package com.smartbus.ticketing.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import java.io.IOException;
import java.util.Arrays;

// ============================================================================
// SCRUM-47 - Chan API theo vai tro (xem @RequireRole).
// LUU Y: du an mau chua co dang nhap/JWT nen vai tro lay tu 2 header:
//   X-User-Role : ADMIN | MANAGER | ...   (thieu -> 401, khong du quyen -> 403)
//   X-User-Name : ten nguoi thao tac (ghi vao nhat ky)
// Header co the bi gia mao -> khi co dang nhap that, thay phan doc header o day
// bang doc vai tro tu JWT/Spring Security; cac noi dung @RequireRole giu nguyen.
// ============================================================================
@Component
public class RoleInterceptor implements HandlerInterceptor {

    public static final String HEADER_ROLE = "X-User-Role";
    public static final String HEADER_USER = "X-User-Name";
    public static final String ATTR_ROLE = "currentRole";
    public static final String ATTR_USER = "currentUser";

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws IOException {
        String role = req.getHeader(HEADER_ROLE);
        String user = req.getHeader(HEADER_USER);
        role = role == null ? "" : role.trim().toUpperCase();
        // De AuditLogger lay duoc nguoi thao tac o moi API, ke ca API khong bi chan quyen
        req.setAttribute(ATTR_ROLE, role);
        req.setAttribute(ATTR_USER, user == null || user.isBlank() ? "unknown" : user.trim());

        if (!(handler instanceof HandlerMethod hm)) return true; // vd: CORS preflight OPTIONS

        RequireRole required = hm.getMethodAnnotation(RequireRole.class);
        if (required == null) required = hm.getBeanType().getAnnotation(RequireRole.class);
        if (required == null) return true;

        if (role.isEmpty()) {
            deny(res, HttpServletResponse.SC_UNAUTHORIZED, "Chua xac dinh nguoi dung (thieu header " + HEADER_ROLE + ")");
            return false;
        }
        if (!Arrays.asList(required.value()).contains(role)) {
            deny(res, HttpServletResponse.SC_FORBIDDEN, "Chi " + String.join("/", required.value()) + " duoc thuc hien thao tac nay");
            return false;
        }
        return true;
    }

    private void deny(HttpServletResponse res, int status, String message) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"success\":false,\"message\":\"" + message + "\"}");
    }
}
