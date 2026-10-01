// busService.js - MODULE MAU: Dich vu Quan ly Xe (Bus)
// ---------------------------------------------------------------------------
// Day la tang GIAO TIEP giua Frontend va Backend.
// - Khi USE_MOCK = true  : chay bang du lieu gia trong localStorage (khong can backend).
// - Khi USE_MOCK = false : goi that vao REST API Spring Boot (/buses) -> CSDL.
// Doi cong tac tai frontend/src/api/apiClient.js (bien VITE_USE_MOCK trong file .env).
// ---------------------------------------------------------------------------

import { apiClient, USE_MOCK } from './apiClient.js';
import { generateSeats, validateLayout } from '../utils/seatLayout.js';

const STORAGE_KEY = 'smartbus_mock_buses';
const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

const readAll = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const writeAll = (buses) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buses));
};

export const busService = {
  // Lay danh sach xe
  getBuses: async () => {
    if (!USE_MOCK) {
      return await apiClient.get('/buses');
    }
    await delay();
    return readAll();
  },

  // Lay so do ghe cua 1 xe (sap theo hang, cot)
  getSeats: async (id) => {
    if (!USE_MOCK) {
      return await apiClient.get(`/buses/${id}/seats`);
    }
    await delay();
    const bus = readAll().find(b => b.id === Number(id));
    if (!bus) throw new Error('Khong tim thay xe.');
    if (!bus.seatRows || !bus.seatCols) return [];
    return generateSeats(bus.id, bus.seatRows, bus.seatCols);
  },

  // Them xe moi (nhap seatRows + seatCols -> capacity = hang x cot)
  createBus: async (busData) => {
    if (!USE_MOCK) {
      return await apiClient.post('/buses', busData);
    }
    await delay(300);
    const buses = readAll();
    const plate = (busData.plateNumber || '').trim();
    if (!plate) {
      throw new Error('Bien so xe khong duoc de trong.');
    }
    if (buses.some(b => b.plateNumber.toLowerCase() === plate.toLowerCase())) {
      throw new Error(`Bien so "${plate}" da ton tai.`);
    }
    const layoutError = validateLayout(busData.seatRows, busData.seatCols);
    if (layoutError) throw new Error(layoutError);
    const seatRows = Number(busData.seatRows);
    const seatCols = Number(busData.seatCols);
    const newBus = {
      id: Date.now(),
      plateNumber: plate,
      model: (busData.model || '').trim(),
      capacity: seatRows * seatCols,
      seatRows,
      seatCols,
      status: busData.status || 'ACTIVE',
    };
    writeAll([newBus, ...buses]);
    return newBus;
  },

  // Cap nhat xe (sua duoc ca bien so; doi hang/cot thi so do ghe sinh lai)
  updateBus: async (id, busData) => {
    if (!USE_MOCK) {
      return await apiClient.put(`/buses/${id}`, busData);
    }
    await delay(300);
    const buses = readAll();
    const idx = buses.findIndex(b => b.id === Number(id));
    if (idx === -1) throw new Error('Khong tim thay xe can cap nhat.');

    const plate = busData.plateNumber !== undefined ? busData.plateNumber.trim() : buses[idx].plateNumber;
    if (!plate) throw new Error('Bien so xe khong duoc de trong.');
    if (buses.some(b => b.id !== buses[idx].id && b.plateNumber.toLowerCase() === plate.toLowerCase())) {
      throw new Error(`Bien so "${plate}" da ton tai.`);
    }

    let { seatRows, seatCols, capacity } = buses[idx];
    if (busData.seatRows !== undefined || busData.seatCols !== undefined) {
      const rows = busData.seatRows !== undefined ? busData.seatRows : seatRows;
      const cols = busData.seatCols !== undefined ? busData.seatCols : seatCols;
      const layoutError = validateLayout(rows, cols);
      if (layoutError) throw new Error(layoutError);
      seatRows = Number(rows);
      seatCols = Number(cols);
      capacity = seatRows * seatCols;
    }

    buses[idx] = {
      ...buses[idx],
      plateNumber: plate,
      model: busData.model !== undefined ? busData.model.trim() : buses[idx].model,
      capacity,
      seatRows,
      seatCols,
      status: busData.status || buses[idx].status,
    };
    writeAll([...buses]);
    return buses[idx];
  },

  // Xoa mem (chuyen trang thai INACTIVE)
  deleteBus: async (id) => {
    if (!USE_MOCK) {
      return await apiClient.delete(`/buses/${id}`);
    }
    await delay(250);
    const buses = readAll();
    const idx = buses.findIndex(b => b.id === Number(id));
    if (idx !== -1) {
      buses[idx].status = 'INACTIVE';
      writeAll([...buses]);
    }
    return { success: true };
  },
};
