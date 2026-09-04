package com.dineflow.reservation.repository;

import com.dineflow.reservation.domain.RestaurantSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantSettingsRepository extends JpaRepository<RestaurantSettings, Long> {
}
