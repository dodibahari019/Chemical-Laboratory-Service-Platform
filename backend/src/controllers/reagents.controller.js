import db from "../config/db.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/reagents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'reagent-' + uniqueSuffix + path.extname(file.originalname));
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
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
    cb(null, 'reagents-import-' + uniqueSuffix + path.extname(file.originalname));
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

// Generate Reagent ID (format: RG001, RG002, dst)
const generateReagentId = async () => {
  try {
    const [rows] = await db.query(
      "SELECT reagent_id FROM reagents ORDER BY reagent_id DESC LIMIT 1"
    );
    
    if (rows.length === 0) {
      return "RG001";
    }
    
    const lastId = rows[0].reagent_id;
    const numPart = parseInt(lastId.substring(2)) + 1;
    return `RG${numPart.toString().padStart(3, '0')}`;
  } catch (err) {
    throw err;
  }
};

export const getAllReagents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_get_all_reagents");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReagentById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "CALL sp_get_reagent_by_id(?)",
      [req.params.id]
    );
    res.json(rows[0][0] || null);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage });
  }
};

export const searchReagents = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const [rows] = await db.query(
      "CALL sp_search_reagents(?)",
      [keyword]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage });
  }
};

export const createReagent = async (req, res) => {
  const { name, stock_quantity, unit, expired_date, price_per_unit } = req.body;
  const foto = req.file ? `/uploads/reagents/${req.file.filename}` : null;

  try {
    const reagentId = await generateReagentId();
    
    await db.query(
      "CALL sp_create_reagent(?,?,?,?,?,?)",
      [name, parseFloat(stock_quantity), unit, expired_date, foto, parseFloat(price_per_unit)]
    );

    res.status(201).json({ 
      message: "Reagent created successfully",
      reagent_id: reagentId
    });
  } catch (err) {
    // Delete uploaded file if database insert fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const updateReagent = async (req, res) => {
  const { name, stock_quantity, unit, expired_date, status, price_per_unit } = req.body;
  let foto = req.body.existingFoto;

  try {
    // If new file uploaded
    if (req.file) {
      foto = `/uploads/reagents/${req.file.filename}`;
      
      // Delete old image
      const [oldReagent] = await db.query(
        "SELECT foto FROM reagents WHERE reagent_id = ?",
        [req.params.id]
      );
      
      if (oldReagent[0]?.foto) {
        const oldImagePath = path.join(process.cwd(), oldReagent[0].foto);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await db.query(
      "CALL sp_update_reagent(?,?,?,?,?,?,?,?)",
      [req.params.id, name, parseFloat(stock_quantity), unit, expired_date, status, foto, parseFloat(price_per_unit)]
    );

    res.json({ message: "Reagent updated successfully" });
  } catch (err) {
    // Delete uploaded file if update fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
};

export const deleteReagent = async (req, res) => {
  try {
    await db.query(
      "CALL sp_delete_reagent(?)",
      [req.params.id]
    );

    res.json({ message: "Reagent deleted successfully" });
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
      ['Nama Reagent', 'Jumlah Stok', 'Unit', 'Tanggal Kadaluarsa', 'Harga per Unit'],
      ['Asam Sulfat (H2SO4)', 10, 'botol', '2026-12-31', 150000],
      ['Natrium Hidroksida (NaOH)', 15, 'kg', '2027-06-30', 200000],
      ['Etanol 96%', 20, 'liter', '2026-08-15', 75000]
    ];
    
    const ws = xlsx.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 30 },  // Nama Reagent
      { wch: 15 },  // Jumlah Stok
      { wch: 12 },  // Unit
      { wch: 20 },  // Tanggal Kadaluarsa
      { wch: 18 }   // Harga per Unit
    ];
    
    // Add instruction sheet
    const instructionData = [
      ['PETUNJUK PENGISIAN TEMPLATE IMPORT DATA REAGENT LABORATORIUM'],
      [''],
      ['1. Kolom yang harus diisi:'],
      ['   - Nama Reagent: Nama bahan kimia/reagent (wajib diisi)'],
      ['   - Jumlah Stok: Jumlah stok yang tersedia (angka, minimal 0)'],
      ['   - Unit: Satuan stok - pilih: botol, kg, gram, liter, ml, box (wajib diisi)'],
      ['   - Tanggal Kadaluarsa: Format YYYY-MM-DD atau DD/MM/YYYY (wajib diisi)'],
      ['   - Harga per Unit: Harga per satuan dalam Rupiah (angka, minimal 0)'],
      [''],
      ['2. Format Unit yang tersedia:'],
      ['   - botol: Untuk reagent dalam kemasan botol'],
      ['   - kg: Kilogram'],
      ['   - gram: Gram'],
      ['   - liter: Liter'],
      ['   - ml: Mililiter'],
      ['   - box: Box/kotak'],
      [''],
      ['3. Format Tanggal Kadaluarsa:'],
      ['   - Gunakan format: YYYY-MM-DD (contoh: 2026-12-31)'],
      ['   - Atau format: DD/MM/YYYY (contoh: 31/12/2026)'],
      ['   - Pastikan tanggal valid dan di masa depan'],
      [''],
      ['4. Contoh pengisian dapat dilihat pada sheet "Template Data"'],
      [''],
      ['5. Hapus baris contoh sebelum import data asli Anda'],
      [''],
      ['CATATAN PENTING:'],
      ['- Jangan mengubah nama kolom pada baris pertama'],
      ['- Pastikan format data sesuai dengan petunjuk'],
      ['- Jumlah stok bisa berupa angka desimal (contoh: 2.5)'],
      ['- Harga harus berupa angka positif'],
      ['- Gunakan titik (.) sebagai pemisah desimal untuk harga dan stok'],
      ['- Status akan otomatis diset "useable" saat import']
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
    res.setHeader('Content-Disposition', 'attachment; filename=Template_Import_Reagents.xlsx');
    res.send(buffer);
    
  } catch (err) {
    console.error('Download template error:', err);
    res.status(500).json({ error: 'Gagal mendownload template' });
  }
};

// ============================================
// IMPORT REAGENTS FROM EXCEL
// ============================================
export const importReagentsFromExcel = async (req, res) => {
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
        const name = row['Nama Reagent'];
        const stock_quantity = parseFloat(row['Jumlah Stok']);
        const unit = row['Unit'];
        const expired_date = row['Tanggal Kadaluarsa'];
        const price_per_unit = parseFloat(row['Harga per Unit']);

        // Validation
        if (!name || name.trim() === '') {
          throw new Error('Nama Reagent tidak boleh kosong');
        }

        if (isNaN(stock_quantity) || stock_quantity < 0) {
          throw new Error('Jumlah Stok harus angka minimal 0');
        }

        if (!['botol', 'kg', 'gram', 'liter', 'ml', 'box'].includes(unit)) {
          throw new Error('Unit harus: botol, kg, gram, liter, ml, atau box');
        }

        if (!expired_date) {
          throw new Error('Tanggal Kadaluarsa tidak boleh kosong');
        }

        // Parse date - support both formats
        let formattedDate;
        if (typeof expired_date === 'number') {
          // Excel serial date number
          const excelEpoch = new Date(1899, 11, 30);
          const msPerDay = 86400000;
          const date = new Date(excelEpoch.getTime() + expired_date * msPerDay);
          formattedDate = date.toISOString().split('T')[0];
        } else if (typeof expired_date === 'string') {
          // String date - try to parse
          const dateStr = expired_date.trim();
          let parsedDate;
          
          if (dateStr.includes('/')) {
            // DD/MM/YYYY or MM/DD/YYYY
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              // Assume DD/MM/YYYY
              parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          } else if (dateStr.includes('-')) {
            // YYYY-MM-DD
            parsedDate = new Date(dateStr);
          }
          
          if (!parsedDate || isNaN(parsedDate.getTime())) {
            throw new Error('Format tanggal tidak valid. Gunakan YYYY-MM-DD atau DD/MM/YYYY');
          }
          
          formattedDate = parsedDate.toISOString().split('T')[0];
        } else {
          throw new Error('Format tanggal tidak valid');
        }

        if (isNaN(price_per_unit) || price_per_unit < 0) {
          throw new Error('Harga per Unit harus angka minimal 0');
        }

        // Insert to database using stored procedure
        await db.query(
          "CALL sp_bulk_insert_reagents(?,?,?,?,?)",
          [name, stock_quantity, unit, formattedDate, price_per_unit]
        );

        results.success++;
        console.log(`✅ Row ${rowNumber}: ${name} - Berhasil`);

      } catch (err) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          name: row['Nama Reagent'] || 'Unknown',
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
        message: `Berhasil import ${results.success} data reagent`,
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