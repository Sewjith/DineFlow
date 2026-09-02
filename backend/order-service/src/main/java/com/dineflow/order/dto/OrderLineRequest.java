package com.dineflow.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** One requested line: a menu item id and a quantity. Price is resolved server-side. */
public record OrderLineRequest(
        @NotNull(message = "menuItemId is required")
        Long menuItemId,

        @NotNull(message = "quantity is required")
        @Min(value = 1, message = "quantity must be at least 1")
        Integer quantity
) {
}
