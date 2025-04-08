import React, { useState, useEffect, useCallback } from "react";
import { Line, Bar } from "react-chartjs-2";
import { FaFilter, FaTimes } from "react-icons/fa";
import axiosInstance from "../../../context/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [productData, setProductData] = useState({
    best_selling: [],
    least_selling: [],
    sales_by_period: [],
  });
  const [filters, setFilters] = useState({
    start_date: "2025-03-01",
    end_date: "", // Changed default to empty string to make it nullable
    interval: "monthly",
    limit: 5,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const colorPalette = [
    "rgba(255, 99, 132, 0.5)", // Red
    "rgba(54, 162, 235, 0.5)", // Blue
    "rgba(255, 206, 86, 0.5)", // Yellow
    "rgba(75, 192, 192, 0.5)", // Teal
    "rgba(153, 102, 255, 0.5)", // Purple
    "rgba(255, 159, 64, 0.5)", // Orange
  ];

  const formatPeriodLabel = (period, interval) => {
    try {
      if (interval === "daily") {
        return new Date(period).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      } else if (interval === "weekly") {
        const year = period.substring(0, 4);
        const week = parseInt(period.substring(4), 10);
        const date = new Date(year, 0, 1 + (week - 1) * 7);
        const startOfWeek = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `Week ${week}, ${year} (${startOfWeek})`;
      } else if (interval === "monthly") {
        return new Date(`${period}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      } else if (interval === "yearly") {
        return period;
      }
      return period;
    } catch (error) {
      console.error(`Error formatting period ${period} for interval ${interval}:`, error);
      return period;
    }
  };

  const fetchSalesAnalytics = useCallback(async () => {
    setLoadingSales(true);
    try {
      const response = await axiosInstance.get("/analytics/sales", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date || undefined, // Pass undefined if end_date is empty
          interval: filters.interval,
        },
      });
      const { sales_by_period, total_sales } = response.data.data;
      setSalesData(sales_by_period);
      setTotalSales(total_sales);
      console.log("Sales data fetched:", sales_by_period, "Total sales:", total_sales);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch sales analytics.", {
        position: "top-center",
        autoClose: 3000,
      });
      setSalesData([]);
      setTotalSales(0);
    } finally {
      setLoadingSales(false);
    }
  }, [filters.start_date, filters.end_date, filters.interval]);

  const fetchProductAnalytics = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await axiosInstance.get("/analytics/products", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date || undefined, // Pass undefined if end_date is empty
          interval: filters.interval,
          limit: filters.limit,
        },
      });
      setProductData(response.data.data);
      console.log("Product data fetched:", response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch product analytics.", {
        position: "top-center",
        autoClose: 3000,
      });
      setProductData({ best_selling: [], least_selling: [], sales_by_period: [] });
    } finally {
      setLoadingProducts(false);
    }
  }, [filters.start_date, filters.end_date, filters.interval, filters.limit]);

  useEffect(() => {
    fetchSalesAnalytics();
    fetchProductAnalytics();
  }, [fetchSalesAnalytics, fetchProductAnalytics]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    // Only validate dates if both are provided
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
    // Allow apply if only start_date is provided or both are empty
    fetchSalesAnalytics();
    fetchProductAnalytics();
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      interval: "monthly",
      limit: 5,
    });
    fetchSalesAnalytics();
    fetchProductAnalytics();
    setIsFilterModalOpen(false);
  };

  const salesChartData = {
    labels: salesData.map((entry) => formatPeriodLabel(entry.period, filters.interval)),
    datasets: [
      {
        label: "Revenue (₱)",
        data: salesData.map((entry) => parseFloat(entry.total_sales)),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const productSalesChartData = () => {
    const periods = [...new Set(productData.sales_by_period.map((entry) => entry.period))];
    const products = [...new Set(productData.sales_by_period.map((entry) => entry.product_name))];
    const datasets = products.map((product, index) => {
      const data = periods.map((period) => {
        const entry = productData.sales_by_period.find(
          (e) => e.period === period && e.product_name === product
        );
        return entry ? parseFloat(entry.total_revenue) : 0;
      });
      return {
        label: product,
        data,
        backgroundColor: colorPalette[index % colorPalette.length],
        stack: "Revenue",
      };
    });

    return {
      labels: periods.map((period) => formatPeriodLabel(period, filters.interval)),
      datasets,
    };
  };

  return (
    <div className="bg-gray-800 min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto bg-gray-900 p-6 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-white">Accounting Dashboard</h2>
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

        {/* Overview Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-medium text-white mb-4">Financial Overview</h3>
          {loadingSales ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : (
            <div className="text-center">
              <p className="text-4xl font-bold text-green-400">₱{parseFloat(totalSales).toFixed(2)}</p>
              <p className="text-gray-400">Total Revenue</p>
            </div>
          )}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Trend Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-white mb-4">Revenue Trend</h3>
            {loadingSales ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : salesData.length === 0 ? (
              <p className="text-center text-gray-400">No revenue data available.</p>
            ) : (
              <div className="h-80">
                <Line
                  data={salesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top", labels: { color: "white" } },
                      title: { display: true, text: "Revenue Over Time", color: "white", font: { size: 16 } },
                    },
                    scales: {
                      x: { ticks: { color: "white" } },
                      y: { ticks: { color: "white" }, beginAtZero: true },
                    },
                  }}
                />
              </div>
            )}
          </div>

          {/* Product Sales Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-white mb-4">Product Revenue Breakdown</h3>
            {loadingProducts ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : productData.sales_by_period.length === 0 ? (
              <p className="text-center text-gray-400">No product revenue data available.</p>
            ) : (
              <div className="h-80">
                <Bar
                  data={productSalesChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top", labels: { color: "white" } },
                      title: { display: true, text: "Product Revenue Trends", color: "white", font: { size: 16 } },
                    },
                    scales: {
                      x: { stacked: true, ticks: { color: "white" } },
                      y: { stacked: true, ticks: { color: "white" }, beginAtZero: true },
                    },
                  }}
                />
              </div>
            )}
          </div>

          {/* Best-Selling Products */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-white mb-4">Top Revenue Products</h3>
            {loadingProducts ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : productData.best_selling.length === 0 ? (
              <p className="text-center text-gray-400">No data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-white">
                  <thead className="bg-gray-700 text-white">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Units Sold</th>
                      <th className="p-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productData.best_selling.map((product) => (
                      <tr key={product.product_id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-3">{product.product_name}</td>
                        <td className="p-3">{product.total_quantity}</td>
                        <td className="p-3 font-medium text-green-400">₱{parseFloat(product.total_revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Least-Selling Products */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-white mb-4">Low Revenue Products</h3>
            {loadingProducts ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : productData.least_selling.length === 0 ? (
              <p className="text-center text-gray-400">No data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-white">
                  <thead className="bg-gray-700 text-white">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Units Sold</th>
                      <th className="p-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productData.least_selling.map((product) => (
                      <tr key={product.product_id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-3">{product.product_name}</td>
                        <td className="p-3">{product.total_quantity}</td>
                        <td className="p-3 font-medium text-green-400">₱{parseFloat(product.total_revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Filter Analytics</h3>
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
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Product Limit</label>
                  <input
                    type="number"
                    name="limit"
                    value={filters.limit}
                    onChange={handleFilterChange}
                    min="1"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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