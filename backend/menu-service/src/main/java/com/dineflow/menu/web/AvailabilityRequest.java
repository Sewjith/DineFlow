package com.dineflow.menu.web;

import jakarta.validation.constraints.NotNull;

/** Payload to toggle a menu item's availability (mark sold-out / back in stock). */
public record AvailabilityRequest(
        @NotNull(message = "available is required")
        Boolean available
) {
}
