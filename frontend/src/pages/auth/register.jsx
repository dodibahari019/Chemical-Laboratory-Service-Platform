import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Phone, AlertCircle, CheckCircle, Loader, Beaker } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/Api.js';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    no_hp: '',
    password: '',
    confirmPassword: '',
    agree: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username hanya boleh mengandung huruf, angka, dan underscore';
    }

    if (!formData.no_hp.trim()) {
      newErrors.no_hp = 'Nomor telepon wajib diisi';
    } else if (!/^(08|62)[0-9]{8,13}$/.test(formData.no_hp)) {
      newErrors.no_hp = 'Format nomor telepon tidak valid (contoh: 081234567890)';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (!formData.agree) {
      newErrors.agree = 'Anda harus menyetujui syarat dan ketentuan';
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
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        no_hp: formData.no_hp,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.status === 'success') {
        // Save token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        setSuccessMessage('Registrasi berhasil! Mengalihkan...');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.data?.errors) {
        // Validation errors from backend
        console.log('📋 Validation errors:', error.response.data.errors);
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.path] = err.msg;
        });
        setErrors(backendErrors);
      } else if (error.response?.data?.message) {
        console.log('💬 Error message:', error.response.data.message);
        setErrors({ general: error.response.data.message });
      } else if (error.response?.data?.error) {
        console.log('⚠️ Error:', error.response.data.error);
        setErrors({ general: error.response.data.error });
      } else {
        console.log('❓ Unknown error');
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
            {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm shadow-xl">
              <Beaker className="w-10 h-10" strokeWidth={2} />
            </div> */}
            <h2 className="text-5xl font-bold mb-4 leading-tight">
              Bergabung dengan<br />ChemLabSys
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Sistem manajemen laboratorium kimia yang modern dan terintegrasi untuk kebutuhan riset Anda.
            </p>
          </div>
          
          {/* Benefits */}
          <div className="space-y-5">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
              <div className="bg-teal-500/30 rounded-lg p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Akses 24/7</h3>
                <p className="text-sm text-white/80">Kelola peminjaman kapan saja, di mana saja dengan sistem cloud</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
              <div className="bg-teal-500/30 rounded-lg p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Sistem Terintegrasi</h3>
                <p className="text-sm text-white/80">Semua data alat, reagen, dan jadwal terpusat dalam satu platform</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
              <div className="bg-teal-500/30 rounded-lg p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Notifikasi Real-time</h3>
                <p className="text-sm text-white/80">Dapatkan update status peminjaman dan pengingat jadwal otomatis</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
              <p className="text-gray-600">Lengkapi data di bawah untuk mendaftar</p>
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

            {/* Google Login Button */}
            {/* <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mb-6 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Daftar dengan Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Atau daftar dengan email</span>
              </div>
            </div> */}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Masukkan nama lengkap"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

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
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Username & Phone */}
              <div className="grid grid-cols-2 gap-4">
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
                      placeholder="username"
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${
                        errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.username && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.username}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    No. Telepon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.no_hp}
                      onChange={(e) => setFormData({...formData, no_hp: e.target.value})}
                      placeholder="08xxx"
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${
                        errors.no_hp ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.no_hp && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.no_hp}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Minimal 8 karakter"
                    className={`w-full pl-11 pr-11 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={loading}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Ulangi password"
                    className={`w-full pl-11 pr-11 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              {/* Agreement */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agree}
                    onChange={(e) => setFormData({...formData, agree: e.target.checked})}
                    className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5 cursor-pointer"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Saya setuju dengan{' '}
                    <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                      Syarat dan Ketentuan
                    </a>{' '}
                    serta{' '}
                    <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                      Kebijakan Privasi
                    </a>
                  </span>
                </label>
                {errors.agree && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.agree}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  'Daftar Sekarang'
                )}
              </button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;