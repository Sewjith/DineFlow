package com.dineflow.reservation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

/** Payload for an admin to update the restaurant's booking settings. */
public record SettingsRequest(
        @NotNull(message = "openingTime is required (HH:mm)")
        LocalTime openingTime,

        @NotNull(message = "closingTime is required (HH:mm)")
        LocalTime closingTime,

        @NotNull(message = "defaultDurationMinutes is required")
        @Min(value = 30, message = "defaultDurationMinutes must be at least 30")
        @Max(value = 480, message = "defaultDurationMinutes must be at most 480")
        Integer defaultDurationMinutes
) {
}
