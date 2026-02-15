import React, { useState, useContext, useEffect } from 'react';
import { 
  TestTube, Plus, Edit, Trash2, Search, Filter, 
  Download, Upload, Eye, AlertTriangle, CheckCircle, 
  XCircle, AlertCircle, X, Image as ImageIcon, FileSpreadsheet
} from 'lucide-react';
import axios from 'axios';
import Frame from '../../layouts/frame.jsx';
import { VariableDash } from '../context/VariableDash.jsx';
import Modal from '../../components/common/Modal.jsx';
import Alert from '../../components/common/alert.jsx';
import ConfirmAlert from '../../components/common/cofirmAlert.jsx';

const ManagementReagent = () => {
  const { 
    loading, setLoading,
    error, setError,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    showModal, setShowModal,
    modalMode, setModalMode,
    selectedReagent, setSelectedReagent,
    reagents, setReagents,
    imagePreview, setImagePreview,
    selectedImage, setSelectedImage,
    showConfirm, setShowConfirm,
  } = useContext(VariableDash);

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  
  const [alert, setAlert] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    stock_quantity: 0,
    unit: 'botol',
    expired_date: '',
    status: 'useable',
    price_per_unit: 0,
    existingFoto: null
  });

  // Helper function untuk format stok
  const formatStock = (value) => {
    if (value == null) return '0';
    
    // Cek jika value bulat (tanpa desimal)
    const isInteger = Number(value) % 1 === 0;

    if (isInteger) {
      // Format ribuan tanpa desimal
      return Number(value).toLocaleString('id-ID', { maximumFractionDigits: 0 });
    } else {
      // Format ribuan dengan desimal jika ada
      return Number(value).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
  };


  const statusColors = {
    useable: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700'
  };

  // Fetch Reagents
  useEffect(() => {
    setFilterStatus("all");
    fetchReagents();
  }, []);

  const fetchReagents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/reagents');
      setReagents(response.data);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data reagent.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReagents = reagents.filter(reagent => {
    const matchesSearch = reagent.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || reagent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          show: true,
          type: 'warning',
          message: 'Ukuran file maksimal 5MB!'
        });
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/jfif'];
      if (!validTypes.includes(file.type)) {
        setAlert({
          show: true,
          type: 'warning',
          message: 'Format file harus JPG, PNG, GIF, JFIF, atau WebP!'
        });
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExcelChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setAlert({
          show: true,
          type: 'warning',
          message: 'Ukuran file maksimal 10MB!'
        });
        return;
      }

      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type)) {
        setAlert({
          show: true,
          type: 'warning',
          message: 'Format file harus Excel (.xlsx atau .xls)!'
        });
        return;
      }

      setSelectedExcelFile(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, existingFoto: null }));
  };

  const removeExcelFile = () => {
    setSelectedExcelFile(null);
    document.getElementById('excel-upload').value = '';
  };

  const handleAdd = () => {
    setSelectedReagent(null);
    setModalMode('add');
    setFormData({
      name: '',
      stock_quantity: 0,
      unit: 'botol',
      expired_date: '',
      price_per_unit: 0,
      status: 'useable',
      existingFoto: null
    });
    setImagePreview(null);
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleEdit = (reagent) => {
    setSelectedReagent(reagent);
    setModalMode('edit');
    setFormData({
      name: reagent.name,
      stock_quantity: reagent.stock_quantity,
      unit: reagent.unit,
      price_per_unit: reagent.price_per_unit,
      expired_date: reagent.expired_date,
      status: reagent.status,
      existingFoto: reagent.foto
    });
    setImagePreview(reagent.foto ? `http://localhost:5000${reagent.foto}` : null);
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const requiredFields = ['name', 'stock_quantity', 'unit', 'expired_date', 'price_per_unit'];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setAlert({
          show: true,
          type: 'warning',
          message: `${field === 'name' ? 'Nama' : 
                     field === 'stock_quantity' ? 'Jumlah Stok' : 
                     field === 'unit' ? 'Unit' : 'Tanggal Kadaluarsa'} tidak boleh kosong!`
        });
        return;
      }
    }

    if (formData.stock_quantity < 0) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Jumlah stok tidak boleh negatif!'
      });
      return;
    }

    if (formData.price_per_unit < 0) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Harga tidak boleh negatif!'
      });
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('stock_quantity', parseFloat(formData.stock_quantity));
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('expired_date', formData.expired_date);
      formDataToSend.append('price_per_unit', parseFloat(formData.price_per_unit));
      formDataToSend.append('status', formData.status);
      
      if (selectedImage) {
        formDataToSend.append('foto', selectedImage);
      } else if (formData.existingFoto) {
        formDataToSend.append('existingFoto', formData.existingFoto);
      }

      if (modalMode === 'add') {
        await axios.post('http://localhost:5000/reagents', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setAlert({
          show: true,
          type: 'success',
          message: 'Reagent berhasil ditambahkan!'
        });
      } else {
        await axios.put(`http://localhost:5000/reagents/${selectedReagent.reagent_id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setAlert({
          show: true,
          type: 'success',
          message: 'Reagent berhasil diperbarui!'
        });
      }

      setShowModal(false);
      fetchReagents();
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menyimpan data: ' + (err.response?.data?.error || err.message)
      });
    }
  };

  const handleDelete = (reagent) => {
    setSelectedReagent(reagent);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedReagent) return;

    try {
      await axios.delete(`http://localhost:5000/reagents/${selectedReagent.reagent_id}`);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Reagent berhasil ditandai kadaluarsa!'
      });

      fetchReagents();
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menghapus reagent'
      });
    } finally {
      setShowConfirm(false);
      setSelectedReagent(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get('http://localhost:5000/reagents/template/download', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Import_Reagents.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setAlert({
        show: true,
        type: 'success',
        message: 'Template berhasil didownload!'
      });
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal mendownload template'
      });
    }
  };

  const handleImportExcel = async () => {
    if (!selectedExcelFile) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Pilih file Excel terlebih dahulu!'
      });
      return;
    }

    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedExcelFile);

      const response = await axios.post('http://localhost:5000/reagents/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        setAlert({
          show: true,
          type: 'success',
          message: response.data.message + (response.data.details.failed > 0 ? ` (${response.data.details.failed} gagal)` : '')
        });

        setShowImportModal(false);
        setSelectedExcelFile(null);
        fetchReagents();

        // Show detailed errors if any
        if (response.data.details.errors.length > 0) {
          console.log('Import errors:', response.data.details.errors);
        }
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message;
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal import data: ' + errorMessage
      });
    } finally {
      setImportLoading(false);
    }
  };

  const stats = {
    total: reagents.length,
    useable: reagents.filter(r => r.status === 'useable').length,
    expired: reagents.filter(r => r.status === 'expired').length,
    lowStock: reagents.filter(r => r.stock_quantity < 10 && r.status === 'useable').length
  };

  return (
    <Frame menuName={"Management Reagent"} descriptionMenu={"Kelola data bahan kimia laboratorium"} bodyContent={
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Reagent</span>
              <TestTube className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Dapat Digunakan</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.useable}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Stok Rendah</span>
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.lowStock}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Kadaluarsa</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.expired}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama reagent..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Semua Status</option>
                <option value="useable">Dapat Digunakan</option>
                <option value="expired">Kadaluarsa</option>
              </select>

              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Import Excel
              </button>

              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
              >
                <Plus className="w-5 h-5" />
                Tambah Reagent
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">No</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Foto</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nama Reagent</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Harga</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Stok</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Unit</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tanggal Kadaluarsa</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredReagents.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredReagents.map((reagent, index) => (
                    <tr key={reagent.reagent_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {reagent.foto ? (
                            <img 
                              src={`http://localhost:5000${reagent.foto}`} 
                              alt={reagent.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af">?</text></svg>';
                              }}
                            />
                          ) : (
                            <TestTube className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{reagent.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium text-gray-900`}>
                          Rp{formatStock(reagent.price_per_unit)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${
                          reagent.stock_quantity < 10 ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                          {formatStock(reagent.stock_quantity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{reagent.unit}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(reagent.expired_date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[reagent.status]}`}>
                          {reagent.status === 'useable' ? 'Dapat Digunakan' : 'Kadaluarsa'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEdit(reagent)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(reagent)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Add/Edit */}
        {showModal && <Modal bodyModal={
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Tambah Reagent Baru' : 'Edit Reagent'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Reagent
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {!imagePreview && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="foto-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/jfif"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="foto-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Klik untuk upload atau drag & drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF, JFIF, WebP hingga 5MB
                        </p>
                      </label>
                    </div>
                  )}
                  
                  {imagePreview && (
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="foto-change"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/jfif"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label 
                        htmlFor="foto-change"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50"
                      >
                        Ganti Foto
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Reagent <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Masukkan nama reagent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="botol">Botol</option>
                    <option value="kg">Kg</option>
                    <option value="gram">Gram</option>
                    <option value="liter">Liter</option>
                    <option value="ml">ml</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Kadaluarsa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="expired_date"
                    value={formData.expired_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price_per_unit"
                    value={formData.price_per_unit}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </div>

              </div>
              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="useable">Dapat Digunakan</option>
                    <option value="expired">Kadaluarsa</option>
                  </select>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Perhatian:</p>
                    <p>Pastikan tanggal kadaluarsa sudah benar. Reagent yang sudah kadaluarsa tidak dapat digunakan untuk praktikum.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
              >
                Simpan
              </button>
            </div>
          </div>
        } />}

        {/* Import Excel Modal */}
        {showImportModal && <Modal bodyModal={
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Import Data dari Excel</h3>
                <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">Petunjuk Import:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Download template Excel terlebih dahulu</li>
                      <li>Isi data reagent sesuai format yang tersedia</li>
                      <li>Upload file Excel yang sudah diisi</li>
                      <li>Klik tombol "Import Data"</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Download Template Button */}
              <div>
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Template Excel
                </button>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File Excel
                </label>
                
                {!selectedExcelFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="excel-upload"
                      accept=".xlsx,.xls"
                      onChange={handleExcelChange}
                      className="hidden"
                    />
                    <label htmlFor="excel-upload" className="cursor-pointer">
                      <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-1">
                        Klik untuk upload file Excel
                      </p>
                      <p className="text-xs text-gray-500">
                        Format: .xlsx atau .xls (Maks. 10MB)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedExcelFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(selectedExcelFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeExcelFile}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedExcelFile(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                disabled={importLoading}
              >
                Batal
              </button>
              <button
                onClick={handleImportExcel}
                disabled={!selectedExcelFile || importLoading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Mengimport...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Import Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        } />}

        <Alert 
          show={alert.show} 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert({ ...alert, show: false })}
        />

        <ConfirmAlert 
          show={showConfirm} 
          type="warning" 
          title="Konfirmasi Hapus" 
          message={`Apakah Anda yakin ingin menandai reagent "${selectedReagent?.name}" sebagai kadaluarsa?`}
          onConfirm={confirmDelete} 
          onCancel={() => setShowConfirm(false)} 
          confirmText="Ya" 
          cancelText="Tidak" 
        />
      </div>
    }/>
  );
};

export default ManagementReagent;