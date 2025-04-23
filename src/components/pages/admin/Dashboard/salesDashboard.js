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
import { FaFileExport, FaFilter, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SalesDashboard() {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date(); // Current date: Apr 22, 2025
  const defaultEndDate = currentDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD (2025-04-22)

  const [salesData, setSalesData] = useState([]);
  const [totalSalesThisMonth, setTotalSalesThisMonth] = useState(0);
  const [averageDailySales, setAverageDailySales] = useState(0);
  const [orderTypeBreakdown, setOrderTypeBreakdown] = useState({
    dine_in: 0,
    take_out: 0,
    delivery: 0,
  });
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState({
    cash: 0,
    credit_card: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: `${currentYear}-01-01`,
    end_date: defaultEndDate, // Set to Apr 22, 2025
    interval: "monthly",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchSalesData = useCallback(() => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get("/analytics/sales", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date || undefined,
          interval: filters.interval,
        },
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      .then((response) => {
        console.log("Sales data fetched:", response.data.data);
        setSalesData(response.data.data.sales_over_time || []);
        setTotalSalesThisMonth(response.data.data.total_sales_this_month || 0);
        setAverageDailySales(response.data.data.average_daily_sales || 0);
        setOrderTypeBreakdown(response.data.data.order_type_breakdown || {});
        setPaymentMethodBreakdown(response.data.data.payment_method_breakdown || {});
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to load sales data. Please try again later.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 3000,
        });
        setLoading(false);
      });
  }, [filters.start_date, filters.end_date, filters.interval]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

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

    fetchSalesData();
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      start_date: `${currentYear}-01-01`,
      end_date: defaultEndDate,
      interval: "monthly",
    });
    fetchSalesData();
    setIsFilterModalOpen(false);
  };

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

  const salesChartData = {
    labels: salesData.map((data) => formatPeriodLabel(data.date, filters.interval)),
    datasets: [
      {
        label: "Sales",
        data: salesData.map((data) => data.sales),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "white",
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "white",
          callback: (value) => `₱${(value / 1000).toFixed(0)}K`,
        },
        title: {
          display: true,
          text: "Amount (₱)",
          color: "white",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Sales: ₱${value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
  };

  const formatNumber = (number) => {
    return parseFloat(number).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
          <p>Loading sales data...</p>
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
            onClick={fetchSalesData}
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
          <h2 className="text-3xl font-semibold">Total Sales</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Sales Overview</h3>
          {salesData.length > 0 ? (
            <div className="h-96">
              <Bar data={salesChartData} options={chartOptions} />
            </div>
          ) : (
            <p>No sales data available for the selected period.</p>
          )}
        </div>

        <div className="space-y-6">
          <button className="w-full bg-teal-600 text-white py-2 rounded-lg flex items-center justify-center">
            <FaFileExport className="mr-2" /> Generate Report
          </button>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg mb-2 flex items-center">
              <span className="mr-2">🍽️</span> Dine-in Sales
            </h3>
            <p className="text-2xl font-bold">₱{formatNumber(orderTypeBreakdown.dine_in)}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg mb-2 flex items-center">
              <span className="mr-2">🛒</span> Take-out Sales
            </h3>
            <p className="text-2xl font-bold">₱{formatNumber(orderTypeBreakdown.take_out)}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Average Sales</h3>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-400">Total Sales This Month</p>
              <p className="text-2xl font-bold">₱{formatNumber(totalSalesThisMonth)}</p>
            </div>
            <div className="text-green-400">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-400">Average Daily Sales</p>
          <p className="text-2xl font-bold">₱{formatNumber(averageDailySales)}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg mb-2 flex items-center">
            <span className="mr-2">💵</span> Cash
          </h3>
          <p className="text-2xl font-bold">₱{formatNumber(paymentMethodBreakdown.cash)}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg mb-2 flex items-center">
            <span className="mr-2">💳</span> Credit Card
          </h3>
          <p className="text-2xl font-bold">₱{formatNumber(paymentMethodBreakdown.credit_card)}</p>
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

export default SalesDashboard;