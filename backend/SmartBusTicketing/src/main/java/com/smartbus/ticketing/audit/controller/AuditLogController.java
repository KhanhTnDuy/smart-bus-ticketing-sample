package com.smartbus.ticketing.audit.controller;

import com.smartbus.ticketing.audit.entity.AuditLog;
import com.smartbus.ticketing.audit.repository.AuditLogRepository;
import com.smartbus.ticketing.security.RequireRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// ============================================================================
// SCRUM-47 - API xem nhat ky thay doi (chi ADMIN/MANAGER).
// GET /api/v1/audit-logs                                -> 200 dong moi nhat
// GET /api/v1/audit-logs?entityType=SCHEDULE            -> chi lich trinh
// GET /api/v1/audit-logs?entityType=SCHEDULE&entityId=7 -> lich su 1 lich trinh
// ============================================================================
@RestController
@RequestMapping("/api/v1/audit-logs")
@CrossOrigin("*")
@RequireRole
public class AuditLogController {

    private static final int LIMIT = 200;

    @Autowired
    private AuditLogRepository repo;

    @GetMapping
    public List<AuditLog> getAll(@RequestParam(required = false) String entityType,
                                 @RequestParam(required = false) Long entityId) {
        if (entityId != null && entityType == null) {
            throw new IllegalArgumentException("Loc theo entityId thi phai co entityType");
        }
        if (entityType == null) {
            return repo.findAll(PageRequest.of(0, LIMIT, Sort.by(Sort.Direction.DESC, "createdAt", "id"))).getContent();
        }
        PageRequest page = PageRequest.of(0, LIMIT);
        return entityId == null
                ? repo.findByEntityTypeOrderByCreatedAtDescIdDesc(entityType, page)
                : repo.findByEntityTypeAndEntityIdOrderByCreatedAtDescIdDesc(entityType, entityId, page);
    }
}
