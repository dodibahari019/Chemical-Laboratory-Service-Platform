import React, { useState, useEffect } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthServices.js';
import LogoutModal from '../components/LogoutModal.jsx';

const Navbar = ({ menu, description }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Loading...',
    email: 'Loading...',
    username: ''
  });
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch user info on component mount
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await authService.getUserInfo();
      if (response.data.status === 'success') {
        setUserInfo(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // Jika token invalid, redirect ke login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/staff/login');
      }
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login
      navigate('/staff/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Tetap logout di frontend meskipun API gagal
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/staff/login');
    } finally {
      setLoading(false);
      setShowLogoutModal(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{menu}</h1>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="relative">
            {/* <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{userInfo.name}</div>
                <div className="text-xs text-gray-600">{userInfo.email}</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {getInitials(userInfo.name)}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button> */}
            <button
                    onClick={() => {
                      // setShowDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 border border-red-200 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{userInfo.name}</div>
                    <div className="text-sm text-gray-600 truncate">{userInfo.email}</div>
                    {userInfo.username && (
                      <div className="text-xs text-gray-500 mt-1">@{userInfo.username}</div>
                    )}
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        loading={loading}
      />
    </>
  );
};

export default Navbar;