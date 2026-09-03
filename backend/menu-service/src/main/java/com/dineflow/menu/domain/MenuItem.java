package com.dineflow.menu.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/** A single item on the menu, belonging to one {@link Category}. */
@Entity
@Table(name = "menu_item")
@Getter
@Setter
@NoArgsConstructor
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private boolean available = true;

    /**
     * MIME type of the uploaded photo, or {@code null} when the item has no photo.
     * Kept on the item (rather than with the bytes) so lists can tell an image exists
     * without loading it. The actual bytes live in {@link MenuItemImage}.
     */
    @Column(name = "image_content_type")
    private String imageContentType;

    /** When the photo was last set — used as a cache-busting version for the image URL. */
    @Column(name = "image_updated_at")
    private Instant imageUpdatedAt;

    public boolean hasImage() {
        return imageContentType != null;
    }
}
