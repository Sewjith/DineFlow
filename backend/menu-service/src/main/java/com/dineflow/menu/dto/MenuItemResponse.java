package com.dineflow.menu.dto;

import com.dineflow.menu.domain.MenuItem;

import java.math.BigDecimal;

/** Menu item as returned to clients, including its category name for grouping. */
public record MenuItemResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String name,
        String description,
        BigDecimal price,
        boolean available
) {
    public static MenuItemResponse fromEntity(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.isAvailable()
        );
    }
}
