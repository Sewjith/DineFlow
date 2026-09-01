package com.dineflow.order.client;

import java.math.BigDecimal;

/** The subset of a menu item that order-service needs from menu-service. */
public record MenuItemDto(
        Long id,
        String name,
        BigDecimal price,
        boolean available
) {
}
