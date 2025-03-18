import { useEffect, useState } from "react";
import axiosInstance from "../../context/axiosInstance";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  if (loading) return <p className="text-center text-sm">Loading orders...</p>;
  if (error) return <p className="text-center text-red-600 text-sm">{error}</p>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-semibold text-center mb-4">Order List</h2>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-700 text-white">
            <tr>
              {[
                "ID",
                "Order Type",
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
                <th key={header} className="p-2 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-100">
                <td className="p-2">{order.id}</td>
                <td className="p-2">{order.order_type}</td>
                <td className="p-2">{order.customer_name || "N/A"}</td>
                <td className="p-2">{order.staff_name}</td>
                <td className="p-2">{order.discount_type}</td>
                <td className="p-2">{order.discount_value}</td>
                <td className="p-2">{order.discount_amount}</td>
                <td className="p-2">₱{order.final_price}</td>
                <td className="p-2">{order.payment_method}</td>
                <td className="p-2">₱{order.amount_paid}</td>
                <td className="p-2">₱{order.change}</td>
                <td className="p-2">{order.status}</td>
                <td className="p-2">{new Date(order.created_at).toLocaleString()}</td>
                <td className="p-2 text-center">
                  <button
                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-400"
                    onClick={() => handleViewOrderDetails(order.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-lg font-bold mb-3 border-b pb-2 text-gray-800">
              Order Details
            </h3>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <div>
                  <span className="font-medium text-gray-600">ID:</span> {selectedOrder.id}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Order Type:</span>{" "}
                  {selectedOrder.order_type}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Customer:</span>{" "}
                  {selectedOrder.customer_name || "N/A"}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Staff:</span>{" "}
                  {selectedOrder.staff_name}
                </div>
              </div>
              <div>
                <div>
                  <span className="font-medium text-gray-600">Final Price:</span>{" "}
                  ₱{selectedOrder.final_price}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Payment:</span>{" "}
                  {selectedOrder.payment_method}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Paid:</span> ₱{selectedOrder.amount_paid}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Change:</span> ₱{selectedOrder.change}
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <h4 className="text-sm font-semibold mb-2 border-b pb-1 text-gray-700">
              Ordered Items
            </h4>
            <div className="overflow-y-auto max-h-40">
              <table className="min-w-full table-auto text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border-b">Item</th>
                    <th className="p-2 border-b">Qty</th>
                    <th className="p-2 border-b">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                    selectedOrder.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2">{item.product?.name || "N/A"}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">₱{item.price}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center p-2">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Close Button */}
            <div className="mt-4">
              <button
                className="bg-red-500 text-white w-full py-2 rounded-md hover:bg-red-400"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
