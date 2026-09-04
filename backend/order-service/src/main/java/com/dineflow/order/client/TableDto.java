package com.dineflow.order.client;

/** The subset of a restaurant table that order-service needs from reservation-service. */
public record TableDto(
        Long id,
        String label,
        int seats
) {
}
