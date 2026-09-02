package com.dineflow.order.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Today's headline numbers for the admin dashboard. Cancelled orders are excluded. */
public record DashboardResponse(
        LocalDate date,
        long orderCount,
        BigDecimal revenue
) {
}
