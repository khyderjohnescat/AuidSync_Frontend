import { useContext, useEffect, useState, useMemo } from "react";
import AuthContext from "../../context/AuthContext";
import { Bar, Pie, Line } from "react-chartjs-2";
import axiosInstance from "../../context/axiosInstance";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    TimeScale
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    TimeScale
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState({
        totalSales: 5000,
        totalOrders: 120,
        totalProfit: 2000,
        paymentTypes: { Cash: 60, Card: 40, GCash: 20 },
        popularOrders: [
            { name: "Iced Coffee", count: 50 },
            { name: "Milk Tea", count: 30 },
            { name: "Frappuccino", count: 20 }
        ],
        unpopularOrders: [
            { name: "Espresso", count: 5 },
            { name: "Americano", count: 8 }
        ],
        revenueTrends: [
            { date: "2024-03-01", revenue: 1000, profit: 400 },
            { date: "2024-03-02", revenue: 1500, profit: 600 },
            { date: "2024-03-03", revenue: 2500, profit: 1000 }
        ]
    });
    const [filter, setFilter] = useState("monthly");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                console.log("Fetching analytics for:", filter);
                const response = await axiosInstance.get(`/analytics?filter=${filter}`);
                setAnalytics(response.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            }
        };
        fetchAnalytics();
    }, [filter]);

    const paymentTypeData = useMemo(() => ({
        labels: Object.keys(analytics.paymentTypes),
        datasets: [{
            label: "Payment Methods",
            data: Object.values(analytics.paymentTypes),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        }]
    }), [analytics.paymentTypes]);

    const unpopularOrdersData = useMemo(() => ({
        labels: analytics.unpopularOrders.map(order => order.name),
        datasets: [{
            label: "Unpopular Orders",
            data: analytics.unpopularOrders.map(order => order.count),
            backgroundColor: ["#8E44AD", "#3498DB"],
        }]
    }), [analytics.unpopularOrders]);

    const profitChartData = useMemo(() => ({
        labels: analytics.revenueTrends.map(entry => entry.date),
        datasets: [{
            label: "Profit Trend",
            data: analytics.revenueTrends.map(entry => entry.profit),
            borderColor: "#27AE60",
            backgroundColor: "rgba(39, 174, 96, 0.2)",
            fill: true,
        }]
    }), [analytics.revenueTrends]);

    const popularOrdersData = useMemo(() => ({
        labels: analytics.popularOrders.map(order => order.name),
        datasets: [{
            label: "Most Ordered Products",
            data: analytics.popularOrders.map(order => order.count),
            backgroundColor: ["#E74C3C", "#F39C12", "#2ECC71"],
        }]
    }), [analytics.popularOrders]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.lastname || "User"}</h1>

            <div className="mb-4">
                <label className="mr-2 font-semibold">Filter:</label>
                <select
                    className="p-2 border rounded"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">Total Revenue ({filter})</h2>
                    <p className="text-3xl font-bold">₱{analytics.totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-green-600 text-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">Total Orders ({filter})</h2>
                    <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                </div>
                <div className="bg-purple-600 text-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">Total Profit ({filter})</h2>
                    <p className="text-3xl font-bold">₱{analytics.totalProfit.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 shadow-lg rounded-lg h-[300px]">
                    <h2 className="text-lg font-semibold mb-4">Most Ordered Products</h2>
                    <Bar
                        data={popularOrdersData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true
                        }}
                    />
                </div>
                <div className="bg-white p-6 shadow-lg rounded-lg h-[300px]">
                    <h2 className="text-lg font-semibold mb-4">Unpopular Products</h2>
                    <Bar
                        data={unpopularOrdersData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true
                        }}
                    />
                </div>
                <div className="bg-white p-6 shadow-lg rounded-lg h-[300px]">
                    <h2 className="text-lg font-semibold mb-4">Profit Trend</h2>
                    <Line
                        data={profitChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true
                        }}
                    />
                </div>
                <div className="bg-white p-6 shadow-lg rounded-lg h-[300px]">
                    <h2 className="text-lg font-semibold mb-4">Payment Types</h2>
                    <Pie
                        data={paymentTypeData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;