import React, { useState, useEffect } from 'react';
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  TestTube,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  X,
  ChevronRight
} from 'lucide-react';
import Frame from '../../layouts/frame.jsx';
import reportingService from '../../services/reportingService.js';

const ManagementReporting = () => {
  const [dateRange, setDateRange] = useState('this_month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [exportModal, setExportModal] = useState({ show: false, type: null, data: null });
  
  // State untuk data
  const [summaryStats, setSummaryStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [reagentUsage, setReagentUsage] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    loadReportingData();
  }, [dateRange]);

  const loadReportingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await reportingService.getCompleteReportingData(dateRange);
      
      if (data.success) {
        setSummaryStats(data.data.summary);
        setCategoryStats(data.data.categories);
        setReagentUsage(data.data.reagent_usage);
        setTopUsers(data.data.top_users);
        setWeeklyData(data.data.weekly_activity);
        setRecentReports(data.data.recent_reports);
      }
    } catch (err) {
      console.error('Error loading reporting data:', err);
      setError('Gagal memuat data reporting. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleGenerateReport = async (reportType) => {
    try {
      setGenerating(reportType);
      
      const result = await reportingService.generateReport(reportType, dateRange, 'PDF');
      
      if (result.success) {
        alert(`✅ ${result.data.report_name} berhasil dibuat!`);
        // Reload recent reports
        const reportsData = await reportingService.getRecentReports(5);
        if (reportsData.success) {
          setRecentReports(reportsData.data);
        }
      }
    } catch (err) {
      console.error('Error generating report:', err);
      alert('❌ Gagal membuat laporan. Silakan coba lagi.');
    } finally {
      setGenerating(null);
    }
  };

  const handleExportPDF = (reportType, data) => {
    setExportModal({ show: true, type: 'pdf', reportType, data });
  };

  const handleExportExcel = (reportType, data) => {
    setExportModal({ show: true, type: 'excel', reportType, data });
  };

  const getRangeLabel = (range) => {
    const labels = {
      'today': 'Hari Ini',
      'this_week': 'Minggu Ini',
      'this_month': 'Bulan Ini',
      'last_month': 'Bulan Lalu',
      'this_year': 'Tahun Ini'
    };
    return labels[range] || 'Custom';
  };

  if (loading) {
    return (
      <Frame bodyContent={
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
            <p className="text-lg font-semibold text-gray-800">Memuat Data Reporting</p>
            <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar...</p>
          </div>
        </div>
      } />
    );
  }

  if (error) {
    return (
      <Frame bodyContent={
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadReportingData}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 font-semibold shadow-lg"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      } />
    );
  }

  return (
    <Frame bodyContent={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
        
        {/* Export Modal */}
        {exportModal.show && (
          <ExportModal
            type={exportModal.type}
            reportType={exportModal.reportType}
            data={exportModal.data}
            dateRange={dateRange}
            summaryStats={summaryStats}
            categoryStats={categoryStats}
            reagentUsage={reagentUsage}
            topUsers={topUsers}
            onClose={() => setExportModal({ show: false, type: null, data: null })}
          />
        )}


        {/* Quick Generate Reports - Simplified */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Generate Laporan Lengkap</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'Peminjaman', icon: Package, color: 'teal', desc: 'Data peminjaman alat' },
              { type: 'Reagent', icon: TestTube, color: 'orange', desc: 'Penggunaan reagent' },
              { type: 'Keuangan', icon: DollarSign, color: 'green', desc: 'Laporan keuangan' },
              { type: 'Inventaris', icon: BarChart3, color: 'blue', desc: 'Stok & kondisi' }
            ].map(({ type, icon: Icon, color, desc }) => (
              <button
                key={type}
                onClick={() => handleGenerateReport(type)}
                disabled={generating === type}
                className={`p-5 border-2 border-slate-200 rounded-xl hover:border-${color}-500 hover:bg-${color}-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg`}
              >
                {generating === type ? (
                  <Loader2 className={`w-10 h-10 text-${color}-600 animate-spin mx-auto mb-3`} />
                ) : (
                  <Icon className={`w-10 h-10 text-slate-400 group-hover:text-${color}-600 mx-auto mb-3 transition-colors`} />
                )}
                <div className="font-bold text-slate-800 mb-1">{type}</div>
                <div className="text-sm text-slate-600">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Riwayat Laporan</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-y-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Nama Laporan</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Tipe</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Ukuran</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Format</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentReports.length > 0 ? (
                  recentReports.map((report) => (
                    <tr key={report.log_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-slate-600" />
                          </div>
                          <span className="font-semibold text-slate-800">{report.report_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {report.report_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(report.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{report.file_size}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          report.file_format === 'PDF' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {report.file_format}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-xl text-sm font-semibold transition-colors">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">Belum ada laporan yang dibuat</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    } />
  );
};

// ==========================================
// EXPORT MODAL COMPONENT
// ==========================================

const ExportModal = ({ type, reportType, data, dateRange, summaryStats, categoryStats, reagentUsage, topUsers, onClose }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    try {
      if (type === 'pdf') {
        await exportToPDF(reportType, data, dateRange, summaryStats, categoryStats, reagentUsage, topUsers);
      } else if (type === 'excel') {
        await exportToExcel(reportType, data, dateRange, summaryStats, categoryStats, reagentUsage, topUsers);
      }
      
      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export data. Silakan coba lagi.');
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${type === 'pdf' ? 'bg-red-100' : 'bg-green-100'} rounded-xl flex items-center justify-center`}>
              {type === 'pdf' ? (
                <FileText className="w-6 h-6 text-red-600" />
              ) : (
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Export {type.toUpperCase()}</h3>
              <p className="text-sm text-slate-600">Laporan {reportType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-600 mb-2">File akan didownload dengan format:</p>
          <p className="font-semibold text-slate-800">
            {reportType}_Report_{new Date().toISOString().split('T')[0]}.{type === 'pdf' ? 'pdf' : 'xlsx'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={exporting}
            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`flex-1 px-6 py-3 ${
              type === 'pdf' 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            } text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg`}
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// EXPORT TO PDF FUNCTION
// ==========================================

const exportToPDF = async (reportType, data, dateRange, summaryStats, categoryStats, reagentUsage, topUsers) => {
  // This will use the PDF generation library
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(`Laporan ${reportType}`, 20, 20);
  
  // Date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Periode: ${dateRange}`, 20, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 20, 35);
  
  let yPos = 50;
  
  // Summary Stats
  if (summaryStats) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Ringkasan', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Transaksi: ${summaryStats.total_transactions}`, 20, yPos);
    yPos += 7;
    doc.text(`Total Pendapatan: Rp ${(summaryStats.total_revenue || 0).toLocaleString('id-ID')}`, 20, yPos);
    yPos += 7;
    doc.text(`Alat Dipinjam: ${summaryStats.tools_borrowed}`, 20, yPos);
    yPos += 7;
    doc.text(`Pengguna Aktif: ${summaryStats.active_users}`, 20, yPos);
    yPos += 15;
  }
  
  // Report-specific data
  if (reportType === 'reagent' && reagentUsage.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Top Reagent Usage', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    reagentUsage.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${item.name} - ${item.total_used} ${item.unit} - Rp ${item.total_cost.toLocaleString('id-ID')}`, 25, yPos);
      yPos += 7;
    });
  }
  
  if (reportType === 'users' && topUsers.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Pengguna Teraktif', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    topUsers.forEach((user, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${user.name} (${user.role}) - ${user.total_orders} pesanan - Rp ${user.total_spent.toLocaleString('id-ID')}`, 25, yPos);
      yPos += 7;
    });
  }
  
  if (reportType === 'category' && categoryStats.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Distribusi Kategori', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    categoryStats.forEach((cat, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${cat.category}: ${cat.request_count} (${cat.percentage}%)`, 25, yPos);
      yPos += 7;
    });
  }
  
  // Save
  doc.save(`${reportType}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ==========================================
// EXPORT TO EXCEL FUNCTION
// ==========================================

const exportToExcel = async (reportType, data, dateRange, summaryStats, categoryStats, reagentUsage, topUsers) => {
  const XLSX = window.XLSX;
  const workbook = XLSX.utils.book_new();
  
  // Summary Sheet
  if (summaryStats) {
    const summaryData = [
      ['RINGKASAN LAPORAN'],
      ['Periode', dateRange],
      ['Tanggal Generate', new Date().toLocaleDateString('id-ID')],
      [''],
      ['Metrik', 'Nilai'],
      ['Total Transaksi', summaryStats.total_transactions],
      ['Total Pendapatan', `Rp ${(summaryStats.total_revenue || 0).toLocaleString('id-ID')}`],
      ['Alat Dipinjam', summaryStats.tools_borrowed],
      ['Pengguna Aktif', summaryStats.active_users]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }
  
  // Report-specific sheets
  if (reportType === 'reagent' && reagentUsage.length > 0) {
    const reagentData = [
      ['No', 'Nama Reagent', 'Total Digunakan', 'Unit', 'Total Biaya'],
      ...reagentUsage.map((item, index) => [
        index + 1,
        item.name,
        item.total_used,
        item.unit,
        `Rp ${item.total_cost.toLocaleString('id-ID')}`
      ])
    ];
    
    const reagentSheet = XLSX.utils.aoa_to_sheet(reagentData);
    XLSX.utils.book_append_sheet(workbook, reagentSheet, 'Reagent Usage');
  }
  
  if (reportType === 'users' && topUsers.length > 0) {
    const usersData = [
      ['No', 'Nama', 'Role', 'Total Pesanan', 'Total Pengeluaran'],
      ...topUsers.map((user, index) => [
        index + 1,
        user.name,
        user.role,
        user.total_orders,
        `Rp ${user.total_spent.toLocaleString('id-ID')}`
      ])
    ];
    
    const usersSheet = XLSX.utils.aoa_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Top Users');
  }
  
  if (reportType === 'category' && categoryStats.length > 0) {
    const categoryData = [
      ['Kategori', 'Jumlah Request', 'Persentase'],
      ...categoryStats.map(cat => [
        cat.category,
        cat.request_count,
        `${cat.percentage}%`
      ])
    ];
    
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Kategori');
  }
  
  // Save
  XLSX.writeFile(workbook, `${reportType}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export default ManagementReporting;