import { useEffect, useState } from "react";
import axiosInstance from "../../context/axiosInstance";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get("/orders"); // Should match Express route
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

    if (loading) return <p>Loading orders...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Order List</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Order Type</th>
                        <th>Customer Name</th>
                        <th>Staff Name</th>
                        <th>Discount Type</th>
                        <th>Discount Value</th>
                        <th>Discount Amount</th>
                        <th>Final Price</th>
                        <th>Payment Method</th>
                        <th>Amount Paid</th>
                        <th>Change</th>
                        <th>Status</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.order_type}</td>
                            <td>{order.customer_name || "N/A"}</td>
                            <td>{order.staff_name}</td>
                            <td>{order.discount_type}</td>
                            <td>{order.discount_value}</td>
                            <td>{order.discount_amount}</td>
                            <td>{order.final_price}</td>
                            <td>{order.payment_method}</td>
                            <td>{order.amount_paid}</td>
                            <td>{order.change}</td>
                            <td>{order.status}</td>
                            <td>{new Date(order.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderList;