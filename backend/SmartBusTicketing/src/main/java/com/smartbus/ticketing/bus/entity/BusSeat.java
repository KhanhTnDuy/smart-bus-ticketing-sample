package com.smartbus.ticketing.bus.entity;

import jakarta.persistence.*;

// ============================================================================
// Tang ENTITY - Ghe cua xe (bang bus_seats). Sinh tu dong tu seatRows x seatCols
// cua Bus. Ma ghe: chu cai hang + so cot, vd hang 0 cot 0 -> "A1".
// ============================================================================
@Entity
@Table(name = "bus_seats",
        uniqueConstraints = @UniqueConstraint(columnNames = {"bus_id", "seat_code"}))
public class BusSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_id", nullable = false)
    private Long busId;

    @Column(name = "seat_code", nullable = false, length = 10)
    private String seatCode;

    @Column(name = "row_index", nullable = false)
    private Integer rowIndex;

    @Column(name = "col_index", nullable = false)
    private Integer colIndex;

    public BusSeat() {}

    public BusSeat(Long busId, String seatCode, Integer rowIndex, Integer colIndex) {
        this.busId = busId;
        this.seatCode = seatCode;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
    }

    public Long getId() { return id; }
    public Long getBusId() { return busId; }
    public String getSeatCode() { return seatCode; }
    public Integer getRowIndex() { return rowIndex; }
    public Integer getColIndex() { return colIndex; }
}
