package com.dineflow.reservation.controller;

import com.dineflow.reservation.dto.CreateReservationRequest;
import com.dineflow.reservation.dto.ReservationResponse;
import com.dineflow.reservation.dto.UpdateReservationStatusRequest;
import com.dineflow.reservation.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    // --- Public (customer) ---

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse book(@Valid @RequestBody CreateReservationRequest request) {
        return reservationService.book(request);
    }

    // --- Admin ---

    @GetMapping
    public List<ReservationResponse> byDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reservationService.findByDate(date);
    }

    @PatchMapping("/{id}/status")
    public ReservationResponse updateStatus(@PathVariable Long id,
                                            @Valid @RequestBody UpdateReservationStatusRequest request) {
        return reservationService.updateStatus(id, request.status());
    }
}
