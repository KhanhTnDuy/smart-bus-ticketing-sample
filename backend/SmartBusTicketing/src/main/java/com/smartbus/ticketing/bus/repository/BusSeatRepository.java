package com.smartbus.ticketing.bus.repository;

import com.smartbus.ticketing.bus.entity.BusSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

// Truy cap bang bus_seats.
public interface BusSeatRepository extends JpaRepository<BusSeat, Long> {

    // Sap theo hang roi theo cot de Frontend ve luoi dung thu tu
    List<BusSeat> findByBusIdOrderByRowIndexAscColIndexAsc(Long busId);

    // Xoa hang loat bang 1 cau DELETE chay ngay (derived deleteBy se bi Hibernate
    // xep SAU cac INSERT khi flush -> vi pham unique bus_id + seat_code khi sinh lai).
    @Modifying(clearAutomatically = true)
    @Query("delete from BusSeat s where s.busId = :busId")
    void deleteAllByBusId(@Param("busId") Long busId);
}
