import React, { useState, useEffect } from 'react';
import { 
  Package, TestTube, Search, Filter, ShoppingCart, Plus, Minus, X,
  ArrowRight, CheckCircle, AlertCircle, ChevronLeft, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContex.jsx';
import axios from 'axios';
import HeaderLandingPage from '../../layouts/headerLandingPage.jsx';

const KatalogPage = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, updateQuantity, getCartCount, getCartTotal, clearCart } = useCart();
  
  const [activeTab, setActiveTab] = useState('tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [tools, setTools] = useState([]);
  const [reagents, setReagents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [toolsRes, reagentsRes] = await Promise.all([
        axios.get('http://localhost:5000/catalog/tools'),
        axios.get('http://localhost:5000/catalog/reagents')
      ]);
      setTools(toolsRes.data);
      setReagents(reagentsRes.data);
    } catch (err) {
      console.error('Error fetching catalog:', err);
      showAlert('error', 'Gagal memuat katalog');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleAddToCart = (item, type) => {
    addToCart(item, type);
    // showAlert('success', 'Item berhasil ditambahkan ke keranjang!');
  };

  const handleCheckout = () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      // Show login modal or redirect to login
      if (window.confirm('Anda harus login terlebih dahulu untuk melanjutkan. Login sekarang?')) {
        // Save cart state before redirecting
        navigate('/login', { state: { from: '/katalog' } });
      }
      return;
    }

    // If logged in, proceed to checkout
    navigate('/ajukan-peminjaman');
  };

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReagents = reagents.filter(reagent => 
    reagent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentItems = activeTab === 'tools' ? filteredTools : filteredReagents;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
          alert.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <HeaderLandingPage />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Tabs */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari ${activeTab === 'tools' ? 'alat' : 'reagen'}...`}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filter (Optional) */}
            {/* <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filter</span>
            </button> */}
          </div>

          {/* Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'tools' 
                  ? 'bg-teal-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="w-5 h-5" />
              Peralatan Laboratorium ({tools.length})
            </button>
            <button
              onClick={() => setActiveTab('reagents')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'reagents' 
                  ? 'bg-teal-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TestTube className="w-5 h-5" />
              Bahan Kimia & Reagen ({reagents.length})
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-gray-600">Coba ubah kata kunci pencarian Anda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeTab === 'tools' && filteredTools.map((tool) => {
              const inCart = cartItems.find(item => item.tool_id === tool.tool_id && item.type === 'tool');
              
              return (
                <div key={tool.tool_id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-teal-500 transition-all">
                  {/* Image */}
                  <div className="mb-4 h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                    {tool.image ? (
                      <img 
                        src={`http://localhost:5000${tool.image}`} 
                        alt={tool.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                      tool.status === 'available' && tool.available_stock > 0
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {tool.status === 'available' && tool.available_stock > 0 ? 'Tersedia' : 'Tidak Tersedia'}
                    </span>
                    {tool.risk_level && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        tool.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                        tool.risk_level === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {tool.risk_level === 'high' ? 'Risiko Tinggi' :
                         tool.risk_level === 'medium' ? 'Risiko Sedang' : 'Risiko Rendah'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{tool.name}</h3>
                  
                  {tool.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool.description}</p>
                  )}

                  <div className="text-sm text-gray-600 mb-3">
                    Tersedia: <strong>{tool.available_stock}/{tool.total_stock}</strong> unit
                  </div>

                  <div className="text-teal-600 font-bold text-xl mb-4">
                    Rp {parseFloat(tool.hourly_rate).toLocaleString('id-ID')}/jam
                  </div>

                  {/* Add to Cart Button */}
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(tool.tool_id, 'tool', -1)}
                        className="w-10 h-10 border-2 border-teal-600 text-teal-600 rounded-lg flex items-center justify-center hover:bg-teal-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center font-bold text-lg">{inCart.quantity}</div>
                      <button
                        onClick={() => updateQuantity(tool.tool_id, 'tool', 1)}
                        disabled={inCart.quantity >= tool.available_stock}
                        className="w-10 h-10 border-2 border-teal-600 text-teal-600 rounded-lg flex items-center justify-center hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(tool.tool_id, 'tool')}
                        className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(tool, 'tool')}
                      disabled={tool.available_stock === 0}
                      className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Tambah
                    </button>
                  )}
                </div>
              );
            })}

            {activeTab === 'reagents' && filteredReagents.map((reagent) => {
              const inCart = cartItems.find(item => item.reagent_id === reagent.reagent_id && item.type === 'reagent');
              
              return (
                <div key={reagent.reagent_id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-teal-500 transition-all">
                  {/* Image */}
                  <div className="mb-4 h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                    {reagent.foto ? (
                      <img 
                        src={`http://localhost:5000${reagent.foto}`} 
                        alt={reagent.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <TestTube className="w-16 h-16 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                      reagent.status === 'useable' && reagent.stock_quantity > 0
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {reagent.status === 'useable' && reagent.stock_quantity > 0 ? 'Tersedia' : 'Habis/Kadaluarsa'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{reagent.name}</h3>

                  <div className="text-sm text-gray-600 mb-1">
                    Stok: <strong>{parseFloat(reagent.stock_quantity)} {reagent.unit}</strong>
                  </div>

                  {reagent.expired_date && (
                    <div className="text-xs text-gray-500 mb-3">
                      Exp: {new Date(reagent.expired_date).toLocaleDateString('id-ID')}
                    </div>
                  )}

                  <div className="text-teal-600 font-bold text-xl mb-4">
                    Rp {parseFloat(reagent.price_per_unit).toLocaleString('id-ID')}/{reagent.unit}
                  </div>

                  {/* Add to Cart Button */}
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(reagent.reagent_id, 'reagent', -1)}
                        className="w-10 h-10 border-2 border-teal-600 text-teal-600 rounded-lg flex items-center justify-center hover:bg-teal-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center font-bold text-lg">{inCart.quantity}</div>
                      <button
                        onClick={() => updateQuantity(reagent.reagent_id, 'reagent', 1)}
                        disabled={inCart.quantity >= reagent.stock_quantity}
                        className="w-10 h-10 border-2 border-teal-600 text-teal-600 rounded-lg flex items-center justify-center hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(reagent.reagent_id, 'reagent')}
                        className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(reagent, 'reagent')}
                      disabled={reagent.stock_quantity === 0}
                      className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Tambah ke Keranjang
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setShowCart(false)}
          ></div>

          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Keranjang Belanja</h3>
                <button 
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{getCartCount()} item dipilih</p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Keranjang Anda kosong</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => {
                    const name = item.type === 'tool' ? item.name : item.name;
                    const price = item.type === 'tool' ? item.hourly_rate : item.price_per_unit;
                    const unit = item.type === 'tool' ? 'jam' : item.unit;
                    const id = item.type === 'tool' ? item.tool_id : item.reagent_id;

                    return (
                      <div key={`${item.type}-${id}-${index}`} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.type === 'tool' ? '🔧 Alat Lab' : '🧪 Reagen'}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(id, item.type)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(id, item.type, -1)}
                              className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(id, item.type, 1)}
                              className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Rp {parseFloat(price).toLocaleString('id-ID')}/{unit}</div>
                            <div className="font-bold text-teal-600">
                              Rp {(parseFloat(price) * item.quantity).toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rp {getCartTotal().toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total Estimasi</span>
                    <span className="text-lg font-bold text-teal-600">
                      Rp {getCartTotal().toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-teal-600 text-white py-4 rounded-lg font-semibold hover:bg-teal-700 flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  Ajukan Peminjaman
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full mt-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KatalogPage;