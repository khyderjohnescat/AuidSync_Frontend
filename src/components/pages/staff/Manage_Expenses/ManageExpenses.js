/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import ReactPaginate from "react-paginate";
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import axiosInstance from "../../../../context/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle, MenuSquare } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ExpenseManager() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // ReactPaginate uses 0-based indexing
  const [itemsPerPage] = useState(5); // Number of items per page
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Expenses with Pagination
  const fetchExpenses = useCallback(async () => {
    try {
      const params = {
        page: currentPage + 1, // API uses 1-based indexing
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
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch categories", {
        position: "top-center",
        autoClose: 3000,
      });
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [fetchExpenses, fetchCategories]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
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
          <div className="hidden sm:block overflow-x-hidden rounded-md">
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
                      className="p-3 sm:p-3 text-left text-xs sm:text-sm whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan="15"
                      className="p-2 sm:p-3 text-center text-gray-400 text-xs sm:text-sm"
                    >
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
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
                            className="bg-blue-500 hover:bg-blue-400 text-white px-1 py-1 sm:px-2 sm:py-1 rounded text-xs"
                          >
                            <FaEdit />
                          </button>
                          <button
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
          </div>
        </div>

        {/* Pagination Controls */}
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName={"flex justify-center items-center mt-4 space-x-2"}
          pageClassName={"px-3 py-1 rounded text-sm bg-gray-600 hover:bg-gray-500"}
          activeClassName={"bg-blue-700"}
          previousClassName={"px-3 py-1 rounded text-sm bg-blue-500 hover:bg-blue-600"}
          nextClassName={"px-3 py-1 rounded text-sm bg-blue-500 hover:bg-blue-600"}
          disabledClassName={"bg-gray-600 cursor-not-allowed"}
        />
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

export default ExpenseManager;