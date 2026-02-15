import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Calendar, 
  Clock, 
  FileText, 
  CreditCard,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CustomerOrder = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Mikroskop Digital',
      type: 'tool',
      price: 25000,
      quantity: 1,
      duration: 2,
      startDate: '2026-02-01',
      image: 'https://via.placeholder.com/100/0d9488/ffffff?text=Mikroskop'
    },
    {
      id: 2,
      name: 'Asam Sulfat (H₂SO₄)',
      type: 'reagent',
      price: 5000,
      quantity: 3,
      image: 'https://via.placeholder.com/100/ea580c/ffffff?text=H2SO4'
    }
  ]);

  const [formData, setFormData] = useState({
    purpose: '',
    notes: '',
    paymentMethod: 'transfer'
  });

  const [step, setStep] = useState(1); // 1: Cart, 2: Form, 3: Payment, 4: Success

  const updateQuantity = (id, action) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = action === 'increment' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.type === 'tool') {
        return total + (item.price * item.quantity * item.duration);
      }
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleSubmit = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-teal-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">ChemLabSys</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[
              { num: 1, label: 'Keranjang' },
              { num: 2, label: 'Detail Pemesanan' },
              { num: 3, label: 'Pembayaran' },
              { num: 4, label: 'Selesai' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                  </div>
                  <span className={`text-sm mt-2 ${step >= s.num ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`w-24 h-1 mx-4 ${step > s.num ? 'bg-teal-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-teal-600" />
                  Keranjang Pemesanan
                </h2>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Keranjang kosong</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900">{item.name}</h3>
                              <span className="text-sm text-gray-600">
                                {item.type === 'tool' ? 'Alat Laboratorium' : 'Bahan Kimia'}
                              </span>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          {item.type === 'tool' && (
                            <div className="text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Mulai: {item.startDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Durasi: {item.duration} hari</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, 'decrement')}
                                className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-medium w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 'increment')}
                                className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Rp {item.price.toLocaleString()}/{item.type === 'tool' ? 'hari' : '100ml'}</div>
                              <div className="font-bold text-teal-600">
                                Rp {(item.type === 'tool' 
                                  ? item.price * item.quantity * item.duration 
                                  : item.price * item.quantity
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-teal-600" />
                  Detail Pemesanan
                </h2>

                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tujuan Penggunaan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Pilih tujuan</option>
                      <option value="praktikum">Praktikum</option>
                      <option value="penelitian">Penelitian</option>
                      <option value="tugas_akhir">Tugas Akhir</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan Tambahan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={4}
                      placeholder="Tambahkan catatan jika diperlukan..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Perhatian:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Pastikan data yang Anda isi sudah benar</li>
                          <li>Pemesanan akan diverifikasi oleh admin laboratorium</li>
                          <li>Anda akan menerima notifikasi melalui email</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-teal-600" />
                  Metode Pembayaran
                </h2>

                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-teal-500 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">Transfer Bank</div>
                      <div className="text-sm text-gray-600">
                        BCA, BNI, Mandiri, BRI
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-teal-500 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input
                      type="radio"
                      name="payment"
                      value="ewallet"
                      checked={formData.paymentMethod === 'ewallet'}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">E-Wallet</div>
                      <div className="text-sm text-gray-600">
                        GoPay, OVO, Dana, ShopeePay
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-teal-500 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">Tunai</div>
                      <div className="text-sm text-gray-600">
                        Bayar langsung di laboratorium
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pemesanan Berhasil!</h2>
                <p className="text-gray-600 mb-6">
                  Pesanan Anda telah berhasil diajukan. Silakan tunggu konfirmasi dari admin laboratorium melalui email.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-600 mb-1">Nomor Pesanan</div>
                  <div className="text-2xl font-bold text-teal-600">ORD-2026-0001</div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50">
                    Lihat Riwayat
                  </button>
                  <button className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700">
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h3>
              
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rp {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Biaya Admin</span>
                  <span className="font-medium">Rp 0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diskon Mahasiswa (50%)</span>
                  <span className="font-medium text-green-600">- Rp {(calculateTotal() * 0.5).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-teal-600">
                  Rp {(calculateTotal() * 0.5).toLocaleString()}
                </span>
              </div>

              {step < 4 && (
                <button
                  onClick={handleSubmit}
                  disabled={cartItems.length === 0}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {step === 1 && 'Lanjut ke Detail'}
                  {step === 2 && 'Lanjut ke Pembayaran'}
                  {step === 3 && 'Konfirmasi Pesanan'}
                </button>
              )}

              {step > 1 && step < 4 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="w-full mt-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                >
                  Kembali
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrder;