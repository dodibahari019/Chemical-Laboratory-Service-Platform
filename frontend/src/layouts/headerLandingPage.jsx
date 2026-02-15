import React, { useState } from 'react';
import { 
  ShoppingCart, Users, LogOut, User, ChevronDown, Settings, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../pages/context/CartContex.jsx';
import { useAuth } from '../pages/context/AuthContext.jsx';

const HeaderLandingPage = ({ children }) => {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleProfile = () => {
    setShowDropdown(false);
    // Navigate based on user role
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'staff') {
      navigate('/staff/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            {/* <div className="bg-teal-600 p-2.5 rounded-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
            </div> */}
            <img
                src="/images/chemlabsysLogo.png"
                alt="ChemLabSys Logo"
                className="w-[3.25rem] h-[3.25rem] object-contain"
              />
            <div>
              <span className="text-xl font-bold text-gray-900 block">ChemLabSys</span>
              <span className="text-xs text-gray-500">Professional Lab Management</span>
            </div>
          </div>

          {/* Navigation */}
          {children}

          {/* Auth & Cart */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <button 
              onClick={() => navigate('/ajukan-peminjaman')}
              className="relative text-gray-700 hover:text-teal-600 p-2 transition-colors"
              title="Keranjang"
            >
              <ShoppingCart className="w-6 h-6" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Authenticated User Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || user?.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'Customer'}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDropdown(false)}
                    ></div>
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {/* <span className="inline-block mt-2 px-2.5 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full capitalize">
                          {user?.role || 'Customer'}
                        </span> */}
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={handleProfile}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Dashboard</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/customer/requests');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span>Permohonan Saya</span>
                        </button>

                        {/* <button
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/customer/settings');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>Pengaturan</span>
                        </button> */}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Keluar</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Guest User Buttons */
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-gray-700 px-4 py-2 hover:text-gray-900 flex items-center gap-2 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Daftar Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderLandingPage;