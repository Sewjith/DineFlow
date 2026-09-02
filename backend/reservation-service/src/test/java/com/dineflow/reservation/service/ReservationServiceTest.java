package com.dineflow.reservation.service;

import com.dineflow.reservation.domain.Reservation;
import com.dineflow.reservation.domain.ReservationStatus;
import com.dineflow.reservation.domain.RestaurantTable;
import com.dineflow.reservation.dto.CreateReservationRequest;
import com.dineflow.reservation.dto.ReservationResponse;
import com.dineflow.reservation.exception.BadRequestException;
import com.dineflow.reservation.exception.NoTableAvailableException;
import com.dineflow.reservation.repository.ReservationRepository;
import com.dineflow.reservation.repository.RestaurantTableRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private RestaurantTableRepository tableRepository;
    @InjectMocks
    private ReservationService reservationService;

    private static RestaurantTable table(long id, String label, int seats) {
        RestaurantTable t = new RestaurantTable();
        t.setId(id);
        t.setLabel(label);
        t.setSeats(seats);
        return t;
    }

    private static CreateReservationRequest request(int partySize) {
        return new CreateReservationRequest("Alice", "0770", partySize,
                LocalDate.of(2026, 9, 20), LocalTime.of(19, 0), null);
    }

    private void stubSave() {
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void assignsSmallestFittingFreeTable() {
        stubSave();
        RestaurantTable small = table(1, "T1", 2);
        RestaurantTable big = table(2, "T2", 4);
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(2))
                .thenReturn(List.of(small, big));
        when(reservationRepository.hasOverlap(eq(1L), any(), any())).thenReturn(false);

        ReservationResponse response = reservationService.book(request(2));

        assertThat(response.tableLabel()).isEqualTo("T1");
        assertThat(response.status()).isEqualTo(ReservationStatus.REQUESTED);
    }

    @Test
    void skipsBusyTableAndPicksNextFree() {
        stubSave();
        RestaurantTable first = table(1, "T1", 2);
        RestaurantTable second = table(2, "T2", 2);
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(2))
                .thenReturn(List.of(first, second));
        when(reservationRepository.hasOverlap(eq(1L), any(), any())).thenReturn(true);
        when(reservationRepository.hasOverlap(eq(2L), any(), any())).thenReturn(false);

        ReservationResponse response = reservationService.book(request(2));

        assertThat(response.tableLabel()).isEqualTo("T2");
    }

    @Test
    void rejectsWhenEveryTableIsBusy() {
        RestaurantTable only = table(1, "T1", 2);
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(2))
                .thenReturn(List.of(only));
        when(reservationRepository.hasOverlap(eq(1L), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> reservationService.book(request(2)))
                .isInstanceOf(NoTableAvailableException.class);
    }

    @Test
    void rejectsWhenNoTableFitsTheParty() {
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(20))
                .thenReturn(List.of());

        assertThatThrownBy(() -> reservationService.book(request(20)))
                .isInstanceOf(NoTableAvailableException.class);
    }

    @Test
    void confirmSetsStatus() {
        Reservation reservation = new Reservation();
        reservation.setTable(table(1, "T1", 2));
        reservation.setReservedAt(LocalDateTime.of(2026, 9, 20, 19, 0));
        reservation.setStatus(ReservationStatus.REQUESTED);
        when(reservationRepository.findById(7L)).thenReturn(Optional.of(reservation));

        ReservationResponse response = reservationService.updateStatus(7L, ReservationStatus.CONFIRMED);

        assertThat(response.status()).isEqualTo(ReservationStatus.CONFIRMED);
    }

    @Test
    void rejectsUpdatingToRequested() {
        assertThatThrownBy(() -> reservationService.updateStatus(7L, ReservationStatus.REQUESTED))
                .isInstanceOf(BadRequestException.class);
    }
}
