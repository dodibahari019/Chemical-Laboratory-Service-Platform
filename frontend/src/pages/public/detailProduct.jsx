import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Microscope, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Clock,
  Shield,
  Star,
  ShoppingCart,
  Minus,
  Plus
} from 'lucide-react';

const ProductDetail = ({ type = 'tool' }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [duration, setDuration] = useState(1);

  // Sample data - bisa diganti dengan data dari API
  const product = type === 'tool' ? {
    id: 1,
    name: 'Mikroskop Digital HD Pro',
    category: 'Alat Laboratorium',
    stock: 12,
    status: 'Tersedia',
    price: 25000,
    priceUnit: 'hari',
    rating: 4.8,
    reviews: 24,
    image: 'https://via.placeholder.com/600x400/0d9488/ffffff?text=Mikroskop+Digital',
    description: 'Mikroskop digital profesional dengan pembesaran hingga 1000x, dilengkapi kamera HD untuk dokumentasi hasil pengamatan. Cocok untuk penelitian mikrobiologi, histologi, dan analisis sampel.',
    specifications: [
      { label: 'Pembesaran', value: '40x - 1000x' },
      { label: 'Jenis Lensa', value: 'Plan Achromatic' },
      { label: 'Sumber Cahaya', value: 'LED 3W' },
      { label: 'Kamera', value: '5MP HD' },
      { label: 'Kondisi', value: 'Sangat Baik' },
      { label: 'Tahun Pembelian', value: '2023' }
    ],
    features: [
      'Pembesaran hingga 1000x dengan kualitas gambar tajam',
      'Kamera HD 5MP untuk dokumentasi digital',
      'Pencahayaan LED yang dapat diatur intensitasnya',
      'Dudukan sampel presisi dengan skala ukur',
      'Software analisis gambar included',
      'Carrying case untuk penyimpanan aman'
    ],
    usage: [
      'Wajib mengikuti prosedur SOP penggunaan mikroskop',
      'Tidak boleh dipindahkan tanpa izin laboran',
      'Bersihkan lensa setelah digunakan',
      'Matikan dan cover setelah selesai',
      'Laporkan segera jika ada kerusakan'
    ]
  } : {
    id: 2,
    name: 'Asam Sulfat (H₂SO₄) 98%',
    category: 'Bahan Kimia',
    stock: 50,
    status: 'Tersedia',
    price: 5000,
    priceUnit: '100ml',
    rating: 4.9,
    reviews: 18,
    image: 'https://via.placeholder.com/600x400/ea580c/ffffff?text=H2SO4',
    description: 'Asam sulfat konsentrasi tinggi (98%) dengan grade analitik. Digunakan untuk berbagai aplikasi analisis kimia, sintesis, dan titrasi. Tersimpan dalam botol kaca gelap dengan tutup safety.',
    specifications: [
      { label: 'Konsentrasi', value: '98%' },
      { label: 'Grade', value: 'Analytical Grade' },
      { label: 'Kemurnian', value: '≥ 98%' },
      { label: 'Kemasan', value: 'Botol kaca 1L' },
      { label: 'CAS Number', value: '7664-93-9' },
      { label: 'Kondisi Penyimpanan', value: 'Suhu ruangan' }
    ],
    features: [
      'Grade analitik dengan kemurnian tinggi (≥98%)',
      'Tersimpan dalam botol kaca gelap anti bocor',
      'Dilengkapi dengan MSDS (Material Safety Data Sheet)',
      'Label bahaya dan instruksi penanganan',
      'Expired date jelas tercantum',
      'Dapat digunakan untuk berbagai aplikasi'
    ],
    usage: [
      'WAJIB menggunakan APD lengkap (kacamata, sarung tangan, jas lab)',
      'Gunakan di dalam fume hood',
      'Jangan dicampur dengan bahan organik atau air secara langsung',
      'Tuang asam ke dalam air, BUKAN sebaliknya',
      'Segera bilas dengan air jika terkena kulit',
      'Simpan kembali di tempat penyimpanan khusus asam'
    ]
  };

  const handleQuantityChange = (action) => {
    if (action === 'increment' && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (action === 'decrement' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const totalPrice = type === 'tool' 
    ? product.price * duration * quantity 
    : product.price * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-teal-600 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">ChemLabSys</span>
              </div>
            </div>
            <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Kembali ke Katalog
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            
            {/* Safety Notice for Chemicals */}
            {type === 'reagent' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">Peringatan Keselamatan</h4>
                    <p className="text-sm text-red-800">
                      Bahan kimia berbahaya. Wajib menggunakan APD lengkap dan mengikuti prosedur keselamatan laboratorium.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rating & Reviews */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold text-gray-900">{product.rating}</span>
                </div>
                <div className="text-sm text-gray-600">
                  ({product.reviews} ulasan)
                </div>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-8">{star} ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{star === 5 ? 19 : star === 4 ? 3 : star === 3 ? 1 : 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm text-teal-600 font-medium mb-2">{product.category}</div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.status === 'Tersedia' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.status}
                </span>
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Price */}
              <div className="bg-teal-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-teal-700 mb-1">Harga</div>
                <div className="text-3xl font-bold text-teal-600">
                  Rp {product.price.toLocaleString()}
                  <span className="text-lg font-normal text-teal-700">/{product.priceUnit}</span>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 text-gray-700 mb-6">
                <Package className="w-5 h-5" />
                <span className="font-medium">Stok Tersedia:</span>
                <span className="text-teal-600 font-bold">{product.stock} {type === 'tool' ? 'unit' : 'botol'}</span>
              </div>

              {/* Booking Form */}
              <div className="space-y-4 border-t pt-6">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange('decrement')}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      className="w-20 text-center border border-gray-300 rounded-lg py-2 font-medium"
                    />
                    <button
                      onClick={() => handleQuantityChange('increment')}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      {type === 'tool' ? 'unit' : '× 100ml'}
                    </span>
                  </div>
                </div>

                {type === 'tool' && (
                  <>
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Peminjaman
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durasi Peminjaman
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map(d => (
                            <option key={d} value={d}>{d} hari</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Total */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">Rp {totalPrice.toLocaleString()}</span>
                  </div>
                  {type === 'tool' && (
                    <div className="text-sm text-gray-600">
                      {quantity} unit × {duration} hari × Rp {product.price.toLocaleString()}
                    </div>
                  )}
                  {type === 'reagent' && (
                    <div className="text-sm text-gray-600">
                      {quantity} × 100ml × Rp {product.price.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <button className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Ajukan Peminjaman
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Spesifikasi</h3>
              <div className="space-y-3">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">{spec.label}</span>
                    <span className="font-medium text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fitur & Keunggulan</h3>
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage Instructions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-teal-600" />
                <h3 className="text-xl font-bold text-gray-900">Panduan Penggunaan</h3>
              </div>
              <ul className="space-y-3">
                {product.usage.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;