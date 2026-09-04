package com.dineflow.reservation.web;

import com.dineflow.reservation.domain.RestaurantTable;

/** A restaurant table as returned to admin clients. */
public record TableResponse(
        Long id,
        String label,
        int seats
) {
    public static TableResponse fromEntity(RestaurantTable t) {
        return new TableResponse(t.getId(), t.getLabel(), t.getSeats());
    }
}
