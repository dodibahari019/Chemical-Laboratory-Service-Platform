import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Filter, Calendar, Package, TestTube,
  Eye, XCircle, Clock, CheckCircle, AlertCircle, Download,
  ChevronDown, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeaderLandingPage from '../../layouts/headerLandingPage';

const MyRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/customer/requests',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            status: statusFilter || null,
            search: searchQuery || null
          }
        }
      );
      setRequests(response.data.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (statusFilter) {
      filtered = filtered.filter(req => req.request_status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.request_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.tool_names?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reagent_names?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: Clock,
        label: 'Menunggu Approval'
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle,
        label: 'Disetujui'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Ditolak'
      },
      cancelled: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: XCircle,
        label: 'Dibatalkan'
      }
    };
    return badges[status] || badges.pending;
  };

  const getPaymentBadge = (status) => {
    const badges = {
      paid: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Lunas'
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Belum Lunas'
      },
      failed: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Gagal'
      }
    };
    return badges[status] || badges.pending;
  };

  const formatCurrency = (amount) => {
    return `Rp ${parseFloat(amount || 0).toLocaleString('id-ID')}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.request_status === 'pending').length,
      approved: requests.filter(r => r.request_status === 'approved').length,
      rejected: requests.filter(r => r.request_status === 'rejected').length,
      cancelled: requests.filter(r => r.request_status === 'cancelled').length
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderLandingPage />
      {/* <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Permohonan Saya</h1>
              <p className="text-gray-600 mt-1">Kelola semua permohonan penggunaan laboratorium Anda</p>
            </div>
            <button
              onClick={() => navigate('/katalog')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <FileText className="w-5 h-5" />
              Buat Permohonan Baru
            </button>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-teal-500 transition-all">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 hover:border-yellow-400 transition-all">
            <p className="text-sm text-yellow-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-all">
            <p className="text-sm text-green-700 mb-1">Disetujui</p>
            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-red-200 hover:border-red-400 transition-all">
            <p className="text-sm text-red-700 mb-1">Ditolak</p>
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-gray-400 transition-all">
            <p className="text-sm text-gray-600 mb-1">Dibatalkan</p>
            <p className="text-2xl font-bold text-gray-700">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan ID, catatan, alat, atau reagen..."
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[200px]"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {(searchQuery || statusFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-gray-600">Memuat permohonan...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                {searchQuery || statusFilter ? 'Tidak ada permohonan yang sesuai' : 'Belum ada permohonan'}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {searchQuery || statusFilter 
                  ? 'Coba ubah filter pencarian Anda' 
                  : 'Mulai ajukan permohonan penggunaan laboratorium'}
              </p>
              {!searchQuery && !statusFilter && (
                <button
                  onClick={() => navigate('/katalog')}
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 inline-flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Buat Permohonan
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const statusBadge = getStatusBadge(request.request_status);
                const paymentBadge = request.payment_status ? getPaymentBadge(request.payment_status) : null;
                const StatusIcon = statusBadge.icon;

                return (
                  <div
                    key={request.request_id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/customer/requests/${request.request_id}`)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{request.request_id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusBadge.label}
                          </span>
                          {paymentBadge && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentBadge.bg} ${paymentBadge.text}`}>
                              {paymentBadge.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Diajukan: {formatDate(request.request_date)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/requests/${request.request_id}`);
                        }}
                        className="text-teal-600 hover:text-teal-700 p-2 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Items Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4 text-teal-600" />
                        <span><strong>{request.total_tools}</strong> Alat</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TestTube className="w-4 h-4 text-orange-600" />
                        <span><strong>{request.total_reagents}</strong> Reagen</span>
                      </div>
                    </div>

                    {/* Schedule & Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      {request.start_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {formatDate(request.start_date)}
                          </span>
                        </div>
                      )}
                      {request.amount && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Total:</span>
                          </div>
                          <span className="font-bold text-gray-900">{formatCurrency(request.amount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Items Names (truncated) */}
                    {(request.tool_names || request.reagent_names) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {request.tool_names && (
                          <p className="text-xs text-gray-500 mb-1">
                            <span className="font-medium">Alat:</span> {request.tool_names}
                          </p>
                        )}
                        {request.reagent_names && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Reagen:</span> {request.reagent_names}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && filteredRequests.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredRequests.length} dari {requests.length} permohonan
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;