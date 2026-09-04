package com.dineflow.order.repository;

import com.dineflow.order.domain.Order;
import com.dineflow.order.domain.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    boolean existsByReference(String reference);

    Optional<Order> findByReference(String reference);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findByPhoneOrderByCreatedAtDesc(String phone);

    List<Order> findByCreatedAtGreaterThanEqual(Instant start);
}
