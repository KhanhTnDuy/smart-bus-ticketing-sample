package com.smartbus.ticketing.audit.repository;

import com.smartbus.ticketing.audit.entity.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// SCRUM-47 - Truy cap bang audit_logs (moi nhat truoc, gioi han so dong bang Pageable)
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByEntityTypeOrderByCreatedAtDescIdDesc(String entityType, Pageable page);

    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDescIdDesc(String entityType, Long entityId, Pageable page);
}
