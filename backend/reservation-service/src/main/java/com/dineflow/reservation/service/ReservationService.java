package com.dineflow.reservation.service;

import com.dineflow.reservation.domain.Reservation;
import com.dineflow.reservation.domain.ReservationStatus;
import com.dineflow.reservation.domain.RestaurantTable;
import com.dineflow.reservation.dto.CreateReservationRequest;
import com.dineflow.reservation.dto.ReservationResponse;
import com.dineflow.reservation.exception.BadRequestException;
import com.dineflow.reservation.exception.NoTableAvailableException;
import com.dineflow.reservation.exception.ResourceNotFoundException;
import com.dineflow.reservation.repository.ReservationRepository;
import com.dineflow.reservation.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              RestaurantTableRepository tableRepository) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
    }

    /**
     * Books the smallest available table that fits the party for the requested window.
     * Rejects with {@link NoTableAvailableException} (409) if none is free.
     */
    public ReservationResponse book(CreateReservationRequest request) {
        LocalDateTime start = LocalDateTime.of(request.date(), request.time());
        LocalDateTime end = start.plusMinutes(request.durationOrDefault());

        List<RestaurantTable> candidates =
                tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(request.partySize());
        if (candidates.isEmpty()) {
            throw new NoTableAvailableException(
                    "No table can seat a party of " + request.partySize());
        }

        RestaurantTable freeTable = candidates.stream()
                .filter(table -> !reservationRepository.hasOverlap(table.getId(), start, end))
                .findFirst()
                .orElseThrow(() -> new NoTableAvailableException(
                        "No table is available at the requested time"));

        Reservation reservation = new Reservation();
        reservation.setTable(freeTable);
        reservation.setCustomerName(request.customerName());
        reservation.setPhone(request.phone());
        reservation.setPartySize(request.partySize());
        reservation.setReservedAt(start);
        reservation.setEndsAt(end);
        reservation.setDurationMinutes(request.durationOrDefault());
        reservation.setStatus(ReservationStatus.REQUESTED);

        return ReservationResponse.fromEntity(reservationRepository.save(reservation));
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

    public ReservationResponse updateStatus(Long id, ReservationStatus status) {
        if (status != ReservationStatus.CONFIRMED && status != ReservationStatus.CANCELLED) {
            throw new BadRequestException("status must be CONFIRMED or CANCELLED");
        }
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id " + id));
        reservation.setStatus(status);
        return ReservationResponse.fromEntity(reservation);
    }
}
