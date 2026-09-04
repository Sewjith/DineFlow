package com.dineflow.order.dto;

import com.dineflow.order.domain.Order;
import com.dineflow.order.domain.OrderStatus;
import com.dineflow.order.domain.OrderType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Full order view returned to clients. */
public record OrderResponse(
        Long id,
        String reference,
        String customerName,
        String phone,
        OrderType orderType,
        String tableLabel,
        OrderStatus status,
        BigDecimal total,
        Instant createdAt,
        List<OrderItemResponse> items
) {
    public static OrderResponse fromEntity(Order order) {
        List<OrderItemResponse> lines = order.getItems().stream()
                .map(OrderItemResponse::fromEntity)
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getReference(),
                order.getCustomerName(),
                order.getPhone(),
                order.getOrderType(),
                order.getTableLabel(),
                order.getStatus(),
                order.getTotal(),
                order.getCreatedAt(),
                lines);
    }
}
