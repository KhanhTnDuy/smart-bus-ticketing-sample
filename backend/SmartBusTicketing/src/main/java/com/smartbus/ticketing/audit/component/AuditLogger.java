package com.smartbus.ticketing.audit.component;

import com.smartbus.ticketing.audit.entity.AuditLog;
import com.smartbus.ticketing.audit.repository.AuditLogRepository;
import com.smartbus.ticketing.security.RoleInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

// ============================================================================
// SCRUM-47 - Ghi nhat ky thay doi. Controller (vd ScheduleController) goi sau khi
// them/sua/xoa thanh cong, nguoi thao tac lay tu RoleInterceptor:
//
//   Schedule saved = repo.save(s);
//   auditLogger.log(request, "SCHEDULE", saved.getId(), "CREATE", "Tuyen 5, 06:00-22:00, 15 phut/chuyen");
//
// Goi trong cung @Transactional voi thao tac chinh de nhat ky rollback cung nhau.
// ============================================================================
@Component
public class AuditLogger {

    private static final int MAX_DETAILS = 2000;

    @Autowired
    private AuditLogRepository repo;

    public AuditLog log(HttpServletRequest req, String entityType, Long entityId, String action, String details) {
        AuditLog entry = new AuditLog();
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setAction(action);
        entry.setActor(String.valueOf(req.getAttribute(RoleInterceptor.ATTR_USER)));
        entry.setActorRole(String.valueOf(req.getAttribute(RoleInterceptor.ATTR_ROLE)));
        if (details != null) {
            entry.setDetails(details.length() > MAX_DETAILS ? details.substring(0, MAX_DETAILS) : details);
        }
        return repo.save(entry);
    }
}
