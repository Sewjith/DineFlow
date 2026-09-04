package com.dineflow.reservation.web;

import com.dineflow.reservation.web.CreateReservationRequest;
import com.dineflow.reservation.web.ReservationResponse;
import com.dineflow.reservation.web.UpdateReservationRequest;
import com.dineflow.reservation.web.UpdateReservationStatusRequest;
import com.dineflow.reservation.service.ReservationService;
import com.dineflow.reservation.service.ReservationEventPublisher;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@Validated
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationEventPublisher eventPublisher;

    public ReservationController(ReservationService reservationService,
                                ReservationEventPublisher eventPublisher) {
        this.reservationService = reservationService;
        this.eventPublisher = eventPublisher;
    }

    // --- Public (customer) ---

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse book(@Valid @RequestBody CreateReservationRequest request) {
        // The service's @Transactional method has committed by the time it returns,
        // so broadcasting here means clients never see a reservation that isn't persisted.
        ReservationResponse reservation = reservationService.book(request);
        eventPublisher.broadcastReservationChanged(reservation);
        return reservation;
    }

    /** Public booking history lookup by phone, so customers can check their reservation status. */
    @GetMapping("/history")
    public List<ReservationResponse> history(
            @RequestParam @NotBlank(message = "phone is required") String phone) {
        return reservationService.findByPhone(phone);
    }

    /** Public: start times that can seat the party on a date — offered when a slot is full. */
    @GetMapping("/availability")
    public List<LocalTime> availability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @Positive(message = "partySize must be at least 1") int partySize) {
        return reservationService.findAvailableTimes(date, partySize);
    }

    // --- Admin ---

    @GetMapping
    public List<ReservationResponse> byDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reservationService.findByDate(date);
    }

    @PutMapping("/{id}")
    public ReservationResponse update(@PathVariable Long id,
                                      @Valid @RequestBody UpdateReservationRequest request) {
        ReservationResponse reservation = reservationService.update(id, request);
        eventPublisher.broadcastReservationChanged(reservation);
        return reservation;
    }

    @PatchMapping("/{id}/status")
    public ReservationResponse updateStatus(@PathVariable Long id,
                                            @Valid @RequestBody UpdateReservationStatusRequest request) {
        ReservationResponse reservation = reservationService.updateStatus(id, request.status());
        eventPublisher.broadcastReservationChanged(reservation);
        return reservation;
    }
}
