// busService.js - MODULE MAU: Dich vu Quan ly Xe (Bus)
// ---------------------------------------------------------------------------
// Day la tang GIAO TIEP giua Frontend va Backend.
// - Khi USE_MOCK = true  : chay bang du lieu gia trong localStorage (khong can backend).
// - Khi USE_MOCK = false : goi that vao REST API Spring Boot (/buses) -> CSDL.
// Doi cong tac tai frontend/src/api/apiClient.js (bien VITE_USE_MOCK trong file .env).
// ---------------------------------------------------------------------------

import { apiClient, USE_MOCK } from './apiClient.js';

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

  // Them xe moi
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
    if (!busData.capacity || Number(busData.capacity) <= 0) {
      throw new Error('So ghe phai lon hon 0.');
    }
    const newBus = {
      id: Date.now(),
      plateNumber: plate,
      model: (busData.model || '').trim(),
      capacity: Number(busData.capacity),
      status: busData.status || 'ACTIVE',
    };
    writeAll([newBus, ...buses]);
    return newBus;
  },

  // Cap nhat xe
  updateBus: async (id, busData) => {
    if (!USE_MOCK) {
      return await apiClient.put(`/buses/${id}`, busData);
    }
    await delay(300);
    const buses = readAll();
    const idx = buses.findIndex(b => b.id === Number(id));
    if (idx === -1) throw new Error('Khong tim thay xe can cap nhat.');
    buses[idx] = {
      ...buses[idx],
      model: busData.model !== undefined ? busData.model.trim() : buses[idx].model,
      capacity: busData.capacity !== undefined ? Number(busData.capacity) : buses[idx].capacity,
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
