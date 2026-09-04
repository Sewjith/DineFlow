package com.dineflow.order.dto;

import com.dineflow.order.domain.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Payload to place an order. Prices/totals are computed on the server from live menu data. */
public record PlaceOrderRequest(
        @NotBlank(message = "customerName is required")
        @Size(max = 120, message = "customerName must be at most 120 characters")
        String customerName,

        @NotBlank(message = "phone is required")
        @Size(max = 30, message = "phone must be at most 30 characters")
        @Pattern(regexp = "^\\+?[0-9()\\-\\s]{7,30}$",
                message = "phone must be 7-30 characters using digits and + ( ) - spaces")
        String phone,

        @NotNull(message = "orderType is required (DINE_IN or TAKEAWAY)")
        OrderType orderType,

        /** Required only for DINE_IN — must name a real table; enforced in the service. */
        @Size(max = 30, message = "tableLabel must be at most 30 characters")
        String tableLabel,

        @NotEmpty(message = "at least one item is required")
        @Valid
        List<OrderLineRequest> items
) {
}
