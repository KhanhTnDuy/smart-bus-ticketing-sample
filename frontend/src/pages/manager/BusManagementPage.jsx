import React, { useEffect, useState } from 'react';
import { Bus as BusIcon, Plus, Trash2, Pencil, Eye, X } from 'lucide-react';
import { busService } from '@/api/busService';
import { MAX_ROWS, MAX_COLS } from '@/utils/seatLayout';

// ============================================================================
// MODULE MAU - Trang Quan ly Xe (Frontend tieu thu du lieu tu Backend/CSDL)
// Luong: Trang nay -> busService -> apiClient -> REST /api/v1/buses -> CSDL
// De don gian, trang goi thang busService bang useState/useEffect.
// Voi tinh nang phuc tap hon, tach state ra Context (xem RouteContext lam mau).
// ============================================================================
const EMPTY_FORM = { plateNumber: '', model: '', seatRows: '', seatCols: '', status: 'ACTIVE' };
const STATUSES = ['ACTIVE', 'MAINTENANCE', 'INACTIVE'];
const cell = { padding: '0.75rem 1.25rem' };

export default function BusManagementPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null = dang them moi
  const [seatMap, setSeatMap] = useState(null); // { bus, seats } khi dang xem so do ghe

  // So ghe = hang x cot (hien thi xem truoc, backend cung tinh nhu vay)
  const previewCapacity = Number(form.seatRows) > 0 && Number(form.seatCols) > 0
    ? Number(form.seatRows) * Number(form.seatCols)
    : null;

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

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  // Them moi hoac luu chinh sua tuy editingId
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload = {
        ...form,
        seatRows: form.seatRows === '' ? null : Number(form.seatRows),
        seatCols: form.seatCols === '' ? null : Number(form.seatCols),
      };
      if (editingId) {
        await busService.updateBus(editingId, payload);
      } else {
        await busService.createBus(payload);
      }
      resetForm();
      setSeatMap(null);
      await loadBuses();
    } catch (err) {
      setError(err.message);
    }
  };

  // Do du lieu xe vao form de sua
  const handleEdit = (bus) => {
    setError('');
    setEditingId(bus.id);
    setForm({
      plateNumber: bus.plateNumber || '',
      model: bus.model || '',
      seatRows: bus.seatRows ?? '',
      seatCols: bus.seatCols ?? '',
      status: bus.status || 'ACTIVE',
    });
  };

  // Xoa (mem) xe
  const handleDelete = async (id) => {
    try {
      await busService.deleteBus(id);
      if (editingId === id) resetForm();
      if (seatMap?.bus.id === id) setSeatMap(null);
      await loadBuses();
    } catch (err) {
      setError(err.message);
    }
  };

  // Xem so do ghe cua xe
  const handleViewSeats = async (bus) => {
    try {
      setError('');
      const seats = await busService.getSeats(bus.id);
      setSeatMap({ bus, seats });
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

      {/* Form them / sua xe */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
            <label>So hang ghe</label>
            <input
              type="number"
              min="1"
              max={MAX_ROWS}
              value={form.seatRows}
              onChange={(e) => setForm({ ...form, seatRows: e.target.value })}
              placeholder="11"
            />
          </div>
          <div>
            <label>So cot ghe</label>
            <input
              type="number"
              min="1"
              max={MAX_COLS}
              value={form.seatCols}
              onChange={(e) => setForm({ ...form, seatCols: e.target.value })}
              placeholder="4"
            />
          </div>
          <div>
            <label>Tong so ghe</label>
            <input value={previewCapacity ?? ''} readOnly placeholder="hang x cot" />
          </div>
          <div>
            <label>Trang thai</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            {editingId ? <><Pencil size={16} /> Luu</> : <><Plus size={16} /> Them xe</>}
          </button>
          {editingId && (
            <button type="button" className="btn" onClick={resetForm}>
              <X size={16} /> Huy
            </button>
          )}
        </form>
        {error && <p style={{ color: 'var(--danger, #dc2626)', marginTop: '0.75rem' }}>{error}</p>}
      </div>

      {/* So do ghe */}
      {seatMap && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <strong>So do ghe - {seatMap.bus.plateNumber} ({seatMap.seats.length} ghe)</strong>
            <button className="btn btn-icon" onClick={() => setSeatMap(null)} title="Dong">
              <X size={16} />
            </button>
          </div>
          {seatMap.seats.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Xe chua co so do ghe. Bam sua va nhap so hang, so cot.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${seatMap.bus.seatCols}, 3rem)`,
                gap: '0.5rem',
              }}
            >
              {seatMap.seats.map((seat) => (
                <div
                  key={seat.id}
                  style={{
                    padding: '0.5rem 0',
                    textAlign: 'center',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    borderRadius: '0.375rem',
                  }}
                >
                  {seat.seatCode}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                <th style={{ textAlign: 'left', ...cell }}>Bien so</th>
                <th style={{ textAlign: 'left', ...cell }}>Dong xe</th>
                <th style={{ textAlign: 'left', ...cell }}>So ghe</th>
                <th style={{ textAlign: 'left', ...cell }}>Hang x Cot</th>
                <th style={{ textAlign: 'left', ...cell }}>Trang thai</th>
                <th style={cell}></th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id} style={{ borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
                  <td style={cell}>{bus.plateNumber}</td>
                  <td style={cell}>{bus.model}</td>
                  <td style={cell}>{bus.capacity}</td>
                  <td style={cell}>{bus.seatRows && bus.seatCols ? `${bus.seatRows} x ${bus.seatCols}` : '-'}</td>
                  <td style={cell}>{bus.status}</td>
                  <td style={{ ...cell, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn btn-icon" onClick={() => handleViewSeats(bus)} title="Xem so do ghe">
                      <Eye size={16} />
                    </button>
                    <button className="btn btn-icon" onClick={() => handleEdit(bus)} title="Sua">
                      <Pencil size={16} />
                    </button>
                    <button className="btn btn-icon" onClick={() => handleDelete(bus.id)} title="Xoa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {buses.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
