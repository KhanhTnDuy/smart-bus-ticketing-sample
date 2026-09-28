import React, { useEffect, useState } from 'react';
import { Bus as BusIcon, Plus, Trash2 } from 'lucide-react';
import { busService } from '@/api/busService';

// ============================================================================
// MODULE MAU - Trang Quan ly Xe (Frontend tieu thu du lieu tu Backend/CSDL)
// Luong: Trang nay -> busService -> apiClient -> REST /api/v1/buses -> CSDL
// De don gian, trang goi thang busService bang useState/useEffect.
// Voi tinh nang phuc tap hon, tach state ra Context (xem RouteContext lam mau).
// ============================================================================
export default function BusManagementPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ plateNumber: '', model: '', capacity: '' });

  // Tai danh sach xe khi vao trang
  const loadBuses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await busService.getBuses();
      setBuses(data);
    } catch (e) {
      setError(e.message || 'Khong tai duoc danh sach xe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  // Them xe moi
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await busService.createBus(form);
      setForm({ plateNumber: '', model: '', capacity: '' });
      await loadBuses();
    } catch (err) {
      setError(err.message);
    }
  };

  // Xoa (mem) xe
  const handleDelete = async (id) => {
    try {
      await busService.deleteBus(id);
      await loadBuses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Quan ly Xe</h1>
          <p>Them, sua, xoa va xem danh sach xe buyt trong he thong.</p>
        </div>
      </div>

      {/* Form them xe */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label>Bien so</label>
            <input
              value={form.plateNumber}
              onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
              placeholder="VD: 29B-12345"
            />
          </div>
          <div>
            <label>Dong xe</label>
            <input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="VD: Thaco 45 cho"
            />
          </div>
          <div>
            <label>So ghe</label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              placeholder="45"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={16} /> Them xe
          </button>
        </form>
        {error && <p style={{ color: 'var(--danger, #dc2626)', marginTop: '0.75rem' }}>{error}</p>}
      </div>

      {/* Danh sach xe */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
          <BusIcon size={18} />
          <strong>Danh sach xe ({buses.length})</strong>
        </div>
        {loading ? (
          <p style={{ padding: '1.25rem' }}>Dang tai...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.25rem' }}>Bien so</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.25rem' }}>Dong xe</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.25rem' }}>So ghe</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.25rem' }}>Trang thai</th>
                <th style={{ padding: '0.75rem 1.25rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id} style={{ borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
                  <td style={{ padding: '0.75rem 1.25rem' }}>{bus.plateNumber}</td>
                  <td style={{ padding: '0.75rem 1.25rem' }}>{bus.model}</td>
                  <td style={{ padding: '0.75rem 1.25rem' }}>{bus.capacity}</td>
                  <td style={{ padding: '0.75rem 1.25rem' }}>{bus.status}</td>
                  <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                    <button className="btn btn-icon" onClick={() => handleDelete(bus.id)} title="Xoa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {buses.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Chua co xe nao. Them xe dau tien o tren.
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
