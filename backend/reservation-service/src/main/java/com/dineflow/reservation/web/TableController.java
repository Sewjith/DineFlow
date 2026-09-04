package com.dineflow.reservation.web;

import com.dineflow.reservation.web.TableRequest;
import com.dineflow.reservation.web.TableResponse;
import com.dineflow.reservation.service.TableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Admin-only management of the restaurant's physical tables. */
@RestController
@RequestMapping("/tables")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @GetMapping
    public List<TableResponse> list() {
        return tableService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TableResponse create(@Valid @RequestBody TableRequest request) {
        return tableService.create(request);
    }

    @PutMapping("/{id}")
    public TableResponse update(@PathVariable Long id, @Valid @RequestBody TableRequest request) {
        return tableService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tableService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
