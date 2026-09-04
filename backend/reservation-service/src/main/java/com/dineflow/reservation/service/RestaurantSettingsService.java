package com.dineflow.reservation.service;

import com.dineflow.reservation.domain.RestaurantSettings;
import com.dineflow.reservation.dto.SettingsRequest;
import com.dineflow.reservation.dto.SettingsResponse;
import com.dineflow.reservation.exception.BadRequestException;
import com.dineflow.reservation.repository.RestaurantSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

/**
 * Manages the singleton {@link RestaurantSettings} row, creating sensible defaults on first
 * access (opening 11:00, closing 22:00, 90-minute turn-time).
 */
@Service
@Transactional
public class RestaurantSettingsService {

    private static final LocalTime DEFAULT_OPENING = LocalTime.of(11, 0);
    private static final LocalTime DEFAULT_CLOSING = LocalTime.of(22, 0);
    private static final int DEFAULT_DURATION_MINUTES = 90;

    private final RestaurantSettingsRepository repository;

    public RestaurantSettingsService(RestaurantSettingsRepository repository) {
        this.repository = repository;
    }

    /** The current settings, lazily initialised to defaults if none have been saved yet. */
    public RestaurantSettings getSettings() {
        return repository.findById(RestaurantSettings.SINGLETON_ID)
                .orElseGet(() -> repository.save(new RestaurantSettings(
                        DEFAULT_OPENING, DEFAULT_CLOSING, DEFAULT_DURATION_MINUTES)));
    }

    @Transactional(readOnly = true)
    public SettingsResponse get() {
        // Read-only view; if absent, describe the defaults without persisting.
        return repository.findById(RestaurantSettings.SINGLETON_ID)
                .map(SettingsResponse::fromEntity)
                .orElseGet(() -> new SettingsResponse(
                        DEFAULT_OPENING, DEFAULT_CLOSING, DEFAULT_DURATION_MINUTES));
    }

    public SettingsResponse update(SettingsRequest request) {
        if (!request.openingTime().isBefore(request.closingTime())) {
            throw new BadRequestException("openingTime must be before closingTime");
        }
        RestaurantSettings settings = getSettings();
        settings.setOpeningTime(request.openingTime());
        settings.setClosingTime(request.closingTime());
        settings.setDefaultDurationMinutes(request.defaultDurationMinutes());
        return SettingsResponse.fromEntity(settings);
    }
}
