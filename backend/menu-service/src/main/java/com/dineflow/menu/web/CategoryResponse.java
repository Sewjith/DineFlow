package com.dineflow.menu.web;

import com.dineflow.menu.domain.Category;

/** Category as returned to clients. */
public record CategoryResponse(Long id, String name) {

    public static CategoryResponse fromEntity(Category category) {
        return new CategoryResponse(category.getId(), category.getName());
    }
}
