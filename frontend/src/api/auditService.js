// auditService.js - SCRUM-47: Dich vu xem nhat ky thay doi
// ---------------------------------------------------------------------------
// - USE_MOCK = false : goi GET /audit-logs (backend tu ghi nhat ky, chi ADMIN/MANAGER xem duoc;
//                      khong du quyen -> apiClient nem loi 401/403 voi thong bao tu backend).
// - USE_MOCK = true  : doc nhat ky gia trong localStorage. Cac service mock khac (vd
//                      scheduleService) goi auditService.record(...) sau moi thao tac de co du lieu.
// ---------------------------------------------------------------------------

import { apiClient, USE_MOCK } from './apiClient.js';

const STORAGE_KEY = 'smartbus_mock_audit_logs';
const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

const readAll = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const auditService = {
  // Lay nhat ky moi nhat truoc. filters: { entityType?, entityId? }
  getLogs: async ({ entityType, entityId } = {}) => {
    if (!USE_MOCK) {
      const params = new URLSearchParams();
      if (entityType) params.set('entityType', entityType);
      if (entityType && entityId) params.set('entityId', entityId);
      const query = params.toString();
      return await apiClient.get(`/audit-logs${query ? `?${query}` : ''}`);
    }
    await delay();
    return readAll()
      .filter(l => !entityType || l.entityType === entityType)
      .filter(l => !entityType || !entityId || l.entityId === Number(entityId));
  },

  // Chi dung o che do mock: ghi 1 dong nhat ky. Che do that backend tu ghi (AuditLogger).
  record: ({ entityType, entityId, action, actor, actorRole, details }) => {
    if (!USE_MOCK) return;
    const entry = {
      id: Date.now(),
      entityType,
      entityId: entityId ?? null,
      action,
      actor: actor || 'unknown',
      actorRole: actorRole || '',
      details: details || '',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...readAll()].slice(0, 200)));
  },
};
