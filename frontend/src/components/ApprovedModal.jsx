import React from 'react';
import { Check } from 'lucide-react';

const ApproveModal = ({
  adminNotes,
  setAdminNotes,
  onClose,
  onConfirm
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Setujui Permohonan?
          </h3>

          <p className="text-gray-600 text-center mb-4">
            Anda akan menyetujui permohonan
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Admin (Opsional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Tambahkan catatan persetujuan..."
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
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Setujui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;
