package com.smartbus.ticketing.bus.controller;

import com.smartbus.ticketing.bus.entity.Bus;
import com.smartbus.ticketing.bus.entity.BusSeat;
import com.smartbus.ticketing.bus.repository.BusRepository;
import com.smartbus.ticketing.bus.repository.BusSeatRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
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

    // Gioi han so do ghe - khop @Max trong Bus.java va seatLayout.js o Frontend
    private static final int MAX_ROWS = 20;
    private static final int MAX_COLS = 6;

    @Autowired
    private BusRepository repo;

    @Autowired
    private BusSeatRepository seatRepo;

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

    // GET /api/v1/buses/{id}/seats -> so do ghe cua xe (sap theo hang, cot)
    @GetMapping("/{id}/seats")
    public List<BusSeat> getSeats(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Khong tim thay xe ID: " + id);
        }
        return seatRepo.findByBusIdOrderByRowIndexAscColIndexAsc(id);
    }

    // POST /api/v1/buses -> them xe moi (co seatRows/seatCols thi tu sinh so do ghe)
    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@Valid @RequestBody Bus bus) {
        if (repo.existsByPlateNumber(bus.getPlateNumber())) {
            throw new IllegalArgumentException("Bien so xe da ton tai!");
        }
        if (bus.getSeatRows() != null || bus.getSeatCols() != null) {
            checkLayout(bus.getSeatRows(), bus.getSeatCols());
            bus.setCapacity(bus.getSeatRows() * bus.getSeatCols());
        } else if (bus.getCapacity() == null) {
            throw new IllegalArgumentException("So ghe (capacity) khong duoc rong");
        }
        Bus saved = repo.save(bus);
        generateSeats(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/v1/buses/{id} -> cap nhat xe (doi hang/cot thi sinh lai so do ghe)
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Bus b) {
        return repo.findById(id).map(bus -> {
            if (b.getPlateNumber() != null && !b.getPlateNumber().isBlank()
                    && !b.getPlateNumber().equals(bus.getPlateNumber())) {
                if (repo.existsByPlateNumber(b.getPlateNumber())) {
                    throw new IllegalArgumentException("Bien so xe da ton tai!");
                }
                bus.setPlateNumber(b.getPlateNumber());
            }
            if (b.getModel() != null) bus.setModel(b.getModel());
            if (b.getStatus() != null) bus.setStatus(b.getStatus());

            boolean layoutChanged = false;
            if (b.getSeatRows() != null || b.getSeatCols() != null) {
                Integer rows = b.getSeatRows() != null ? b.getSeatRows() : bus.getSeatRows();
                Integer cols = b.getSeatCols() != null ? b.getSeatCols() : bus.getSeatCols();
                checkLayout(rows, cols);
                layoutChanged = !rows.equals(bus.getSeatRows()) || !cols.equals(bus.getSeatCols());
                bus.setSeatRows(rows);
                bus.setSeatCols(cols);
                bus.setCapacity(rows * cols);
            } else if (b.getCapacity() != null && bus.getSeatRows() == null) {
                // Chi cho nhap tay capacity khi xe chua co so do ghe (tranh lech voi so ghe sinh ra)
                bus.setCapacity(b.getCapacity());
            }
            Bus saved = repo.save(bus);
            if (layoutChanged) generateSeats(saved);
            return ResponseEntity.ok(saved);
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

    // Hang va cot phai co du, nam trong gioi han
    private void checkLayout(Integer rows, Integer cols) {
        if (rows == null || cols == null) {
            throw new IllegalArgumentException("Phai nhap du so hang (seatRows) va so cot (seatCols)");
        }
        if (rows < 1 || rows > MAX_ROWS) {
            throw new IllegalArgumentException("So hang ghe phai tu 1 den " + MAX_ROWS);
        }
        if (cols < 1 || cols > MAX_COLS) {
            throw new IllegalArgumentException("So cot ghe phai tu 1 den " + MAX_COLS);
        }
    }

    // Sinh lai toan bo ghe cua xe: hang 0 -> 'A', cot 0 -> '1' => "A1", "A2", "B1"...
    private void generateSeats(Bus bus) {
        if (bus.getSeatRows() == null || bus.getSeatCols() == null) return;
        seatRepo.deleteAllByBusId(bus.getId());
        List<BusSeat> seats = new ArrayList<>();
        for (int r = 0; r < bus.getSeatRows(); r++) {
            for (int c = 0; c < bus.getSeatCols(); c++) {
                seats.add(new BusSeat(bus.getId(), (char) ('A' + r) + String.valueOf(c + 1), r, c));
            }
        }
        seatRepo.saveAll(seats);
    }
}
