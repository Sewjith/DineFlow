package com.dineflow.reservation.dto;

import com.dineflow.reservation.domain.RestaurantSettings;

import java.time.LocalTime;

/** Restaurant booking settings as returned to clients. */
public record SettingsResponse(
        LocalTime openingTime,
        LocalTime closingTime,
        int defaultDurationMinutes
) {
    public static SettingsResponse fromEntity(RestaurantSettings s) {
        return new SettingsResponse(s.getOpeningTime(), s.getClosingTime(), s.getDefaultDurationMinutes());
    }
}
