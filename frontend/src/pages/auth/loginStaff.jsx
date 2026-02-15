import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader, Shield, Briefcase } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/Api.js';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
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
      console.log('Attempting staff login...');
      
      const response = await authService.staffLogin({
        username: formData.username,
        password: formData.password
      });

      console.log('Login response:', response.data);

      if (response.data.status === 'success') {
        // Save token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        setSuccessMessage('Login berhasil! Mengalihkan ke dashboard...');
        
        // Redirect to admin/staff dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'; // Adjust path as needed
        }, 1500);
      }
    } catch (error) {
      console.error('Staff login error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - Staff Portal Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white max-w-lg">
          {/* Logo Icon */}
          <div className="mb-8">
            {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600/20 rounded-2xl mb-6 backdrop-blur-sm shadow-xl border border-teal-500/30">
              <Shield className="w-10 h-10 text-teal-400" strokeWidth={2} />
            </div> */}
            <div className="mb-2 flex items-center gap-5">
              <h2 className="text-5xl font-bold leading-none">
                ChemLabSys
              </h2>
            </div>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Portal khusus untuk staff, admin, dan manager untuk mengelola sistem laboratorium kimia.
            </p>
          </div>
          
          {/* Features */}
          <div className="space-y-5">
            <div className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-colors border border-white/10">
              <div className="bg-teal-500/20 rounded-lg p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-teal-400" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Manajemen Penuh</h3>
                <p className="text-sm text-gray-300">Kelola semua aspek laboratorium dari satu dashboard terpadu</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-colors border border-white/10">
              <div className="bg-teal-500/20 rounded-lg p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-teal-400" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Approval System</h3>
                <p className="text-sm text-gray-300">Review dan setujui permintaan peminjaman dengan cepat</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-colors border border-white/10">
              <div className="bg-teal-500/20 rounded-lg p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-teal-400" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Laporan & Analytics</h3>
                <p className="text-sm text-gray-300">Akses laporan lengkap dan analisis data laboratorium</p>
              </div>
            </div>
          </div>

          {/* Customer Portal Link */}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white lg:bg-transparent">
        <div className="w-full max-w-md">
          {/* Logo for Mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <img
                src="/images/chemlabsysLogo.png"
                alt="ChemLabSys Logo"
                className="w-[4.5rem] h-[4.5rem] object-contain"
              />
              <span className="text-2xl font-bold text-gray-900">Staff Portal</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Masuk ke Staff Portal</h1>
              <p className="text-gray-600">Gunakan username dan password Anda</p>
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
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-red-800 text-sm leading-relaxed">{errors.general}</span>
              </div>
            )}

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              {/* <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /> */}
              <div className="text-sm text-blue-800">
                <strong>Portal Khusus Staff</strong>
                <p className="mt-1 text-blue-700">Login menggunakan username yang telah diberikan oleh administrator.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Masukkan username"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${
                      errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  {/* <Link
                    to="/staff/forgot-password"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
                  >
                    Lupa password?
                  </Link> */}
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
                    tabIndex={-1}
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

              {/* Remember Me */}
              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={formData.remember}
                  onChange={(e) => setFormData({...formData, remember: e.target.checked})}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                  disabled={loading}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  Ingat saya di perangkat ini
                </label>
              </div> */}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3.5 rounded-xl font-semibold hover:from-slate-900 hover:to-black hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    {/* <Shield className="w-5 h-5" /> */}
                    Masuk
                  </>
                )}
              </button>

              {/* Customer Portal Link */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Bukan staff?{' '}
                  <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                    Masuk sebagai Customer
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Security Notice */}
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;