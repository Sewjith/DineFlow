package com.dineflow.reservation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Payload for an admin to edit an existing reservation (guest details, party size or time
 * window). The server re-checks table availability and may reassign the table to fit.
 */
public record UpdateReservationRequest(
        @NotBlank(message = "customerName is required")
        @Size(max = 120, message = "customerName must be at most 120 characters")
        String customerName,

        @NotBlank(message = "phone is required")
        @Size(max = 30, message = "phone must be at most 30 characters")
        @Pattern(regexp = "^\\+?[0-9()\\-\\s]{7,30}$",
                message = "phone must be 7-30 characters using digits and + ( ) - spaces")
        String phone,

        @NotNull(message = "partySize is required")
        @Min(value = 1, message = "partySize must be at least 1")
        @Max(value = 50, message = "partySize must be at most 50")
        Integer partySize,

        @NotNull(message = "date is required (yyyy-MM-dd)")
        LocalDate date,

        @NotNull(message = "time is required (HH:mm)")
        LocalTime time,

        /** Optional; falls back to the restaurant's configured turn-time when omitted. */
        @Min(value = 30, message = "durationMinutes must be at least 30")
        @Max(value = 480, message = "durationMinutes must be at most 480")
        Integer durationMinutes
) {
}
