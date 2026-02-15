import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Activity,
  AlertTriangle,
  Package,
  Users,
  FileText,
  Loader2,
  Calendar,
  ShoppingCart,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Frame from '../../layouts/frame.jsx';
import dashboardService from '../../services/dashbaordService.js';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiData, setKpiData] = useState({});
  const [requestFlowData, setRequestFlowData] = useState([]);
  const [toolUsageData, setToolUsageData] = useState([]);
  const [toolStatusData, setToolStatusData] = useState([]);
  const [scheduleStatusData, setScheduleStatusData] = useState([]);
  const [paymentStatusData, setPaymentStatusData] = useState([]);
  const [revenueTrendData, setRevenueTrendData] = useState([]);
  const [reagentAlertData, setReagentAlertData] = useState([]);
  const [userDistData, setUserDistData] = useState([]);
  const [topUsersData, setTopUsersData] = useState([]);
  const [recentRequestsData, setRecentRequestsData] = useState([]);

  const COLORS = {
    primary: ['#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B'],
    status: {
      pending: '#F59E0B',
      approved: '#3B82F6',
      rejected: '#EF4444',
      cancelled: '#6B7280',
      scheduled: '#14B8A6',
      completed: '#10B981',
      no_show: '#EF4444',
      available: '#10B981',
      maintenance: '#F59E0B',
      unavailable: '#EF4444',
      paid: '#10B981',
      failed: '#EF4444'
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        kpi, requestFlow, toolUsage, toolStatus, scheduleStatus,
        paymentStatus, revenueTrend, reagentAlert, userDist, topUsers, recentReq
      ] = await Promise.all([
        dashboardService.getKPI(),
        dashboardService.getRequestFlow(30),
        dashboardService.getToolUsage(10),
        dashboardService.getToolStatus(),
        dashboardService.getScheduleStatus(30),
        dashboardService.getPaymentStatus(),
        dashboardService.getRevenueTrend(30),
        dashboardService.getReagentAlert(),
        dashboardService.getUserDistribution(),
        dashboardService.getTopUsers(10, 30),
        dashboardService.getRecentRequests(5)
      ]);

      setKpiData(kpi.data || {});
      setRequestFlowData(requestFlow.data || []);
      setToolUsageData(toolUsage.data || []);
      setToolStatusData(toolStatus.data || []);
      setScheduleStatusData(scheduleStatus.data || []);
      setPaymentStatusData(paymentStatus.data || []);
      setRevenueTrendData(revenueTrend.data || []);
      setReagentAlertData(reagentAlert.data || []);
      setUserDistData(userDist.data || []);
      setTopUsersData(topUsers.data || []);
      setRecentRequestsData(recentReq.data || []);

    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError('Gagal memuat data dashboard');
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Menunggu' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Disetujui' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Batal' },
      scheduled: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Terjadwal' }
    };
    const style = config[status] || config.pending;
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Frame 
        menuName="Dashboard Admin" 
        descriptionMenu="Ringkasan & Analisis Sistem Laboratorium Kimia"
        bodyContent={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-teal-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Memuat Dashboard...</p>
            </div>
          </div>
        } 
      />
    );
  }

  if (error) {
    return (
      <Frame 
        menuName="Dashboard Admin" 
        descriptionMenu="Ringkasan & Analisis Sistem Laboratorium Kimia"
        bodyContent={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
              <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={loadDashboardData}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-semibold"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        } 
      />
    );
  }

  return (
    <Frame 
      menuName="Dashboard Admin" 
      descriptionMenu="Ringkasan & Analisis Sistem Laboratorium Kimia"
      bodyContent={
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">
          
          {/* RINGKASAN UTAMA */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              Ringkasan Bulan Ini
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Bulan Ini</span>
                </div>
                <div className="text-3xl font-bold mb-1">{kpiData.total_requests_month || 0}</div>
                <div className="text-white/90">Total Permintaan</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Persentase</span>
                </div>
                <div className="text-3xl font-bold mb-1">{kpiData.approval_rate || 0}%</div>
                <div className="text-white/90">Tingkat Persetujuan</div>
                <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${kpiData.approval_rate || 0}%` }} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Revenue</span>
                </div>
                <div className="text-2xl font-bold mb-1">Rp {formatNumber(kpiData.total_revenue_month || 0)}</div>
                <div className="text-white/90">Pendapatan Bulan Ini</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Hari Ini</span>
                </div>
                <div className="text-3xl font-bold mb-1">{kpiData.active_schedules_today || 0}</div>
                <div className="text-white/90">Jadwal Aktif</div>
              </div>
            </div>
          </div>

          {/* METRIK OPERASIONAL */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Metrik Operasional</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-cyan-100 p-3 rounded-xl">
                    <Package className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Utilisasi Alat</div>
                    <div className="text-2xl font-bold">{kpiData.tools_utilization || 0}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-cyan-500 h-3 rounded-full"
                    style={{ width: `${kpiData.tools_utilization || 0}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500">Alat yang sedang digunakan</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 p-3 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Menunggu Bayar</div>
                    <div className="text-2xl font-bold">{kpiData.pending_payments_count || 0}</div>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <div className="text-xs text-amber-700 mb-1">Total Nilai</div>
                  <div className="text-lg font-bold text-amber-900">
                    {formatCurrency(kpiData.pending_payments_amount || 0)}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Pengguna</div>
                    <div className="text-2xl font-bold">
                      {userDistData.reduce((sum, item) => sum + parseInt(item.count), 0)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {userDistData.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <div className="text-xs text-gray-500 mb-1">{item.role}</div>
                      <div className="text-sm font-bold">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TREND & STATUS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold">Trend Permintaan</h3>
                  <p className="text-sm text-gray-500">30 hari terakhir</p>
                </div>
                <div className="bg-teal-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={requestFlowData}>
                  <defs>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID')}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="pending_count"
                    stroke="#F59E0B"
                    fill="url(#colorPending)"
                    strokeWidth={2}
                    name="Menunggu"
                  />
                  <Area
                    type="monotone"
                    dataKey="approved_count"
                    stroke="#3B82F6"
                    fill="url(#colorApproved)"
                    strokeWidth={2}
                    name="Disetujui"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold">Status Alat</h3>
                  <p className="text-sm text-gray-500">Ketersediaan saat ini</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={toolStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {toolStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.status[entry.status] || COLORS.primary[index % 4]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {toolStatusData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS.status[item.status] }}
                        />
                        <span className="text-sm font-medium">
                          {item.status === 'available' ? 'Tersedia' : 
                           item.status === 'maintenance' ? 'Maintenance' : 
                           'Tidak Tersedia'}
                        </span>
                      </div>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ALAT POPULER & REVENUE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-6">Alat Paling Populer</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={toolUsageData.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="tool_name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total_qty_used" fill="#14B8A6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-6">Trend Pendapatan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID')}
                  />
                  <Area type="monotone" dataKey="daily_revenue" stroke="#10B981" strokeWidth={3} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ALERT REAGENT */}
          {reagentAlertData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold">Alert Stok Reagent</h3>
                {/* <span className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                  {reagentAlertData.length} Item
                </span> */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reagentAlertData.slice(0, 6).map((item) => (
                  <div
                    key={item.reagent_id}
                    className={`p-4 rounded-xl border-2 ${
                      item.alert_level === 'critical' ? 'border-red-300 bg-white-50' :
                      item.alert_level === 'warning' ? 'border-yellow-300 bg-white-50' :
                      'border-green-300 bg-white-50'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold">{item.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        item.alert_level === 'critical' ? 'bg-red-200 text-red-900' :
                        item.alert_level === 'warning' ? 'bg-yellow-200 text-yellow-900' :
                        'bg-green-200 text-green-900'
                      }`}>
                        {item.alert_level}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Stok: {item.stock_quantity} {item.unit}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.days_until_expired > 0 ? `${item.days_until_expired} hari lagi` : 'Kadaluarsa'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PERMINTAAN TERBARU */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Permintaan Terbaru</h3>
              <a href="/requests" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                Lihat Semua
              </a>
            </div>
            <div className="space-y-3">
              {recentRequestsData.length > 0 ? (
                recentRequestsData.map((request) => (
                  <div key={request.request_id} className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-teal-200">
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{request.request_id}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-gray-600">{request.user_name}</div>
                      <div className="text-xs text-gray-500">{request.tools_requested}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(request.total_amount)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.request_date).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada permintaan terbaru</p>
                </div>
              )}
            </div>
          </div>

        </div>
      } 
    />
  );
};

export default AdminDashboard;