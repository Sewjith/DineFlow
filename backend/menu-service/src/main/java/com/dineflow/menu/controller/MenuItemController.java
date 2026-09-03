package com.dineflow.menu.controller;

import com.dineflow.menu.dto.AvailabilityRequest;
import com.dineflow.menu.dto.MenuImage;
import com.dineflow.menu.dto.MenuItemRequest;
import com.dineflow.menu.dto.MenuItemResponse;
import com.dineflow.menu.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @GetMapping
    public List<MenuItemResponse> list(@RequestParam(required = false) Long categoryId,
                                       @RequestParam(required = false) String search,
                                       @RequestParam(required = false) Boolean available) {
        return menuItemService.search(categoryId, search, available);
    }

    @GetMapping("/{id}")
    public MenuItemResponse get(@PathVariable Long id) {
        return menuItemService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItemResponse create(@Valid @RequestBody MenuItemRequest request) {
        return menuItemService.create(request);
    }

    @PutMapping("/{id}")
    public MenuItemResponse update(@PathVariable Long id,
                                   @Valid @RequestBody MenuItemRequest request) {
        return menuItemService.update(id, request);
    }

    @PatchMapping("/{id}/availability")
    public MenuItemResponse setAvailability(@PathVariable Long id,
                                            @Valid @RequestBody AvailabilityRequest request) {
        return menuItemService.setAvailability(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        menuItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Public: stream the item's photo. Returns 404 when the item has no uploaded photo. */
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        MenuImage image = menuItemService.getImage(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.contentType()))
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
                // Never let the browser sniff the body into a different (executable) type.
                .header("X-Content-Type-Options", "nosniff")
                .body(image.data());
    }

    /** Admin: set or replace the item's photo (multipart form field {@code file}). */
    @PostMapping("/{id}/image")
    public MenuItemResponse uploadImage(@PathVariable Long id,
                                        @RequestPart("file") MultipartFile file) {
        return menuItemService.setImage(id, file);
    }

    /** Admin: remove the item's photo. */
    @DeleteMapping("/{id}/image")
    public MenuItemResponse deleteImage(@PathVariable Long id) {
        return menuItemService.deleteImage(id);
    }
}
