import React, { useState, useContext, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Search, 
  Download, Upload, Eye, CheckCircle, XCircle, AlertCircle, X, Image as ImageIcon, FileSpreadsheet
} from 'lucide-react';
import axios from 'axios';
import Frame from '../../layouts/frame.jsx';
import { VariableDash } from '../context/VariableDash.jsx';
import Modal from '../../components/common/Modal.jsx';
import Alert from '../../components/common/alert.jsx';
import ConfirmAlert from '../../components/common/cofirmAlert.jsx';

const ManagementTools = () => {
  const { 
    loading, setLoading,
    error, setError,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    showModal, setShowModal,
    modalMode, setModalMode,
    selectedTool, setSelectedTool,
  } = useContext(VariableDash);

  const [tools, setTools] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    risk_level: 'low',
    total_stock: 0,
    available_stock: 0,
    status: 'available',
    hourly_rate: 0,
    existingImage: null
  });

  const formatStock = (value) => {
    if (value == null) return '0';
    const isInteger = Number(value) % 1 === 0;
    if (isInteger) {
      return Number(value).toLocaleString('id-ID', { maximumFractionDigits: 0 });
    } else {
      return Number(value).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
  };

  const riskLevelColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };

  const statusColors = {
    available: 'bg-green-100 text-green-700',
    maintenance: 'bg-orange-100 text-orange-700',
    unavailable: 'bg-gray-100 text-gray-700'
  };

  useEffect(() => {
    setFilterStatus("all");
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/tools');
      setTools(response.data);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data alat.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || tool.status === filterStatus;
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

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setAlert({
          show: true,
          type: 'warning',
          message: 'Format file harus JPG, PNG, GIF, atau WebP!'
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
    setFormData(prev => ({ ...prev, existingImage: null }));
  };

  const removeExcelFile = () => {
    setSelectedExcelFile(null);
    document.getElementById('excel-upload').value = '';
  };

  const handleAdd = () => {
    setSelectedTool(null);
    setModalMode('add');
    setFormData({
      name: '',
      description: '',
      risk_level: 'low',
      total_stock: 0,
      available_stock: 0,
      status: 'available',
      hourly_rate: 0,
      existingImage: null
    });
    setImagePreview(null);
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleEdit = (tool) => {
    setSelectedTool(tool);
    setModalMode('edit');
    setFormData({
      name: tool.name,
      description: tool.description || '',
      risk_level: tool.risk_level,
      total_stock: tool.total_stock,
      hourly_rate: tool.hourly_rate,
      available_stock: tool.available_stock,
      status: tool.status,
      existingImage: tool.image
    });
    setImagePreview(tool.image ? `http://localhost:5000${tool.image}` : null);
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const requiredFields = ['name', 'total_stock', 'available_stock', 'hourly_rate', 'status', 'risk_level'];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setAlert({
          show: true,
          type: 'warning',
          message: `${field === 'name' ? 'Nama' : field === 'total_stock' ? 'Total Stok' : 'Stok Tersedia'} tidak boleh kosong!`
        });
        return;
      }
    }

    if (formData.total_stock < 1) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Total stok harus lebih dari 0!'
      });
      return;
    }

    if (formData.hourly_rate < 0) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Harga per jam tidak boleh negatif!'
      });
      return;
    }

    const total = parseInt(formData.total_stock);
    const available = parseInt(formData.available_stock);

    if (available < 0 || available > total) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Stok tersedia harus antara 0 dan total stok!'
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('risk_level', formData.risk_level);
      formDataToSend.append('total_stock', parseInt(formData.total_stock));
      formDataToSend.append('available_stock', parseInt(formData.available_stock));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('hourly_rate', parseFloat(formData.hourly_rate));
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      } else if (formData.existingImage) {
        formDataToSend.append('existingImage', formData.existingImage);
      }

      if (modalMode === 'add') {
        await axios.post('http://localhost:5000/tools', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setAlert({
          show: true,
          type: 'success',
          message: 'Alat berhasil ditambahkan!'
        });
      } else {
        await axios.put(`http://localhost:5000/tools/${selectedTool.tool_id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setAlert({
          show: true,
          type: 'success',
          message: 'Alat berhasil diperbarui!'
        });
      }

      setShowModal(false);
      fetchTools();
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menyimpan data: ' + (err.response?.data?.error || err.message)
      });
    }
  };

  const handleDelete = (tool) => {
    setSelectedTool(tool);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedTool) return;

    try {
      await axios.delete(`http://localhost:5000/tools/${selectedTool.tool_id}`);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Alat berhasil dinonaktifkan!'
      });

      fetchTools();
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menonaktifkan alat'
      });
    } finally {
      setShowConfirm(false);
      setSelectedTool(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tools/template/download', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Import_Tools.xlsx');
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

      const response = await axios.post('http://localhost:5000/tools/import/excel', formData, {
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
        fetchTools();

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
    total: tools.length,
    available: tools.filter(tool => tool.status === 'available').length,
    maintenance: tools.filter(tool => tool.status === 'maintenance').length,
    unavailable: tools.filter(tool => tool.status === 'unavailable').length,
  };

  return (
    <Frame menuName={"Management Tools"} descriptionMenu={"Kelola data alat laboratorium"} bodyContent={
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Alat</span>
              <Package className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Tersedia</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.available}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Maintenance</span>
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.maintenance}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Tidak Tersedia</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.unavailable}</div>
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
                placeholder="Cari nama alat..."
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
                <option value="available">Tersedia</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Tidak Tersedia</option>
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
                Tambah Alat
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nama Alat</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Harga/Jam</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tingkat Risiko</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Total Stok</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tersedia</th>
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
                ) : filteredTools.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredTools.map((tool, index) => (
                    <tr key={tool.tool_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {tool.image ? (
                            <img 
                              src={`http://localhost:5000${tool.image}`} 
                              alt={tool.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af">?</text></svg>';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tool.name}</div>
                        {tool.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">{tool.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">Rp {formatStock(tool.hourly_rate)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskLevelColors[tool.risk_level]}`}>
                          {tool.risk_level === 'low' ? 'Rendah' : tool.risk_level === 'medium' ? 'Sedang' : 'Tinggi'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{formatStock(tool.total_stock)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${tool.available_stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatStock(tool.available_stock)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[tool.status]}`}>
                          {tool.status === 'available' ? 'Tersedia' : 
                           tool.status === 'maintenance' ? 'Maintenance' : 'Tidak Tersedia'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEdit(tool)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(tool)}
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

        {/* Add/Edit Modal */}
        {showModal && <Modal bodyModal={
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Tambah Alat Baru' : 'Edit Alat'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Alat
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
                        id="image-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Klik untuk upload atau drag & drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF, WebP hingga 5MB
                        </p>
                      </label>
                    </div>
                  )}
                  
                  {imagePreview && (
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="image-change"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label 
                        htmlFor="image-change"
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
                  Nama Alat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Masukkan nama alat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Masukkan deskripsi alat"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Risiko <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="risk_level"
                    value={formData.risk_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="total_stock"
                    value={formData.total_stock}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Tersedia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="available_stock"
                    value={formData.available_stock}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.total_stock}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga per Jam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </div>
              </div>

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
                  <option value="available">Tersedia</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="unavailable">Tidak Tersedia</option>
                </select>
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
                      <li>Isi data alat sesuai format yang tersedia</li>
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
          message={`Apakah Anda yakin ingin menonaktifkan alat "${selectedTool?.name}"?`}
          onConfirm={confirmDelete} 
          onCancel={() => setShowConfirm(false)} 
          confirmText="Ya" 
          cancelText="Tidak" 
        />
      </div>
    }/>
  );
};

export default ManagementTools;