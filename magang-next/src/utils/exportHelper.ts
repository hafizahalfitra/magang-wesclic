import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ForecastResponse } from '../types/prediction';

const formatRupiah = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const exportForecastToExcel = async (data: ForecastResponse) => {
  if (!data) throw new Error("Data forecast kosong");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Forecast Anggaran');

  // Set default row height
  sheet.properties.defaultRowHeight = 20;

  // Title
  sheet.mergeCells('A1:E1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `Hasil Forecast Anggaran Divisi ${data.division || '-'}`;
  titleCell.font = { name: 'Arial', size: 14, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Subtitle
  sheet.mergeCells('A2:E2');
  const subtitleCell = sheet.getCell('A2');
  subtitleCell.value = "Estimasi kebutuhan anggaran untuk masa mendatang";
  subtitleCell.font = { name: 'Arial', size: 11, italic: true };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Period
  sheet.mergeCells('A3:E3');
  const periodCell = sheet.getCell('A3');
  const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const startMonth = monthNames[data.current_month || 1] || "Bulan Awal";
  const endMonth = monthNames[data.target_month || 1] || "Bulan Target";
  periodCell.value = `(${startMonth} 2026 - ${endMonth} 2026) (${data.forecast_period || 0} Bulan)`;
  periodCell.font = { name: 'Arial', size: 11, bold: true };
  periodCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Growth Factor
  const growthTitle = sheet.getCell('A5');
  growthTitle.value = "Growth Factor";
  growthTitle.font = { bold: true };

  const growthDesc = sheet.getCell('B5');
  growthDesc.value = `Mempertimbangkan growth rate sebesar ${(data.growth_rate || 0) * 100}% per bulan untuk divisi ${data.division || '-'}.`;

  // Summary Section
  sheet.getCell('A7').value = "Divisi";
  sheet.getCell('B7').value = data.division || '-';
  
  sheet.getCell('A8').value = "Total Karyawan";
  sheet.getCell('B8').value = data.headcount || 0;
  
  sheet.getCell('A9').value = "Total Estimasi Anggaran";
  sheet.getCell('B9').value = data.estimated_total_budget || 0;
  sheet.getCell('B9').font = { bold: true };
  sheet.getCell('B9').numFmt = '"Rp"#,##0';

  // Breakdown Header
  const breakdownHeader = sheet.getCell('A11');
  breakdownHeader.value = "Breakdown Jabatan";
  breakdownHeader.font = { bold: true };

  const headers = ["Jabatan", "Jumlah", "Gaji/Orang", "Total Gaji"];
  const headerRow = sheet.getRow(12);
  headers.forEach((headerText, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = headerText;
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF13624C' } // Wesclic Green
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Breakdown Data
  let currentRow = 13;
  if (data.breakdown && Array.isArray(data.breakdown)) {
    data.breakdown.forEach(item => {
      const row = sheet.getRow(currentRow);
      
      row.getCell(1).value = item.position || '-';
      row.getCell(2).value = item.count || 0;
      row.getCell(3).value = item.salary_per_person || 0;
      row.getCell(3).numFmt = '"Rp"#,##0';
      row.getCell(4).value = item.total_salary || 0;
      row.getCell(4).numFmt = '"Rp"#,##0';

      for (let i = 1; i <= 4; i++) {
        row.getCell(i).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      currentRow++;
    });
  }

  // Footer
  sheet.getCell(`A${currentRow + 1}`).value = "Estimasi Per Bulan";
  sheet.getCell(`A${currentRow + 1}`).font = { bold: true };
  sheet.getCell(`D${currentRow + 1}`).value = data.monthly_forecast || 0;
  sheet.getCell(`D${currentRow + 1}`).font = { bold: true };
  sheet.getCell(`D${currentRow + 1}`).numFmt = '"Rp"#,##0';

  sheet.getCell(`A${currentRow + 2}`).value = "Estimasi Total Periode";
  sheet.getCell(`A${currentRow + 2}`).font = { bold: true };
  sheet.getCell(`D${currentRow + 2}`).value = data.estimated_total_budget || 0;
  sheet.getCell(`D${currentRow + 2}`).font = { bold: true };
  sheet.getCell(`D${currentRow + 2}`).numFmt = '"Rp"#,##0';

  // Auto column width
  sheet.columns.forEach((col, idx) => {
    let maxLength = 0;
    col.eachCell!({ includeEmpty: true }, (cell) => {
      let columnLength = cell.value ? cell.value.toString().length : 10;
      if (cell.numFmt) {
        // approximate width for currency
        columnLength += 5; 
      }
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    // Set max width constraint
    col.width = Math.min(Math.max(maxLength + 2, 15), 50);
  });

  // Export File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const filename = `forecast_${data.division || 'divisi'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, filename);
};


export const exportEmployeesToExcel = async (employees: any[]) => {
  if (!employees || employees.length === 0) throw new Error("Data karyawan kosong");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data Karyawan');

  // Insert Logo (optional, requires fetching the image first)
  try {
    const response = await fetch('/logo-dark.png');
    if (response.ok) {
      const imageBuffer = await response.arrayBuffer();
      const logoId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });
      // Add image to top left
      sheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 40 }
      });
    }
  } catch (error) {
    console.warn("Could not load logo for export", error);
  }

  // Adjust first rows to make room for logo
  sheet.getRow(1).height = 45;

  // Title
  sheet.mergeCells('A2:E2');
  const titleCell = sheet.getCell('A2');
  titleCell.value = "Data Lengkap Karyawan";
  titleCell.font = { name: 'Arial', size: 14, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Date
  sheet.mergeCells('A3:E3');
  const dateCell = sheet.getCell('A3');
  const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
  dateCell.value = `Tanggal Export: ${dateStr}`;
  dateCell.font = { italic: true };
  dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Headers
  const headers = ["No", "Nama", "Divisi", "Jabatan", "Gaji"];
  const headerRow = sheet.getRow(5);
  headers.forEach((headerText, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = headerText;
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF13624C' } // Wesclic Green
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Table Data
  let currentRow = 6;
  employees.forEach((emp, index) => {
    const row = sheet.getRow(currentRow);
    
    row.getCell(1).value = index + 1;
    row.getCell(2).value = emp.nama || '-';
    row.getCell(3).value = emp.divisi || '-';
    row.getCell(4).value = emp.jabatan || '-';
    row.getCell(5).value = emp.gaji ? Number(emp.gaji) : 0;
    row.getCell(5).numFmt = '"Rp"#,##0';

    for (let i = 1; i <= 5; i++) {
      row.getCell(i).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      row.getCell(i).alignment = { vertical: 'middle' };
    }
    currentRow++;
  });

  // Auto column width
  sheet.columns.forEach((col, idx) => {
    let maxLength = 0;
    col.eachCell!({ includeEmpty: true }, (cell) => {
      // Don't count the title cells for width
      if (Number(cell.row) <= 3) return; 
      
      let columnLength = cell.value ? cell.value.toString().length : 10;
      if (cell.numFmt) {
        columnLength += 5; 
      }
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    col.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });

  // Export File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const filename = `data_karyawan_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, filename);
};
