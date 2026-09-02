package com.dineflow.reservation.repository;

import com.dineflow.reservation.domain.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    /** Candidate tables that can seat the party, smallest suitable table first. */
    List<RestaurantTable> findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(int partySize);
}
