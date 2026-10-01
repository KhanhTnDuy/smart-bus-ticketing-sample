package com.smartbus.ticketing.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// ============================================================================
// SCRUM-47 - Danh dau API chi cho phep mot so vai tro goi (mac dinh ADMIN, MANAGER).
// Gan len method hoac ca controller:
//   @RequireRole                       -> ADMIN hoac MANAGER
//   @RequireRole({"ADMIN"})            -> chi ADMIN
// RoleInterceptor doc annotation nay truoc khi vao controller.
// ============================================================================
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    String[] value() default {"ADMIN", "MANAGER"};
}
