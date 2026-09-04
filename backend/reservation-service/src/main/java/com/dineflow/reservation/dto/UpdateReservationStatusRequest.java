package com.dineflow.reservation.dto;

import com.dineflow.reservation.domain.ReservationStatus;
import jakarta.validation.constraints.NotNull;

/** Payload for an admin to advance a reservation to the next lifecycle status. */
public record UpdateReservationStatusRequest(
        @NotNull(message = "status is required")
        ReservationStatus status
) {
}
