import React, { useState, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { FaFilter, FaTimes } from "react-icons/fa";
import axiosInstance from "../../../context/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalyticsDashboard() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [overviewData, setOverviewData] = useState({
    total_sales: "0.00",
    total_profits: "0.00",
    total_expenses: "0.00",
    total_orders: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [filters, setFilters] = useState({
    start_date: `${currentYear}-01-01`,
    end_date: `${currentYear}-12-31`,
    interval: "monthly",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);

  // Fetch overview data
  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const response = await axiosInstance.get("/analytics/overview", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date || undefined,
          interval: "yearly",
        },
      });
      setOverviewData(response.data.data);
      console.log("Overview data fetched:", response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch overview statistics.", {
        position: "top-center",
        autoClose: 3000,
      });
      setOverviewData({
        total_sales: "0.00",
        total_profits: "0.00",
        total_expenses: "0.00",
        total_orders: 0,
      });
    } finally {
      setLoadingOverview(false);
    }
  }, [filters.start_date, filters.end_date]);

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    setLoadingChart(true);
    try {
      const response = await axiosInstance.get("/analytics/statistics", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date || undefined,
          interval: filters.interval,
        },
      });
      setChartData(response.data.data.chart_data);
      console.log("Chart data fetched:", response.data.data.chart_data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch chart data.", {
        position: "top-center",
        autoClose: 3000,
      });
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, [filters.start_date, filters.end_date, filters.interval]);

  useEffect(() => {
    fetchOverview();
    fetchChartData();
  }, [fetchOverview, fetchChartData]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    if (filters.start_date && filters.end_date) {
      const start = new Date(filters.start_date);
      const end = new Date(filters.end_date);
      if (start > end) {
        toast.error("Start date must be before end date.", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
    }
    fetchOverview();
    fetchChartData();
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      start_date: `${currentYear}-01-01`,
      end_date: `${currentYear}-12-31`,
      interval: "monthly",
    });
    fetchOverview();
    fetchChartData();
    setIsFilterModalOpen(false);
  };

  // Helper function to format period labels based on interval
  const formatPeriodLabel = (period, interval) => {
    try {
      if (interval === "daily") {
        return new Date(period).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      } else if (interval === "weekly") {
        const year = period.toString().substring(0, 4);
        const week = parseInt(period.toString().substring(4), 10);
        const date = new Date(year, 0, 1 + (week - 1) * 7);
        const startOfWeek = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `Week ${week}, ${year} (${startOfWeek})`;
      } else if (interval === "monthly") {
        const month = parseInt(period.split("-")[1], 10);
        return new Date(0, month - 1).toLocaleString("default", { month: "short" });
      } else if (interval === "yearly") {
        return period.toString();
      }
      return period.toString();
    } catch (error) {
      console.error(`Error formatting period ${period} for interval ${interval}:`, error);
      return period.toString();
    }
  };

  // Format chart data for the bar chart (Sales, Expenses, Profits, and Orders)
  const barChartData = {
    labels: chartData.map((entry) => formatPeriodLabel(entry.period, filters.interval)),
    datasets: [
      {
        label: "Sales",
        data: chartData.map((entry) => parseFloat(entry.total_sales)),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Expenses",
        data: chartData.map((entry) => parseFloat(entry.total_expenses)),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Profits",
        data: chartData.map((entry) => parseFloat(entry.total_profits)),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Orders",
        data: chartData.map((entry) => entry.total_orders),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
        yAxisID: "y-orders",
      },
    ],
  };

  return (
    <div className="bg-gray-800 min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto bg-gray-900 p-6 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-white">Overview Statistic</h2>
          <h2 className="text-3xl font-semibold text-white">Dashboard</h2>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition duration-200"
            >
              <ArrowLeftCircle className="mr-2 w-5 h-5" /> Back
            </button>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition duration-200"
            >
              <FaFilter className="mr-2 w-5 h-5" /> Filters
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-medium text-white mb-4">Statistic</h3>
          {loadingChart ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : chartData.length === 0 ? (
            <p className="text-center text-gray-400">No data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="h-80 min-w-[800px]">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top", labels: { color: "white" } },
                      title: { display: false },
                    },
                    scales: {
                      x: { ticks: { color: "white", autoSkip: true, maxRotation: 45, minRotation: 45 } },
                      y: {
                        type: "linear",
                        position: "left",
                        ticks: { color: "white" },
                        beginAtZero: true,
                        title: { display: true, text: "Amount (₱)", color: "white" },
                      },
                      "y-orders": {
                        type: "linear",
                        position: "right",
                        ticks: { color: "white" },
                        beginAtZero: true,
                        title: { display: true, text: "Number of Orders", color: "white" },
                        grid: { drawOnChartArea: false },
                      },
                    },
                    barPercentage: 0.8,
                    categoryPercentage: 0.9,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/sales-dashboard" className="block">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center hover:bg-gray-700 cursor-pointer transition duration-200">
              <h3 className="text-lg font-medium text-white mb-2">Total Sales</h3>
              {loadingOverview ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-green-400">
                  ₱{parseFloat(overviewData.total_sales).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </Link>
          <Link to="/profits-dashboard" className="block">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center hover:bg-gray-700 cursor-pointer transition duration-200">
              <h3 className="text-lg font-medium text-white mb-2">Total Profits</h3>
              {loadingOverview ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-red-400">
                  ₱{parseFloat(overviewData.total_profits).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </Link>
          <Link to="/expenses-dashboard" className="block">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center hover:bg-gray-700 cursor-pointer transition duration-200">
              <h3 className="text-lg font-medium text-white mb-2">Total Expenses</h3>
              {loadingOverview ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-blue-400">
                  ₱{parseFloat(overviewData.total_expenses).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </Link>
          <Link to="/orders-dashboard" className="block">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center hover:bg-gray-700 cursor-pointer transition duration-200">
              <h3 className="text-lg font-medium text-white mb-2">Total Orders</h3>
              {loadingOverview ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-yellow-400">
                  {overviewData.total_orders.toLocaleString("en-US")}
                </p>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Filter Statistics</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave blank for no end date"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Interval</label>
                  <select
                    name="interval"
                    value={filters.interval}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Reset Filters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default AnalyticsDashboard;