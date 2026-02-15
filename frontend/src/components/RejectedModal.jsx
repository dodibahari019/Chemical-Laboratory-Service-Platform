import React from 'react';
import { X } from 'lucide-react';

const RejectModal = ({
  adminNotes,
  setAdminNotes,
  selectedRequest,
  onClose,
  onConfirm
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Tolak Permohonan?
          </h3>

          <p className="text-gray-600 text-center mb-4">
            Anda akan menolak permohonan{' '}
            <span className="font-semibold">
              {selectedRequest?.request_id}
            </span>
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="Jelaskan alasan penolakan..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={!adminNotes.trim()}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium
                         hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tolak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
