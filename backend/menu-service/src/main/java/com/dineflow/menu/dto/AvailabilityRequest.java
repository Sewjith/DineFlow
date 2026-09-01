package com.dineflow.menu.dto;

import jakarta.validation.constraints.NotNull;

/** Payload to toggle a menu item's availability (mark sold-out / back in stock). */
public record AvailabilityRequest(
        @NotNull(message = "available is required")
        Boolean available
) {
}
