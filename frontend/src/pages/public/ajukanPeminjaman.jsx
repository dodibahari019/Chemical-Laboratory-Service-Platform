import React, { useState, useEffect } from 'react';
import { 
  Package, TestTube, Calendar, Clock, User, Mail, Phone, MapPin,
  Plus, Minus, X, AlertCircle, CheckCircle, ArrowRight, CreditCard,
  FileText, ChevronLeft, Target, Search, Sparkles, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContex.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LogoutModal from '../../components/LogoutModal.jsx';
import axios from 'axios';
import HeaderLandingPage from '../../layouts/headerLandingPage.jsx';

const AjukanPeminjaman = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated, token, logout } = useAuth();

  // Logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Available products
  const [availableTools, setAvailableTools] = useState([]);
  const [availableReagents, setAvailableReagents] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activeTab, setActiveTab] = useState('tools');
  const [searchQuery, setSearchQuery] = useState('');

  // Step 1: Identity Data
  const [identityData, setIdentityData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    username: ''
  });

  // Inline validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Step 3: Schedule Data
  const [scheduleData, setScheduleData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    description: ''
  });

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState('gateway');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Auto-fill identitas dari user yang login
  useEffect(() => {
    if (isAuthenticated && user) {
      setIdentityData({
        name: user.name || '',
        email: user.email || '',
        phone: user.no_hp || '',
        address: '',
        username: user.username || ''
      });
    } else {
      // Kalau belum login, kosongkan
      setIdentityData({
        name: '',
        email: '',
        phone: '',
        address: '',
        username: ''
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const fetchAvailableProducts = async () => {
    setLoadingProducts(true);
    try {
      const [toolsRes, reagentsRes] = await Promise.all([
        axios.get('http://localhost:5000/catalog/tools'),
        axios.get('http://localhost:5000/catalog/reagents')
      ]);
      setAvailableTools(toolsRes.data);
      setAvailableReagents(reagentsRes.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  // ─── Validasi Step 1: inline errors ───
  const validateStep1 = () => {
    const errors = {};

    if (!identityData.name.trim()) {
      errors.name = 'Nama lengkap wajib diisi';
    }
    if (!identityData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identityData.email)) {
        errors.email = 'Format email tidak valid';
      }
    }
    if (!identityData.phone.trim()) {
      errors.phone = 'Nomor telepon wajib diisi';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Validasi Step 2 ───
  const validateStep2 = () => {
    if (cartItems.length === 0) {
      showAlert('error', 'Mohon pilih minimal 1 alat atau reagen');
      return false;
    }
    return true;
  };

  // ─── Validasi Step 3: inline errors ───
  const validateStep3 = () => {
    const errors = {};

    if (!scheduleData.date) {
      errors.date = 'Tanggal penggunaan wajib diisi';
    }
    if (!scheduleData.startTime) {
      errors.startTime = 'Waktu mulai wajib diisi';
    }
    if (!scheduleData.endTime) {
      errors.endTime = 'Waktu selesai wajib diisi';
    }
    if (scheduleData.startTime && scheduleData.endTime && scheduleData.date) {
      const startDateTime = new Date(`${scheduleData.date}T${scheduleData.startTime}`);
      const endDateTime = new Date(`${scheduleData.date}T${scheduleData.endTime}`);
      if (endDateTime <= startDateTime) {
        errors.endTime = 'Waktu selesai harus lebih dari waktu mulai';
      }
    }
    if (!scheduleData.purpose) {
      errors.purpose = 'Tujuan penggunaan wajib dipilih';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateDuration = () => {
    if (!scheduleData.date || !scheduleData.startTime || !scheduleData.endTime) return 0;
    const startDateTime = new Date(`${scheduleData.date}T${scheduleData.startTime}`);
    const endDateTime = new Date(`${scheduleData.date}T${scheduleData.endTime}`);
    const hours = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
    return hours;
  };

  const calculateTotal = () => {
    const duration = calculateDuration() || 1;
    let total = 0;
    cartItems.forEach(item => {
      if (item.type === 'tool') {
        total += parseFloat(item.hourly_rate) * item.quantity * duration;
      } else {
        total += parseFloat(item.price_per_unit) * item.quantity;
      }
    });
    return total;
  };

  const handleNextStep = () => {
    // Clear errors sebelum validasi ulang
    setFieldErrors({});

    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;

    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setFieldErrors({});
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Cek login sebelum payment gateway ───
  const handlePayment = async () => {
    if (!agreeTerms) {
      showAlert('error', 'Mohon setujui syarat dan ketentuan terlebih dahulu');
      return;
    }

    // Cek: kalau belum login dan pilih payment gateway → redirect login
    if (paymentMethod === 'gateway' && !isAuthenticated) {
      showAlert('warning', 'Silakan login dulu sebelum melakukan pembayaran');
      // setTimeout(() => navigate('/login'), 2500);
      setTimeout(() => {
          // navigate('/');
          window.location.href = '/login';
        }, 1500);
      return;
    }

    setLoading(true);

    try {
      // ─── user_id dari AuthContext, bukan hardcoding ───
      const userId = isAuthenticated && user ? user.user_id : null;

      if (!userId) {
        showAlert('error', 'User ID tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      const tools = cartItems
        .filter(item => item.type === 'tool')
        .map(item => ({
          tool_id: item.tool_id,
          qty: item.quantity
        }));

      const reagents = cartItems
        .filter(item => item.type === 'reagent')
        .map(item => ({
          reagent_id: item.reagent_id,
          estimated_qty: item.quantity
        }));

      const startDateTime = `${scheduleData.date} ${scheduleData.startTime}:00`;
      const endDateTime = `${scheduleData.date} ${scheduleData.endTime}:00`;

      const notes = `Tujuan: ${scheduleData.purpose}\nDeskripsi: ${scheduleData.description || '-'}\nUsername: ${identityData.username || '-'}`;

      const response = await axios.post('http://localhost:5000/requests', {
        user_id: userId,
        notes: notes,
        start_date: startDateTime,
        end_date: endDateTime,
        tools: tools.length > 0 ? tools : null,
        reagents: reagents.length > 0 ? reagents : null,
        customer_details: {
          first_name: identityData.name,
          email: identityData.email,
          phone: identityData.phone,
          billing_address: {
            first_name: identityData.name,
            email: identityData.email,
            phone: identityData.phone,
            address: identityData.address || '-',
            city: 'Jakarta',
            postal_code: '12345',
            country_code: 'IDN'
          }
        }
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        const { request_id, payment_id, snap_token } = response.data;

        if (paymentMethod === 'gateway' && window.snap) {
          window.snap.pay(snap_token, {
            onSuccess: async function(result) {
              console.log('Payment success:', result);
              try {
                await axios.put('http://localhost:5000/requests/payment/status', {
                  payment_id: payment_id,
                  status: 'paid',
                  transaction_ref: result.transaction_id
                });
                clearCart();
                showAlert('success', `Pembayaran berhasil! ID: ${request_id}`);
                setTimeout(() => navigate('/'), 2000);
              } catch (err) {
                console.error('Error updating payment status:', err);
                clearCart();
                navigate('/');
              }
            },
            onPending: function(result) {
              console.log('Payment pending:', result);
              clearCart();
              navigate('/');
            },
            onError: function(result) {
              console.error('Payment error:', result);
              clearCart();
              navigate('/');
            },
            onClose: function() {
              console.log('Payment popup closed');
              clearCart();
              navigate('/');
            }
          });
        } else {
          // Manual payment
          clearCart();
          showAlert('success', `Permohonan berhasil! ID: ${request_id}`);
          setTimeout(() => navigate('/'), 2000);
        }
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      showAlert('error', err.response?.data?.error || 'Gagal mengajukan permohonan');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item, type) => {
    addToCart(item, type);
  };

  // ─── Logout handler ───
  const handleLogout = () => {
    setLogoutLoading(true);
    setTimeout(() => {
      logout();
      setLogoutLoading(false);
      setShowLogoutModal(false);
      navigate('/');
    }, 800);
  };

  const hasHighHazardReagent = cartItems.some(
    item => item.type === 'reagent' && item.hazard === 'high'
  );

  const filteredTools = availableTools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReagents = availableReagents.filter(reagent =>
    reagent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Inline Error Component ───
  const InlineError = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1.5 mt-2 text-rose-600 text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        loading={logoutLoading}
      />

      {/* Alert */}
      {alert.show && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm animate-slideIn ${
          alert.type === 'success' ? 'bg-emerald-500/95 text-white' :
          alert.type === 'error' ? 'bg-rose-500/95 text-white' :
          alert.type === 'warning' ? 'bg-amber-500/95 text-white' :
          'bg-blue-500/95 text-white'
        }`}>
          {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <HeaderLandingPage/>

      {/* Progress Steps */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Identitas', icon: User },
              { num: 2, label: 'Pilih Item', icon: Package },
              { num: 3, label: 'Jadwal', icon: Calendar },
              { num: 4, label: 'Pembayaran', icon: CreditCard }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 ${
                    step >= s.num
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/50 scale-110'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-7 h-7" /> : <s.icon className="w-7 h-7" />}
                  </div>
                  <span className={`text-xs mt-2 font-semibold text-center transition-colors ${
                    step >= s.num ? 'text-teal-600' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1.5 mx-3 rounded-full transition-all duration-500 ${
                    step > s.num ? 'bg-gradient-to-r from-teal-500 to-cyan-600' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* ─── Step 1: Identity ─── */}
            {step === 1 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-4 rounded-2xl">
                      <User className="w-8 h-8 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Data Identitas
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {isAuthenticated ? 'Data dari akun Anda' : 'Lengkapi informasi pribadi Anda'}
                      </p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 border border-rose-300 rounded-xl hover:bg-rose-100 hover:border-rose-300 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  )}
                </div>

                {/* Info badge kalau sudah login */}
                {isAuthenticated && user && (
                  <div className="mb-6 p-4 border border-teal-300 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-teal-800">{user.name}</p>
                      <p className="text-xs text-teal-600">{user.email} · @{user.username}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={identityData.name}
                      onChange={(e) => {
                        setIdentityData({...identityData, name: e.target.value});
                        if (e.target.value.trim()) setFieldErrors(prev => ({...prev, name: undefined}));
                      }}
                      readOnly={isAuthenticated}
                      className={`w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                        fieldErrors.name
                          ? 'border-rose-400 bg-rose-50/50'
                          : isAuthenticated
                            ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                            : 'border-slate-200 bg-white/50'
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                    <InlineError error={fieldErrors.name} />
                  </div>

                  {/* Email & Phone row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.email ? 'text-rose-400' : 'text-slate-400'}`} />
                        <input
                          type="email"
                          value={identityData.email}
                          onChange={(e) => {
                            setIdentityData({...identityData, email: e.target.value});
                            if (e.target.value.trim()) setFieldErrors(prev => ({...prev, email: undefined}));
                          }}
                          readOnly={isAuthenticated}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                            fieldErrors.email
                              ? 'border-rose-400 bg-rose-50/50'
                              : isAuthenticated
                                ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                                : 'border-slate-200 bg-white/50'
                          }`}
                          placeholder="email@example.com"
                        />
                      </div>
                      <InlineError error={fieldErrors.email} />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        No. Telepon <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.phone ? 'text-rose-400' : 'text-slate-400'}`} />
                        <input
                          type="tel"
                          value={identityData.phone}
                          onChange={(e) => {
                            setIdentityData({...identityData, phone: e.target.value});
                            if (e.target.value.trim()) setFieldErrors(prev => ({...prev, phone: undefined}));
                          }}
                          readOnly={isAuthenticated}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                            fieldErrors.phone
                              ? 'border-rose-400 bg-rose-50/50'
                              : isAuthenticated
                                ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                                : 'border-slate-200 bg-white/50'
                          }`}
                          placeholder="08123456789"
                        />
                      </div>
                      <InlineError error={fieldErrors.phone} />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={identityData.username}
                        onChange={(e) => setIdentityData({...identityData, username: e.target.value})}
                        readOnly={isAuthenticated}
                        className={`w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                          isAuthenticated ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white/50'
                        }`}
                        placeholder="Username"
                      />
                    </div>
                  </div>

                  {/* Alamat */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Alamat
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <textarea
                        value={identityData.address}
                        onChange={(e) => setIdentityData({...identityData, address: e.target.value})}
                        rows={3}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 resize-none transition-all bg-white/50"
                        placeholder="Alamat lengkap"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 2: Select Items ─── */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Search & Tabs */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-slate-200/50">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Cari ${activeTab === 'tools' ? 'alat' : 'reagen'}...`}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all bg-white/50"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab('tools')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'tools'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Package className="w-5 h-5" />
                      Alat Lab ({availableTools.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('reagents')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'reagents'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <TestTube className="w-5 h-5" />
                      Reagen ({availableReagents.length})
                    </button>
                  </div>
                </div>

                {/* Products Grid */}
                {loadingProducts ? (
                  <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500/30 border-t-teal-500"></div>
                    <p className="mt-4 text-slate-600 font-medium">Memuat produk...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Tools */}
                    {activeTab === 'tools' && filteredTools.map((tool) => {
                      const inCart = cartItems.find(item => item.tool_id === tool.tool_id && item.type === 'tool');
                      return (
                        <div
                          key={tool.tool_id}
                          className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 ${
                            inCart
                              ? 'border-2 border-teal-400 shadow-xl shadow-teal-500/20 scale-[1.02]'
                              : 'border-2 border-slate-200/50 hover:shadow-xl hover:border-teal-300 hover:scale-[1.02]'
                          }`}
                        >
                          <div className="mb-4 h-32 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden relative">
                            {inCart && (
                              <div className="absolute top-2 right-2 bg-teal-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Terpilih
                              </div>
                            )}
                            {tool.image ? (
                              <img src={`http://localhost:5000${tool.image}`} alt={tool.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <Package className="w-16 h-16 text-slate-300" />
                            )}
                          </div>

                          <div className="flex items-start justify-between mb-3">
                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                              tool.status === 'available' && tool.available_stock > 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {tool.status === 'available' && tool.available_stock > 0 ? 'Tersedia' : 'Habis'}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-2 min-h-[3rem]">{tool.name}</h3>
                          <div className="text-sm text-slate-600 mb-3">
                            Tersedia: <strong className="text-slate-800">{tool.available_stock}/{tool.total_stock}</strong> unit
                          </div>
                          <div className="text-teal-600 font-bold text-xl mb-4">
                            Rp {parseFloat(tool.hourly_rate).toLocaleString('id-ID')}/jam
                          </div>

                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(tool.tool_id, 'tool', -1)} className="w-10 h-10 border-2 border-teal-500 text-teal-600 rounded-xl flex items-center justify-center hover:bg-teal-50 transition-colors">
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="flex-1 text-center font-bold text-lg text-teal-600">{inCart.quantity}</div>
                              <button onClick={() => updateQuantity(tool.tool_id, 'tool', 1)} disabled={inCart.quantity >= tool.available_stock} className="w-10 h-10 border-2 border-teal-500 text-teal-600 rounded-xl flex items-center justify-center hover:bg-teal-50 transition-colors disabled:opacity-50">
                                <Plus className="w-4 h-4" />
                              </button>
                              <button onClick={() => removeFromCart(tool.tool_id, 'tool')} className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(tool, 'tool')}
                              disabled={tool.available_stock === 0}
                              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-teal-500/30"
                            >
                              <Plus className="w-5 h-5" />
                              Tambah
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Reagents */}
                    {activeTab === 'reagents' && filteredReagents.map((reagent) => {
                      const inCart = cartItems.find(item => item.reagent_id === reagent.reagent_id && item.type === 'reagent');
                      return (
                        <div
                          key={reagent.reagent_id}
                          className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 ${
                            inCart
                              ? 'border-2 border-teal-400 shadow-xl shadow-teal-500/20 scale-[1.02]'
                              : 'border-2 border-slate-200/50 hover:shadow-xl hover:border-teal-300 hover:scale-[1.02]'
                          }`}
                        >
                          <div className="mb-4 h-32 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden relative">
                            {inCart && (
                              <div className="absolute top-2 right-2 bg-teal-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Terpilih
                              </div>
                            )}
                            {reagent.foto ? (
                              <img src={`http://localhost:5000${reagent.foto}`} alt={reagent.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <TestTube className="w-16 h-16 text-slate-300" />
                            )}
                          </div>

                          <div className="flex items-start justify-between mb-3">
                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                              reagent.status === 'useable' && reagent.stock_quantity > 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {reagent.status === 'useable' && reagent.stock_quantity > 0 ? 'Tersedia' : 'Habis'}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-2 min-h-[3rem]">{reagent.name}</h3>
                          <div className="text-sm text-slate-600 mb-3">
                            Stok: <strong className="text-slate-800">{parseFloat(reagent.stock_quantity)} {reagent.unit}</strong>
                          </div>
                          <div className="text-teal-600 font-bold text-xl mb-4">
                            Rp {parseFloat(reagent.price_per_unit).toLocaleString('id-ID')}/{reagent.unit}
                          </div>

                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(reagent.reagent_id, 'reagent', -1)} className="w-10 h-10 border-2 border-teal-500 text-teal-600 rounded-xl flex items-center justify-center hover:bg-teal-50 transition-colors">
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="flex-1 text-center font-bold text-lg text-teal-600">{inCart.quantity}</div>
                              <button onClick={() => updateQuantity(reagent.reagent_id, 'reagent', 1)} disabled={inCart.quantity >= reagent.stock_quantity} className="w-10 h-10 border-2 border-teal-500 text-teal-600 rounded-xl flex items-center justify-center hover:bg-teal-50 transition-colors disabled:opacity-50">
                                <Plus className="w-4 h-4" />
                              </button>
                              <button onClick={() => removeFromCart(reagent.reagent_id, 'reagent')} className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(reagent, 'reagent')}
                              disabled={reagent.stock_quantity === 0}
                              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-teal-500/30"
                            >
                              <Plus className="w-5 h-5" />
                              Tambah
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Cart Summary */}
                {cartItems.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border-2 border-teal-200 shadow-xl">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      {/* <Sparkles className="w-5 h-5 text-teal-600" /> */}
                      Item Terpilih ({cartItems.length})
                    </h4>
                    <div className="space-y-2">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="flex items-center border border-teal-200 justify-between text-sm bg-white rounded-xl p-3 shadow-sm">
                          <span className="font-semibold text-slate-700">{item.name}</span>
                          <span className="text-teal-600 font-bold">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Step 3: Schedule ─── */}
            {step === 3 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Jadwal Penggunaan
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Tentukan waktu penggunaan</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Tanggal */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tanggal <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.date ? 'text-rose-400' : 'text-slate-400'}`} />
                      <input
                        type="date"
                        value={scheduleData.date}
                        onChange={(e) => {
                          setScheduleData({...scheduleData, date: e.target.value});
                          if (e.target.value) setFieldErrors(prev => ({...prev, date: undefined}));
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                          fieldErrors.date ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-white/50'
                        }`}
                      />
                    </div>
                    <InlineError error={fieldErrors.date} />
                  </div>

                  {/* Waktu Mulai & Selesai */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Waktu Mulai <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.startTime ? 'text-rose-400' : 'text-slate-400'}`} />
                        <input
                          type="time"
                          value={scheduleData.startTime}
                          onChange={(e) => {
                            setScheduleData({...scheduleData, startTime: e.target.value});
                            if (e.target.value) setFieldErrors(prev => ({...prev, startTime: undefined}));
                          }}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                            fieldErrors.startTime ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-white/50'
                          }`}
                        />
                      </div>
                      <InlineError error={fieldErrors.startTime} />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Waktu Selesai <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.endTime ? 'text-rose-400' : 'text-slate-400'}`} />
                        <input
                          type="time"
                          value={scheduleData.endTime}
                          onChange={(e) => {
                            setScheduleData({...scheduleData, endTime: e.target.value});
                            if (e.target.value) setFieldErrors(prev => ({...prev, endTime: undefined}));
                          }}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                            fieldErrors.endTime ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-white/50'
                          }`}
                        />
                      </div>
                      <InlineError error={fieldErrors.endTime} />
                    </div>
                  </div>

                  {/* Durasi display */}
                  {scheduleData.date && scheduleData.startTime && scheduleData.endTime && !fieldErrors.endTime && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
                      <div className="flex items-center gap-3 text-blue-900">
                        <Clock className="w-6 h-6" />
                        <div>
                          <p className="font-semibold">Durasi Penggunaan</p>
                          <p className="text-3xl font-bold">{calculateDuration()} Jam</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tujuan */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tujuan <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Target className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.purpose ? 'text-rose-400' : 'text-slate-400'}`} />
                      <select
                        value={scheduleData.purpose}
                        onChange={(e) => {
                          setScheduleData({...scheduleData, purpose: e.target.value});
                          if (e.target.value) setFieldErrors(prev => ({...prev, purpose: undefined}));
                        }}
                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all appearance-none ${
                          fieldErrors.purpose ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-white/50'
                        }`}
                      >
                        <option value="">Pilih tujuan</option>
                        <option value="Praktikum">Praktikum</option>
                        <option value="Penelitian">Penelitian</option>
                        <option value="Tugas Akhir">Tugas Akhir</option>
                        <option value="Testing">Testing</option>
                        <option value="Quality Control">QC</option>
                        <option value="R&D">R&D</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <InlineError error={fieldErrors.purpose} />
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Deskripsi
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <textarea
                        value={scheduleData.description}
                        onChange={(e) => setScheduleData({...scheduleData, description: e.target.value})}
                        rows={4}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 resize-none transition-all bg-white/50"
                        placeholder="Detail kegiatan..."
                      />
                    </div>
                  </div>

                  {/* B3 Warning */}
                  {hasHighHazardReagent && (
                    <div className="bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200 rounded-2xl p-5">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                        <div className="text-sm text-rose-900">
                          <p className="font-bold mb-2">⚠️ Bahan B3 Terdeteksi</p>
                          <p>Pastikan menggunakan APD lengkap dan mengikuti SOP keselamatan.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── Step 4: Review & Payment ─── */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/50">
                  <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Ringkasan Permohonan
                  </h3>

                  <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Nama</p>
                        <p className="font-semibold text-slate-800">{identityData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Email</p>
                        <p className="font-semibold text-slate-800">{identityData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Tanggal</p>
                        <p className="font-semibold text-slate-800">{new Date(scheduleData.date).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Waktu</p>
                        <p className="font-semibold text-slate-800">{scheduleData.startTime} - {scheduleData.endTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Durasi</p>
                        <p className="font-semibold text-slate-800">{calculateDuration()} jam</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Tujuan</p>
                        <p className="font-semibold text-slate-800">{scheduleData.purpose}</p>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 mb-4">Item yang Dipesan</h4>
                  <div className="space-y-3">
                    {cartItems.map((item, index) => {
                      const price = item.type === 'tool' ? item.hourly_rate : item.price_per_unit;
                      const duration = item.type === 'tool' ? calculateDuration() : 1;
                      const subtotal = parseFloat(price) * item.quantity * duration;
                      return (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'tool' ? 'bg-teal-100' : 'bg-orange-100'}`}>
                              {item.type === 'tool' ? <Package className="w-5 h-5 text-teal-600" /> : <TestTube className="w-5 h-5 text-orange-600" />}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{item.name}</p>
                              <p className="text-sm text-slate-600">
                                {item.quantity}x Rp {parseFloat(price).toLocaleString('id-ID')}
                                {item.type === 'tool' && ` × ${duration} jam`}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-teal-600">Rp {subtotal.toLocaleString('id-ID')}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-4 rounded-2xl">
                      <CreditCard className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Metode Pembayaran
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Pilih cara bayar</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === 'gateway'
                        ? 'border-teal-400 bg-teal-50/50 shadow-lg'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <input type="radio" name="payment" value="gateway" checked={paymentMethod === 'gateway'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-teal-600" />
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 mb-1">Payment Gateway</div>
                        <div className="text-sm text-slate-600">Bank Transfer, E-Wallet, Kartu Kredit</div>
                      </div>
                      {/* <img src="https://midtrans.com/assets/images/midtrans-logo.svg" alt="Midtrans" className="h-7" /> */}
                    </label>

                    {/* Warning: payment gateway butuh login */}
                    {paymentMethod === 'gateway' && !isAuthenticated && (
                      <div className="bg-white-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-amber-800 font-semibold">Login diperlukan</p>
                          <p className="text-xs text-amber-700 mt-0.5">Anda harus login untuk menggunakan payment gateway. Klik "Bayar Sekarang" untuk diarahkan ke halaman login.</p>
                        </div>
                      </div>
                    )}

                    <label className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === 'manual'
                        ? 'border-teal-400 bg-teal-50/50 shadow-lg'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <input type="radio" name="payment" value="manual" checked={paymentMethod === 'manual'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-teal-600" />
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 mb-1">Transfer Manual</div>
                        <div className="text-sm text-slate-600">Konfirmasi setelah transfer</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-200/50">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-5 h-5 text-teal-600 rounded mt-0.5" />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      Saya setuju dengan <a href="#" className="text-teal-600 hover:text-teal-700 font-bold underline">syarat dan ketentuan</a> yang berlaku.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ─── Sidebar ─── */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-slate-200/50 sticky top-28">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                <FileText className="w-6 h-6 text-teal-600" />
                Ringkasan Biaya
              </h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Jumlah Item</span>
                  <span className="font-bold text-slate-800">{cartItems.length} item</span>
                </div>
                {step >= 3 && scheduleData.date && scheduleData.startTime && scheduleData.endTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Durasi</span>
                    <span className="font-bold text-slate-800">{calculateDuration()} jam</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-bold text-slate-800">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200">
                <span className="text-lg font-bold text-slate-800">Total</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Rp {calculateTotal().toLocaleString('id-ID')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {step < 4 ? (
                  <button
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-2xl font-bold hover:from-teal-600 hover:to-cyan-700 flex items-center justify-center gap-2 transition-all shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:scale-[1.02]"
                  >
                    Lanjutkan
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handlePayment}
                    disabled={loading || !agreeTerms}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-2xl font-bold hover:from-teal-600 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:scale-[1.02] disabled:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Bayar Sekarang
                      </>
                    )}
                  </button>
                )}

                {step > 1 && (
                  <button
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="w-full bg-white border-2 border-slate-300 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Kembali
                  </button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  Data yang Anda berikan akan digunakan untuk administrasi laboratorium.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjukanPeminjaman;