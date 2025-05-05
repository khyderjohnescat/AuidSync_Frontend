// src/components/ManageAccount.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { ArrowLeftCircle } from 'lucide-react';
import axiosInstance from '../../../context/axiosInstance.js'; // Ensure this path points to axiosInstance.js
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ManageAccount() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    password: '',
  });
  const [roleOptions, setRoleOptions] = useState(['Admin', 'Staff', 'Kitchen']); // Initial role options

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      }).toString();
      const url = `/users${queryParams ? `?${queryParams}` : ''}`;
      console.log('Fetching users from:', `${axiosInstance.defaults.baseURL}${url}`);
      const response = await axiosInstance.get(url);
      const fetchedUsers = response.data.data;

      // Extract unique roles from fetched users and update roleOptions
      const uniqueRoles = [...new Set(fetchedUsers.map(user => user.role).filter(role => role && !roleOptions.includes(role)))];
      if (uniqueRoles.length > 0) {
        setRoleOptions(prev => [...prev, ...uniqueRoles]);
      }

      setUsers(fetchedUsers);
      setTotal(response.data.total);
      setPage(response.data.page);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      setError('User list not available. Please check backend setup.');
      toast.error('User list not available. Please check backend setup.', {
        position: 'top-center',
        autoClose: 3000,
      });
      setLoading(false);
    }
  }, [limit, page, search]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUsers();
    }
  }, [fetchUsers]);

  // Check if the user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found. Redirecting to login...');
      toast.error('Please log in to access this page.', {
        position: 'top-center',
        autoClose: 3000,
      });
      axiosInstance.logout().catch((err) => console.error('Logout error during redirect:', err));
      navigate('/');
    }
  }, [navigate]);

  const handleDeactivate = async (id) => {
    try {
      const response = await axiosInstance.put(`/users/${id}/deactivate`, {});
      toast.success(response.data.message, { position: 'top-center', autoClose: 3000 });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate user', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await axiosInstance.put(`/users/${id}/activate`, {});
      toast.success(response.data.message, { position: 'top-center', autoClose: 3000 });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate user', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  const handleSoftDelete = async (id) => {
    if (window.confirm('Are you sure you want to soft delete this user?')) {
      try {
        const response = await axiosInstance.put(`/users/${id}/soft-delete`, {});
        toast.success(response.data.message, { position: 'top-center', autoClose: 3000 });
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to soft-delete user', {
          position: 'top-center',
          autoClose: 3000,
        });
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    // Split the name into first_name and last_name
    const [first_name, last_name] = user.name.split(' ').filter(Boolean);
    const userRole = user.role || '';
    
    // Ensure the user's role is in roleOptions
    if (userRole && !roleOptions.includes(userRole)) {
      setRoleOptions(prev => [...prev, userRole]);
    }

    setFormData({
      first_name: first_name || '',
      last_name: last_name || '',
      email: user.email || '',
      role: userRole,
      password: '', // Reset password for editing
    });
    setIsModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        setError('First name and last name are required');
        return;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        return;
      }
      if (!formData.role.trim()) {
        setError('Role is required');
        return;
      }
      if (!editingUser && !formData.password.trim()) {
        setError('Password is required');
        return;
      }

      const endpoint = editingUser ? `/users/${editingUser.userId}` : '/register';
      const method = editingUser ? 'PUT' : 'POST';
      const dataToSend = {
        name: `${formData.first_name.trim()} ${formData.last_name.trim()}`, // Combine name
        email: formData.email.trim(),
        role: formData.role.trim(),
        ...(method === 'POST' && { password: formData.password.trim() }),
      };

      const response = await axiosInstance({
        method,
        url: endpoint,
        data: dataToSend,
      });

      toast.success(response.data.message, { position: 'top-center', autoClose: 3000 });
      fetchUsers();
      closeModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error submitting user';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  const openModal = () => {
    setEditingUser(null);
    setFormData({ first_name: '', last_name: '', email: '', role: '', password: '' });
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ first_name: '', last_name: '', email: '', role: '', password: '' });
    setError('');
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // Function to add a new role
  const addNewRole = (newRole) => {
    if (newRole.trim() && !roleOptions.includes(newRole.trim())) {
      setRoleOptions([...roleOptions, newRole.trim()]);
      setFormData({ ...formData, role: newRole.trim() }); // Set the new role as selected
    }
  };

  return (
    <div className="bg-gray-800 gap-2 flex flex-col h-screen p-2 text-white">
      <div className="p-6 bg-gray-900 rounded-lg text-white h-auto min-h-full">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Manage Account</h2>

        {/* Button Group */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <div className="flex w-full justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 px-4 py-2 rounded flex items-center hover:bg-blue-600 transition duration-200"
            >
              <ArrowLeftCircle className="mr-2" /> Back
            </button>
            <button
              onClick={openModal}
              className="bg-green-500 px-4 py-2 rounded flex items-center hover:bg-green-600 transition duration-200"
            >
              <FaPlus className="mr-2" /> Add User
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between bg-gray-700 p-2 rounded mb-4">
          <div className="flex items-center w-full">
            <FaSearch className="text-gray-400 mx-2" />
            <input
              type="text"
              placeholder="Search users..."
              className="bg-transparent outline-none text-white w-full px-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto bg-gray-800 shadow-md rounded-md">
          <table className="min-w-full table-auto text-base">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="p-3 text-left">User ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-700">
                    <td className="p-3">{user.userId}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.status}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() =>
                            user.action === 'Deactivate'
                              ? handleDeactivate(user.userId)
                              : handleActivate(user.userId)
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                          {user.action}
                        </button>
                        {user.canSoftDelete && (
                          <button
                            onClick={() => handleSoftDelete(user.userId)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <span>Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}</span>
            <div>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded mr-2 disabled:opacity-50"
              >
                {'<'}
              </button>
              {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`mx-1 px-3 py-1 rounded ${
                    page === num ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === Math.ceil(total / limit)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded disabled:opacity-50"
              >
                {'>'}
              </button>
            </div>
          </div>
        )}

        {/* Modal for Create/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white p-2 rounded-full bg-gray-800"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-2 bg-red-600 text-white rounded text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Role
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                      className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                      <option value="" disabled>Select a role</option>
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Add new role"
                      className="p-2 rounded bg-gray-700 w-1/3 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          addNewRole(e.target.value);
                          e.target.value = ''; // Clear input after adding
                        }
                      }}
                    />
                  </div>
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required
                      className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="mt-6 w-full text-white font-medium transition duration-200 rounded py-2 px-4 bg-green-500 hover:bg-green-600"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
}

export default ManageAccount;