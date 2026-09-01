package com.dineflow.order.service;

import com.dineflow.order.client.MenuClient;
import com.dineflow.order.client.MenuItemDto;
import com.dineflow.order.domain.Order;
import com.dineflow.order.domain.OrderItem;
import com.dineflow.order.domain.OrderStatus;
import com.dineflow.order.domain.OrderType;
import com.dineflow.order.dto.OrderLineRequest;
import com.dineflow.order.dto.OrderResponse;
import com.dineflow.order.dto.PlaceOrderRequest;
import com.dineflow.order.exception.BadRequestException;
import com.dineflow.order.exception.ConflictException;
import com.dineflow.order.exception.ResourceNotFoundException;
import com.dineflow.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;

@Service
@Transactional
public class OrderService {

    private static final String REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int REFERENCE_LENGTH = 6;
    private static final int MAX_REFERENCE_ATTEMPTS = 5;

    private final OrderRepository orderRepository;
    private final MenuClient menuClient;
    private final SecureRandom random = new SecureRandom();

    public OrderService(OrderRepository orderRepository, MenuClient menuClient) {
        this.orderRepository = orderRepository;
        this.menuClient = menuClient;
    }

    public OrderResponse placeOrder(PlaceOrderRequest request) {
        if (request.orderType() == OrderType.DINE_IN && request.tableNumber() == null) {
            throw new BadRequestException("tableNumber is required for dine-in orders");
        }

        Order order = new Order();
        order.setReference(generateUniqueReference());
        order.setCustomerName(request.customerName());
        order.setPhone(request.phone());
        order.setOrderType(request.orderType());
        order.setTableNumber(request.orderType() == OrderType.DINE_IN ? request.tableNumber() : null);
        order.setStatus(OrderStatus.PLACED);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderLineRequest line : request.items()) {
            MenuItemDto item = menuClient.findItem(line.menuItemId())
                    .orElseThrow(() -> new BadRequestException(
                            "Menu item " + line.menuItemId() + " does not exist"));
            if (!item.available()) {
                throw new BadRequestException("Menu item '" + item.name() + "' is not available");
            }
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItemId(item.id());
            orderItem.setName(item.name());
            orderItem.setUnitPrice(item.price());
            orderItem.setQuantity(line.quantity());
            order.addItem(orderItem);
            total = total.add(orderItem.lineTotal());
        }
        order.setTotal(total);

        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public OrderResponse findByReference(String reference) {
        Order order = orderRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with reference " + reference));
        return OrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(Long id) {
        return OrderResponse.fromEntity(getOrder(id));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findAll(OrderStatus status) {
        List<Order> orders = (status == null)
                ? orderRepository.findAllByOrderByCreatedAtDesc()
                : orderRepository.findByStatusOrderByCreatedAtDesc(status);
        return orders.stream().map(OrderResponse::fromEntity).toList();
    }

    public OrderResponse updateStatus(Long id, OrderStatus target) {
        Order order = getOrder(id);
        if (!order.getStatus().canTransitionTo(target)) {
            throw new ConflictException(
                    "Cannot change status from " + order.getStatus() + " to " + target);
        }
        order.setStatus(target);
        return OrderResponse.fromEntity(order);
    }

    private Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + id));
    }

    private String generateUniqueReference() {
        for (int attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt++) {
            String reference = randomReference();
            if (!orderRepository.existsByReference(reference)) {
                return reference;
            }
        }
        throw new ConflictException("Could not generate a unique order reference, please retry");
    }

    private String randomReference() {
        StringBuilder sb = new StringBuilder("ORD-");
        for (int i = 0; i < REFERENCE_LENGTH; i++) {
            sb.append(REFERENCE_ALPHABET.charAt(random.nextInt(REFERENCE_ALPHABET.length())));
        }
        return sb.toString();
    }
}
