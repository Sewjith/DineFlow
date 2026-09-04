package com.dineflow.reservation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.Clock;

@SpringBootApplication
public class ReservationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReservationServiceApplication.class, args);
    }

    /** System clock, injected where "now" is needed so it can be fixed in tests. */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
