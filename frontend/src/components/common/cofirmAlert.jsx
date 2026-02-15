// components/common/ConfirmAlert.jsx
import React from 'react';
import { CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ConfirmAlert({ 
  show, 
  type = 'warning', 
  title = '', 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Ya',
  cancelText = 'Tidak'
}) {
  if (!show) return null;

  // Konfigurasi ikon berdasarkan type
  const typeConfig = {
    success: { 
      iconBg: 'bg-green-100',
      confirmBg: 'bg-green-600 hover:bg-green-700',
      icon: <CheckCircle className="w-8 h-8 text-green-600" /> 
    },
    error: { 
      iconBg: 'bg-red-100',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      icon: <AlertCircle className="w-8 h-8 text-red-600" /> 
    },
    info: { 
      iconBg: 'bg-blue-100',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      icon: <Info className="w-8 h-8 text-blue-600" /> 
    },
    warning: { 
      iconBg: 'bg-yellow-100',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      icon: <AlertTriangle className="w-8 h-8 text-yellow-600" /> 
    },
  };

  const { iconBg, confirmBg, icon } = typeConfig[type] || typeConfig.warning;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onCancel}></div>

      {/* Kotak alert - putih dengan shadow */}
      <div className="relative z-10 w-96 bg-white rounded-3xl shadow-2xl px-8 pt-16 pb-8 flex flex-col items-center">
        
        {/* Ikon di atas dengan background lingkaran */}
        <div className={`absolute -top-10 ${iconBg} rounded-full w-20 h-20 flex items-center justify-center shadow-lg border-4 border-white`}>
          {icon}
        </div>

        {/* Judul/Pesan */}
        {title && (
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
            {title}
          </h3>
        )}

        {/* Pesan detail */}
        {message && (
          <p className="text-center text-gray-600 mb-6 px-4">
            {message}
          </p>
        )}

        {/* Container 2 Tombol */}
        <div className="flex gap-4 w-full">
          {/* Tombol Batal/Tidak */}

          {/* Tombol Konfirmasi/Ya */}
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 ${confirmBg} text-white rounded-xl font-medium transition-colors`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}