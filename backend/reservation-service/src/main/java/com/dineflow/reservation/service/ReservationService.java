package com.dineflow.reservation.service;

import com.dineflow.reservation.domain.Reservation;
import com.dineflow.reservation.domain.ReservationStatus;
import com.dineflow.reservation.domain.RestaurantSettings;
import com.dineflow.reservation.domain.RestaurantTable;
import com.dineflow.reservation.web.CreateReservationRequest;
import com.dineflow.reservation.web.ReservationResponse;
import com.dineflow.reservation.web.UpdateReservationRequest;
import com.dineflow.reservation.domain.BadRequestException;
import com.dineflow.reservation.domain.NoTableAvailableException;
import com.dineflow.reservation.domain.ResourceNotFoundException;
import com.dineflow.reservation.infra.ReservationRepository;
import com.dineflow.reservation.infra.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ReservationService {

    /** Sentinel for overlap checks that shouldn't exclude any existing reservation. */
    private static final long NO_EXCLUSION = -1L;
    /** Granularity of the suggested-times search when a requested slot is full. */
    private static final int SLOT_MINUTES = 30;
    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final RestaurantSettingsService settingsService;
    private final Clock clock;

    public ReservationService(ReservationRepository reservationRepository,
                              RestaurantTableRepository tableRepository,
                              RestaurantSettingsService settingsService,
                              Clock clock) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
        this.settingsService = settingsService;
        this.clock = clock;
    }

    /**
     * Books the smallest available table that fits the party for the requested window.
     * Rejects with {@link NoTableAvailableException} (409) if none is free.
     */
    public ReservationResponse book(CreateReservationRequest request) {
        int duration = resolveDuration(request.durationMinutes());
        LocalDateTime start = LocalDateTime.of(request.date(), request.time());
        LocalDateTime end = start.plusMinutes(duration);
        validateWindow(start, end);

        RestaurantTable freeTable = chooseTable(request.partySize(), start, end, NO_EXCLUSION);

        Reservation reservation = new Reservation();
        reservation.setTable(freeTable);
        reservation.setCustomerName(request.customerName());
        reservation.setPhone(request.phone());
        reservation.setPartySize(request.partySize());
        reservation.setReservedAt(start);
        reservation.setEndsAt(end);
        reservation.setDurationMinutes(duration);
        reservation.setStatus(ReservationStatus.REQUESTED);

        return ReservationResponse.fromEntity(reservationRepository.save(reservation));
    }

    /**
     * Edits an existing (non-terminal) reservation's guest details and time window, re-checking
     * availability. Keeps the current table when it still fits and is free; otherwise reassigns
     * to the smallest fitting free table, or rejects (409) if none is available. Status is unchanged.
     */
    public ReservationResponse update(Long id, UpdateReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id " + id));

        if (!reservation.getStatus().holdsTable()) {
            throw new BadRequestException(
                    "Cannot edit a reservation that is " + reservation.getStatus());
        }

        int duration = resolveDuration(request.durationMinutes());
        LocalDateTime start = LocalDateTime.of(request.date(), request.time());
        LocalDateTime end = start.plusMinutes(duration);
        validateWindow(start, end);

        RestaurantTable table = reservation.getTable();
        boolean keepsCurrentTable = table.getSeats() >= request.partySize()
                && !reservationRepository.hasOverlapExcluding(table.getId(), start, end, id);
        if (!keepsCurrentTable) {
            table = chooseTable(request.partySize(), start, end, id);
        }

        reservation.setTable(table);
        reservation.setCustomerName(request.customerName());
        reservation.setPhone(request.phone());
        reservation.setPartySize(request.partySize());
        reservation.setReservedAt(start);
        reservation.setEndsAt(end);
        reservation.setDurationMinutes(duration);

        return ReservationResponse.fromEntity(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> findByDate(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        return reservationRepository
                .findByReservedAtBetweenOrderByReservedAtAsc(start, end.minusNanos(1)).stream()
                .map(ReservationResponse::fromEntity)
                .toList();
    }

    /**
     * Suggests start times on the given date that can seat the party — the fitting free slots at
     * {@link #SLOT_MINUTES} granularity within opening hours, skipping any already in the past.
     * Used to offer alternatives when a specific requested time is full.
     */
    @Transactional(readOnly = true)
    public List<LocalTime> findAvailableTimes(LocalDate date, int partySize) {
        List<RestaurantTable> fitting =
                tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(partySize);
        if (fitting.isEmpty()) {
            return List.of();
        }
        RestaurantSettings settings = settingsService.getSettings();
        int duration = settings.getDefaultDurationMinutes();
        LocalDateTime closesAt = LocalDateTime.of(date, settings.getClosingTime());
        LocalDateTime now = LocalDateTime.now(clock);

        List<LocalTime> slots = new ArrayList<>();
        LocalDateTime start = LocalDateTime.of(date, settings.getOpeningTime());
        for (LocalDateTime end = start.plusMinutes(duration);
             !end.isAfter(closesAt);
             start = start.plusMinutes(SLOT_MINUTES), end = start.plusMinutes(duration)) {
            if (start.isBefore(now)) {
                continue;
            }
            final LocalDateTime slotStart = start;
            final LocalDateTime slotEnd = end;
            boolean anyFree = fitting.stream().anyMatch(table ->
                    !reservationRepository.hasOverlapExcluding(table.getId(), slotStart, slotEnd, NO_EXCLUSION));
            if (anyFree) {
                slots.add(start.toLocalTime());
            }
        }
        return slots;
    }

    /** Customer booking history: all reservations made with the given phone, newest first. */
    @Transactional(readOnly = true)
    public List<ReservationResponse> findByPhone(String phone) {
        String normalized = phone == null ? "" : phone.trim();
        if (normalized.isEmpty()) {
            throw new BadRequestException("phone is required");
        }
        return reservationRepository.findByPhoneOrderByReservedAtDesc(normalized).stream()
                .map(ReservationResponse::fromEntity)
                .toList();
    }

    public ReservationResponse updateStatus(Long id, ReservationStatus target) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id " + id));
        if (!reservation.getStatus().canTransitionTo(target)) {
            throw new BadRequestException(
                    "Cannot change reservation from " + reservation.getStatus() + " to " + target);
        }
        reservation.setStatus(target);
        return ReservationResponse.fromEntity(reservation);
    }

    /** Turn-time: the caller's value when supplied, otherwise the admin-configured default. */
    private int resolveDuration(Integer requested) {
        return requested != null ? requested : settingsService.getSettings().getDefaultDurationMinutes();
    }

    /**
     * Rejects (400) bookings in the past or outside the restaurant's opening hours — the whole
     * dining window must fall within {@code [openingTime, closingTime]} on the booked day.
     */
    private void validateWindow(LocalDateTime start, LocalDateTime end) {
        if (start.isBefore(LocalDateTime.now(clock))) {
            throw new BadRequestException("Cannot book a table in the past");
        }
        RestaurantSettings settings = settingsService.getSettings();
        LocalDateTime opensAt = LocalDateTime.of(start.toLocalDate(), settings.getOpeningTime());
        LocalDateTime closesAt = LocalDateTime.of(start.toLocalDate(), settings.getClosingTime());
        if (start.isBefore(opensAt) || end.isAfter(closesAt)) {
            throw new BadRequestException("Booking must fall within opening hours "
                    + settings.getOpeningTime().format(HH_MM) + "–" + settings.getClosingTime().format(HH_MM));
        }
    }

    /** Picks the smallest table that fits the party and is free for {@code [start, end)}. */
    private RestaurantTable chooseTable(int partySize, LocalDateTime start, LocalDateTime end,
                                        long excludeReservationId) {
        List<RestaurantTable> candidates =
                tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(partySize);
        if (candidates.isEmpty()) {
            throw new NoTableAvailableException("No table can seat a party of " + partySize);
        }
        return candidates.stream()
                .filter(table -> !reservationRepository.hasOverlapExcluding(
                        table.getId(), start, end, excludeReservationId))
                .findFirst()
                .orElseThrow(() -> new NoTableAvailableException(
                        "No table is available at the requested time"));
    }
}
