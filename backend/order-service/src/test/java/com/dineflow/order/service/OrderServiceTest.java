package com.dineflow.order.service;

import com.dineflow.order.client.MenuClient;
import com.dineflow.order.client.MenuItemDto;
import com.dineflow.order.client.ReservationClient;
import com.dineflow.order.domain.Order;
import com.dineflow.order.domain.OrderStatus;
import com.dineflow.order.domain.OrderType;
import com.dineflow.order.dto.DashboardResponse;
import com.dineflow.order.dto.OrderLineRequest;
import com.dineflow.order.dto.OrderResponse;
import com.dineflow.order.dto.PlaceOrderRequest;
import com.dineflow.order.exception.BadRequestException;
import com.dineflow.order.exception.ConflictException;
import com.dineflow.order.exception.ResourceNotFoundException;
import com.dineflow.order.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private MenuClient menuClient;
    @Mock
    private ReservationClient reservationClient;
    @InjectMocks
    private OrderService orderService;

    private void stubSaveAndReference() {
        when(orderRepository.existsByReference(any())).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void computesTotalFromLiveMenuPrices() {
        stubSaveAndReference();
        when(menuClient.findItem(1L)).thenReturn(Optional.of(new MenuItemDto(1L, "Pizza", new BigDecimal("9.50"), true)));
        when(menuClient.findItem(2L)).thenReturn(Optional.of(new MenuItemDto(2L, "Water", new BigDecimal("1.50"), true)));

        PlaceOrderRequest request = new PlaceOrderRequest("Alice", "0770", OrderType.TAKEAWAY, null,
                List.of(new OrderLineRequest(1L, 2), new OrderLineRequest(2L, 3)));

        OrderResponse response = orderService.placeOrder(request);

        // 2 x 9.50 + 3 x 1.50 = 23.50 — computed on the server, not from the client.
        assertThat(response.total()).isEqualByComparingTo("23.50");
        assertThat(response.status()).isEqualTo(OrderStatus.PLACED);
        assertThat(response.reference()).startsWith("ORD-");
        assertThat(response.items()).hasSize(2);
    }

    @Test
    void rejectsDineInWithoutTableLabel() {
        PlaceOrderRequest request = new PlaceOrderRequest("Bob", "0770", OrderType.DINE_IN, null,
                List.of(new OrderLineRequest(1L, 1)));

        assertThatThrownBy(() -> orderService.placeOrder(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("tableLabel");
    }

    @Test
    void rejectsDineInWithUnknownTable() {
        when(reservationClient.tableExists("T9")).thenReturn(false);

        PlaceOrderRequest request = new PlaceOrderRequest("Bea", "0770", OrderType.DINE_IN, "T9",
                List.of(new OrderLineRequest(1L, 1)));

        assertThatThrownBy(() -> orderService.placeOrder(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not exist");
    }

    @Test
    void placesDineInWithValidTable() {
        stubSaveAndReference();
        when(reservationClient.tableExists("T3")).thenReturn(true);
        when(menuClient.findItem(1L))
                .thenReturn(Optional.of(new MenuItemDto(1L, "Pizza", new BigDecimal("9.50"), true)));

        PlaceOrderRequest request = new PlaceOrderRequest("Bob", "0770", OrderType.DINE_IN, "T3",
                List.of(new OrderLineRequest(1L, 1)));

        OrderResponse response = orderService.placeOrder(request);

        assertThat(response.tableLabel()).isEqualTo("T3");
        assertThat(response.status()).isEqualTo(OrderStatus.PLACED);
    }

    @Test
    void rejectsUnavailableItem() {
        when(menuClient.findItem(1L)).thenReturn(Optional.of(new MenuItemDto(1L, "Burger", new BigDecimal("10.00"), false)));

        PlaceOrderRequest request = new PlaceOrderRequest("Cara", "0770", OrderType.TAKEAWAY, null,
                List.of(new OrderLineRequest(1L, 1)));

        assertThatThrownBy(() -> orderService.placeOrder(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void rejectsMissingItem() {
        when(menuClient.findItem(99L)).thenReturn(Optional.empty());

        PlaceOrderRequest request = new PlaceOrderRequest("Dan", "0770", OrderType.TAKEAWAY, null,
                List.of(new OrderLineRequest(99L, 1)));

        assertThatThrownBy(() -> orderService.placeOrder(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not exist");
    }

    @Test
    void findsOrderHistoryByPhone() {
        Order order = new Order();
        order.setReference("ORD-ABC123");
        order.setPhone("0770");
        when(orderRepository.findByPhoneOrderByCreatedAtDesc("0770")).thenReturn(List.of(order));

        List<OrderResponse> history = orderService.findByPhone("  0770  ");

        assertThat(history).hasSize(1);
        assertThat(history.get(0).reference()).isEqualTo("ORD-ABC123");
    }

    @Test
    void rejectsBlankPhoneLookup() {
        assertThatThrownBy(() -> orderService.findByPhone("  "))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void rejectsInvalidStatusTransition() {
        Order order = new Order();
        order.setStatus(OrderStatus.PLACED);
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        // PLACED cannot jump straight to READY.
        assertThatThrownBy(() -> orderService.updateStatus(5L, OrderStatus.READY))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void dashboardExcludesCancelledAndSumsTodaysRevenue() {
        Order active1 = new Order();
        active1.setStatus(OrderStatus.PLACED);
        active1.setTotal(new BigDecimal("10.00"));
        Order active2 = new Order();
        active2.setStatus(OrderStatus.COMPLETED);
        active2.setTotal(new BigDecimal("5.50"));
        Order cancelled = new Order();
        cancelled.setStatus(OrderStatus.CANCELLED);
        cancelled.setTotal(new BigDecimal("99.00"));
        when(orderRepository.findByCreatedAtGreaterThanEqual(any(Instant.class)))
                .thenReturn(List.of(active1, active2, cancelled));

        DashboardResponse dashboard = orderService.dashboard();

        // Cancelled order is excluded from both count and revenue.
        assertThat(dashboard.orderCount()).isEqualTo(2);
        assertThat(dashboard.revenue()).isEqualByComparingTo("15.50");
    }

    @Test
    void findByReferenceThrowsWhenMissing() {
        when(orderRepository.findByReference("ORD-NOPE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.findByReference("ORD-NOPE"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void allowsValidStatusTransition() {
        Order order = new Order();
        order.setStatus(OrderStatus.PLACED);
        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.updateStatus(5L, OrderStatus.CONFIRMED);

        assertThat(response.status()).isEqualTo(OrderStatus.CONFIRMED);
    }
}
