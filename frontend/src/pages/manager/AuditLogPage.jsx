import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { auditService } from '@/api/auditService';

// ============================================================================
// SCRUM-47 - Trang Nhat ky thay doi (Admin/Quan ly).
// Luong: Trang nay -> auditService -> apiClient -> GET /api/v1/audit-logs -> CSDL
// Khong du quyen thi backend tra 401/403 va thong bao hien o day.
// ============================================================================
const ENTITY_TYPES = [
  { value: '', label: 'Tat ca' },
  { value: 'SCHEDULE', label: 'Lich trinh' },
  { value: 'BUS', label: 'Xe' },
];
const cell = { padding: '0.75rem 1.25rem' };

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entityType, setEntityType] = useState('SCHEDULE');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setLogs(await auditService.getLogs({ entityType: entityType || undefined }));
      } catch (e) {
        setLogs([]);
        setError(e.message || 'Khong tai duoc nhat ky.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [entityType]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Nhat ky thay doi</h1>
          <p>Ai da them, sua, xoa gi, vao luc nao. Chi Admin/Quan ly xem duoc.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
          <History size={18} />
          <strong>Nhat ky ({logs.length})</strong>
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)} style={{ marginLeft: 'auto' }}>
            {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {error && <p style={{ color: 'var(--danger, #dc2626)', padding: '1rem 1.25rem' }}>{error}</p>}
        {loading ? (
          <p style={{ padding: '1.25rem' }}>Dang tai...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', ...cell }}>Thoi gian</th>
                <th style={{ textAlign: 'left', ...cell }}>Nguoi thao tac</th>
                <th style={{ textAlign: 'left', ...cell }}>Hanh dong</th>
                <th style={{ textAlign: 'left', ...cell }}>Doi tuong</th>
                <th style={{ textAlign: 'left', ...cell }}>Chi tiet</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
                  <td style={cell}>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                  <td style={cell}>{log.actor}{log.actorRole ? ` (${log.actorRole})` : ''}</td>
                  <td style={cell}>{log.action}</td>
                  <td style={cell}>{log.entityType}{log.entityId != null ? ` #${log.entityId}` : ''}</td>
                  <td style={cell}>{log.details}</td>
                </tr>
              ))}
              {logs.length === 0 && !error && (
                <tr>
                  <td colSpan={5} style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Chua co thay doi nao duoc ghi nhan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
