package com.dineflow.reservation.service;

import com.dineflow.reservation.domain.RestaurantTable;
import com.dineflow.reservation.web.TableRequest;
import com.dineflow.reservation.web.TableResponse;
import com.dineflow.reservation.domain.ConflictException;
import com.dineflow.reservation.domain.ResourceNotFoundException;
import com.dineflow.reservation.infra.ReservationRepository;
import com.dineflow.reservation.infra.RestaurantTableRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TableServiceTest {

    @Mock
    private RestaurantTableRepository tableRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @InjectMocks
    private TableService tableService;

    private static RestaurantTable table(long id, String label, int seats) {
        RestaurantTable t = new RestaurantTable();
        t.setId(id);
        t.setLabel(label);
        t.setSeats(seats);
        return t;
    }

    @Test
    void createsTableWithUniqueLabel() {
        when(tableRepository.findByLabelIgnoreCase("T7")).thenReturn(Optional.empty());
        when(tableRepository.save(any(RestaurantTable.class))).thenAnswer(inv -> inv.getArgument(0));

        TableResponse response = tableService.create(new TableRequest("T7", 4));

        assertThat(response.label()).isEqualTo("T7");
        assertThat(response.seats()).isEqualTo(4);
    }

    @Test
    void rejectsDuplicateLabelOnCreate() {
        when(tableRepository.findByLabelIgnoreCase("T1")).thenReturn(Optional.of(table(1, "T1", 2)));

        assertThatThrownBy(() -> tableService.create(new TableRequest("T1", 2)))
                .isInstanceOf(ConflictException.class);
        verify(tableRepository, never()).save(any());
    }

    @Test
    void updatesSeatsKeepingSameLabel() {
        RestaurantTable existing = table(1, "T1", 2);
        when(tableRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(tableRepository.findByLabelIgnoreCase("T1")).thenReturn(Optional.of(existing));

        TableResponse response = tableService.update(1L, new TableRequest("T1", 4));

        assertThat(response.seats()).isEqualTo(4);
    }

    @Test
    void rejectsUpdateThatCollidesWithAnotherLabel() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(table(1, "T1", 2)));
        when(tableRepository.findByLabelIgnoreCase("T2")).thenReturn(Optional.of(table(2, "T2", 4)));

        assertThatThrownBy(() -> tableService.update(1L, new TableRequest("T2", 2)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void deletesTableWithoutActiveBookings() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(table(1, "T1", 2)));
        when(reservationRepository.existsByTable_IdAndStatusIn(eq(1L), any())).thenReturn(false);

        tableService.delete(1L);

        verify(reservationRepository).deleteByTable_Id(1L);
        verify(tableRepository).delete(any(RestaurantTable.class));
    }

    @Test
    void blocksDeleteWhenTableHasActiveBookings() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(table(1, "T1", 2)));
        when(reservationRepository.existsByTable_IdAndStatusIn(eq(1L), any())).thenReturn(true);

        assertThatThrownBy(() -> tableService.delete(1L))
                .isInstanceOf(ConflictException.class);
        verify(tableRepository, never()).delete(any());
    }

    @Test
    void rejectsDeletingUnknownTable() {
        when(tableRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tableService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void rejectsUpdatingUnknownTable() {
        when(tableRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tableService.update(99L, new TableRequest("T9", 2)))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
