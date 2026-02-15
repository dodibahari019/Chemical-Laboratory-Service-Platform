import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader, Beaker, UserCog } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/Api.js';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.data.status === 'success') {
        // Save token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        setSuccessMessage('Login berhasil! Mengalihkan...');
        
        // Redirect to dashboard
        setTimeout(() => {
          // navigate('/');
          window.location.href = '/';
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authService.googleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white max-w-lg">
          {/* Logo Icon */}
          <div className="mb-8">
            {/* <img
              src="/images/chemlabsysLogo2.png"
              alt="ChemLabSys Logo"
              className="w-[5rem] h-[5rem] object-contain"
            /> */}
            <h2 className="text-5xl font-bold mb-4 leading-tight">
              Selamat Datang<br />Kembali!
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Masuk ke akun Anda dan lanjutkan pengelolaan laboratorium kimia dengan mudah.
            </p>
          </div>
          
          {/* Features */}
          <div className="space-y-5">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
              <div className="bg-teal-500/30 rounded-lg p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Dashboard Terpadu</h3>
                <p className="text-sm text-white/80">Lihat semua aktivitas dan status peminjaman dalam satu tampilan</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
              <div className="bg-teal-500/30 rounded-lg p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Booking Cepat</h3>
                <p className="text-sm text-white/80">Ajukan peminjaman alat dan reagen hanya dalam beberapa klik</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
              <div className="bg-teal-500/30 rounded-lg p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Riwayat Lengkap</h3>
                <p className="text-sm text-white/80">Akses histori peminjaman dan transaksi Anda kapan saja</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white lg:bg-transparent">
        <div className="w-full max-w-md">
          {/* Logo for Mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <img
                src="/images/chemlabsysLogo.png"
                alt="ChemLabSys Logo"
                className="w-[3.5rem] h-[3.5rem] object-contain"
              />
              <span className="text-2xl font-bold text-gray-900">ChemLabSys</span>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:shadow-2xl">
            <div className="text-center mb-8">
              <div className="hidden lg:inline-flex items-center gap-3 mb-4">
                <img
                src="/images/chemlabsysLogo.png"
                alt="ChemLabSys Logo"
                className="w-[3.5rem] h-[3.5rem] object-contain"
              />
                <span className="text-2xl font-bold text-gray-900">ChemLabSys</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Masuk ke Akun</h1>
              <p className="text-gray-600">Masukkan email dan password Anda</p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800 font-medium">{successMessage}</span>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-800 font-medium">{errors.general}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Masukkan password"
                    className={`w-full pl-11 pr-11 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Atau</span>
              </div>
            </div>

            {/* Staff Login Button */}
            <Link
              to="/staff/login"
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 border border-gray-300"
            >
              <UserCog className="w-5 h-5" />
              Masuk sebagai Staff
            </Link>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Belum punya akun?{' '}
              <Link to="/register" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;