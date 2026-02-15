import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Mail,
  Phone,
  Shield,
  Filter,
  Download,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import axios from 'axios'; // import axios
import Frame from '../../layouts/frame.jsx';
import { VariableDash } from '../context/VariableDash.jsx'; // path sesuai
import Modal from '../../components/common/Modal.jsx';
import Alert from '../../components/common/alert.jsx';
import ConfirmAlert from '../../components/common/cofirmAlert.jsx';

export default function UserManagement() {
  const { 
    users, setUsers,
    loading, setLoading,
    error, setError,
  
    searchQuery, setSearchQuery,
    filterRole, setFilterRole,
    filterStatus, setFilterStatus,
    showModal, setShowModal,
    modalMode, setModalMode,
    selectedUser, setSelectedUser,
    showConfirm, setShowConfirm,
   } = useContext(VariableDash);

   const [alert, setAlert] = useState({
      show: false,
      type: 'success',
      message: ''
    });

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    no_hp: '',
    role: 'staff',
    password: ''
  });

  const roleColors = {
    admin: 'bg-orange-100 text-orange-700',
    staff: 'bg-blue-100 text-blue-700',
    manager: 'bg-purple-100 text-purple-700'
  };

  const roleLabels = {
    admin: 'Admin',
    staff: 'Staff',
    manager: 'Manager'
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setModalMode('add');
    setFormData({ name: '', username: '', email: '', no_hp: '', role: 'staff', password: '' });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      no_hp: user.no_hp,
      role: user.role,
      password: ''
    });
    setShowModal(true);
  };

  useEffect(() => {
    setFilterRole("all");
    setFilterStatus("all");
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users'); // ganti URL sesuai backend kamu
        setUsers(response.data); // pastikan response.data adalah array user
      } catch (err) {
        console.error(err);
        setError('Gagal mengambil data user');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    const requiredFields = modalMode === 'add'
    ? ['name', 'username', 'email', 'no_hp', 'password']
    : ['name', 'username', 'email', 'no_hp']; // edit -> password opsional

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        setAlert({
          show: true,
          type: 'warning',
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} tidak boleh kosong!`
        });
        return;
      }
    }

    try {
      if (modalMode === 'add') {
        // POST ke backend
        const response = await axios.post('http://localhost:5000/users', {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          no_hp: formData.no_hp,
          role: formData.role,
          auth_provider: 'local'
        });

        // kalau sukses, ambil data user terbaru
        const newUser = {
          id: users.length + 1, // sementara kalau backend belum return ID
          ...formData,
          status: 'active'
        };
        setUsers([...users, newUser]);

        // alert('User berhasil ditambahkan!');
        setAlert({
          show: true,
          type: 'success',
          message: 'User berhasil ditambahkan!'
        });

      } else {
        // PUT ke backend untuk update
      const payload = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        no_hp: formData.no_hp,
        role: formData.role
      };

      // hanya sertakan password kalau diisi
      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password;
      }

      await axios.put(`http://localhost:5000/users/${selectedUser.user_id}`, payload);

      // update state lokal
      setUsers(users.map(user =>
        user.user_id === selectedUser.user_id
          ? { ...user, ...payload } // password tidak ditampilkan di frontend
          : user
      ));

      setAlert({
        show: true,
        type: 'success',
        message: 'User berhasil diperbarui!'
      });
    }

    setShowModal(false);
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menyimpan data: ' + (err.response?.data?.error || err.message)
      });
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    manager: users.filter(u => u.role === 'manager').length
  };  

  return (
    <Frame menuName={"Management Users"} descriptionMenu={"Kelola data user"}  bodyContent={
        <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Karyawan</span>
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Admin</span>
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.admin}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Staff</span>
            <UserCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.staff}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Manager</span>
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.manager}</div>
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
              placeholder="Cari nama, username, atau email..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-5">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            {/* <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-5 h-5" />
              Export
            </button> */}

            <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
              >
                <Plus className="w-5 h-5" />
                Tambah
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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {user.no_hp}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user)}
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

      {showModal && <Modal 
      bodyModal={
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">
              {modalMode === 'add' ? 'Tambah Data' : 'Edit Data'}
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {modalMode === 'add' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  // placeholder={modalMode === 'edit' ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}
                />
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
      <Alert show={alert.show} type={alert.type} message={alert.message} onClose={() => 
        setAlert({
          ...alert,
          show: false
        })}/>
      <ConfirmAlert 
      show={showConfirm} 
      type="warning" 
      title="Konfirmasi Hapus" 
      message="Apakah Anda yakin ingin menonaktifkan ini?" 
      onConfirm={async () => {
    if (!selectedUser) return;

    try {
      // Panggil API delete (soft delete / deactivate) dari controller
      await axios.delete(`http://localhost:5000/users/${selectedUser.user_id}`);
      setUsers(users.map(u =>
  u.user_id === selectedUser.user_id
    ? { ...u, status: 'inactive' }
    : u
));

      setAlert({
        show: true,
        type: 'success',
        message: 'User berhasil dinonaktifkan!'
      });

    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal menonaktifkan user'
      });
    } finally {
      setShowConfirm(false); // tutup modal konfirmasi
      setSelectedUser(null); // reset selectedUser
    }
  }} 
      onCancel={() => setShowConfirm(false)} 
      confirmText="Ya" cancelText="Tidak" />
    </div>
    }/>
  );
}