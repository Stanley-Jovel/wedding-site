// The guest book reads and writes the couple's "Guest List" tab through this
// interface. Google Sheets implements it in production; an in-memory grid
// implements it for local development and tests.

/** One guest table as it sits in the tab (e.g. "Stanley Guests"). */
export type TableData = {
  name: string;
  /** Absolute 0-based row index of the header row. */
  headerRow: number;
  /** Absolute 0-based column index of the table's first column. */
  startCol: number;
  headers: string[];
  /** Data rows in sheet order; rows[i] sits at absolute row headerRow + 1 + i. */
  rows: string[][];
};

/** A single cell on the Guest List tab, absolute 0-based coordinates. */
export type CellUpdate = { row: number; col: number; value: string };

export interface SheetStore {
  readTables(): Promise<TableData[]>;
  writeCells(updates: CellUpdate[]): Promise<void>;
  appendLog(rows: string[][]): Promise<void>;
}

export type TableRange = { name: string; startRow: number; endRow: number; startCol: number; endCol: number };

/** A whole tab held in memory, with table ranges like the Sheets API reports them. */
export class MemoryStore implements SheetStore {
  grid: string[][];
  tables: TableRange[];
  log: string[][] = [];

  constructor(grid: string[][], tables: TableRange[]) {
    this.grid = grid.map((r) => [...r]);
    this.tables = tables;
  }

  cell(row: number, col: number) {
    return this.grid[row]?.[col] ?? "";
  }

  async readTables(): Promise<TableData[]> {
    return this.tables.map((t) => {
      const slice = (r: number) =>
        Array.from({ length: t.endCol - t.startCol }, (_, i) => this.cell(r, t.startCol + i));
      const rows: string[][] = [];
      for (let r = t.startRow + 1; r < t.endRow; r++) rows.push(slice(r));
      return { name: t.name, headerRow: t.startRow, startCol: t.startCol, headers: slice(t.startRow), rows };
    });
  }

  async writeCells(updates: CellUpdate[]) {
    for (const u of updates) {
      while (this.grid.length <= u.row) this.grid.push([]);
      const row = this.grid[u.row];
      while (row.length <= u.col) row.push("");
      row[u.col] = u.value;
    }
  }

  async appendLog(rows: string[][]) {
    this.log.push(...rows.map((r) => [...r]));
  }
}
