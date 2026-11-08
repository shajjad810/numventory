export type InventoryExportRow = {
  product: string;
  sku: string;
  location: string;
  quantity: number;
  unit: string;
};

export async function downloadInventoryExcel(
  rows: InventoryExportRow[],
): Promise<void> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Numventory";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Inventory Report", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  // Report title
  sheet.mergeCells("A1:E1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "Numventory - Inventory Report";
  titleCell.font = {
    bold: true,
    size: 18,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A8A" },
  };
  titleCell.alignment = { vertical: "middle" };
  sheet.getRow(1).height = 34;

  sheet.mergeCells("A2:E2");
  sheet.getCell("A2").value = `Exported: ${new Date().toLocaleString()}`;

  // Column headers
  const headers = ["Product", "SKU", "Location", "Quantity", "Unit"];

  const headerRow = sheet.getRow(4);
  headerRow.values = headers;

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    cell.alignment = { vertical: "middle" };
  });

  headerRow.height = 25;

  // Inventory records
  rows.forEach((item) => {
    sheet.addRow([
      item.product,
      item.sku,
      item.location,
      item.quantity,
      item.unit,
    ]);
  });

  // Column widths
  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 18;
  sheet.getColumn(3).width = 25;
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 12;

  // Quantity formatting
  sheet.getColumn(4).numFmt = "0.00";

  // Alternating row colors
  for (let rowNumber = 5; rowNumber <= sheet.rowCount; rowNumber++) {
    if (rowNumber % 2 === 0) {
      sheet.getRow(rowNumber).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };
      });
    }
  }

  // Excel column filters
  sheet.autoFilter = {
    from: "A4",
    to: `E${Math.max(4, sheet.rowCount)}`,
  };

  // Generate and download XLSX
  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([new Uint8Array(buffer)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "numventory-inventory.xlsx";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type TransactionExportRow = {
  date: string;
  type: string;
  product: string;
  sku: string;
  quantity: number;
  unit: string;
  from: string;
  to: string;
  reference: string;
  notes: string;
};

export async function downloadTransactionsExcel(
  rows: TransactionExportRow[],
): Promise<void> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Numventory";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Transaction History", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  // Report title
  sheet.mergeCells("A1:J1");

  const titleCell = sheet.getCell("A1");
  titleCell.value = "Numventory - Transaction History";
  titleCell.font = {
    bold: true,
    size: 18,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A8A" },
  };
  titleCell.alignment = { vertical: "middle" };

  sheet.getRow(1).height = 34;

  // Export date
  sheet.mergeCells("A2:J2");
  sheet.getCell("A2").value = `Exported: ${new Date().toLocaleString()}`;

  // Column headers
  const headers = [
    "Date",
    "Type",
    "Product",
    "SKU",
    "Quantity",
    "Unit",
    "From",
    "To",
    "Reference",
    "Notes",
  ];

  const headerRow = sheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 25;

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    cell.alignment = { vertical: "middle" };
  });

  // Transaction records
  rows.forEach((item) => {
    sheet.addRow([
      item.date,
      item.type,
      item.product,
      item.sku,
      item.quantity,
      item.unit,
      item.from,
      item.to,
      item.reference,
      item.notes,
    ]);
  });

  // Column widths
  sheet.columns.forEach((column, index) => {
    const widths = [24, 24, 28, 18, 15, 12, 24, 24, 22, 40];
    column.width = widths[index];
  });

  // Quantity formatting
  sheet.getColumn(5).numFmt = "0.00";

  // Alternating row colors
  for (let rowNumber = 5; rowNumber <= sheet.rowCount; rowNumber++) {
    if (rowNumber % 2 === 0) {
      sheet.getRow(rowNumber).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };
      });
    }
  }

  // Excel filters
  sheet.autoFilter = {
    from: "A4",
    to: `J${Math.max(4, sheet.rowCount)}`,
  };

  // Download Excel file
  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([new Uint8Array(buffer)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "numventory-transactions.xlsx";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
