package com.dineflow.reservation.controller;

import com.dineflow.reservation.dto.SettingsRequest;
import com.dineflow.reservation.dto.SettingsResponse;
import com.dineflow.reservation.service.RestaurantSettingsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Restaurant booking settings. Reading is public (the booking page shows opening hours);
 * updating is admin-only.
 */
@RestController
@RequestMapping("/settings")
public class SettingsController {

    private final RestaurantSettingsService settingsService;

    public SettingsController(RestaurantSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public SettingsResponse get() {
        return settingsService.get();
    }

    @PutMapping
    public SettingsResponse update(@Valid @RequestBody SettingsRequest request) {
        return settingsService.update(request);
    }
}
