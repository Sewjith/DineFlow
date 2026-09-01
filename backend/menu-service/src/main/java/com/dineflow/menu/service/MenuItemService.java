package com.dineflow.menu.service;

import com.dineflow.menu.domain.Category;
import com.dineflow.menu.domain.MenuItem;
import com.dineflow.menu.dto.AvailabilityRequest;
import com.dineflow.menu.dto.MenuItemRequest;
import com.dineflow.menu.dto.MenuItemResponse;
import com.dineflow.menu.exception.ResourceNotFoundException;
import com.dineflow.menu.repository.CategoryRepository;
import com.dineflow.menu.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    public MenuItemService(MenuItemRepository menuItemRepository,
                           CategoryRepository categoryRepository) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> search(Long categoryId, String search, Boolean available) {
        String normalized = (search == null || search.isBlank()) ? null : search.trim();
        return menuItemRepository.search(categoryId, normalized, available).stream()
                .map(MenuItemResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public MenuItemResponse findById(Long id) {
        return MenuItemResponse.fromEntity(getItem(id));
    }

    public MenuItemResponse create(MenuItemRequest request) {
        Category category = getCategory(request.categoryId());
        MenuItem item = new MenuItem();
        apply(item, request, category);
        item.setAvailable(request.availableOrDefault());
        return MenuItemResponse.fromEntity(menuItemRepository.save(item));
    }

    public MenuItemResponse update(Long id, MenuItemRequest request) {
        MenuItem item = getItem(id);
        Category category = getCategory(request.categoryId());
        apply(item, request, category);
        item.setAvailable(request.availableOrDefault());
        return MenuItemResponse.fromEntity(item);
    }

    public MenuItemResponse setAvailability(Long id, AvailabilityRequest request) {
        MenuItem item = getItem(id);
        item.setAvailable(request.available());
        return MenuItemResponse.fromEntity(item);
    }

    public void delete(Long id) {
        menuItemRepository.delete(getItem(id));
    }

    private void apply(MenuItem item, MenuItemRequest request, Category category) {
        item.setCategory(category);
        item.setName(request.name());
        item.setDescription(request.description());
        item.setPrice(request.price());
    }

    private MenuItem getItem(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Menu item", id));
    }

    private Category getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", id));
    }
}
