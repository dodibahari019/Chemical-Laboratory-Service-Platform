import React, { useState, useContext, useEffect } from 'react';
import { 
  Calendar, Clock, Search, Eye, CheckCircle, XCircle,
  AlertCircle, ChevronLeft, ChevronRight, List, Grid, User, Package, TestTube, X, Ban
} from 'lucide-react';
import axios from 'axios';
import Frame from '../../layouts/frame.jsx';
import { VariableDash } from '../context/VariableDash.jsx';
import Alert from '../../components/common/alert.jsx';
import ConfirmAlert from '../../components/common/cofirmAlert.jsx';

export default function ScheduleManagement() {
  const { 
    loading, setLoading,
    error, setError,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
  } = useContext(VariableDash);

  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [calendarSchedules, setCalendarSchedules] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    no_show: 0,
    cancelled: 0
  });
  const [alert, setAlert] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  const statusConfig = {
    scheduled: { 
      label: 'Terjadwal', 
      color: 'bg-blue-100 text-blue-700 border-blue-200', 
      calendarColor: 'bg-blue-500 text-white hover:bg-blue-600',
      icon: Clock 
    },
    completed: { 
      label: 'Selesai', 
      color: 'bg-green-100 text-green-700 border-green-200', 
      calendarColor: 'bg-green-500 text-white hover:bg-green-600',
      icon: CheckCircle 
    },
    no_show: { 
      label: 'No Show', 
      color: 'bg-red-100 text-red-700 border-red-200', 
      calendarColor: 'bg-gray-500 text-white hover:bg-gray-600',
      icon: XCircle 
    },
    cancelled: { 
      label: 'Dibatalkan', 
      color: 'bg-gray-100 text-gray-700 border-gray-200', 
      calendarColor: 'bg-red-500 text-white hover:bg-red-600',
      icon: AlertCircle 
    }
  };

  useEffect(() => {
    setFilterStatus("all");
    fetchSchedules();
    fetchStats();
  }, []);

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchCalendarSchedules();
    }
  }, [selectedDate, viewMode]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/schedules');
      console.log('📅 Schedules loaded:', response.data);
      setSchedules(response.data);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data jadwal.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/schedules/stats');
      setStats(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCalendarSchedules = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      console.log('📅 Fetching calendar schedules:', {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      });

      const response = await axios.get('http://localhost:5000/schedules/by-date', {
        params: {
          start_date: formatDate(startDate),
          end_date: formatDate(endDate)
        }
      });

      console.log('📊 Calendar schedules received:', response.data);
      setCalendarSchedules(response.data);
    } catch (err) {
      console.error('❌ Error fetching calendar schedules:', err);
    }
  };

  const fetchScheduleDetail = async (scheduleId) => {
    try {
      const response = await axios.get(`http://localhost:5000/schedules/${scheduleId}`);
      setSelectedSchedule(response.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal mengambil detail jadwal'
      });
    }
  };

  const handleStatusUpdate = (scheduleId, newStatus, scheduleName) => {
    setPendingStatusUpdate({ scheduleId, newStatus, scheduleName });
    setShowStatusConfirm(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;

    try {
      const { scheduleId, newStatus } = pendingStatusUpdate;
      
      const response = await axios.put(
        `http://localhost:5000/schedules/${scheduleId}/status`,
        { status: newStatus }
      );

      if (response.data.status === 'success') {
        setAlert({
          show: true,
          type: 'success',
          message: response.data.message
        });

        // Refresh data
        fetchSchedules();
        fetchStats();
        if (viewMode === 'calendar') {
          fetchCalendarSchedules();
        }
      }
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: err.response?.data?.message || 'Gagal update status jadwal'
      });
    } finally {
      setShowStatusConfirm(false);
      setPendingStatusUpdate(null);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchSearch = schedule.schedule_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       schedule.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       schedule.request_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || schedule.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleViewDetail = (schedule) => {
    fetchScheduleDetail(schedule.schedule_id);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getSchedulesForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const targetDateStr = `${year}-${month}-${day}`;
    
    const filtered = calendarSchedules.filter(schedule => {
      if (!schedule.start_date) return false;
      
      // Handle different date formats
      let scheduleDateStr = '';
      
      if (schedule.start_date.includes('T')) {
        // Format: 2026-01-31T10:00:00.000Z
        scheduleDateStr = schedule.start_date.split('T')[0];
      } else if (schedule.start_date.includes(' ')) {
        // Format: 2026-01-31 10:00:00
        scheduleDateStr = schedule.start_date.split(' ')[0];
      } else {
        // Format: 2026-01-31
        scheduleDateStr = schedule.start_date;
      }
      
      const match = scheduleDateStr === targetDateStr;
      
      if (match) {
        console.log('✅ Match found:', {
          targetDate: targetDateStr,
          scheduleDate: scheduleDateStr,
          scheduleName: schedule.user_name
        });
      }
      
      return match;
    });
    
    return filtered;
  };

  const previousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getStatusConfirmMessage = () => {
    if (!pendingStatusUpdate) return '';
    
    const statusMessages = {
      no_show: {
        title: 'Tandai sebagai No Show?',
        message: `Customer "${pendingStatusUpdate.scheduleName}" tidak hadir sesuai jadwal.`
      },
      cancelled: {
        title: 'Batalkan Jadwal?',
        message: `Jadwal untuk "${pendingStatusUpdate.scheduleName}" akan dibatalkan.`
      },
      completed: {
        title: 'Tandai sebagai Selesai?',
        message: `Jadwal untuk "${pendingStatusUpdate.scheduleName}" akan ditandai sebagai selesai.`
      }
    };

    return statusMessages[pendingStatusUpdate.newStatus] || {
      title: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin mengubah status jadwal ini?'
    };
  };

  const DetailModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh]" style={{
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Detail Jadwal</h3>
            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Informasi Pengguna
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nama</label>
                <p className="font-medium text-gray-900">{selectedSchedule?.user_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium text-gray-900">{selectedSchedule?.user_email}</p>
              </div>
              {selectedSchedule?.user_phone && (
                <div>
                  <label className="text-sm text-gray-600">No. Telepon</label>
                  <p className="font-medium text-gray-900">{selectedSchedule.user_phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-900">Waktu Mulai</label>
                <p className="text-lg font-semibold text-blue-900">
                  {selectedSchedule?.start_date ? new Date(selectedSchedule.start_date).toLocaleString('id-ID') : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-900">Waktu Selesai</label>
                <p className="text-lg font-semibold text-blue-900">
                  {selectedSchedule?.end_date ? new Date(selectedSchedule.end_date).toLocaleString('id-ID') : '-'}
                </p>
              </div>
            </div>
            {selectedSchedule?.duration_hours && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <label className="text-sm font-medium text-blue-900">Durasi</label>
                <p className="text-lg font-semibold text-blue-900">{selectedSchedule.duration_hours} Jam</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedSchedule?.status]?.color}`}>
                {React.createElement(statusConfig[selectedSchedule?.status]?.icon, { className: 'w-4 h-4' })}
                {statusConfig[selectedSchedule?.status]?.label}
              </span>
            </div>
          </div>

          {selectedSchedule?.tools && selectedSchedule.tools.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                Alat Laboratorium
              </h4>
              <div className="space-y-2">
                {selectedSchedule.tools.map((tool, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <span className="text-gray-900">{tool.tool_name}</span>
                    <span className="text-sm font-medium text-gray-600">Qty: {tool.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSchedule?.reagents && selectedSchedule.reagents.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TestTube className="w-5 h-5 text-teal-600" />
                Bahan Kimia / Reagen
              </h4>
              <div className="space-y-2">
                {selectedSchedule.reagents.map((reagent, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <span className="text-gray-900">{reagent.reagent_name}</span>
                    <span className="text-sm font-medium text-gray-600">
                      {reagent.estimated_qty} {reagent.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSchedule?.notes && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Catatan</label>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                {selectedSchedule.notes}
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

  const CalendarView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedDate);
    const days = [];
    
    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] p-2 bg-gray-50"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const daySchedules = getSchedulesForDate(currentDate);
      const isToday = new Date().toDateString() === currentDate.toDateString();
      
      days.push(
        <div
          key={day}
          className={`min-h-[120px] p-2 border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
        >
          <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1.5">
            {daySchedules.length > 0 ? (
              daySchedules.map(schedule => {
                const config = statusConfig[schedule.status] || statusConfig.scheduled;
                return (
                  <button
                    key={schedule.schedule_id}
                    onClick={() => handleViewDetail(schedule)}
                    className={`w-full text-left text-xs p-2 rounded-md ${config.calendarColor} transition-all shadow-sm`}
                  >
                    <div className="font-semibold truncate">
                      {schedule.user_name ? schedule.user_name.split(' ')[0] : 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span className="truncate">
                        {schedule.start_date ? new Date(schedule.start_date).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) : '-'}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-xs text-gray-400 italic">Tidak ada jadwal</div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <button 
            onClick={previousMonth} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          <button 
            onClick={nextMonth} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days}
        </div>

        {/* Legend */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Terjadwal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">Selesai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-xs text-gray-600">No Show</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-600">Dibatalkan</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Frame menuName={"Schedule Management"} descriptionMenu={"Kelola jadwal penggunaan laboratorium"} bodyContent={
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Jadwal</span>
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Terjadwal</span>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.scheduled}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Selesai</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">No Show</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.no_show}</div>
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
                placeholder="Cari ID jadwal, nama, atau request ID..."
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
                <option value="scheduled">Terjadwal</option>
                <option value="completed">Selesai</option>
                <option value="no_show">No Show</option>
                <option value="cancelled">Dibatalkan</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2.5 flex items-center gap-2 ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2.5 flex items-center gap-2 border-l border-gray-300 ${viewMode === 'calendar' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                  <span className="hidden sm:inline">Kalender</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">No</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Pengguna</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Waktu Mulai</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Waktu Selesai</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Durasi</th>
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
                  ) : filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((schedule, index) => {
                      const StatusIcon = statusConfig[schedule.status]?.icon || Clock;
                      const canUpdateStatus = schedule.status === 'scheduled';
                      
                      return (
                        <tr key={schedule.schedule_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{schedule.user_name}</div>
                            <div className="text-sm text-gray-500">{schedule.user_email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {schedule.start_date ? new Date(schedule.start_date).toLocaleString('id-ID') : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {schedule.end_date ? new Date(schedule.end_date).toLocaleString('id-ID') : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {schedule.duration_hours ? `${schedule.duration_hours} jam` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[schedule.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusConfig[schedule.status]?.label || schedule.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetail(schedule)}
                                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {canUpdateStatus && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(schedule.schedule_id, 'no_show', schedule.user_name)}
                                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded"
                                    title="Tandai No Show"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(schedule.schedule_id, 'cancelled', schedule.user_name)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Batalkan Jadwal"
                                  >
                                    <Ban className="w-4 h-4" />
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
        ) : (
          <CalendarView />
        )}

        {/* Modals */}
        {showDetailModal && <DetailModal />}

        <ConfirmAlert 
          show={showStatusConfirm} 
          type="warning" 
          title={pendingStatusUpdate ? getStatusConfirmMessage().title : 'Konfirmasi'} 
          message={pendingStatusUpdate ? getStatusConfirmMessage().message : ''}
          onConfirm={confirmStatusUpdate} 
          onCancel={() => {
            setShowStatusConfirm(false);
            setPendingStatusUpdate(null);
          }} 
          confirmText="Ya, Lanjutkan" 
          cancelText="Batal" 
        />

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