package com.dineflow.reservation.infra;

import com.dineflow.reservation.domain.Reservation;
import com.dineflow.reservation.domain.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * True if the given table already has a table-holding reservation overlapping the window
     * {@code [start, end)}, ignoring the reservation with {@code excludeId} (pass a value that
     * matches nothing, e.g. {@code -1}, when checking a brand-new booking). Two windows overlap
     * when each starts before the other ends. Cancelled and no-show bookings free the table.
     */
    @Query("""
            select count(r) > 0 from Reservation r
            where r.table.id = :tableId
              and r.id <> :excludeId
              and r.status in (
                    com.dineflow.reservation.domain.ReservationStatus.REQUESTED,
                    com.dineflow.reservation.domain.ReservationStatus.CONFIRMED,
                    com.dineflow.reservation.domain.ReservationStatus.SEATED)
              and r.reservedAt < :end
              and r.endsAt > :start
            """)
    boolean hasOverlapExcluding(@Param("tableId") Long tableId,
                                @Param("start") LocalDateTime start,
                                @Param("end") LocalDateTime end,
                                @Param("excludeId") Long excludeId);

    List<Reservation> findByReservedAtBetweenOrderByReservedAtAsc(LocalDateTime start, LocalDateTime end);

    /** Customer booking history: all reservations made with the given phone, newest first. */
    List<Reservation> findByPhoneOrderByReservedAtDesc(String phone);

    /** True if the table still has bookings in any of the given statuses (used to guard deletion). */
    boolean existsByTable_IdAndStatusIn(Long tableId, Collection<ReservationStatus> statuses);

    /** Removes a table's (terminal) reservation history when the table itself is deleted. */
    long deleteByTable_Id(Long tableId);
}
