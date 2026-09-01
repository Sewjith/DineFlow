package com.dineflow.reservation.domain;

/** Reservation lifecycle: a new booking is REQUESTED, then admin CONFIRMs or CANCELs it. */
public enum ReservationStatus {
    REQUESTED,
    CONFIRMED,
    CANCELLED
}
