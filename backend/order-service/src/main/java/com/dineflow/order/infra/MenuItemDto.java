package com.dineflow.order.infra;

import java.math.BigDecimal;

/** The subset of a menu item that order-service needs from menu-service. */
public record MenuItemDto(
        Long id,
        String name,
        BigDecimal price,
        boolean available
) {
}
