/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash, FaBackward, FaBackspace } from "react-icons/fa";
import axiosInstance from "../../context/axiosInstance"; // Adjust path
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowLeftCircle, ArrowLeftFromLine, ArrowLeftSquare, ArrowRightCircleIcon, SendToBackIcon, SkipBackIcon } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DiscountManager() {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    type: "fixed",
    value: "",
    start_date: "",
    end_date: "",
    product_id: "", // Will be set to the first product in useEffect
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Fetch Discounts
  const fetchDiscounts = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/discounts/");
      setDiscounts(response.data);
    } catch (error) {
      console.error("Error fetching discounts:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch discounts", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/products/");
      const activeProducts = response.data.filter((p) => p.is_active);
      setProducts(activeProducts);

      // Set the default product_id to the first product if available
      if (activeProducts.length > 0 && !formData.product_id && !editingId) {
        setFormData((prev) => ({
          ...prev,
          product_id: activeProducts[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch products", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [formData.product_id, editingId]);

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, [fetchDiscounts, fetchProducts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        type: formData.type, // Fixed: Use the actual value, not a string
        value: parseFloat(formData.value),
        start_date: formData.start_date, // Already in ISO format from datetime-local
        end_date: formData.end_date || null,
        product_id: formData.product_id ? parseInt(formData.product_id) : null,
      };

      // Validation: Ensure a product is selected
      if (!dataToSend.product_id) {
        setError("Please select a product to apply the discount to");
        return;
      }

      // Existing validations
      if (isNaN(dataToSend.value) || dataToSend.value <= 0) {
        setError("Value must be a positive number");
        return;
      }
      if (!dataToSend.start_date) {
        setError("Start date and time are required");
        return;
      }

      let response;
      if (editingId) {
        response = await axiosInstance.put(`/discounts/${editingId}`, dataToSend);
        toast.success(response.data.message || "Discount updated successfully", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        response = await axiosInstance.post("/discounts/", dataToSend);
        toast.success(response.data.message || "Discount added successfully", {
          position: "top-center",
          autoClose: 3000,
        });
      }

      await fetchDiscounts();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || "Error submitting discount");
      console.error("Error submitting discount:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to submit discount", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (discount) => {
    const formatDateTime = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:MM
    };

    setFormData({
      type: discount.type,
      value: discount.value.toString(),
      start_date: formatDateTime(discount.start_date),
      end_date: formatDateTime(discount.end_date),
      product_id: discount.product?.id ? discount.product.id.toString() : "",
    });
    setEditingId(discount.id);
    setIsModalOpen(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      try {
        const response = await axiosInstance.delete(`/discounts/${id}`);
        setDiscounts((prev) => prev.filter((d) => d.id !== id));
        toast.success(response.data.message || "Discount deleted successfully", {
          position: "top-center",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error deleting discount:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to delete discount", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    }
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      type: "fixed",
      value: "",
      start_date: "",
      end_date: "",
      product_id: products.length > 0 ? products[0].id.toString() : "", // Default to first product
    });
    setIsModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setError("");
  };

  const filteredDiscounts = discounts.filter((discount) => {
    const discountMatch =
      discount.type.toLowerCase().includes(search.toLowerCase()) ||
      discount.value.toString().includes(search) ||
      (discount.product?.name || "").toLowerCase().includes(search.toLowerCase());
    return discountMatch;
  });

  return (
    <div className="bg-gray-800 gap-2 flex flex-col h-screen p-2 text-white">
      <div className="p-6 bg-gray-900 rounded-lg text-white h-auto min-h-full">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Discount Management</h2>

        {/* Button Group */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <div className="flex w-full justify-between">
            <button
              onClick={() => navigate("/manageproduct")}
              className="bg-blue-500 px-4 py-2 rounded flex items-center"
            >
              <ArrowLeftCircle className="mr-2" /> Back
            </button>
            <button
              onClick={openModal}
              className="bg-green-500 px-4 py-2 rounded flex items-center"
            >
              <FaPlus className="mr-2" /> Add Discount
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-700 p-2 rounded mb-4">
          <FaSearch className="text-gray-400 mx-2" />
          <input
            type="text"
            placeholder="Search discounts by type, value, or product..."
            className="bg-transparent outline-none text-white w-full px-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Discounts Table */}
        <div className="overflow-x-auto bg-gray-800 shadow-md rounded-md">
          <table className="min-w-full table-auto text-base">
            <thead className="bg-gray-700 text-white">
              <tr>
                {["ID", "Type", "Value", "Start Date & Time", "End Date & Time", "Product", "Actions"].map(
                  (header) => (
                    <th key={header} className="p-3 text-left">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-3 text-center text-gray-400">
                    No discounts are set.
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-700">
                    <td className="p-3">{discount.id}</td>
                    <td className="p-3">{discount.type}</td>
                    <td className="p-3">
                      {discount.type === "fixed" ? "₱" : ""}
                      {Number(discount.value).toFixed(2)}
                      {discount.type === "percentage" ? "%" : ""}
                    </td>
                    <td className="p-3">
                      {new Date(discount.start_date).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {discount.end_date
                        ? new Date(discount.end_date).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="p-3">{discount.product?.name || "None"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded text-sm"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded text-sm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Discount Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingId ? "Edit Discount" : "Add New Discount"}
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

              {products.length === 0 ? (
                <div className="mb-4 p-2 bg-yellow-600 text-white rounded text-sm">
                  No active products available. Please add a product first.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Discount Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                      <option value="fixed">Fixed (₱)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder="e.g., 5.00"
                      step="0.01"
                      min="0"
                      required
                      className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                      className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      End Date & Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Apply to Product
                    </label>
                    <select
                      name="product_id"
                      value={formData.product_id}
                      onChange={handleChange}
                      required
                      className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 bg-green-500 hover:bg-green-600 px-4 py-2 rounded w-full text-white font-medium transition duration-200"
                  >
                    {editingId ? "Update Discount" : "Add Discount"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

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
  );
}

export default DiscountManager;