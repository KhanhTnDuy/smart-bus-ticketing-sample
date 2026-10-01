// seatLayout.js - Sinh so do ghe theo hang/cot (dung cho che do mock)
// Quy tac khop BusController.java: hang 0 -> 'A', cot 0 -> '1' => "A1", "A2", "B1"...
// Gioi han khop @Max trong Bus.java.

export const MAX_ROWS = 20;
export const MAX_COLS = 6;

// Tra ve thong bao loi (string) neu hang/cot khong hop le, hop le thi tra null
export const validateLayout = (rows, cols) => {
  const r = Number(rows);
  const c = Number(cols);
  if (!Number.isInteger(r) || !Number.isInteger(c)) {
    return 'Phai nhap du so hang va so cot ghe.';
  }
  if (r < 1 || r > MAX_ROWS) return `So hang ghe phai tu 1 den ${MAX_ROWS}.`;
  if (c < 1 || c > MAX_COLS) return `So cot ghe phai tu 1 den ${MAX_COLS}.`;
  return null;
};

export const generateSeats = (busId, rows, cols) => {
  const seats = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      seats.push({
        id: `${busId}-${r}-${c}`,
        busId,
        seatCode: String.fromCharCode(65 + r) + (c + 1),
        rowIndex: r,
        colIndex: c,
      });
    }
  }
  return seats;
};
