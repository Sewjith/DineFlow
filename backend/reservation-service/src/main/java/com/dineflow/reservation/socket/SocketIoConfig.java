package com.dineflow.reservation.socket;

import com.corundumstudio.socketio.AuthorizationListener;
import com.corundumstudio.socketio.AuthorizationResult;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.protocol.JacksonJsonSupport;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Configures the standalone Socket.IO (Netty) server used to push live reservation updates to
 * the admin Reservations view. Only connections presenting a valid admin JWT (as {@code ?token=})
 * are accepted — the same shared secret the {@code JwtAuthFilter} validates for REST calls.
 *
 * <p>A custom context path ({@code /rsocket.io}) keeps this server distinct from order-service's
 * Socket.IO server, so both can be proxied same-origin without clashing on {@code /socket.io}.
 */
@Configuration
public class SocketIoConfig {

    private final SecretKey key;

    public SocketIoConfig(@Value("${app.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Bean
    public SocketIOServer socketIOServer(@Value("${socketio.host}") String host,
                                         @Value("${socketio.port}") int port,
                                         @Value("${socketio.context}") String context) {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(host);
        config.setPort(port);
        config.setContext(context);
        config.setJsonSupport(new JacksonJsonSupport());
        config.setAuthorizationListener(adminOnly());
        return new SocketIOServer(config);
    }

    private AuthorizationListener adminOnly() {
        return data -> {
            String token = data.getSingleUrlParam("token");
            if (token == null || token.isBlank()) {
                return new AuthorizationResult(false);
            }
            try {
                Claims claims = Jwts.parser().verifyWith(key).build()
                        .parseSignedClaims(token).getPayload();
                boolean isAdmin = "ADMIN".equals(claims.get("role", String.class));
                return new AuthorizationResult(isAdmin);
            } catch (JwtException | IllegalArgumentException ex) {
                return new AuthorizationResult(false);
            }
        };
    }
}
