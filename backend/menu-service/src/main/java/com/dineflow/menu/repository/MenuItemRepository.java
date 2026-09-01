package com.dineflow.menu.repository;

import com.dineflow.menu.domain.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    boolean existsByCategoryId(Long categoryId);

    /**
     * Filters menu items. Any of the parameters may be {@code null}, in which case that
     * filter is skipped. {@code search} matches the name or description (case-insensitive).
     */
    @Query("""
            select m from MenuItem m
            where (:categoryId is null or m.category.id = :categoryId)
              and (:available is null or m.available = :available)
              and (:search is null
                   or lower(m.name) like lower(concat('%', cast(:search as string), '%'))
                   or lower(m.description) like lower(concat('%', cast(:search as string), '%')))
            order by m.category.id, m.name
            """)
    List<MenuItem> search(@Param("categoryId") Long categoryId,
                          @Param("search") String search,
                          @Param("available") Boolean available);
}
