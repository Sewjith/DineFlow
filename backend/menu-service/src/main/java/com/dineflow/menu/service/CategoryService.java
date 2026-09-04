package com.dineflow.menu.service;

import com.dineflow.menu.domain.Category;
import com.dineflow.menu.web.CategoryRequest;
import com.dineflow.menu.web.CategoryResponse;
import com.dineflow.menu.domain.DuplicateResourceException;
import com.dineflow.menu.domain.ResourceNotFoundException;
import com.dineflow.menu.infra.CategoryRepository;
import com.dineflow.menu.infra.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           MenuItemRepository menuItemRepository) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Category already exists: " + request.name());
        }
        Category saved = categoryRepository.save(new Category(request.name()));
        return CategoryResponse.fromEntity(saved);
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", id));
        categoryRepository.findByNameIgnoreCase(request.name())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Category already exists: " + request.name());
                });
        category.setName(request.name());
        return CategoryResponse.fromEntity(category);
    }

    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", id));
        if (menuItemRepository.existsByCategoryId(id)) {
            throw new DuplicateResourceException(
                    "Category cannot be deleted while it still has menu items");
        }
        categoryRepository.delete(category);
    }
}
