import React, { useState, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axiosInstance from "../../../../context/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";
import { FaFilter, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function OrdersDashboard() {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date(); // Current date: Apr 22, 2025
  const defaultEndDate = currentDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD (2025-04-22)

  const [ordersData, setOrdersData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [leastSellingProducts, setLeastSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: `${currentYear}-01-01`,
    end_date: defaultEndDate, // Set to Apr 22, 2025
    interval: "monthly",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch orders data
  const fetchOrdersData = useCallback(() => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get("/analytics/orders", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date || undefined,
          interval: filters.interval,
        },
      })
      .then((response) => {
        setOrdersData(response.data.data.orders_over_time || []);
        setTopSellingProducts(response.data.data.top_selling_products || []);
        setLeastSellingProducts(response.data.data.least_selling_products || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders data:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to load orders data. Please try again later.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 3000,
        });
        setLoading(false);
      });
  }, [filters.start_date, filters.end_date, filters.interval]);

  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters with validation
  const applyFilters = () => {
    const start = new Date(filters.start_date);
    const end = new Date(filters.end_date);
    const today = new Date(defaultEndDate); // Apr 22, 2025

    if (filters.start_date && filters.end_date) {
      if (start > end) {
        toast.error("Start date must be before end date.", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
      if (end > today) {
        toast.error("End date cannot be in the future.", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
    }

    fetchOrdersData();
    setIsFilterModalOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      start_date: `${currentYear}-01-01`,
      end_date: defaultEndDate,
      interval: "monthly",
    });
    fetchOrdersData();
    setIsFilterModalOpen(false);
  };

  // Format chart labels based on interval
  const formatPeriodLabel = (period, interval) => {
    try {
      if (interval === "daily") {
        return new Date(period).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else if (interval === "weekly") {
        const [year, week] = period.split("-");
        const yearNum = parseInt(year, 10);
        const weekNum = parseInt(week, 10);
        if (isNaN(yearNum) || isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
          return `Week ${weekNum}, ${year} (Invalid)`;
        }
        const firstDayOfYear = new Date(Date.UTC(yearNum, 0, 1));
        const daysOffset = firstDayOfYear.getUTCDay() === 0 ? -6 : 1 - firstDayOfYear.getUTCDay();
        const firstMonday = new Date(firstDayOfYear);
        firstMonday.setDate(firstDayOfYear.getDate() + daysOffset);
        const startOfWeek = new Date(firstMonday);
        startOfWeek.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
        const actualYear = startOfWeek.getUTCFullYear();
        const formattedStart = startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `Week ${weekNum}, ${actualYear} (${formattedStart})`;
      } else if (interval === "monthly") {
        const [year, month] = period.split("-");
        const monthNum = parseInt(month, 10) - 1;
        return new Date(year, monthNum).toLocaleString("en-US", { month: "short", year: "numeric" });
      } else if (interval === "yearly") {
        return period.toString();
      }
      return period.toString();
    } catch (error) {
      console.error(`Error formatting period ${period} for interval ${interval}:`, error);
      return period.toString();
    }
  };

  const ordersChartData = {
    labels: ordersData.map((data) => formatPeriodLabel(data.date, filters.interval)),
    datasets: [
      {
        label: "Orders",
        data: ordersData.map((data) => data.orders),
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Cyan, matching the image
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 4,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "white" },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "white",
          callback: (value) => `${(value / 1000).toFixed(0)}K`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-gray-800 min-h-screen p-6 text-white">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <p>Loading orders data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 min-h-screen p-6 text-white">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchOrdersData}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 min-h-screen p-6 text-white">
      <div className="bg-gray-900 min-h-screen p-6 text-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/admindashboard")}
          className="bg-blue-500 px-4 py-2 rounded flex items-center"
        >
          <ArrowLeftCircle className="mr-2" /> Back
        </button>
        <div className="flex items-center">
          <h2 className="text-3xl font-semibold">Order</h2>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition duration-200"
          >
            <FaFilter className="mr-2 w-5 h-5" /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Order Overview (Bar Chart) - Full Width */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Order Overview</h3>
          {ordersData.length > 0 ? (
            <Bar data={ordersChartData} options={chartOptions} />
          ) : (
            <p>No orders data available for the selected period.</p>
          )}
        </div>

        {/* Top-Selling and Least-Selling Products - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top-Selling Products */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl mb-4">Top-Selling Products</h3>
            {topSellingProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Qty Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map((product, index) => (
                      <tr key={index} className="border-t border-gray-600">
                        <td className="py-2">{product.product_name}</td>
                        <td className="py-2">{product.quantity_sold.toLocaleString("en-US")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No top-selling products data available.</p>
            )}
          </div>

          {/* Least-Selling Products */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl mb-4">Least-Selling Products</h3>
            {leastSellingProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Qty Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leastSellingProducts.map((product, index) => (
                      <tr key={index} className="border-t border-gray-600">
                        <td className="py-2">{product.product_name}</td>
                        <td className="py-2">{product.quantity_sold.toLocaleString("en-US")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No least-selling products data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Filters</h3>
              <button onClick={() => setIsFilterModalOpen(false)}>
                <FaTimes className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  max={defaultEndDate}
                  className="w-full p-2 rounded bg-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  max={defaultEndDate}
                  className="w-full p-2 rounded bg-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Interval</label>
                <select
                  name="interval"
                  value={filters.interval}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded bg-gray-600 text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={resetFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Apply
              </button>
            </div>
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
    </div>
  );
}

export default OrdersDashboard;