package com.dineflow.menu.web;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Payload to create or update a menu item. */
public record MenuItemRequest(
        @NotNull(message = "categoryId is required")
        Long categoryId,

        @NotBlank(message = "name is required")
        @Size(max = 150, message = "name must be at most 150 characters")
        String name,

        @Size(max = 1000, message = "description must be at most 1000 characters")
        String description,

        @NotNull(message = "price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "price must be greater than 0")
        @Digits(integer = 8, fraction = 2, message = "price must have at most 2 decimal places")
        BigDecimal price,

        Boolean available
) {
    /** Availability defaults to {@code true} when omitted. */
    public boolean availableOrDefault() {
        return available == null || available;
    }
}
