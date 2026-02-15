import React, { useState, useContext, useEffect } from 'react';
import { 
  CreditCard, Search, Filter, Download, Eye, CheckCircle, XCircle, Clock,
  DollarSign, Calendar, User, FileText, AlertCircle, X
} from 'lucide-react';
import axios from 'axios';
import Frame from '../../layouts/frame.jsx';
import { VariableDash } from '../context/VariableDash.jsx';
import Alert from '../../components/common/alert.jsx';

export default function PaymentManagement() {
  const { 
    loading, setLoading,
    error, setError,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
  } = useContext(VariableDash);

  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterMethod, setFilterMethod] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0
  });
  const [alert, setAlert] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  const statusConfig = {
    paid: { label: 'Lunas', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { label: 'Pending', color: 'bg-orange-100 text-orange-700', icon: Clock },
    failed: { label: 'Gagal', color: 'bg-red-100 text-red-700', icon: XCircle }
  };

  const methodConfig = {
    gateway: { label: 'Midtrans', icon: '' },
    manual: { label: 'Manual', icon: '' }
  };

  useEffect(() => {
    setFilterStatus("all");
    setFilterMethod("all");
    fetchPayments();
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/payments');
      setPayments(response.data);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/payments/stats');
      setStats(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaymentDetail = async (paymentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/payments/${paymentId}`);
      setSelectedPayment(response.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal mengambil detail pembayaran'
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchSearch = payment.payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       payment.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       payment.request_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       payment.transaction_ref?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || payment.payment_status === filterStatus;
    const matchMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    return matchSearch && matchStatus && matchMethod;
  });

  const handleViewDetail = (payment) => {
    fetchPaymentDetail(payment.payment_id);
  };

  const DetailModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh]"style={{
    overflowY: 'auto',
    scrollbarWidth: 'none',        // Firefox
    msOverflowStyle: 'none',       // IE & Edge lama
  }}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Detail Pembayaran</h3>
            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Info */}

          {/* User Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Informasi Pengguna
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nama</label>
                <p className="font-medium text-gray-900">{selectedPayment?.user_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium text-gray-900">{selectedPayment?.user_email}</p>
              </div>
              {selectedPayment?.user_phone && (
                <div>
                  <label className="text-sm text-gray-600">No. Telepon</label>
                  <p className="font-medium text-gray-900">{selectedPayment.user_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white-50 rounded-xl p-4 border border-gray-200">
              <label className="text-sm font-medium text-blue-900">Metode Pembayaran</label>
              <p className="text-lg font-semibold text-blue-900 flex items-center gap-2 mt-1">
                <span>{methodConfig[selectedPayment?.payment_method]?.icon}</span>
                {methodConfig[selectedPayment?.payment_method]?.label}
              </p>
            </div>
            <div className="bg-white-50 rounded-xl p-4 border border-gray-200">
              <label className="text-sm font-medium text-purple-900">Referensi Transaksi</label>
              <p className="text-lg font-semibold text-purple-900 mt-1">
                {selectedPayment?.transaction_ref || '-'}
              </p>
            </div>
          </div>

          {/* Status & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedPayment?.payment_status]?.color}`}>
                  {React.createElement(statusConfig[selectedPayment?.payment_status]?.icon, { className: 'w-4 h-4' })}
                  {statusConfig[selectedPayment?.payment_status]?.label}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tanggal Dibuat</label>
              <p className="font-medium text-gray-900 mt-2">
                {selectedPayment?.created_at ? new Date(selectedPayment.created_at).toLocaleString('id-ID') : '-'}
              </p>
            </div>
          </div>

          {selectedPayment?.paid_at && (
            <div className="bg-white-50 rounded-xl p-4 border border-green-200">
              <label className="text-sm font-medium text-green-900">Tanggal Pembayaran</label>
              <p className="text-lg font-semibold text-green-900 mt-1">
                {new Date(selectedPayment.paid_at).toLocaleString('id-ID')}
              </p>
            </div>
          )}

          {/* Items */}
          {selectedPayment?.items && selectedPayment.items.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Rincian Pembayaran
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Harga</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedPayment.items.map((item, idx) => {
                      const itemName = item.tool_name || item.reagent_name || item.damage_name || item.penalty_name || 'Unknown';
                      const itemType = item.item_type;
                      const typeIcon = itemType === 'tool' ? '' : 
                                      itemType === 'reagent' ? '' : 
                                      itemType === 'damage' ? '' : 
                                      itemType === 'penalty' ? '' : '';
                      const typeLabel = itemType === 'tool' ? 'Alat' : 
                                       itemType === 'reagent' ? 'Reagen' : 
                                       itemType === 'damage' ? 'Kerusakan' : 
                                       itemType === 'penalty' ? 'Denda' : 'Item';
                      
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{itemName}</div>
                            <div className="text-xs text-gray-500">
                              {typeIcon} {typeLabel}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {item.qty} {item.unit || ''}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            Rp {parseFloat(item.price || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            Rp {parseFloat(item.subtotal || 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-teal-50">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right font-bold text-teal-900">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-teal-900 text-lg">
                        Rp {parseFloat(selectedPayment?.amount || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {selectedPayment?.isPenalty && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Pembayaran Denda/Kerusakan</p>
                  <p>Ini adalah pembayaran untuk denda atau kerusakan yang terjadi.</p>
                </div>
              </div>
            </div>
          )}

          {selectedPayment?.notes && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Catatan</label>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                {selectedPayment.notes}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => setShowDetailModal(false)}
            className="w-full px-4 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Frame menuName={"Payment Management"} descriptionMenu={"Kelola pembayaran laboratorium"} bodyContent={
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Transaksi</span>
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              Rp {parseFloat(stats.total || 0).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Terbayar</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              Rp {parseFloat(stats.paid || 0).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Pending</span>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              Rp {parseFloat(stats.pending || 0).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Gagal</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.failed || 0}</div>
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
                placeholder="Cari ID pembayaran, nama, atau referensi transaksi..."
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
                <option value="paid">Lunas</option>
                <option value="pending">Pending</option>
                <option value="failed">Gagal</option>
              </select>

              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Semua Metode</option>
                <option value="gateway">Midtrans</option>
                <option value="manual">Manual</option>
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
                  {/* <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ID Pembayaran</th> */}
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Pengguna</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Metode</th>
                  {/* <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Referensi</th> */}
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Total</th>
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
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, index) => {
                    const StatusIcon = statusConfig[payment.payment_status]?.icon || Clock;
                    return (
                      <tr key={payment.payment_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                        {/* <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{payment.payment_id}</div>
                          <div className="text-sm text-gray-500">{payment.request_id}</div>
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{payment.user_name}</div>
                          <div className="text-sm text-gray-500">{payment.user_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {payment.created_at ? new Date(payment.created_at).toLocaleDateString('id-ID') : '-'}
                          </div>
                          {payment.paid_at && (
                            <div className="text-xs text-green-600">
                              Lunas: {new Date(payment.paid_at).toLocaleDateString('id-ID')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span>{methodConfig[payment.payment_method]?.icon}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {methodConfig[payment.payment_method]?.label}
                            </span>
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 text-sm text-gray-600">
                          {payment.transaction_ref || '-'}
                        </td> */}
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          Rp {parseFloat(payment.amount || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[payment.payment_status]?.color || 'bg-gray-100 text-gray-700'}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[payment.payment_status]?.label || payment.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewDetail(payment)}
                            className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showDetailModal && <DetailModal />}

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