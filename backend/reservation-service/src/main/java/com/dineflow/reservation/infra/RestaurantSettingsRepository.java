package com.dineflow.reservation.infra;

import com.dineflow.reservation.domain.RestaurantSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantSettingsRepository extends JpaRepository<RestaurantSettings, Long> {
}
