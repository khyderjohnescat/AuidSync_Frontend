/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../context/axiosInstance";
import { CheckCircle, CheckCircle2, CheckCircle2Icon, XCircle } from "lucide-react";
import { IoCheckmarkCircle } from "react-icons/io5";

const OrderList = ({ isOpen }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalOrderId, setStatusModalOrderId] = useState(null);
  const [notification, setNotification] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Number of items per page

  const [filters, setFilters] = useState({
    search: "",
    order_type: "",
    date: "",
    payment_method: "",
  });

  const debouncedFilters = useMemo(() => {
    return () => {
      const handler = setTimeout(() => {
        fetchOrders();
      }, 500);
      return () => clearTimeout(handler);
    };
  }, [filters]);

  useEffect(() => {
    const cancel = debouncedFilters();
    fetchOrders(); // Initial fetch
    return () => cancel();
  }, [debouncedFilters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/orders/kitchen/", {
        params: filters,
        headers: { "Cache-Control": "no-cache" },
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      order_type: "",
      date: "",
      payment_method: "",
    });
    fetchOrders(); // Immediate refresh
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch order details");
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      setStatusModalOrderId(null); // Close the status modal

      setNotification({
        message: `Order number ${orderId} is now "${newStatus}"`,
        type: "success",
      });

      await fetchOrders();

      if (selectedOrder && selectedOrder.id === orderId) {
        if (newStatus === "ready") {
          setSelectedOrder(null); // Close modal on "ready"
        } else {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      }

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status");
      setNotification({
        message: "Couldn’t update the order status",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Calculate paginated orders
  const totalOrders = orders.length;
  const totalPages = Math.ceil(totalOrders / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const OrderModal = ({ selectedOrder, handleCloseModal }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const orderItems = Object.values(
      selectedOrder.orderItems?.reduce((acc, item) => {
        const productName = item.product?.name || "N/A";
        if (!acc[productName]) {
          acc[productName] = { ...item, quantity: 0, totalPrice: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].totalPrice += item.quantity * Number(item.price || 0);
        return acc;
      }, {}) || {}
    );

    const totalItems = orderItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = orderItems.slice(startIndex, endIndex);

    const handlePrevious = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4"
        onClick={handleCloseModal}
      >
        <div
          className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-5xl text-white relative max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleCloseModal}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
            Order Details
          </h2>

          <div className="flex gap-6">
            {selectedOrder.orderItems?.length > 0 && (
              <div className="w-2/5 border-r border-gray-700 pr-4 max-h-[400px] flex flex-col">
                <h3 className="text-lg font-bold mb-2">Order Items</h3>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-1">
                    {paginatedItems.map((item) => (
                      <div
                        key={item.product?.name}
                        className="flex justify-between text-sm border-b border-gray-700 pb-1"
                      >
                        <span className="w-1/3 truncate">
                          {item.product?.name || "N/A"}
                        </span>
                        <span className="w-1/6 text-center">
                          {item.quantity}
                        </span>
                        <span className="w-1/6 text-center">
                          ₱{Number(item.price || 0).toFixed(2)}
                        </span>
                        <span className="w-1/6 text-right">
                          ₱{item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {totalItems > itemsPerPage && (
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 rounded ${
                        currentPage === 1
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-400"
                      }`}
                    >
                      Previous
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 rounded ${
                        currentPage === totalPages
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-400"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="w-3/5">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p>
                    <span className="font-semibold">Order ID:</span>{" "}
                    {selectedOrder.id}
                  </p>
                  <p>
                    <span className="font-semibold">Customer:</span>{" "}
                    {selectedOrder.customer_name || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Order Type:</span>{" "}
                    {selectedOrder.order_type}
                  </p>
                  <p>
                    <span className="font-semibold">Staff:</span>{" "}
                    {selectedOrder.staff_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Payment Method:</span>{" "}
                    {selectedOrder.payment_method}
                  </p>
                  <p>
                    <span className="font-semibold">Discount Type:</span>{" "}
                    {selectedOrder.discount_type || "None"}
                  </p>
                  <p>
                    <span className="font-semibold">Discount Value:</span> ₱
                    {selectedOrder.discount_value || "0.00"}
                  </p>
                  <p>
                    <span className="font-semibold">Discount Amount:</span> ₱
                    {selectedOrder.discount_amount || "0.00"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p>
                    <span className="font-semibold">Final Price:</span> ₱
                    {selectedOrder.final_price}
                  </p>
                  <p>
                    <span className="font-semibold">Amount Paid:</span> ₱
                    {selectedOrder.amount_paid}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Change:</span> ₱
                    {selectedOrder.change}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    {selectedOrder.status}
                  </p>
                  <p>
                    <span className="font-semibold">Created At:</span>{" "}
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatusModal = ({ order, onClose }) => {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-4">
            Update Order #{order.id} Status
          </h3>
          <p className="mb-4">
            Current Status:{" "}
            <span className="font-semibold">{order.status}</span>
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleStatusChange(order.id, "processing")}
              disabled={order.status === "processing"}
              className={`p-4 rounded-lg text-center ${
                order.status === "processing"
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-yellow-500 hover:bg-yellow-400 text-white"
              }`}
            >
              <span className="font-semibold">Mark as Processing</span>
            </button>
            <button
              onClick={() => handleStatusChange(order.id, "ready")}
              disabled={order.status === "ready"}
              className={`p-4 rounded-lg text-center ${
                order.status === "ready"
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-green-500 hover:bg-green-400 text-white"
              }`}
            >
              <span className="font-semibold">Mark as Ready</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-gray-500 hover:bg-gray-400 text-white py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 flex flex-col gap-2 min-h-screen p-2 md:p-4 text-white">
  <div className="bg-gray-900 flex-1 rounded-lg p-4 md:p-6 text-gray-200 transition-all duration-300 overflow-auto">
        <h2 className="text-2xl font-bold text-white text-center">Kitchen Order List</h2>
        <div className="flex flex-row gap-4 mb-4 justify-end">
          <Link
            to="/kitchencompleteorders"
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <CheckCircle size={18} /> Completed Orders
          </Link>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md text-white ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-4 p-4 bg-gray-800 shadow-md rounded-md flex flex-wrap gap-3">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by ID, Customer Name, or Staff Name"
            className="border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 text-sm flex-1 min-w-[150px]"
          />
          <select
            name="order_type"
            value={filters.order_type}
            onChange={handleFilterChange}
            className="border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 text-sm flex-1 min-w-[150px]"
          >
            <option value="">All Order Types</option>
            <option value="dine-in">Dine-In</option>
            <option value="takeout">Takeout</option>
          </select>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 text-sm flex-1 min-w-[150px]"
          />
          <select
            name="payment_method"
            value={filters.payment_method}
            onChange={handleFilterChange}
            className="border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 text-sm flex-1 min-w-[150px]"
          >
            <option value="">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
          <button
            onClick={handleClearFilters}
            className="bg-red-500 text-white text-sm py-2 px-4 rounded hover:bg-red-400"
          >
            Clear Filters
          </button>
        </div>

        {/* Table Section */}
        {error && <div className="text-center text-red-500">{error}</div>}
        <div className="bg-gray-800 shadow-md rounded-md w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-base">
              <thead className="bg-gray-700 text-white">
                <tr>
                  {[
                    "ID",
                    "Order Type",
                    "Order",
                    "Customer",
                    "Staff",
                    "Discount Type",
                    "Value",
                    "Amount",
                    "Final Price",
                    "Payment",
                    "Paid",
                    "Change",
                    "Status",
                    "Created At",
                    "Actions",
                  ].map((header) => (
                    <th key={header} className="p-1 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700">
                    <td className="p-2">{order.id}</td>
                    <td className="p-2">{order.order_type}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleViewOrderDetails(order.id)}
                        className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded text-sm"
                      >
                        View
                      </button>
                    </td>
                    <td className="p-2">{order.customer_name || "N/A"}</td>
                    <td className="p-2">{order.staff_name || "N/A"}</td>
                    <td className="p-2">{order.discount_type || "None"}</td>
                    <td className="p-2">₱{order.discount_value || "0.00"}</td>
                    <td className="p-2">₱{order.discount_amount || "0.00"}</td>
                    <td className="p-2">₱{order.final_price}</td>
                    <td className="p-2">{order.payment_method}</td>
                    <td className="p-2">₱{order.amount_paid}</td>
                    <td className="p-2">₱{order.change}</td>
                    <td className="p-2">{order.status}</td>
                    <td className="p-2">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="p-2">
                      <button
                        onClick={() => setStatusModalOrderId(order.id)}
                        className="bg-yellow-500 hover:bg-yellow-400 text-white px-2 py-1 rounded text-sm"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

          {/* Pagination Controls */}
          {totalOrders > itemsPerPage && ( // Only show pagination if totalOrders exceeds itemsPerPage
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-400"
              }`}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-400"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Modal for Order Details */}
        {selectedOrder && (
          <OrderModal
            selectedOrder={selectedOrder}
            handleCloseModal={handleCloseModal}
          />
        )}

        {/* Status Update Modal */}
        {statusModalOrderId && (
          <StatusModal
            order={orders.find((o) => o.id === statusModalOrderId)}
            onClose={() => setStatusModalOrderId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default OrderList;
