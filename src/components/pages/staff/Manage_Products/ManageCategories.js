/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash, FaTag } from "react-icons/fa";
import axiosInstance from "../../../../context/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeftCircle } from "lucide-react";

function CategoryManager() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/products/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch categories", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        name: formData.name.trim(),
      };

      if (!dataToSend.name) {
        setError("Category name is required");
        return;
      }

      if (editingId) {
        const response = await axiosInstance.put(`/products/categories/${editingId}`, dataToSend);
        toast.success(response.data.message, { position: "top-center", autoClose: 3000 });
      } else {
        const response = await axiosInstance.post("/products/categories", dataToSend);
        toast.success(response.data.message, { position: "top-center", autoClose: 3000 });
      }

      await fetchCategories();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || "Error submitting category");
      console.error("Error submitting category:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to submit category", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
    });
    setEditingId(category.id);
    setIsModalOpen(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await axiosInstance.delete(`/products/categories/${id}`);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success(response.data.message, { position: "top-center", autoClose: 3000 });
      } catch (error) {
        console.error("Error deleting category:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to delete category", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    }
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
    });
    setIsModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setError("");
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filter and sort categories
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortConfig.key === "id") {
      return sortConfig.direction === "asc" ? a.id - b.id : b.id - a.id;
    }
    if (sortConfig.key === "name") {
      return sortConfig.direction === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  return (
    <div className="bg-gray-800 gap-2 flex flex-col h-screen p-2 text-white">
      <div className="p-6 bg-gray-900 rounded-lg text-white h-auto min-h-full">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Category Management</h2>

        {/* Button Group */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <div className="flex w-full justify-between">
            <button
              onClick={() => navigate("/manageproduct")}
              className="bg-blue-500 px-4 py-2 rounded flex items-center hover:bg-blue-600 transition duration-200"
            >
              <ArrowLeftCircle className="mr-2" /> Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={openModal}
                className="bg-green-500 px-4 py-2 rounded flex items-center hover:bg-green-600 transition duration-200"
              >
                <FaPlus className="mr-2" /> Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-700 p-2 rounded mb-4">
          <FaSearch className="text-gray-400 mx-2" />
          <input
            type="text"
            placeholder="Search category by name..."
            className="bg-transparent outline-none text-white w-full px-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories Table */}
        <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
          <table className="min-w-full table-auto text-base">
            <thead>
              <tr className="text-gray-400">
                <th
                  className="p-3 text-left font-semibold cursor-pointer hover:text-gray-300 transition duration-150"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-1">
                    ID
                    {sortConfig.key === "id" && (
                      <span className="text-xs text-gray-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="p-3 text-left font-semibold cursor-pointer hover:text-gray-300 transition duration-150"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Name
                    {sortConfig.key === "name" && (
                      <span className="text-xs text-gray-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.length > 0 ? (
                sortedCategories.map((category) => (
                  <tr key={category.id} className="bg-gray-800">
                    <td className="p-3 text-white">{category.id}</td>
                    <td className="p-3 text-white">{category.name}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded flex items-center gap-1 transition duration-200"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded flex items-center gap-1 transition duration-200"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-3 text-center text-gray-400">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Category Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingId ? "Edit Category" : "Add New Category"}
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
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Electronics"
                    required
                    className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-6 bg-green-500 hover:bg-green-600 px-4 py-2 rounded w-full text-white font-medium transition duration-200"
                >
                  {editingId ? "Update Category" : "Add Category"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default CategoryManager;