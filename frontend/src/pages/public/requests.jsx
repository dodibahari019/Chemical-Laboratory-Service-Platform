import React, { useState, useContext, useEffect } from 'react';
import { 
  FileText, Search, Filter, Download, Eye, Check, X, Clock,
  AlertCircle, CheckCircle, XCircle, Calendar, User, Package, TestTube
} from 'lucide-react';
import axios from 'axios';
import Frame from '../../layouts/frame.jsx';
import { VariableDash } from '../context/VariableDash.jsx';
import Alert from '../../components/common/alert.jsx';
import ApproveModal from '../../components/ApprovedModal.jsx';
import RejectModal from '../../components/RejectedModal.jsx';

export default function RequestManagement() {
  const { 
    loading, setLoading,
    error, setError,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
  } = useContext(VariableDash);

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  });
  const [alert, setAlert] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-orange-100 text-orange-700', icon: Clock },
    approved: { label: 'Disetujui', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
    cancelled: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
  };

  useEffect(() => {
    setFilterStatus("all");
    fetchRequests();
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/requests');
      setRequests(response.data);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data request.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/requests/stats');
      setStats(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequestDetail = async (requestId) => {
    try {
      const response = await axios.get(`http://localhost:5000/requests/${requestId}`);
      setSelectedRequest(response.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal mengambil detail request'
      });
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchSearch = req.request_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       req.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       req.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleViewDetail = (request) => {
    fetchRequestDetail(request.request_id);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setShowApproveModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    try {
      await axios.put(`http://localhost:5000/requests/${selectedRequest.request_id}/approve`, {
        admin_notes: adminNotes || 'Permohonan disetujui'
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Request berhasil disetujui!'
      });

      setShowApproveModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
      fetchStats();
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menyetujui request'
      });
    }
  };

  const confirmReject = async () => {
    if (!adminNotes.trim()) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Alasan penolakan harus diisi!'
      });
      return;
    }

    try {
      await axios.put(`http://localhost:5000/requests/${selectedRequest.request_id}/reject`, {
        admin_notes: adminNotes
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Request berhasil ditolak!'
      });

      setShowRejectModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
      fetchStats();
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menolak request'
      });
    }
  };

  // Calculate totals
  const calculateTotals = (request) => {
    let toolsTotal = 0;
    let reagentsTotal = 0;

    if (request?.tools) {
      toolsTotal = request.tools.reduce((sum, tool) => sum + parseFloat(tool.subtotal || 0), 0);
    }

    if (request?.reagents) {
      reagentsTotal = request.reagents.reduce((sum, reagent) => sum + parseFloat(reagent.subtotal || 0), 0);
    }

    return {
      toolsTotal,
      reagentsTotal,
      grandTotal: toolsTotal + reagentsTotal
    };
  };

  // Detail Modal
  const DetailModal = () => {
    const totals = calculateTotals(selectedRequest);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh]" style={{
    overflowY: 'auto',
    scrollbarWidth: 'none',        // Firefox
    msOverflowStyle: 'none',       // IE & Edge lama
  }}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Detail Permohonan</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Request Info */}
            {/* <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">ID Permohonan</label>
                <p className="text-lg font-semibold text-gray-900">{selectedRequest?.request_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedRequest?.status]?.color}`}>
                    {React.createElement(statusConfig[selectedRequest?.status]?.icon, { className: 'w-4 h-4' })}
                    {statusConfig[selectedRequest?.status]?.label}
                  </span>
                </div>
              </div>
            </div> */}

            {/* User Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Informasi Pemohon
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Nama</label>
                  <p className="font-medium text-gray-900">{selectedRequest?.user_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium text-gray-900">{selectedRequest?.user_email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">No. Telepon</label>
                  <p className="font-medium text-gray-900">{selectedRequest?.user_phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tanggal Permohonan</label>
                  <p className="font-medium text-gray-900">
                    {selectedRequest?.request_date ? new Date(selectedRequest.request_date).toLocaleString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            {selectedRequest?.start_date && (
              <div className="bg-white-50 rounded-xl p-4 border border-gray-300">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Jadwal Penggunaan
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-blue-700">Mulai</label>
                    <p className="font-medium text-blue-900">
                      {new Date(selectedRequest.start_date).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-blue-700">Selesai</label>
                    <p className="font-medium text-blue-900">
                      {new Date(selectedRequest.end_date).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tools */}
            {selectedRequest?.tools && selectedRequest.tools.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-600" />
                  Alat Laboratorium
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama Alat</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Harga/Jam</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedRequest.tools.map((tool, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{tool.tool_name}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{tool.qty}</td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            Rp {parseFloat(tool.hourly_rate).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            Rp {parseFloat(tool.subtotal).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan="3" className="px-4 py-3 text-right text-gray-900">Total Alat:</td>
                        <td className="px-4 py-3 text-right text-teal-700">
                          Rp {totals.toolsTotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reagents */}
            {selectedRequest?.reagents && selectedRequest.reagents.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-teal-600" />
                  Bahan Kimia / Reagen
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama Reagen</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Estimasi Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Harga/Unit</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedRequest.reagents.map((reagent, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{reagent.reagent_name}</td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {reagent.estimated_qty} {reagent.unit}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            Rp {parseFloat(reagent.price_per_unit).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            Rp {parseFloat(reagent.subtotal).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan="3" className="px-4 py-3 text-right text-gray-900">Total Reagen:</td>
                        <td className="px-4 py-3 text-right text-teal-700">
                          Rp {totals.reagentsTotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Total Cost Summary */}
            <div className="bg-white-50 rounded-xl p-6 border-2 border-gray-300">
              <h4 className="font-semibold text-teal-900 mb-4 text-lg">Ringkasan Biaya</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Alat Laboratorium</span>
                  <span className="font-semibold text-gray-900">
                    Rp {totals.toolsTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Bahan Kimia / Reagen</span>
                  <span className="font-semibold text-gray-900">
                    Rp {totals.reagentsTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-teal-900">TOTAL ESTIMASI BIAYA</span>
                    <span className="text-2xl font-bold text-teal-900">
                      Rp {totals.grandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {selectedRequest?.payment_status && (
                <div className="mt-4 pt-4 border-t border-teal-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Status Pembayaran:</span>
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                      selectedRequest.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                      selectedRequest.payment_status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedRequest.payment_status === 'paid' ? 'Lunas' : 
                       selectedRequest.payment_status === 'pending' ? 'Menunggu Pembayaran' : 'Gagal'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedRequest?.notes && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Catatan Pemohon</label>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line border border-gray-200">
                  {selectedRequest.notes}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3">
            {selectedRequest?.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleReject(selectedRequest);
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Tolak
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleApprove(selectedRequest);
                  }}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Setujui
                </button>
              </>
            )}
            {selectedRequest?.status !== 'pending' && (
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Approve Modal
  // const ApproveModal = () => (
  //   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  //     <div className="bg-white rounded-xl max-w-md w-full">
  //       <div className="p-6">
  //         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <Check className="w-8 h-8 text-green-600" />
  //         </div>
  //         <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Setujui Permohonan?</h3>
  //         <p className="text-gray-600 text-center mb-4">
  //           Anda akan menyetujui permohonan
  //         </p>

  //         <div className="mb-4">
  //           <label className="block text-sm font-medium text-gray-700 mb-2">
  //             Catatan Admin (Opsional)
  //           </label>
  //           <textarea
  //             value={adminNotes}
  //             onChange={(e) => setAdminNotes(e.target.value)}
  //             rows={3}
  //             className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
  //             placeholder="Tambahkan catatan persetujuan..."
  //           />
  //         </div>

  //         <div className="flex gap-3">
  //           <button
  //             onClick={() => setShowApproveModal(false)}
  //             className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
  //           >
  //             Batal
  //           </button>
  //           <button
  //             onClick={confirmApprove}
  //             className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
  //           >
  //             Setujui
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  // // Reject Modal
  // const RejectModal = () => (
  //   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  //     <div className="bg-white rounded-xl max-w-md w-full">
  //       <div className="p-6">
  //         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <X className="w-8 h-8 text-red-600" />
  //         </div>
  //         <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Tolak Permohonan?</h3>
  //         <p className="text-gray-600 text-center mb-4">
  //           Anda akan menolak permohonan <span className="font-semibold">{selectedRequest?.request_id}</span>
  //         </p>

  //         <div className="mb-4">
  //           <label className="block text-sm font-medium text-gray-700 mb-2">
  //             Alasan Penolakan <span className="text-red-500">*</span>
  //           </label>
  //           <textarea
  //             value={adminNotes}
  //             onChange={(e) => setAdminNotes(e.target.value)}
  //             rows={3}
  //             className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
  //             placeholder="Jelaskan alasan penolakan..."
  //           />
  //         </div>

  //         <div className="flex gap-3">
  //           <button
  //             onClick={() => setShowRejectModal(false)}
  //             className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
  //           >
  //             Batal
  //           </button>
  //           <button
  //             onClick={confirmReject}
  //             disabled={!adminNotes.trim()}
  //             className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
  //           >
  //             Tolak
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <Frame menuName={"Request Management"} descriptionMenu={"Kelola permohonan penggunaan laboratorium"} bodyContent={
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Permohonan</span>
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Pending</span>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Disetujui</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.approved}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Ditolak</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID permohonan, nama, atau email..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">No</th>
                  {/* <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ID Permohonan</th> */}
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Pemohon</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Jadwal Penggunaan</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Estimasi Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request, index) => {
                    const StatusIcon = statusConfig[request.status]?.icon || Clock;
                    return (
                      <tr key={request.request_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                        {/* <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{request.request_id}</div>
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{request.user_name}</div>
                          <div className="text-sm text-gray-500">{request.user_email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {request.request_date ? new Date(request.request_date).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {request.start_date ? (
                            <div>
                              <div>{new Date(request.start_date).toLocaleDateString('id-ID')}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(request.start_date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                {' - '}
                                {new Date(request.end_date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {request.total_amount ? `Rp ${parseFloat(request.total_amount).toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[request.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[request.status]?.label || request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetail(request)}
                              className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                                  title="Setujui"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Tolak"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {showDetailModal && <DetailModal />}
{showApproveModal && (
  <ApproveModal
    adminNotes={adminNotes}
    setAdminNotes={setAdminNotes}
    onClose={() => setShowApproveModal(false)}
    onConfirm={confirmApprove}
  />
)}

{showRejectModal && (
  <RejectModal
    adminNotes={adminNotes}
    setAdminNotes={setAdminNotes}
    onClose={() => setShowRejectModal(false)}
    onConfirm={confirmReject}
  />
)}
        <Alert 
          show={alert.show} 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert({ ...alert, show: false })}
        />
      </div>
    }/>
  );
}