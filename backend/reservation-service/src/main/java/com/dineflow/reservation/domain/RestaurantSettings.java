package com.dineflow.reservation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

/**
 * Restaurant-wide booking settings — opening/closing hours and the standard dining turn-time.
 * A single row (id = {@link #SINGLETON_ID}); drives reservation validation and default duration.
 */
@Entity
@Table(name = "restaurant_settings")
@Getter
@Setter
@NoArgsConstructor
public class RestaurantSettings {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(nullable = false)
    private LocalTime openingTime;

    @Column(nullable = false)
    private LocalTime closingTime;

    /** Standard dining duration in minutes, used when a booking doesn't specify one. */
    @Column(nullable = false)
    private int defaultDurationMinutes;

    public RestaurantSettings(LocalTime openingTime, LocalTime closingTime, int defaultDurationMinutes) {
        this.id = SINGLETON_ID;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.defaultDurationMinutes = defaultDurationMinutes;
    }
}
