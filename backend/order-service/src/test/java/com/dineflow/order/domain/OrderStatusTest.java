package com.dineflow.order.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OrderStatusTest {

    @Test
    void happyPathTransitionsAreAllowed() {
        assertThat(OrderStatus.PLACED.canTransitionTo(OrderStatus.CONFIRMED)).isTrue();
        assertThat(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PREPARING)).isTrue();
        assertThat(OrderStatus.PREPARING.canTransitionTo(OrderStatus.READY)).isTrue();
        assertThat(OrderStatus.READY.canTransitionTo(OrderStatus.COMPLETED)).isTrue();
    }

    @Test
    void anyActiveStateCanBeCancelled() {
        assertThat(OrderStatus.PLACED.canTransitionTo(OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatus.READY.canTransitionTo(OrderStatus.CANCELLED)).isTrue();
    }

    @Test
    void terminalStatesAllowNoFurtherChange() {
        assertThat(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.CANCELLED)).isFalse();
        assertThat(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.PLACED)).isFalse();
    }

    @Test
    void skippingStepsIsNotAllowed() {
        assertThat(OrderStatus.PLACED.canTransitionTo(OrderStatus.READY)).isFalse();
        assertThat(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.COMPLETED)).isFalse();
    }
}
