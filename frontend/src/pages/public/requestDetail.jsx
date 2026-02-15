import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Calendar, Package, TestTube, CreditCard, FileText,
  CheckCircle, XCircle, Clock, AlertCircle, Download, Printer
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import HeaderLandingPage from '../../layouts/headerLandingPage';

const RequestDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [tools, setTools] = useState([]);
  const [reagents, setReagents] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/customer/requests/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRequest(response.data.data.request);
      setTools(response.data.data.tools || []);
      setReagents(response.data.data.reagents || []);
    } catch (err) {
      console.error('Error fetching request detail:', err);
      alert('Gagal memuat detail permohonan');
      navigate('/customer/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      alert('Mohon masukkan alasan pembatalan');
      return;
    }

    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/customer/requests/${id}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Permohonan berhasil dibatalkan');
      setShowCancelModal(false);
      fetchRequestDetail();
    } catch (err) {
      console.error('Error cancelling request:', err);
      alert(err.response?.data?.message || 'Gagal membatalkan permohonan');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Menunggu Approval' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Disetujui' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Ditolak' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Dibatalkan' }
    };
    return badges[status] || badges.pending;
  };

  const formatCurrency = (amount) => `Rp ${parseFloat(amount || 0).toLocaleString('id-ID')}`;
  const formatDate = (date) => !date ? '-' : new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600">Memuat detail...</p>
        </div>
      </div>
    );
  }

  if (!request) return null;

  const statusBadge = getStatusBadge(request.request_status);
  const StatusIcon = statusBadge.icon;
  const canCancel = request.request_status === 'pending' || request.request_status === 'approved';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderLandingPage />
      {/* <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/customer/requests')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Permohonan
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{request.request_id}</h1>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${statusBadge.bg} ${statusBadge.text}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusBadge.label}
                </span>
                {request.payment_status === 'paid' && (
                  <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-100 text-green-700">
                    Lunas
                  </span>
                )}
              </div>
            </div>
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700"
              >
                Batalkan Permohonan
              </button>
            )}
          </div>
        </div>
      </div> */}

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Permohonan</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal Pengajuan</p>
                  <p className="font-medium text-gray-900">{formatDate(request.request_date)}</p>
                </div>
                {request.start_date && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Waktu Mulai</p>
                      <p className="font-medium text-gray-900">{formatDate(request.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Waktu Selesai</p>
                      <p className="font-medium text-gray-900">{formatDate(request.end_date)}</p>
                    </div>
                  </>
                )}
                {request.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Catatan</p>
                    <p className="text-gray-900">{request.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tools */}
            {tools.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-teal-600" />
                  Alat Laboratorium ({tools.length})
                </h2>
                <div className="space-y-3">
                  {tools.map((tool) => (
                    <div key={tool.request_tool_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {tool.image && (
                          <img src={`http://localhost:5000${tool.image}`} alt={tool.tool_name} className="w-12 h-12 object-contain" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{tool.tool_name}</p>
                          <p className="text-sm text-gray-600">Qty: {tool.qty}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">{formatCurrency(tool.hourly_rate)}/jam</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reagents */}
            {reagents.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TestTube className="w-6 h-6 text-orange-600" />
                  Bahan Kimia & Reagen ({reagents.length})
                </h2>
                <div className="space-y-3">
                  {reagents.map((reagent) => (
                    <div key={reagent.request_reagent_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {reagent.foto && (
                          <img src={`http://localhost:5000${reagent.foto}`} alt={reagent.reagent_name} className="w-12 h-12 object-contain" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{reagent.reagent_name}</p>
                          <p className="text-sm text-gray-600">{reagent.estimated_qty} {reagent.unit}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">{formatCurrency(reagent.price_per_unit)}/{reagent.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Payment Summary */}
            {request.amount && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  Ringkasan Pembayaran
                </h3>
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${request.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {request.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </div>
                  {request.payment_method && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Metode</span>
                      <span className="font-medium text-gray-900">{request.payment_method === 'gateway' ? 'Payment Gateway' : 'Transfer Manual'}</span>
                    </div>
                  )}
                  {request.paid_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dibayar</span>
                      <span className="font-medium text-gray-900">{formatDate(request.paid_at)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-2xl text-teal-600">{formatCurrency(request.amount)}</span>
                </div>

              </div>
            )}
                <div>
                 <button
                    onClick={() => navigate('/customer/requests')}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali
                  </button>
                </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Batalkan Permohonan</h3>
            <p className="text-gray-600 mb-4">Apakah Anda yakin ingin membatalkan permohonan ini? Tindakan ini tidak dapat dibatalkan.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Alasan pembatalan (wajib)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4 resize-none"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                disabled={cancelling}
              >
                Batal
              </button>
              <button
                onClick={handleCancelRequest}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                disabled={cancelling}
              >
                {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail;