package com.dineflow.reservation.service;

import com.dineflow.reservation.domain.RestaurantSettings;
import com.dineflow.reservation.web.SettingsRequest;
import com.dineflow.reservation.web.SettingsResponse;
import com.dineflow.reservation.domain.BadRequestException;
import com.dineflow.reservation.infra.RestaurantSettingsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RestaurantSettingsServiceTest {

    @Mock
    private RestaurantSettingsRepository repository;
    @InjectMocks
    private RestaurantSettingsService settingsService;

    @Test
    void getFallsBackToDefaultsWhenUnset() {
        when(repository.findById(RestaurantSettings.SINGLETON_ID)).thenReturn(Optional.empty());

        SettingsResponse response = settingsService.get();

        assertThat(response.openingTime()).isEqualTo(LocalTime.of(11, 0));
        assertThat(response.closingTime()).isEqualTo(LocalTime.of(22, 0));
        assertThat(response.defaultDurationMinutes()).isEqualTo(90);
    }

    @Test
    void updatePersistsNewHours() {
        RestaurantSettings existing =
                new RestaurantSettings(LocalTime.of(11, 0), LocalTime.of(22, 0), 90);
        when(repository.findById(RestaurantSettings.SINGLETON_ID)).thenReturn(Optional.of(existing));

        SettingsResponse response = settingsService.update(
                new SettingsRequest(LocalTime.of(9, 0), LocalTime.of(23, 0), 120));

        assertThat(response.openingTime()).isEqualTo(LocalTime.of(9, 0));
        assertThat(response.defaultDurationMinutes()).isEqualTo(120);
    }

    @Test
    void rejectsOpeningNotBeforeClosing() {
        assertThatThrownBy(() -> settingsService.update(
                new SettingsRequest(LocalTime.of(22, 0), LocalTime.of(11, 0), 90)))
                .isInstanceOf(BadRequestException.class);
        verify(repository, never()).save(any());
    }
}
