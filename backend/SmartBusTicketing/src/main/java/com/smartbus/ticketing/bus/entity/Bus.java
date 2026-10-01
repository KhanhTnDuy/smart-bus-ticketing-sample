package com.smartbus.ticketing.bus.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

// ============================================================================
// MODULE MAU - Tang ENTITY (anh xa 1 bang trong CSDL thanh 1 class Java)
// Bang tuong ung: buses (xem backend/database/schema.sql)
// JPA/Hibernate se tu tao/anh xa bang nay. Ten cot camelCase -> snake_case
// tu dong (plateNumber -> plate_number), nhung o day khai bao ro rang de lam mau.
// ============================================================================
@Entity
@Table(name = "buses")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Bien so xe (plateNumber) khong duoc rong")
    @Column(name = "plate_number", nullable = false, unique = true, length = 20)
    private String plateNumber;

    @Column(length = 100)
    private String model;

    // Neu co seatRows/seatCols thi capacity = seatRows * seatCols (controller tu tinh).
    // Xe cu chua co so do ghe van dung capacity nhap tay.
    @Min(value = 1, message = "So ghe phai lon hon 0")
    private Integer capacity;

    // So do ghe: so hang x so cot (xem BusSeat). Gioi han khop BusController.
    @Min(value = 1, message = "So hang ghe phai lon hon 0")
    @Max(value = 20, message = "So hang ghe toi da 20")
    @Column(name = "seat_rows")
    private Integer seatRows;

    @Min(value = 1, message = "So cot ghe phai lon hon 0")
    @Max(value = 6, message = "So cot ghe toi da 6")
    @Column(name = "seat_cols")
    private Integer seatCols;

    // ACTIVE | MAINTENANCE | INACTIVE - khop ENUM trong schema.sql
    private String status = "ACTIVE";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getSeatRows() { return seatRows; }
    public void setSeatRows(Integer seatRows) { this.seatRows = seatRows; }
    public Integer getSeatCols() { return seatCols; }
    public void setSeatCols(Integer seatCols) { this.seatCols = seatCols; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
