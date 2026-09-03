package com.dineflow.menu.service;

import com.dineflow.menu.domain.Category;
import com.dineflow.menu.domain.MenuItem;
import com.dineflow.menu.domain.MenuItemImage;
import com.dineflow.menu.dto.AvailabilityRequest;
import com.dineflow.menu.dto.MenuImage;
import com.dineflow.menu.dto.MenuItemRequest;
import com.dineflow.menu.dto.MenuItemResponse;
import com.dineflow.menu.exception.InvalidImageException;
import com.dineflow.menu.exception.ResourceNotFoundException;
import com.dineflow.menu.repository.CategoryRepository;
import com.dineflow.menu.repository.MenuItemImageRepository;
import com.dineflow.menu.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemImageRepository menuItemImageRepository;

    public MenuItemService(MenuItemRepository menuItemRepository,
                           CategoryRepository categoryRepository,
                           MenuItemImageRepository menuItemImageRepository) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.menuItemImageRepository = menuItemImageRepository;
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
        MenuItem item = getItem(id);
        if (item.hasImage()) {
            menuItemImageRepository.deleteById(id);
        }
        menuItemRepository.delete(item);
    }

    /** Stores (or replaces) the item's photo after validating it is a real JPEG/PNG/WebP. */
    public MenuItemResponse setImage(Long id, MultipartFile file) {
        MenuItem item = getItem(id);
        byte[] bytes = readBytes(file);
        String contentType = ImageValidator.detectContentType(bytes);

        menuItemImageRepository.save(new MenuItemImage(id, contentType, bytes));
        item.setImageContentType(contentType);
        item.setImageUpdatedAt(Instant.now());
        return MenuItemResponse.fromEntity(item);
    }

    /** Removes the item's photo, if any. Idempotent. */
    public MenuItemResponse deleteImage(Long id) {
        MenuItem item = getItem(id);
        if (item.hasImage()) {
            menuItemImageRepository.deleteById(id);
            item.setImageContentType(null);
            item.setImageUpdatedAt(null);
        }
        return MenuItemResponse.fromEntity(item);
    }

    @Transactional(readOnly = true)
    public MenuImage getImage(Long id) {
        return menuItemImageRepository.findById(id)
                .map(img -> new MenuImage(img.getContentType(), img.getData()))
                .orElseThrow(() -> ResourceNotFoundException.of("Menu item image", id));
    }

    private byte[] readBytes(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidImageException("Image file is required");
        }
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new InvalidImageException("Could not read the uploaded image");
        }
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
