package com.dineflow.order.controller;

import com.dineflow.order.domain.OrderStatus;
import com.dineflow.order.dto.DashboardResponse;
import com.dineflow.order.dto.OrderResponse;
import com.dineflow.order.dto.PlaceOrderRequest;
import com.dineflow.order.dto.UpdateStatusRequest;
import com.dineflow.order.service.OrderService;
import com.dineflow.order.socket.OrderEventPublisher;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderEventPublisher eventPublisher;

    public OrderController(OrderService orderService, OrderEventPublisher eventPublisher) {
        this.orderService = orderService;
        this.eventPublisher = eventPublisher;
    }

    // --- Public (customer) ---

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(@Valid @RequestBody PlaceOrderRequest request) {
        // The service's @Transactional method has committed by the time it returns,
        // so broadcasting here means clients never see an order that isn't persisted.
        OrderResponse order = orderService.placeOrder(request);
        eventPublisher.broadcastOrderChanged(order);
        return order;
    }

    @GetMapping("/reference/{reference}")
    public OrderResponse getByReference(@PathVariable String reference) {
        return orderService.findByReference(reference);
    }

    // --- Admin ---

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return orderService.dashboard();
    }

    @GetMapping
    public List<OrderResponse> list(@RequestParam(required = false) OrderStatus status) {
        return orderService.findAll(status);
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody UpdateStatusRequest request) {
        OrderResponse order = orderService.updateStatus(id, request.status());
        eventPublisher.broadcastOrderChanged(order);
        return order;
    }
}
