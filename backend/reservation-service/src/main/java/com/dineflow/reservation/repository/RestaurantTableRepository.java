package com.dineflow.reservation.repository;

import com.dineflow.reservation.domain.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    /** Candidate tables that can seat the party, smallest suitable table first. */
    List<RestaurantTable> findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(int partySize);

    /** All tables, smallest first, for the admin management view. */
    List<RestaurantTable> findAllByOrderBySeatsAscLabelAsc();

    /** Used to enforce unique table labels (case-insensitive). */
    Optional<RestaurantTable> findByLabelIgnoreCase(String label);
}
