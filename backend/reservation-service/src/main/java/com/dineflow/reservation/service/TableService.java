package com.dineflow.reservation.service;

import com.dineflow.reservation.domain.ReservationStatus;
import com.dineflow.reservation.domain.RestaurantTable;
import com.dineflow.reservation.web.TableRequest;
import com.dineflow.reservation.web.TableResponse;
import com.dineflow.reservation.domain.ConflictException;
import com.dineflow.reservation.domain.ResourceNotFoundException;
import com.dineflow.reservation.infra.ReservationRepository;
import com.dineflow.reservation.infra.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Admin management of the restaurant's physical tables. The set of tables is configured here
 * rather than being a fixed seed, and drives the reservation engine's smallest-fit assignment.
 */
@Service
@Transactional
public class TableService {

    /** Statuses that still hold a table — a table with any of these can't be deleted. */
    private static final Set<ReservationStatus> ACTIVE_STATUSES =
            EnumSet.of(ReservationStatus.REQUESTED, ReservationStatus.CONFIRMED, ReservationStatus.SEATED);

    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    public TableService(RestaurantTableRepository tableRepository,
                        ReservationRepository reservationRepository) {
        this.tableRepository = tableRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<TableResponse> findAll() {
        return tableRepository.findAllByOrderBySeatsAscLabelAsc().stream()
                .map(TableResponse::fromEntity)
                .toList();
    }

    public TableResponse create(TableRequest request) {
        String label = request.label().trim();
        tableRepository.findByLabelIgnoreCase(label).ifPresent(existing -> {
            throw new ConflictException("A table already exists with label " + label);
        });
        RestaurantTable table = new RestaurantTable();
        table.setLabel(label);
        table.setSeats(request.seats());
        return TableResponse.fromEntity(tableRepository.save(table));
    }

    public TableResponse update(Long id, TableRequest request) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id " + id));
        String label = request.label().trim();
        tableRepository.findByLabelIgnoreCase(label)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ConflictException("A table already exists with label " + label);
                });
        table.setLabel(label);
        table.setSeats(request.seats());
        return TableResponse.fromEntity(table);
    }

    public void delete(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id " + id));
        if (reservationRepository.existsByTable_IdAndStatusIn(id, ACTIVE_STATUSES)) {
            throw new ConflictException(
                    "Table " + table.getLabel() + " has active reservations and cannot be deleted");
        }
        // Only terminal (completed/cancelled/no-show) reservations can remain; remove that history
        // so the non-null table FK isn't violated when the table itself is deleted.
        reservationRepository.deleteByTable_Id(id);
        tableRepository.delete(table);
    }
}
