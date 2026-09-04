package com.dineflow.reservation.infra;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Component;

/** Starts the Socket.IO server when the app comes up and stops it on shutdown. */
@Component
public class SocketIoLifecycle implements SmartLifecycle {

    private final SocketIOServer server;
    private volatile boolean running = false;

    public SocketIoLifecycle(SocketIOServer server) {
        this.server = server;
    }

    @Override
    public void start() {
        server.start();
        running = true;
    }

    @Override
    public void stop() {
        server.stop();
        running = false;
    }

    @Override
    public boolean isRunning() {
        return running;
    }
}
