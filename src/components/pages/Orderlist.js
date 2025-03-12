import { useState } from "react";
import { FaSearch } from "react-icons/fa";

const OrderList = () => {
    const [search, setSearch] = useState("");

    // Sample Orders (Replace with API data)
    const orders = [
        { id: 1, customer: "John Doe", items: "Burger, Fries", total: "$15.99", status: "Completed" },
        { id: 2, customer: "Jane Smith", items: "Pizza", total: "$12.50", status: "Pending" },
        { id: 3, customer: "Michael Lee", items: "Pasta, Coke", total: "$18.75", status: "Processing" },
        { id: 4, customer: "Emily Davis", items: "Salad, Water", total: "$9.99", status: "Completed" },
    ];

    // Filter orders based on search
    const filteredOrders = orders.filter(order =>
        order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.items.toLowerCase().includes(search.toLowerCase())
    );

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "bg-green-500";
            case "Pending":
                return "bg-yellow-500";
            case "Processing":
                return "bg-blue-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Order List</h2>

            {/* Search Bar */}
            <div className="flex items-center bg-gray-800 p-2 rounded mb-4">
                <FaSearch className="text-gray-400 mx-2" />
                <input 
                    type="text" 
                    placeholder="Search orders..." 
                    className="bg-transparent outline-none text-white w-full" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-700">
                    <thead>
                        <tr className="bg-gray-900 text-left">
                            <th className="p-3 border border-gray-700">Order ID</th>
                            <th className="p-3 border border-gray-700">Customer</th>
                            <th className="p-3 border border-gray-700">Items</th>
                            <th className="p-3 border border-gray-700">Total Price</th>
                            <th className="p-3 border border-gray-700">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id} className="bg-gray-800 hover:bg-gray-700 transition">
                                    <td className="p-3 border border-gray-700">{order.id}</td>
                                    <td className="p-3 border border-gray-700">{order.customer}</td>
                                    <td className="p-3 border border-gray-700">{order.items}</td>
                                    <td className="p-3 border border-gray-700">{order.total}</td>
                                    <td className="p-3 border border-gray-700">
                                        <span className={`text-white px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center p-4">No orders found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;
