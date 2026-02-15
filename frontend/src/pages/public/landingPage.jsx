import React, { useState, useEffect } from 'react';
import { 
  Microscope, TestTube, Calendar, CreditCard, Users, Activity, Bell,
  FileText, Shield, Package, Clock, Search, ChevronDown, Building2,
  Award, TrendingUp, ShoppingCart, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContex.jsx';
import axios from 'axios';
import HeaderLandingPage from '../../layouts/headerLandingPage.jsx';

const LandingPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('alat');
  const [openFaq, setOpenFaq] = useState(null);
  const [topTools, setTopTools] = useState([]);
  const [topReagents, setTopReagents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    setLoading(true);
    try {
      const [toolsRes, reagentsRes] = await Promise.all([
        axios.get('http://localhost:5000/catalog/top-tools'),
        axios.get('http://localhost:5000/catalog/top-reagents')
      ]);
      setTopTools(toolsRes.data);
      setTopReagents(reagentsRes.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item, type) => {
    addToCart(item, type);
    // Optional: show toast notification
  };

  const faqData = [
    {
      q: 'Siapa yang dapat menggunakan sistem ChemLabSys?',
      a: 'ChemLabSys dapat digunakan oleh staf internal perusahaan, tim R&D, divisi Quality Control, dan klien eksternal yang telah terdaftar dan terverifikasi.'
    },
    {
      q: 'Bagaimana penanganan bahan kimia berbahaya (B3)?',
      a: 'Penggunaan bahan B3 memerlukan approval supervisor, pelatihan keselamatan kerja laboratorium, dan pencatatan log penggunaan sesuai SOP perusahaan.'
    },
    {
      q: 'Bagaimana sistem perhitungan biaya?',
      a: 'Biaya dihitung berdasarkan durasi penggunaan alat (per jam) dan jumlah reagen yang dikonsumsi. Untuk tim internal, billing dilakukan secara departmental.'
    },
    {
      q: 'Apa yang terjadi jika alat rusak saat penggunaan?',
      a: 'Kerusakan akibat kesalahan operasional akan dikenakan biaya perbaikan atau penggantian sesuai assessment tim maintenance.'
    },
    {
      q: 'Apakah jadwal dapat dibatalkan atau diubah?',
      a: 'Pembatalan/perubahan dapat dilakukan maksimal 48 jam sebelum jadwal tanpa biaya. Pembatalan kurang dari 48 jam dikenakan biaya administrasi 30%.'
    }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <HeaderLandingPage children={<nav className="hidden md:flex items-center gap-8">
                    <button onClick={() => scrollToSection('beranda')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      Beranda
                    </button>
                    <button onClick={() => scrollToSection('layanan')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      Layanan
                    </button>
                    <button onClick={() => scrollToSection('katalog')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      Katalog
                    </button>
                    <button onClick={() => scrollToSection('cara-peminjaman')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      Prosedur
                    </button>
                    <button onClick={() => scrollToSection('faq')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      FAQ
                    </button>
                  </nav>} />

      {/* Hero Section */}
      <section id="beranda" className="relative py-24 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute top-20 left-20 opacity-5">
          <svg className="w-40 h-40" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#0d9488" strokeWidth="2"/>
            <circle cx="50" cy="30" r="8" fill="#0d9488"/>
            <circle cx="35" cy="60" r="8" fill="#0d9488"/>
            <circle cx="65" cy="60" r="8" fill="#0d9488"/>
            <line x1="50" y1="38" x2="35" y2="52" stroke="#0d9488" strokeWidth="2"/>
            <line x1="50" y1="38" x2="65" y2="52" stroke="#0d9488" strokeWidth="2"/>
          </svg>
        </div>
        
        <div className="absolute bottom-20 right-20 opacity-5">
          <Microscope className="w-64 h-64 text-teal-600" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">Solusi Layanan</span>
              <br />
              <span className="text-gray-900">Laboratorium Kimia</span>
              <br />
              <span className="text-teal-600">Standar Profesional & Aman</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Sewa peralatan laboratorium dan bahan kimia berkualitas dengan sistem reservasi yang transparan, terkontrol, dan sesuai standar keselamatan
            </p>

            <div className="flex items-center justify-center gap-4 mb-16">
              <button 
                onClick={() => navigate('/katalog')}
                className="bg-teal-600 text-white px-7 py-4 rounded-lg font-semibold hover:bg-teal-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Search className="w-5 h-5" />
                Lihat Katalog Lengkap
              </button>
              <button 
                onClick={() => scrollToSection('cara-peminjaman')}
                className="bg-white border-2 border-gray-300 text-gray-700 px-7 py-4 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 flex items-center gap-2 transition-all"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Who Uses Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Digunakan Oleh</h3>
            <p className="text-gray-600">Berbagai departemen dan divisi profesional</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors">
              <Building2 className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <div className="font-semibold text-gray-900 text-sm">Tim R&D</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors">
              <Shield className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <div className="font-semibold text-gray-900 text-sm">Quality Control</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors">
              <TestTube className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <div className="font-semibold text-gray-900 text-sm">Chemical Analyst</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors">
              <Activity className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <div className="font-semibold text-gray-900 text-sm">Industrial Testing</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors">
              <Users className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <div className="font-semibold text-gray-900 text-sm">Mahasiswa</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 py-20 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">150+</div>
              <div className="text-teal-100 font-medium">Peralatan Lab</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">200+</div>
              <div className="text-teal-100 font-medium">Jenis Reagen</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-teal-100 font-medium">Uptime System</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">1000+</div>
              <div className="text-teal-100 font-medium">Pengguna Aktif</div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Unggulan */}
      <section id="layanan" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Layanan <span className="text-teal-600">Terintegrasi</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mulai dari peminjaman alat, penyediaan reagen, hingga pelaporan dan pembayaran yang transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-teal-500 transition-all group">
              <div className="bg-teal-50 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                <Microscope className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Peminjaman Peralatan Laboratorium</h3>
              <p className="text-gray-600 text-sm">
                Pesan dan gunakan peralatan laboratorium sesuai kebutuhan Anda dengan jadwal yang jelas dan ketersediaan real-time.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-teal-500 transition-all group">
              <div className="bg-orange-50 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                <TestTube className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Penyediaan Bahan Kimia & Reagen</h3>
              <p className="text-gray-600 text-sm">
                Akses bahan kimia berkualitas dengan informasi stok, satuan, dan ketentuan penggunaan yang transparan.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-teal-500 transition-all group">
              <div className="bg-cyan-50 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
                <FileText className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Laporan & Dokumentasi Penggunaan</h3>
              <p className="text-gray-600 text-sm">
                Dapatkan ringkasan penggunaan alat dan bahan sebagai dokumentasi riset, audit, dan administrasi.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-teal-500 transition-all group">
              <div className="bg-orange-50 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pembayaran yang Jelas & Terukur</h3>
              <p className="text-gray-600 text-sm">
                Biaya penggunaan dihitung secara transparan berdasarkan durasi dan pemakaian aktual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Katalog - Top 6 */}
      <section id="katalog" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Produk <span className="text-teal-600">Paling Populer</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-2">
              Akses berbagai peralatan dan bahan kimia berkualitas tinggi
            </p>
            <p className="text-sm text-gray-500 italic">
              *Harga dapat berubah. Penggunaan bahan B3 memerlukan approval tambahan.
            </p>

            {/* Tabs */}
            <div className="flex items-center justify-center gap-4 mb-8 mt-8">
              <button 
                onClick={() => setActiveTab('alat')}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  activeTab === 'alat' 
                    ? 'bg-teal-600 text-white shadow-lg' 
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Microscope className="w-5 h-5" />
                Peralatan Laboratorium
              </button>
              <button 
                onClick={() => setActiveTab('bahan')}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  activeTab === 'bahan' 
                    ? 'bg-teal-600 text-white shadow-lg' 
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <TestTube className="w-5 h-5" />
                Bahan Kimia & Reagen
              </button>
            </div>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-600">Memuat produk...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {activeTab === 'alat' && topTools.map((tool) => (
                <div key={tool.tool_id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-teal-500 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-teal-50 w-14 h-14 rounded-lg flex items-center justify-center">
                      {tool.image ? (
                        <img src={`http://localhost:5000${tool.image}`} alt={tool.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <Microscope className="w-7 h-7 text-teal-600" />
                      )}
                    </div>
                    <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-green-100 text-green-700">
                      Tersedia
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Tersedia: <strong>{tool.available_stock}/{tool.total_stock}</strong> unit
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Digunakan: {tool.usage_count} kali
                  </p>
                  <p className="text-teal-600 font-bold text-lg mb-4">
                    Rp {parseFloat(tool.hourly_rate).toLocaleString('id-ID')}/jam
                  </p>
                  
                  <button
                    onClick={() => handleAddToCart(tool, 'tool')}
                    className="w-full bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
              ))}

              {activeTab === 'bahan' && topReagents.map((reagent) => (
                <div key={reagent.reagent_id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-teal-500 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-teal-50 w-14 h-14 rounded-lg flex items-center justify-center">
                      {reagent.foto ? (
                        <img src={`http://localhost:5000${reagent.foto}`} alt={reagent.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <TestTube className="w-7 h-7 text-teal-600" />
                      )}
                    </div>
                    <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-green-100 text-green-700">
                      Tersedia
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{reagent.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Stok: <strong>{parseFloat(reagent.stock_quantity)} {reagent.unit}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Digunakan: {reagent.usage_count} kali
                  </p>
                  <p className="text-teal-600 font-bold text-lg mb-4">
                    Rp {parseFloat(reagent.price_per_unit).toLocaleString('id-ID')}/{reagent.unit}
                  </p>
                  
                  <button
                    onClick={() => handleAddToCart(reagent, 'reagent')}
                    className="w-full bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah ke Keranjang
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <button 
              onClick={() => navigate('/katalog')}
              className="bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-teal-700 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Search className="w-5 h-5" />
              Lihat Katalog Lengkap
            </button>
          </div>
        </div>
      </section>

      {/* Cara Peminjaman */}
      <section id="cara-peminjaman" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prosedur <span className="text-teal-600">Penggunaan</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Workflow sistematis untuk memastikan operasional laboratorium yang aman dan terdokumentasi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                1
              </div>
              <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-bold text-gray-900">Registrasi Akun</h3>
                </div>
                <p className="text-gray-600">
                  Daftar sebagai pengguna dengan verifikasi identitas dan role assignment
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                2
              </div>
              <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Search className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-bold text-gray-900">Pilih Alat & Reagen</h3>
                </div>
                <p className="text-gray-600">
                  Browse katalog dan tambahkan ke keranjang sesuai kebutuhan
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                3
              </div>
              <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-bold text-gray-900">Tentukan Jadwal</h3>
                </div>
                <p className="text-gray-600">
                  Pilih slot waktu yang tersedia dengan sistem booking real-time
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                4
              </div>
              <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-bold text-gray-900">Review & Approval</h3>
                </div>
                <p className="text-gray-600">
                  Request diverifikasi oleh admin untuk compliance dan safety check
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                5
              </div>
              <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-bold text-gray-900">Pembayaran</h3>
                </div>
                <p className="text-gray-600">
                  Lakukan pembayaran sesuai metode yang dipilih
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                6
              </div>
              <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-bold text-gray-900">Gunakan Fasilitas</h3>
                </div>
                <p className="text-gray-600">
                  Akses lab sesuai jadwal dengan monitoring keselamatan
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked <span className="text-teal-600">Questions</span>
            </h2>
            <p className="text-gray-600">
              Jawaban untuk pertanyaan umum tentang sistem kami
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-teal-500 transition-all cursor-pointer"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 pr-4">
                    {faq.q}
                  </h3>
                  <ChevronDown className={`w-5 h-5 text-teal-600 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === index && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/images/chemlabsysLogo.png"
                  alt="ChemLabSys Logo"
                  className="w-[3.5rem] h-[3.5rem] object-contain"
                />
                <div>
                  <span className="text-xl font-bold">ChemLabSys</span>
                  <p className="text-xs text-gray-400">Professional Laboratory Services</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Enterprise chemical laboratory management system untuk operasional yang aman dan efisien.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Core Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Equipment Booking</li>
                <li className="hover:text-white cursor-pointer transition-colors">Reagent Management</li>
                <li className="hover:text-white cursor-pointer transition-colors">Usage Reporting</li>
                <li className="hover:text-white cursor-pointer transition-colors">Billing System</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/katalog')}>Katalog</li>
                <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/login')}>Login</li>
                <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/register')}>Register</li>
                <li className="hover:text-white cursor-pointer transition-colors">Tentang Kami</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: info@chemlabsys.com</li>
                <li>Phone: +62 21 1234 5678</li>
                <li>Address: Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                © 2025 ChemLabSys. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                <span className="hover:text-white cursor-pointer transition-colors">Security</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;