# Module Mau - Quan ly Xe (Bus)

Module tham chieu (reference) cho ca du an Smart Bus Ticketing System.
Moi team **clone (sao chep) cau truc nay** roi doi ten sang tinh nang cua minh.
Module minh hoa **luong day du: Frontend -> REST API -> Backend (JPA) -> CSDL**.

## 1. Luong du lieu

```
[Trang React]  BusManagementPage.jsx
      |  goi
      v
[Service]      api/busService.js  --- USE_MOCK? ---> localStorage (chay khong can backend)
      |  goi (khi USE_MOCK = false)
      v
[apiClient]    api/apiClient.js  (fetch + Bearer token)
      |  HTTP  GET/POST/PUT/DELETE  /api/v1/buses
      v
[Controller]   BusController.java   @RestController @RequestMapping("/api/v1/buses")
      |
      v
[Repository]   BusRepository.java   extends JpaRepository (Spring tu sinh SQL)
      |
      v
[CSDL]         bang `buses` (backend/database/schema.sql)
```

## 2. Cac file trong module

Backend (Spring Boot - `backend/SmartBusTicketing`):
- `.../ticketing/bus/entity/Bus.java` - anh xa bang `buses` (co `seatRows`, `seatCols`)
- `.../ticketing/bus/entity/BusSeat.java` - anh xa bang `bus_seats` (so do ghe, sinh tu dong)
- `.../ticketing/bus/repository/BusRepository.java` - truy cap CSDL
- `.../ticketing/bus/repository/BusSeatRepository.java` - truy cap bang `bus_seats`
- `.../ticketing/bus/controller/BusController.java` - REST API `/api/v1/buses` (them `GET /{id}/seats` lay so do ghe)

Frontend (`frontend/src`):
- `api/busService.js` - dich vu goi API (co switch mock/that)
- `utils/seatLayout.js` - sinh/kiem tra so do ghe theo hang x cot (che do mock)
- `pages/manager/BusManagementPage.jsx` - trang giao dien

## 3. Chay thu

### Backend
```
cd backend/SmartBusTicketing
mvn spring-boot:run
```
- Chay o `http://localhost:8080`, API tai `http://localhost:8080/api/v1/buses`.
- Mac dinh dung H2 in-memory (xem `src/main/resources/application.properties`),
  du lieu mat khi tat. Doi sang MySQL that: sua application.properties thanh
  `jdbc:mysql://localhost:3306/smart_bus_ticketing` + driver MySQL, chay
  `backend/database/schema.sql` truoc.

### Frontend
```
cd frontend
npm install
npm run dev
```
- Mac dinh `USE_MOCK = true` -> chay bang localStorage, chua can backend.
- **Noi that vao CSDL:** tao file `frontend/.env` voi:
  ```
  VITE_USE_MOCK=false
  VITE_API_BASE_URL=http://localhost:8080/api/v1
  ```
  Roi bat backend len. Frontend se goi that thay vi mock.

### Gan trang vao router
Trong `frontend/src/routes` (hoac App.jsx), them route tro toi
`BusManagementPage` (import default), giong cach `RouteManagementPage` duoc gan.

## 4. Checklist khi clone sang tinh nang moi

Vi du lam module "Chuyen di" (Trip):
1. Backend: copy thu muc `bus/` -> `trip/`, doi `Bus` -> `Trip`,
   `@Table(name="buses")` -> `@Table(name="trips")`, sua cac cot theo schema.
2. Repository: doi ten + cac derived query (vd `existsByPlateNumber` -> tuy tinh nang).
3. Controller: doi `@RequestMapping("/api/v1/buses")` -> `/api/v1/trips`.
4. Frontend: copy `busService.js` -> `tripService.js`, doi endpoint `/buses` -> `/trips`.
5. Frontend: copy `BusManagementPage.jsx` -> trang moi, doi cot hien thi + form.
6. Gan route moi.

## 5. Quy uoc rut ra tu ma nguon hien tai (giu nhat quan)
- Controller goi thang Repository (chua tach tang Service).
- REST base URL: `/api/v1/<resource-so-nhieu>`, luon co `@CrossOrigin("*")`.
- Xoa = xoa mem: doi `status` sang `INACTIVE`, khong xoa han ban ghi.
- Ten cot camelCase o Java <-> snake_case o CSDL (Hibernate tu anh xa).
- Frontend moi service co switch `USE_MOCK` de chay duoc ca khi chua co backend.
- So do ghe: nhap `seatRows` (1-20) x `seatCols` (1-6) -> `capacity` = hang x cot, backend tu sinh
  ghe trong bang `bus_seats` voi ma "A1", "A2", "B1"... (hang -> chu cai, cot -> so). Doi hang/cot
  khi sua xe thi ghe duoc sinh lai. Xe cu khong co hang/cot van nhap tay `capacity`.
- Sua xe (PUT) doi duoc ca bien so (van kiem tra trung).

## 6. Phan quyen va nhat ky thay doi (SCRUM-47)
Dung chung cho moi module can "chi Admin/Quan ly duoc thao tac + ghi nhat ky", dau tien la Lich trinh.

Backend (`backend/SmartBusTicketing/src/main/java/com/smartbus/ticketing`):
- `security/RequireRole.java` - annotation, mac dinh `ADMIN`, `MANAGER`. Gan len controller hoac method.
- `security/RoleInterceptor.java` + `WebConfig.java` - chan API `/api/**`: thieu vai tro -> 401, sai vai tro -> 403.
- `audit/entity/AuditLog.java`, `audit/repository/AuditLogRepository.java` - bang `audit_logs`.
- `audit/component/AuditLogger.java` - controller goi `auditLogger.log(request, "SCHEDULE", id, "CREATE", "chi tiet")`.
- `audit/controller/AuditLogController.java` - `GET /api/v1/audit-logs?entityType=SCHEDULE&entityId=7` (chi ADMIN/MANAGER).

Frontend: `api/auditService.js`, `pages/manager/AuditLogPage.jsx` (gan route giong BusManagementPage).

Cach gan cho ScheduleController:
```java
@RestController @RequestMapping("/api/v1/schedules") @RequireRole   // chan quyen ca controller
public class ScheduleController {
    @Autowired private AuditLogger auditLogger;
    @PostMapping @Transactional
    public ResponseEntity<?> create(@RequestBody Schedule s, HttpServletRequest req) {
        Schedule saved = repo.save(s);
        auditLogger.log(req, "SCHEDULE", saved.getId(), "CREATE", "mo ta thay doi");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
```
**Luu y:** du an chua co dang nhap that nen vai tro lay tu header `X-User-Role` (ADMIN|MANAGER) va
`X-User-Name`; `apiClient` phai gui 2 header nay. Header co the bi gia mao, khi co JWT thi sua
`RoleInterceptor` doc vai tro tu token, phan con lai giu nguyen.
