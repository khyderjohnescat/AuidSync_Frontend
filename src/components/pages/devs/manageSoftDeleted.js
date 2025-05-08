import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaUndo } from 'react-icons/fa';
import { ArrowLeftCircle } from 'lucide-react';
import axiosInstance from '../../../context/axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ManageSoftDeletedUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        includeAdmin: 'true',
        ...(search && { search }),
      }).toString();
      const url = `/users/soft-deleted${queryParams ? `?${queryParams}` : ''}`;
      console.log('Fetching from:', url);
      const response = await axiosInstance.get(url);
      console.log('Response:', response.data);
      setUsers(response.data.data);
      setTotal(response.data.total);
      setPage(response.data.page);
    } catch (error) {
      console.error('Fetch error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to fetch soft-deleted users.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 3000,
        theme: 'light',
      });
    } finally {
      setLoading(false);
    }
  }, [limit, page, search]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access this page.', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'light',
      });
      axiosInstance.logout().catch((err) => console.error('Logout error:', err));
      navigate('/');
    }
  }, [navigate]);

  const confirmAction = (action, callback) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg">
          <p className="text-gray-800 text-center font-medium">
            Are you sure you want to {action} this user?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                callback();
                closeToast();
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded transition duration-200"
            >
              Yes
            </button>
            <button
              onClick={closeToast}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition duration-200"
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        theme: 'light',
      }
    );
  };

  const handleRestore = async (id) => {
    confirmAction('restore', async () => {
      try {
        const response = await axiosInstance.put(`/users/${id}/restore`, {});
        toast.success(response.data.message, { position: 'top-center', autoClose: 3000, theme: 'light' });
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to restore user', {
          position: 'top-center',
          autoClose: 3000,
          theme: 'light',
        });
      }
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-gray-800 gap-2 flex flex-col h-screen p-2 text-white">
      <div className="p-6 bg-gray-900 rounded-lg text-white h-auto min-h-full">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Manage Soft-Deleted Users</h2>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <button
            onClick={() => navigate('/manage-accounts')}
            className="bg-blue-500 px-4 py-2 rounded flex items-center hover:bg-blue-600 transition duration-200"
          >
            <ArrowLeftCircle className="mr-2" /> Back
          </button>
        </div>
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
        <div className="overflow-x-auto bg-gray-800 shadow-md rounded-md">
          <table className="min-w-full table-auto text-base">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="p-3 text-left">User ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Deleted At</th>
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
                    No soft-deleted users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-700">
                    <td className="p-3">{user.userId}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{formatDateTime(user.deletedAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(user.userId)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                        >
                          <FaUndo />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

export default ManageSoftDeletedUsers;