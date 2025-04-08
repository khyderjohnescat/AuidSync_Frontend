/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import axiosInstance from "../../../context/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle, MenuSquare } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdCategory, MdOutlineCategory } from "react-icons/md";

function ExpenseManager() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    quantity: "",
    tax_amount: "",
    invoice_number: "",
    notes: "",
    payment_status: "pending",
    payment_method: "cash",
    vendor: "",
    is_recurring: false,
    recurrence_interval: "",
    category_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of items per page
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Expenses with Pagination
  const fetchExpenses = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (categoryFilter) params.category_id = categoryFilter;

      const response = await axiosInstance.get("/expenses", { params });
      const { data, pagination } = response.data;
      setExpenses(Array.isArray(data) ? data : []);
      setTotalPages(pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching expenses:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch expenses", {
        position: "top-center",
        autoClose: 3000,
      });
      setExpenses([]);
      setTotalPages(1);
    }
  }, [currentPage, itemsPerPage, statusFilter, paymentStatusFilter, categoryFilter]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/expensescategory");
      const data = Array.isArray(response.data.categories)
        ? response.data.categories
        : [];
      setCategories(data);

      if (data.length > 0 && !formData.category_id && !editingId) {
        setFormData((prev) => ({
          ...prev,
          category_id: data[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch categories", {
        position: "top-center",
        autoClose: 3000,
      });
      setCategories([]);
    }
  }, [formData.category_id, editingId]);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [fetchExpenses, fetchCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        tax_amount: formData.tax_amount ? parseFloat(formData.tax_amount) : 0,
        invoice_number: formData.invoice_number || null,
        notes: formData.notes || null,
        status: "pending", // Always set to "pending" for staff
        payment_status: formData.payment_status,
        payment_method: formData.payment_method,
        vendor: formData.vendor || null,
        is_recurring: formData.is_recurring,
        recurrence_interval: formData.is_recurring ? formData.recurrence_interval : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      };

      if (!dataToSend.description) {
        setError("Description is required");
        return;
      }
      if (isNaN(dataToSend.amount) || dataToSend.amount <= 0) {
        setError("Amount must be a positive number");
        return;
      }
      if (dataToSend.quantity && (isNaN(dataToSend.quantity) || dataToSend.quantity <= 0)) {
        setError("Quantity must be a positive integer");
        return;
      }
      if (dataToSend.tax_amount && (isNaN(dataToSend.tax_amount) || dataToSend.tax_amount < 0)) {
        setError("Tax amount must be a non-negative number");
        return;
      }

      let response;
      if (editingId) {
        response = await axiosInstance.put(`/expenses/${editingId}`, dataToSend);
        toast.success(response.data.message || "Expense updated successfully", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        response = await axiosInstance.post("/expenses", dataToSend);
        toast.success(response.data.message || "Expense added successfully", {
          position: "top-center",
          autoClose: 3000,
        });
      }

      setCurrentPage(1); // Reset to first page after submission
      await fetchExpenses();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || "Error submitting expense");
      console.error("Error submitting expense:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to submit expense", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      quantity: expense.quantity ? expense.quantity.toString() : "",
      tax_amount: expense.tax_amount ? expense.tax_amount.toString() : "",
      invoice_number: expense.invoice_number || "",
      notes: expense.notes || "",
      payment_status: expense.payment_status,
      payment_method: expense.payment_method,
      vendor: expense.vendor || "",
      is_recurring: expense.is_recurring,
      recurrence_interval: expense.recurrence_interval || "",
      category_id: expense.category?.id ? expense.category.id.toString() : "",
    });
    setEditingId(expense.id);
    setIsModalOpen(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        const response = await axiosInstance.delete(`/expenses/${id}`);
        setCurrentPage(1); // Reset to first page after deletion
        await fetchExpenses();
        toast.success(response.data.message || "Expense deleted successfully", {
          position: "top-center",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error deleting expense:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to delete expense", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    }
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      description: "",
      amount: "",
      quantity: "",
      tax_amount: "",
      invoice_number: "",
      notes: "",
      payment_status: "pending",
      payment_method: "cash",
      vendor: "",
      is_recurring: false,
      recurrence_interval: "",
      category_id: categories.length > 0 ? categories[0].id.toString() : "",
    });
    setIsModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setError("");
  };

  // Client-side search filtering
  const filteredExpenses = Array.isArray(expenses)
    ? expenses.filter((expense) => {
        const searchLower = search.toLowerCase();
        return (
          expense.description.toLowerCase().includes(searchLower) ||
          (expense.vendor || "").toLowerCase().includes(searchLower) ||
          (expense.invoice_number || "").toLowerCase().includes(searchLower)
        );
      })
    : [];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="bg-gray-800 flex flex-col min-h-screen p-2 sm:p-4 text-white">
        <div className="p-4 sm:p-6 bg-gray-900 rounded-lg text-white flex-1">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white text-center">
            Expense Management
          </h2>

          {/* Button Group */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <div className="flex w-full justify-between">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-blue-500 px-3 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base"
              >
                <ArrowLeftCircle className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />{" "}
                Back
              </button>
              <div className="justify-end flex gap-2">
              <button
                onClick={() => navigate("/expensescategory")}
                className="bg-blue-500 px-3 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base"
              >
                <MenuSquare className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />{" "}
                Add Category
              </button>
              <button
                onClick={openModal}
                className="bg-green-500 px-3 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base"
              >
                <FaPlus className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Add
                Expense
              </button>
              </div>
            </div>
          </div>

          {/* Search Bar and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-700 p-2 rounded mb-4 gap-2">
            <div className="flex items-center w-full sm:w-1/3">
              <FaSearch className="text-gray-400 mx-2 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search expenses..."
                className="bg-transparent outline-none text-white w-full px-2 text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-2/3">
              <select
                className="bg-gray-700 p-2 rounded text-white w-full sm:w-1/3 text-sm sm:text-base"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="bg-gray-700 p-2 rounded text-white w-full sm:w-1/3 text-sm sm:text-base"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                className="bg-gray-700 p-2 rounded text-white w-full sm:w-1/3 text-sm sm:text-base"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-gray-800 shadow-md rounded-md">
            {/* Table for larger screens */}
            <div className="hidden sm:block overflow-x-hidden">
              <table className="w-full table-auto text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    {[
                      "ID",
                      "Description",
                      "Amount",
                      "Quantity",
                      "Tax Amount",
                      "Total Amount",
                      "Invoice Number",
                      "Status",
                      "Payment Status",
                      "Created At",
                      "Payment Method",
                      "Vendor",
                      "Category",
                      "Recorded By",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="p-2 sm:p-3 text-left text-xs sm:text-sm whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan="15"
                        className="p-2 sm:p-3 text-center text-gray-400 text-xs sm:text-sm"
                      >
                        No expenses found.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-700">
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          {expense.id}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[150px] truncate">
                          {expense.description}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          ₱{Number(expense.amount).toFixed(2)}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          {expense.quantity || "N/A"}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          ₱{Number(expense.tax_amount).toFixed(2)}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          ₱{Number(expense.total_amount).toFixed(2)}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[100px] truncate">
                          {expense.invoice_number || "N/A"}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          <span
                            className={
                              expense.status === "approved"
                                ? "text-green-400"
                                : expense.status === "rejected"
                                ? "text-red-400"
                                : "text-yellow-400"
                            }
                          >
                            {expense.status.charAt(0).toUpperCase() +
                              expense.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          <span
                            className={
                              expense.payment_status === "paid"
                                ? "text-green-400"
                                : expense.payment_status === "overdue"
                                ? "text-red-400"
                                : "text-yellow-400"
                            }
                          >
                            {expense.payment_status.charAt(0).toUpperCase() +
                              expense.payment_status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          {new Date(expense.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[100px] truncate">
                          {expense.payment_method
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[100px] truncate">
                          {expense.vendor || "N/A"}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[100px] truncate">
                          {expense.category?.name || "None"}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[120px] truncate">
                          {expense.recorded_by
                            ? `${expense.recorded_by.first_name} ${expense.recorded_by.last_name}`
                            : "N/A"}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="bg-blue-500 hover:bg-blue-400 text-white px-1 py-1 sm:px-2 sm:py-1 rounded text-xs"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="bg-red-500 hover:bg-red-400 text-white px-1 py-1 sm:px-2 sm:py-1 rounded text-xs"
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
              {/* Pagination for Larger Screens */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === 1
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === page
                          ? "bg-blue-700"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === totalPages
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Card layout for smaller screens */}
            <div className="block sm:hidden space-y-4">
              {filteredExpenses.length === 0 ? (
                <div className="p-3 text-center text-gray-400 text-sm">
                  No expenses found.
                </div>
              ) : (
                filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-gray-700 p-3 rounded-lg shadow"
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-semibold">ID:</div>
                      <div>{expense.id}</div>
                      <div className="font-semibold">Description:</div>
                      <div>{expense.description}</div>
                      <div className="font-semibold">Amount:</div>
                      <div>₱{Number(expense.amount).toFixed(2)}</div>
                      <div className="font-semibold">Quantity:</div>
                      <div>{expense.quantity || "N/A"}</div>
                      <div className="font-semibold">Tax Amount:</div>
                      <div>₱{Number(expense.tax_amount).toFixed(2)}</div>
                      <div className="font-semibold">Total Amount:</div>
                      <div>₱{Number(expense.total_amount).toFixed(2)}</div>
                      <div className="font-semibold">Invoice Number:</div>
                      <div>{expense.invoice_number || "N/A"}</div>
                      <div className="font-semibold">Status:</div>
                      <div>
                        <span
                          className={
                            expense.status === "approved"
                              ? "text-green-400"
                              : expense.status === "rejected"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }
                        >
                          {expense.status.charAt(0).toUpperCase() +
                            expense.status.slice(1)}
                        </span>
                      </div>
                      <div className="font-semibold">Payment Status:</div>
                      <div>
                        <span
                          className={
                            expense.payment_status === "paid"
                              ? "text-green-400"
                              : expense.payment_status === "overdue"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }
                        >
                          {expense.payment_status.charAt(0).toUpperCase() +
                            expense.payment_status.slice(1)}
                        </span>
                      </div>
                      <div className="font-semibold">Created At:</div>
                      <div>{new Date(expense.created_at).toLocaleDateString()}</div>
                      <div className="font-semibold">Payment Method:</div>
                      <div>
                        {expense.payment_method
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </div>
                      <div className="font-semibold">Vendor:</div>
                      <div>{expense.vendor || "N/A"}</div>
                      <div className="font-semibold">Category:</div>
                      <div>{expense.category?.name || "None"}</div>
                      <div className="font-semibold">Recorded By:</div>
                      <div>
                        {expense.recorded_by
                          ? `${expense.recorded_by.first_name} ${expense.recorded_by.last_name}`
                          : "N/A"}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded text-xs"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded text-xs"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
              {/* Pagination for Smaller Screens */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === 1
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === page
                          ? "bg-blue-700"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === totalPages
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expense Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-2">
              <div className="bg-gray-900 p-3 rounded-lg shadow-lg w-full max-w-md border border-gray-600 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-semibold text-white">
                    {editingId ? "Edit Expense" : "Add New Expense"}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white p-1 rounded-full bg-gray-800"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>

                {error && (
                  <div className="mb-2 p-1 bg-red-600 text-white rounded text-xs">
                    {error}
                  </div>
                )}

                {categories.length === 0 ? (
                  <div className="mb-2 p-1 bg-yellow-600 text-white rounded text-xs">
                    No categories available. Please add a category first.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                      {/* Core Expense Details */}
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="e.g., 50.00"
                          step="0.01"
                          min="0"
                          required
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleChange}
                          required
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                        >
                          {Array.isArray(categories) &&
                            categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Financial Details */}
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Quantity (Optional)
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          placeholder="e.g., 10"
                          min="1"
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Tax Amount (Optional)
                        </label>
                        <input
                          type="number"
                          name="tax_amount"
                          value={formData.tax_amount}
                          onChange={handleChange}
                          placeholder="e.g., 5.00"
                          step="0.01"
                          min="0"
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Payment Method
                        </label>
                        <select
                          name="payment_method"
                          value={formData.payment_method}
                          onChange={handleChange}
                          required
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                        >
                          <option value="cash">Cash</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="check">Check</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Invoice Number (Optional)
                        </label>
                        <input
                          type="text"
                          name="invoice_number"
                          value={formData.invoice_number}
                          onChange={handleChange}
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>

                      {/* Payment Status and Vendor */}
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Payment Status
                        </label>
                        <select
                          name="payment_status"
                          value={formData.payment_status}
                          onChange={handleChange}
                          required
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Vendor (Optional)
                        </label>
                        <input
                          type="text"
                          name="vendor"
                          value={formData.vendor}
                          onChange={handleChange}
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>

                      {/* Recurring Option - Spanning Full Width Below Vendor */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_recurring"
                            checked={formData.is_recurring}
                            onChange={handleChange}
                            className="mr-2 w-4 h-4"
                          />
                          <label className="text-xs text-gray-300">
                            Is Recurring?
                          </label>
                        </div>
                        {formData.is_recurring && (
                          <div className="mt-2">
                            <label className="block text-xs text-gray-300 mb-1">
                              Recurrence Interval
                            </label>
                            <select
                              name="recurrence_interval"
                              value={formData.recurrence_interval}
                              onChange={handleChange}
                              required={formData.is_recurring}
                              className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                            >
                              <option value="">Select Interval</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-300 mb-1">
                          Notes (Optional)
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          className="p-1 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-xs"
                          rows="2"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-3 bg-green-500 hover:bg-green-600 px-3 py-1 rounded w-full text-white font-medium transition duration-200 text-sm"
                    >
                      {editingId ? "Update Expense" : "Add Expense"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
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
    </>
  );
}

export default ExpenseManager;