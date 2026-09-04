package com.dineflow.reservation.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.dineflow.reservation.web.ReservationResponse;
import org.springframework.stereotype.Component;

/**
 * Broadcasts a lightweight "reservation changed" event to every connected admin client whenever
 * a reservation is booked, edited or has its status changed. Clients react by refetching — so the
 * payload is kept minimal (id + status) to avoid serializing dates over the socket.
 */
@Component
public class ReservationEventPublisher {

    static final String EVENT = "reservation:changed";

    private final SocketIOServer server;

    public ReservationEventPublisher(SocketIOServer server) {
        this.server = server;
    }

    public void broadcastReservationChanged(ReservationResponse reservation) {
        server.getBroadcastOperations().sendEvent(EVENT, new ReservationChangedEvent(
                reservation.id(), reservation.status().name()));
    }

    /** Minimal event payload; clients refetch on receipt, so no need for the full reservation. */
    public record ReservationChangedEvent(Long id, String status) {
    }
}
