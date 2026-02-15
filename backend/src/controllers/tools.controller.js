import db from "../config/db.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/tools';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'tool-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|gif|jfif|webp/;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /jpeg|jpg|png|gif|jfif|webp/.test(file.mimetype.split('/')[1]);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Configure multer for Excel upload
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/excel';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'tools-import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const excelFileFilter = (req, file, cb) => {
  const allowedExts = /xlsx|xls/;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel');

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) are allowed!'));
  }
};

export const uploadExcel = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const getAllTools = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_get_all_tools");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getToolById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "CALL sp_get_tool_by_id(?)",
      [req.params.id]
    );
    res.json(rows[0][0] || null);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage });
  }
};

export const searchTools = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const [rows] = await db.query(
      "CALL sp_search_tools(?)",
      [keyword]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage });
  }
};

export const createTool = async (req, res) => {
  const { name, description, risk_level, total_stock, available_stock, hourly_rate } = req.body;
  const image = req.file ? `/uploads/tools/${req.file.filename}` : null;

  try {
    await db.query(
      "CALL sp_create_tool(?,?,?,?,?,?,?)",
      [name, description, risk_level, parseInt(total_stock), parseInt(available_stock), parseFloat(hourly_rate), image]
    );

    res.status(201).json({ 
      message: "Tool created successfully",
    });
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const updateTool = async (req, res) => {
  const { name, description, risk_level, total_stock, available_stock, status, hourly_rate } = req.body;
  let image = req.body.existingImage;

  try {
    if (req.file) {
      image = `/uploads/tools/${req.file.filename}`;
      
      const [oldTool] = await db.query(
        "SELECT image FROM tools WHERE tool_id = ?",
        [req.params.id]
      );
      
      if (oldTool[0]?.image) {
        const oldImagePath = path.join(process.cwd(), oldTool[0].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await db.query(
      "CALL sp_update_tool(?,?,?,?,?,?,?,?,?)",
      [req.params.id, name, description, risk_level, parseInt(total_stock), parseInt(available_stock), status, parseFloat(hourly_rate), image]
    );

    res.json({ message: "Tool updated successfully" });
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const deleteTool = async (req, res) => {
  try {
    await db.query(
      "CALL sp_delete_tool(?)",
      [req.params.id]
    );

    res.json({ message: "Tool deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

// ============================================
// DOWNLOAD EXCEL TEMPLATE
// ============================================
export const downloadTemplate = async (req, res) => {
  try {
    // Create workbook
    const wb = xlsx.utils.book_new();
    
    // Template data with headers and example
    const templateData = [
      ['Nama Alat', 'Deskripsi', 'Tingkat Risiko', 'Total Stok', 'Stok Tersedia', 'Status', 'Harga per Jam'],
      ['Mikroskop Optik', 'Mikroskop dengan pembesaran 1000x', 'low', 5, 5, 'available', 50000],
      ['Centrifuge', 'Alat sentrifugasi kecepatan tinggi', 'medium', 3, 2, 'available', 75000],
      ['Spektrofotometer UV-Vis', 'Untuk analisis spektrum UV-Visible', 'high', 2, 1, 'maintenance', 100000]
    ];
    
    const ws = xlsx.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 },  // Nama Alat
      { wch: 40 },  // Deskripsi
      { wch: 15 },  // Tingkat Risiko
      { wch: 12 },  // Total Stok
      { wch: 15 },  // Stok Tersedia
      { wch: 15 },  // Status
      { wch: 15 }   // Harga per Jam
    ];
    
    // Add instruction sheet
    const instructionData = [
      ['PETUNJUK PENGISIAN TEMPLATE IMPORT DATA ALAT LABORATORIUM'],
      [''],
      ['1. Kolom yang harus diisi:'],
      ['   - Nama Alat: Nama alat laboratorium (wajib diisi)'],
      ['   - Deskripsi: Deskripsi singkat tentang alat (opsional)'],
      ['   - Tingkat Risiko: Pilih salah satu: low, medium, high (wajib diisi)'],
      ['   - Total Stok: Jumlah total alat yang tersedia (angka, minimal 1)'],
      ['   - Stok Tersedia: Jumlah alat yang bisa dipinjam (tidak boleh lebih dari Total Stok)'],
      ['   - Status: Pilih salah satu: available, maintenance, unavailable (wajib diisi)'],
      ['   - Harga per Jam: Harga sewa per jam dalam Rupiah (angka, minimal 0)'],
      [''],
      ['2. Format Tingkat Risiko:'],
      ['   - low: Risiko rendah'],
      ['   - medium: Risiko sedang'],
      ['   - high: Risiko tinggi'],
      [''],
      ['3. Format Status:'],
      ['   - available: Tersedia untuk dipinjam'],
      ['   - maintenance: Sedang dalam perawatan'],
      ['   - unavailable: Tidak tersedia'],
      [''],
      ['4. Contoh pengisian dapat dilihat pada sheet "Template Data"'],
      [''],
      ['5. Hapus baris contoh sebelum import data asli Anda'],
      [''],
      ['CATATAN PENTING:'],
      ['- Jangan mengubah nama kolom pada baris pertama'],
      ['- Pastikan format data sesuai dengan petunjuk'],
      ['- Stok Tersedia tidak boleh melebihi Total Stok'],
      ['- Gunakan titik (.) sebagai pemisah desimal untuk harga']
    ];
    
    const instructionWs = xlsx.utils.aoa_to_sheet(instructionData);
    instructionWs['!cols'] = [{ wch: 100 }];
    
    // Add sheets to workbook
    xlsx.utils.book_append_sheet(wb, instructionWs, 'Petunjuk');
    xlsx.utils.book_append_sheet(wb, ws, 'Template Data');
    
    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Template_Import_Tools.xlsx');
    res.send(buffer);
    
  } catch (err) {
    console.error('Download template error:', err);
    res.status(500).json({ error: 'Gagal mendownload template' });
  }
};

// ============================================
// IMPORT TOOLS FROM EXCEL
// ============================================
export const importToolsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error',
        message: 'File Excel tidak ditemukan' 
      });
    }

    console.log('📁 Processing Excel file:', req.file.filename);

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames.find(name => name.includes('Template') || name.includes('Data')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    console.log('📊 Data from Excel:', jsonData);

    if (jsonData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        status: 'error',
        message: 'File Excel kosong atau format tidak sesuai' 
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel row number (header is row 1)

      try {
        // Validate required fields
        const name = row['Nama Alat'];
        const description = row['Deskripsi'] || '';
        const risk_level = row['Tingkat Risiko'];
        const total_stock = parseInt(row['Total Stok']);
        const available_stock = parseInt(row['Stok Tersedia']);
        const status = row['Status'];
        const hourly_rate = parseFloat(row['Harga per Jam']);

        // Validation
        if (!name || name.trim() === '') {
          throw new Error('Nama Alat tidak boleh kosong');
        }

        if (!['low', 'medium', 'high'].includes(risk_level)) {
          throw new Error('Tingkat Risiko harus: low, medium, atau high');
        }

        if (!['available', 'maintenance', 'unavailable'].includes(status)) {
          throw new Error('Status harus: available, maintenance, atau unavailable');
        }

        if (isNaN(total_stock) || total_stock < 1) {
          throw new Error('Total Stok harus angka minimal 1');
        }

        if (isNaN(available_stock) || available_stock < 0) {
          throw new Error('Stok Tersedia harus angka minimal 0');
        }

        if (available_stock > total_stock) {
          throw new Error('Stok Tersedia tidak boleh lebih dari Total Stok');
        }

        if (isNaN(hourly_rate) || hourly_rate < 0) {
          throw new Error('Harga per Jam harus angka minimal 0');
        }

        // Insert to database using stored procedure
        await db.query(
          "CALL sp_bulk_insert_tools(?,?,?,?,?,?,?)",
          [name, description, risk_level, total_stock, available_stock, status, hourly_rate]
        );

        results.success++;
        console.log(`✅ Row ${rowNumber}: ${name} - Berhasil`);

      } catch (err) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          name: row['Nama Alat'] || 'Unknown',
          error: err.message
        });
        console.error(`❌ Row ${rowNumber}: ${err.message}`);
      }
    }

    // Delete uploaded file after processing
    fs.unlinkSync(req.file.path);

    // Send response
    if (results.success > 0) {
      res.json({
        status: 'success',
        message: `Berhasil import ${results.success} data alat`,
        details: {
          success: results.success,
          failed: results.failed,
          errors: results.errors
        }
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Tidak ada data yang berhasil diimport',
        details: {
          success: results.success,
          failed: results.failed,
          errors: results.errors
        }
      });
    }

  } catch (err) {
    console.error('Import error:', err);
    
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      status: 'error',
      message: 'Terjadi kesalahan saat import: ' + err.message 
    });
  }
};