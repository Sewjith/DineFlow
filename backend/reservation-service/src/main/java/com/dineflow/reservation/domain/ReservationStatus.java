package com.dineflow.reservation.domain;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Reservation lifecycle. The happy path is
 * {@code REQUESTED → CONFIRMED → SEATED → COMPLETED}; a booking can be {@code CANCELLED}
 * while still upcoming, and a confirmed guest who never arrives is marked {@code NO_SHOW}.
 * Terminal states ({@code COMPLETED}, {@code CANCELLED}, {@code NO_SHOW}) allow no further changes.
 */
public enum ReservationStatus {
    REQUESTED,
    CONFIRMED,
    SEATED,
    COMPLETED,
    CANCELLED,
    NO_SHOW;

    private static final Map<ReservationStatus, Set<ReservationStatus>> ALLOWED = Map.of(
            REQUESTED, EnumSet.of(CONFIRMED, CANCELLED),
            CONFIRMED, EnumSet.of(SEATED, CANCELLED, NO_SHOW),
            SEATED, EnumSet.of(COMPLETED, CANCELLED),
            COMPLETED, EnumSet.noneOf(ReservationStatus.class),
            CANCELLED, EnumSet.noneOf(ReservationStatus.class),
            NO_SHOW, EnumSet.noneOf(ReservationStatus.class));

    public boolean canTransitionTo(ReservationStatus target) {
        return ALLOWED.get(this).contains(target);
    }

    /** A booking that still holds its table (blocks overlapping bookings on the same table). */
    public boolean holdsTable() {
        return this == REQUESTED || this == CONFIRMED || this == SEATED;
    }
}
