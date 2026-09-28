package com.smartbus.ticketing.bus.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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

    @NotNull(message = "So ghe (capacity) khong duoc rong")
    @Min(value = 1, message = "So ghe phai lon hon 0")
    private Integer capacity;

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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
