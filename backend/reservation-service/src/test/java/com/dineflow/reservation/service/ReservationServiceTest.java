package com.dineflow.reservation.service;

import com.dineflow.reservation.domain.Reservation;
import com.dineflow.reservation.domain.ReservationStatus;
import com.dineflow.reservation.domain.RestaurantSettings;
import com.dineflow.reservation.domain.RestaurantTable;
import com.dineflow.reservation.dto.CreateReservationRequest;
import com.dineflow.reservation.dto.ReservationResponse;
import com.dineflow.reservation.dto.UpdateReservationRequest;
import com.dineflow.reservation.exception.BadRequestException;
import com.dineflow.reservation.exception.NoTableAvailableException;
import com.dineflow.reservation.repository.ReservationRepository;
import com.dineflow.reservation.repository.RestaurantTableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    // Fixed "now" well before the test bookings (2026-09-20) so they read as future.
    private static final Clock FIXED_CLOCK =
            Clock.fixed(Instant.parse("2026-09-04T10:00:00Z"), ZoneOffset.UTC);

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private RestaurantTableRepository tableRepository;
    @Mock
    private RestaurantSettingsService settingsService;

    private ReservationService reservationService;

    @BeforeEach
    void setUp() {
        // Wide-open hours + 90-min turn-time so time-window checks don't interfere with the
        // table-assignment tests; specific tests below stub tighter values where needed.
        lenient().when(settingsService.getSettings())
                .thenReturn(new RestaurantSettings(LocalTime.of(0, 0), LocalTime.of(23, 59), 90));
        reservationService = new ReservationService(
                reservationRepository, tableRepository, settingsService, FIXED_CLOCK);
    }

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

    private static UpdateReservationRequest editRequest(int partySize) {
        return new UpdateReservationRequest("Alice", "0770", partySize,
                LocalDate.of(2026, 9, 20), LocalTime.of(20, 0), null);
    }

    private static Reservation reservation(RestaurantTable table, ReservationStatus status) {
        Reservation r = new Reservation();
        r.setTable(table);
        r.setCustomerName("Alice");
        r.setPhone("0770");
        r.setPartySize(table.getSeats());
        r.setReservedAt(LocalDateTime.of(2026, 9, 20, 19, 0));
        r.setEndsAt(LocalDateTime.of(2026, 9, 20, 20, 30));
        r.setDurationMinutes(90);
        r.setStatus(status);
        return r;
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
        when(reservationRepository.hasOverlapExcluding(eq(1L), any(), any(), anyLong())).thenReturn(false);

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
        when(reservationRepository.hasOverlapExcluding(eq(1L), any(), any(), anyLong())).thenReturn(true);
        when(reservationRepository.hasOverlapExcluding(eq(2L), any(), any(), anyLong())).thenReturn(false);

        ReservationResponse response = reservationService.book(request(2));

        assertThat(response.tableLabel()).isEqualTo("T2");
    }

    @Test
    void rejectsWhenEveryTableIsBusy() {
        RestaurantTable only = table(1, "T1", 2);
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(2))
                .thenReturn(List.of(only));
        when(reservationRepository.hasOverlapExcluding(eq(1L), any(), any(), anyLong())).thenReturn(true);

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
    void rejectsBookingInThePast() {
        CreateReservationRequest past = new CreateReservationRequest("Alice", "0770", 2,
                LocalDate.of(2026, 9, 1), LocalTime.of(19, 0), null);

        assertThatThrownBy(() -> reservationService.book(past))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("past");
    }

    @Test
    void rejectsBookingOutsideOpeningHours() {
        when(settingsService.getSettings())
                .thenReturn(new RestaurantSettings(LocalTime.of(11, 0), LocalTime.of(14, 0), 90));

        // 19:00 is after the 14:00 closing time.
        assertThatThrownBy(() -> reservationService.book(request(2)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("opening hours");
    }

    @Test
    void confirmAdvancesStatus() {
        RestaurantTable t = table(1, "T1", 2);
        when(reservationRepository.findById(7L))
                .thenReturn(Optional.of(reservation(t, ReservationStatus.REQUESTED)));

        ReservationResponse response = reservationService.updateStatus(7L, ReservationStatus.CONFIRMED);

        assertThat(response.status()).isEqualTo(ReservationStatus.CONFIRMED);
    }

    @Test
    void rejectsIllegalStatusTransition() {
        RestaurantTable t = table(1, "T1", 2);
        when(reservationRepository.findById(7L))
                .thenReturn(Optional.of(reservation(t, ReservationStatus.COMPLETED)));

        assertThatThrownBy(() -> reservationService.updateStatus(7L, ReservationStatus.CONFIRMED))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void editKeepsCurrentTableWhenItStillFitsAndIsFree() {
        RestaurantTable t = table(1, "T1", 4);
        when(reservationRepository.findById(7L))
                .thenReturn(Optional.of(reservation(t, ReservationStatus.CONFIRMED)));
        when(reservationRepository.hasOverlapExcluding(eq(1L), any(), any(), eq(7L))).thenReturn(false);

        ReservationResponse response = reservationService.update(7L, editRequest(3));

        assertThat(response.tableLabel()).isEqualTo("T1");
        assertThat(response.partySize()).isEqualTo(3);
        assertThat(response.status()).isEqualTo(ReservationStatus.CONFIRMED);
    }

    @Test
    void editReassignsTableWhenPartyOutgrowsCurrent() {
        RestaurantTable small = table(1, "T1", 2);
        RestaurantTable big = table(2, "T2", 6);
        when(reservationRepository.findById(7L))
                .thenReturn(Optional.of(reservation(small, ReservationStatus.CONFIRMED)));
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(5))
                .thenReturn(List.of(big));
        when(reservationRepository.hasOverlapExcluding(eq(2L), any(), any(), eq(7L))).thenReturn(false);

        ReservationResponse response = reservationService.update(7L, editRequest(5));

        assertThat(response.tableLabel()).isEqualTo("T2");
        assertThat(response.partySize()).isEqualTo(5);
    }

    @Test
    void editReassignsWhenCurrentTableStillFitsButIsBusy() {
        // Party still fits T1 (seats 4), but T1 is now booked for the new window — must move.
        RestaurantTable current = table(1, "T1", 4);
        RestaurantTable other = table(2, "T2", 4);
        when(reservationRepository.findById(7L))
                .thenReturn(Optional.of(reservation(current, ReservationStatus.CONFIRMED)));
        when(reservationRepository.hasOverlapExcluding(eq(1L), any(), any(), eq(7L))).thenReturn(true);
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(3))
                .thenReturn(List.of(current, other));
        when(reservationRepository.hasOverlapExcluding(eq(2L), any(), any(), eq(7L))).thenReturn(false);

        ReservationResponse response = reservationService.update(7L, editRequest(3));

        assertThat(response.tableLabel()).isEqualTo("T2");
    }

    @Test
    void rejectsEditWhenNoTableIsFreeForTheNewWindow() {
        RestaurantTable current = table(1, "T1", 4);
        when(reservationRepository.findById(7L))
                .thenReturn(Optional.of(reservation(current, ReservationStatus.CONFIRMED)));
        when(reservationRepository.hasOverlapExcluding(eq(1L), any(), any(), eq(7L))).thenReturn(true);
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(3))
                .thenReturn(List.of(current));

        assertThatThrownBy(() -> reservationService.update(7L, editRequest(3)))
                .isInstanceOf(NoTableAvailableException.class);
    }

    @Test
    void findByPhoneReturnsBookingsNewestFirstAndTrimsInput() {
        RestaurantTable t = table(1, "T1", 2);
        when(reservationRepository.findByPhoneOrderByReservedAtDesc("0770"))
                .thenReturn(List.of(reservation(t, ReservationStatus.CONFIRMED)));

        List<ReservationResponse> history = reservationService.findByPhone("  0770  ");

        assertThat(history).hasSize(1);
        assertThat(history.get(0).status()).isEqualTo(ReservationStatus.CONFIRMED);
    }

    @Test
    void findByPhoneRejectsBlankPhone() {
        assertThatThrownBy(() -> reservationService.findByPhone("  "))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void availabilityListsFreeSlotsWithinOpeningHours() {
        when(settingsService.getSettings())
                .thenReturn(new RestaurantSettings(LocalTime.of(11, 0), LocalTime.of(14, 0), 90));
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(2))
                .thenReturn(List.of(table(1, "T1", 2)));
        when(reservationRepository.hasOverlapExcluding(eq(1L), any(), any(), anyLong())).thenReturn(false);

        List<LocalTime> times = reservationService.findAvailableTimes(LocalDate.of(2026, 9, 20), 2);

        // 11:00–14:00 with a 90-min turn-time and 30-min slots: last start that still ends by 14:00 is 12:30.
        assertThat(times).containsExactly(
                LocalTime.of(11, 0), LocalTime.of(11, 30), LocalTime.of(12, 0), LocalTime.of(12, 30));
    }

    @Test
    void availabilityIsEmptyWhenNoTableFitsTheParty() {
        when(tableRepository.findBySeatsGreaterThanEqualOrderBySeatsAscLabelAsc(20))
                .thenReturn(List.of());

        assertThat(reservationService.findAvailableTimes(LocalDate.of(2026, 9, 20), 20)).isEmpty();
    }

    @Test
    void rejectsEditingATerminalReservation() {
        RestaurantTable t = table(1, "T1", 2);
        when(reservationRepository.findById(7L))
                .thenReturn(Optional.of(reservation(t, ReservationStatus.CANCELLED)));

        assertThatThrownBy(() -> reservationService.update(7L, editRequest(2)))
                .isInstanceOf(BadRequestException.class);
    }
}
