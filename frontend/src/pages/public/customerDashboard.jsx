import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, FileText, CreditCard, CheckCircle, XCircle,
  AlertCircle, Package, TestTube, TrendingUp, ArrowRight, Bell,
  Plus, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/context/AuthContext';
import axios from 'axios';
import HeaderLandingPage from '../../layouts/headerLandingPage';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [statsRes, requestsRes, schedulesRes] = await Promise.all([
        axios.get('http://localhost:5000/customer/dashboard/stats', config),
        axios.get('http://localhost:5000/customer/dashboard/recent-requests?limit=5', config),
        axios.get('http://localhost:5000/customer/dashboard/upcoming-schedules?limit=3', config)
      ]);

      setStats(statsRes.data.data);
      setRecentRequests(requestsRes.data.data);
      setUpcomingSchedules(schedulesRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Disetujui' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Dibatalkan' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Terjadwal' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' },
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Lunas' }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderLandingPage />
      {/* <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Selamat datang kembali, {user?.name}!</p>
            </div>
            <button
              onClick={() => navigate('/katalog')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-5 h-5" />
              Buat Permohonan Baru
            </button>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Permohonan */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Permohonan</h3>
            <p className="text-3xl font-bold text-gray-900">{stats?.total_requests || 0}</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-yellow-600 font-medium">{stats?.pending_requests || 0} Pending</span>
              <span className="text-gray-400">•</span>
              <span className="text-green-600 font-medium">{stats?.approved_requests || 0} Disetujui</span>
            </div>
          </div>

          {/* Total Pembayaran */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Pembayaran</h3>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats?.total_spent)}
            </p>
            <div className="mt-3 text-sm text-gray-500">
              Pending: {formatCurrency(stats?.pending_payments)}
            </div>
          </div>

          {/* Jadwal Mendatang */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Jadwal Mendatang</h3>
            <p className="text-3xl font-bold text-gray-900">{stats?.upcoming_schedules || 0}</p>
            <div className="mt-3 text-sm text-gray-500">
              Selesai: {stats?.completed_schedules || 0}
            </div>
          </div>

          {/* Jadwal Terdekat */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Jadwal Terdekat</h3>
            {stats?.next_schedule ? (
              <>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(stats.next_schedule).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </p>
                <div className="mt-3 text-sm text-gray-500">
                  {new Date(stats.next_schedule).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </>
            ) : (
              <p className="text-lg text-gray-400">Tidak ada</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Permohonan Terbaru</h2>
                  <button
                    onClick={() => navigate('/customer/requests')}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1"
                  >
                    Lihat Semua
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {recentRequests.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">Belum ada permohonan</p>
                    <p className="text-gray-500 text-sm mb-4">Mulai ajukan permohonan penggunaan laboratorium</p>
                    <button
                      onClick={() => navigate('/katalog')}
                      className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Buat Permohonan
                    </button>
                  </div>
                ) : (
                  recentRequests.map((request) => {
                    const statusBadge = getStatusBadge(request.request_status);
                    return (
                      <div key={request.request_id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{request.request_id}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                {statusBadge.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {formatDate(request.request_date)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {request.total_tools} Alat
                              </span>
                              <span className="flex items-center gap-1">
                                <TestTube className="w-4 h-4" />
                                {request.total_reagents} Reagen
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/customer/requests/${request.request_id}`)}
                            className="text-teal-600 hover:text-teal-700 p-2 rounded-lg hover:bg-teal-50"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                        {request.amount && (
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Total Biaya</span>
                            <span className="font-bold text-gray-900">{formatCurrency(request.amount)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Schedules */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Jadwal Mendatang</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {upcomingSchedules.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Tidak ada jadwal mendatang</p>
                  </div>
                ) : (
                  upcomingSchedules.map((schedule) => (
                    <div key={schedule.schedule_id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="bg-teal-100 p-3 rounded-lg flex-shrink-0">
                          <Calendar className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 mb-1">
                            {new Date(schedule.start_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(schedule.start_date).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {new Date(schedule.end_date).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{schedule.total_tools} Alat</span>
                            <span></span>
                            <span>{schedule.total_reagents} Reagen</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-6 mt-6 text-white">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/katalog')}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Buat Permohonan
                </button>
                <button
                  onClick={() => navigate('/customer/requests')}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Lihat Permohonan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;