// components/common/Alert.jsx
import React from 'react';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export default function Alert({ show, type = 'success', title = '', message, onClose }) {
  if (!show) return null;

  // Konfigurasi ikon berdasarkan type
  const typeConfig = {
    success: { 
      iconBg: 'bg-green-100',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      icon: <CheckCircle className="w-8 h-8 text-green-600" /> 
    },
    error: { 
      iconBg: 'bg-red-100',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      icon: <AlertCircle className="w-8 h-8 text-red-600" /> 
    },
    info: { 
      iconBg: 'bg-blue-100',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      icon: <Info className="w-8 h-8 text-blue-600" /> 
    },
    warning: { 
      iconBg: 'bg-yellow-100',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
      icon: <AlertTriangle className="w-8 h-8 text-yellow-600" /> 
    },
  };

  const { iconBg, buttonBg, icon } = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose}></div>

      {/* Kotak alert - putih dengan shadow */}
      <div className="relative z-10 w-100 bg-white rounded-3xl shadow-2xl px-8 pt-16 pb-8 flex flex-col items-center">
        
        {/* Ikon di atas dengan background lingkaran */}
        <div className={`absolute -top-10 ${iconBg} rounded-full w-20 h-20 flex items-center justify-center shadow-lg border-4 border-white`}>
          {icon}
        </div>

        {/* Judul/Pesan */}
        {/* <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {title || 'Pesan'}
        </h3> */}

        {/* Pesan detail (opsional) */}
        {message && (
          <p className="text-center text-gray-600 mb-6 px-4">
            {message}
          </p>
        )}

        {/* Tombol OK - abu-abu gelap seperti di gambar */}
        <button
          onClick={onClose}
          className={`w-full px-6 py-3 ${buttonBg} text-white rounded-xl font-medium transition-colors`}
        >
          OK
        </button>

        {/* Tombol close kecil di pojok (opsional) */}
        {/* <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1 rounded-full ${iconBg} hover:bg-gray-100 transition-colors`}
        >
          <X className="w-4 h-4 text-gray-600" />
        </button> */}
      </div>
    </div>
  );
}