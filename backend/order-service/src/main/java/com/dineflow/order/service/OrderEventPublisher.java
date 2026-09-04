package com.dineflow.order.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.dineflow.order.web.OrderResponse;
import org.springframework.stereotype.Component;

/**
 * Broadcasts a lightweight "order changed" event to every connected admin client whenever an
 * order is placed or its status changes. Clients react by refetching — so the payload is kept
 * minimal (String/enum fields only) to avoid serializing Instant/BigDecimal over the socket.
 */
@Component
public class OrderEventPublisher {

    static final String EVENT = "order:changed";

    private final SocketIOServer server;

    public OrderEventPublisher(SocketIOServer server) {
        this.server = server;
    }

    public void broadcastOrderChanged(OrderResponse order) {
        server.getBroadcastOperations().sendEvent(EVENT, new OrderChangedEvent(
                order.id(), order.reference(), order.status().name()));
    }

    /** Minimal event payload; clients refetch on receipt, so no need for the full order. */
    public record OrderChangedEvent(Long id, String reference, String status) {
    }
}
