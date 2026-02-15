import React, { createContext, useState } from 'react';

// Buat context
export const VariableDash = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [reagents, setReagents] = useState([]);
  const [selectedReagent, setSelectedReagent] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <VariableDash.Provider
      value={{
        users,
        setUsers,
        loading,
        setLoading,
        error,
        setError,
        searchQuery,
        setSearchQuery,
        filterRole,
        setFilterRole,
        filterStatus,
        setFilterStatus,
        showModal,
        setShowModal,
        modalMode,
        setModalMode,
        selectedUser,
        setSelectedUser,
        showConfirm,
        setShowConfirm,
        selectedTool, 
        setSelectedTool,
        reagents,
        setReagents,
        selectedReagent,
        setSelectedReagent,
        imagePreview,
        setImagePreview,
        selectedImage,
        setSelectedImage
      }}
    >
      {children}
    </VariableDash.Provider>
  );
};
