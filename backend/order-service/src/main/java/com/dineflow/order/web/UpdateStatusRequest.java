package com.dineflow.order.web;

import com.dineflow.order.domain.OrderStatus;
import jakarta.validation.constraints.NotNull;

/** Payload to change an order's status. */
public record UpdateStatusRequest(
        @NotNull(message = "status is required")
        OrderStatus status
) {
}
