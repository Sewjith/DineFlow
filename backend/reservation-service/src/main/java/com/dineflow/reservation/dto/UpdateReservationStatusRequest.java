package com.dineflow.reservation.dto;

import com.dineflow.reservation.domain.ReservationStatus;
import jakarta.validation.constraints.NotNull;

/** Payload for an admin to confirm or cancel a reservation. */
public record UpdateReservationStatusRequest(
        @NotNull(message = "status is required (CONFIRMED or CANCELLED)")
        ReservationStatus status
) {
}
