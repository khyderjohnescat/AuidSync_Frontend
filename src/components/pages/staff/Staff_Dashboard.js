import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import AuthContext from "../../../context/AuthContext";
import { Bar, Pie, Line } from "react-chartjs-2";
import axiosInstance from "../../../context/axiosInstance";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, TimeScale } from "chart.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, TimeScale);

const StaffDashboard = () => {
    const { user } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProfit: 0,
        paymentTypes: {},
        popularOrders: [],
        unpopularOrders: [],
        revenueTrends: [],
    });
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        interval: "monthly",
        limit: 5,
    });
    const [,setLoading] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch sales data
            const salesResponse = await axiosInstance.get("/analytics/sales", {
                params: {
                    start_date: filters.start_date,
                    end_date: filters.end_date || undefined,
                    interval: filters.interval,
                },
            });

            // Fetch product data
            const productResponse = await axiosInstance.get("/analytics/products", {
                params: {
                    start_date: filters.start_date,
                    end_date: filters.end_date || undefined,
                    interval: filters.interval,
                    limit: filters.limit,
                },
            });

            const salesData = salesResponse.data.data;
            const productData = productResponse.data.data;

            setAnalytics({
                totalSales: parseFloat(salesData.total_sales),
                revenueTrends: salesData.sales_by_period,
                popularOrders: productData.best_selling,
                unpopularOrders: productData.least_selling,
                paymentTypes: {}, // Add payment types if available in the backend
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch analytics.", {
                position: "top-center",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const paymentTypeData = useMemo(() => ({
        labels: Object.keys(analytics.paymentTypes),
        datasets: [
            {
                label: "Payment Methods",
                data: Object.values(analytics.paymentTypes),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
        ],
    }), [analytics.paymentTypes]);

    const unpopularOrdersData = useMemo(() => ({
        labels: analytics.unpopularOrders.map((order) => order.product_name),
        datasets: [
            {
                label: "Unpopular Orders",
                data: analytics.unpopularOrders.map((order) => order.total_quantity),
                backgroundColor: ["#8E44AD", "#3498DB"],
            },
        ],
    }), [analytics.unpopularOrders]);

    const profitChartData = useMemo(() => ({
        labels: analytics.revenueTrends.map((entry) => entry.period),
        datasets: [
            {
                label: "Revenue Trend",
                data: analytics.revenueTrends.map((entry) => entry.total_sales),
                borderColor: "#27AE60",
                backgroundColor: "rgba(39, 174, 96, 0.2)",
                fill: true,
            },
        ],
    }), [analytics.revenueTrends]);

    const popularOrdersData = useMemo(() => ({
        labels: analytics.popularOrders.map((order) => order.product_name),
        datasets: [
            {
                label: "Most Ordered Products",
                data: analytics.popularOrders.map((order) => order.total_quantity),
                backgroundColor: ["#E74C3C", "#F39C12", "#2ECC71"],
            },
        ],
    }), [analytics.popularOrders]);

    return (
        <div className="bg-gray-800 gap-2 h-[500px] p-2 bg-gray-950 text-white">
            <div className="p-6 bg-gray-100 min-h-screen bg-gray-900 shadow-md rounded-lg">
                <h1 className="text-3xl font-bold text-white mb-5">Welcome, {user?.firstname || "User"}</h1>

                <div className="mb-4 flex justify-end">
                    <label className="mr-2 mt-2 font-semibold text-white">Filter:</label>
                    <select
                        name="interval"
                        className="p-2 border rounded text-black"
                        value={filters.interval}
                        onChange={handleFilterChange}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                    <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">Total Revenue ({filters.interval})</h2>
                        <p className="text-3xl font-bold">₱{analytics.totalSales.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 shadow-lg rounded-lg h-[300px]">
                        <h2 className="text-lg font-semibold mb-4">Most Ordered Products</h2>
                        <Bar
                            data={popularOrdersData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                            }}
                        />
                    </div>
                    <div className="bg-white p-6 shadow-lg rounded-lg h-[300px]">
                        <h2 className="text-lg font-semibold mb-4">Unpopular Products</h2>
                        <Bar
                            data={unpopularOrdersData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                            }}
                        />
                    </div>
                    <div className="bg-white p-6 shadow-lg rounded-lg h-[300px]">
                        <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
                        <Line
                            data={profitChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                            }}
                        />
                    </div>
                    <div className="bg-white p-6 shadow-lg rounded-lg h-[300px]">
                        <h2 className="text-lg font-semibold mb-4">Payment Types</h2>
                        <Pie
                            data={paymentTypeData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                            }}
                        />
                    </div>
                </div>
            </div>

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
};

export default StaffDashboard;