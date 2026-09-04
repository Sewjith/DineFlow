package com.dineflow.order.web;

import com.dineflow.order.domain.OrderItem;

import java.math.BigDecimal;

/** One order line as returned to clients. */
public record OrderItemResponse(
        Long menuItemId,
        String name,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal
) {
    public static OrderItemResponse fromEntity(OrderItem item) {
        return new OrderItemResponse(
                item.getMenuItemId(),
                item.getName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.lineTotal());
    }
}
