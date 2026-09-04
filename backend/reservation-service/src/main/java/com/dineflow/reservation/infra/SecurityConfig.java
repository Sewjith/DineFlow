package com.dineflow.reservation.infra;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Customers may request a booking; viewing reservations and confirming/cancelling
 * them is admin-only.
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public: request a table booking.
                        .requestMatchers(HttpMethod.POST, "/reservations").permitAll()
                        // Public: customers check their own bookings' status by phone,
                        // and see which times can seat their party on a date.
                        .requestMatchers(HttpMethod.GET, "/reservations/history", "/reservations/availability").permitAll()
                        // Public reads: opening hours (booking page) and the table list
                        // (checkout dine-in picker + order-service validation).
                        .requestMatchers(HttpMethod.GET, "/settings", "/tables").permitAll()
                        // Everything else (list by date, confirm/cancel, table & settings writes) is admin-only.
                        .anyRequest().hasRole("ADMIN"))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> res.sendError(401, "Unauthorized")))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
