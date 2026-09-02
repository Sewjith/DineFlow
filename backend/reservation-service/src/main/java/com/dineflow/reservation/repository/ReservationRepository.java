package com.dineflow.reservation.repository;

import com.dineflow.reservation.domain.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * True if the given table already has a non-cancelled reservation overlapping the
     * window {@code [start, end)}. Two windows overlap when each starts before the other ends.
     */
    @Query("""
            select count(r) > 0 from Reservation r
            where r.table.id = :tableId
              and r.status <> com.dineflow.reservation.domain.ReservationStatus.CANCELLED
              and r.reservedAt < :end
              and r.endsAt > :start
            """)
    boolean hasOverlap(@Param("tableId") Long tableId,
                       @Param("start") LocalDateTime start,
                       @Param("end") LocalDateTime end);

    List<Reservation> findByReservedAtBetweenOrderByReservedAtAsc(LocalDateTime start, LocalDateTime end);
}
