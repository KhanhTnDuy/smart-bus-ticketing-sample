package com.smartbus.ticketing.bus.repository;

import com.smartbus.ticketing.bus.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// ============================================================================
// MODULE MAU - Tang REPOSITORY (truy cap CSDL)
// Chi can khai bao interface, Spring Data JPA tu sinh cau lenh SQL.
// - JpaRepository<Bus, Long> co san: findAll, findById, save, deleteById...
// - Cac phuong thuc duoi la "derived query": Spring doc ten ham -> sinh SQL.
// ============================================================================
public interface BusRepository extends JpaRepository<Bus, Long> {

    // Kiem tra trung bien so truoc khi them moi -> WHERE plate_number = ?
    boolean existsByPlateNumber(String plateNumber);

    // Loc xe theo trang thai -> WHERE status = ?
    List<Bus> findByStatus(String status);
}
