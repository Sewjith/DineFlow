package com.dineflow.reservation.web;

import com.dineflow.reservation.domain.Reservation;
import com.dineflow.reservation.domain.ReservationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** Reservation as returned to clients, including the assigned table. */
public record ReservationResponse(
        Long id,
        Long tableId,
        String tableLabel,
        String customerName,
        String phone,
        int partySize,
        LocalDate date,
        LocalTime time,
        LocalDateTime reservedAt,
        int durationMinutes,
        ReservationStatus status
) {
    public static ReservationResponse fromEntity(Reservation r) {
        return new ReservationResponse(
                r.getId(),
                r.getTable().getId(),
                r.getTable().getLabel(),
                r.getCustomerName(),
                r.getPhone(),
                r.getPartySize(),
                r.getReservedAt().toLocalDate(),
                r.getReservedAt().toLocalTime(),
                r.getReservedAt(),
                r.getDurationMinutes(),
                r.getStatus());
    }
}
