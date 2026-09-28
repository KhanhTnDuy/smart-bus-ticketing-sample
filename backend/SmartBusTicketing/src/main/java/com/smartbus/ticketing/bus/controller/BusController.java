package com.smartbus.ticketing.bus.controller;

import com.smartbus.ticketing.bus.entity.Bus;
import com.smartbus.ticketing.bus.repository.BusRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

// ============================================================================
// MODULE MAU - Tang CONTROLLER (REST API - noi Frontend goi vao)
// Base URL: http://localhost:8080/api/v1/buses
// @CrossOrigin("*") de Frontend (Vite chay o cong khac) goi duoc.
// Controller goi thang Repository (du an dang theo kieu mong, khong co Service layer).
// ============================================================================
@RestController
@RequestMapping("/api/v1/buses")
@CrossOrigin("*")
public class BusController {

    @Autowired
    private BusRepository repo;

    // GET /api/v1/buses -> lay danh sach xe
    @GetMapping
    public List<Bus> getAll() {
        return repo.findAll();
    }

    // GET /api/v1/buses/{id} -> lay 1 xe theo id
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay xe ID: " + id));
    }

    // POST /api/v1/buses -> them xe moi
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Bus bus) {
        if (repo.existsByPlateNumber(bus.getPlateNumber())) {
            throw new IllegalArgumentException("Bien so xe da ton tai!");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(bus));
    }

    // PUT /api/v1/buses/{id} -> cap nhat xe
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Bus b) {
        return repo.findById(id).map(bus -> {
            if (b.getModel() != null) bus.setModel(b.getModel());
            if (b.getCapacity() != null) bus.setCapacity(b.getCapacity());
            if (b.getStatus() != null) bus.setStatus(b.getStatus());
            return ResponseEntity.ok(repo.save(bus));
        }).orElseThrow(() -> new IllegalArgumentException("Khong tim thay xe ID: " + id));
    }

    // DELETE /api/v1/buses/{id} -> xoa mem (chuyen trang thai INACTIVE)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return repo.findById(id).map(bus -> {
            bus.setStatus("INACTIVE");
            repo.save(bus);
            return ResponseEntity.ok(Map.of("success", true));
        }).orElseThrow(() -> new IllegalArgumentException("Khong tim thay xe ID: " + id));
    }
}
