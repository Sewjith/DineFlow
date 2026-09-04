package com.dineflow.menu.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Raw bytes of a menu item's photo, stored in its own table so browsing the menu never
 * loads image data. The primary key is the owning {@link MenuItem} id (one image per item).
 */
@Entity
@Table(name = "menu_item_image")
@Getter
@Setter
@NoArgsConstructor
public class MenuItemImage {

    @Id
    @Column(name = "menu_item_id")
    private Long menuItemId;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    // Plain byte[] maps to Postgres `bytea` (not a large-object `oid`), avoiding the
    // "Large Objects may not be used in auto-commit mode" error.
    @Column(name = "data", nullable = false, columnDefinition = "bytea")
    private byte[] data;

    public MenuItemImage(Long menuItemId, String contentType, byte[] data) {
        this.menuItemId = menuItemId;
        this.contentType = contentType;
        this.data = data;
    }
}
