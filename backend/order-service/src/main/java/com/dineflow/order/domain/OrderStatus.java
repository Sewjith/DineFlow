package com.dineflow.order.domain;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Order lifecycle. The happy path is
 * {@code PLACED → CONFIRMED → PREPARING → READY → COMPLETED}; any non-terminal state can
 * also move to {@code CANCELLED}. Terminal states allow no further changes.
 */
public enum OrderStatus {
    PLACED,
    CONFIRMED,
    PREPARING,
    READY,
    COMPLETED,
    CANCELLED;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = Map.of(
            PLACED, EnumSet.of(CONFIRMED, CANCELLED),
            CONFIRMED, EnumSet.of(PREPARING, CANCELLED),
            PREPARING, EnumSet.of(READY, CANCELLED),
            READY, EnumSet.of(COMPLETED, CANCELLED),
            COMPLETED, EnumSet.noneOf(OrderStatus.class),
            CANCELLED, EnumSet.noneOf(OrderStatus.class));

    public boolean canTransitionTo(OrderStatus target) {
        return ALLOWED.get(this).contains(target);
    }
}
