package com.dineflow.order.controller;

import com.dineflow.order.domain.OrderStatus;
import com.dineflow.order.dto.DashboardResponse;
import com.dineflow.order.dto.OrderResponse;
import com.dineflow.order.dto.PlaceOrderRequest;
import com.dineflow.order.dto.UpdateStatusRequest;
import com.dineflow.order.service.OrderService;
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

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // --- Public (customer) ---

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(@Valid @RequestBody PlaceOrderRequest request) {
        return orderService.placeOrder(request);
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
        return orderService.updateStatus(id, request.status());
    }
}
