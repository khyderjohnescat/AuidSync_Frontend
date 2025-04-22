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

function ProfitsDashboard() {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date(); // Current date: Apr 22, 2025
  const defaultEndDate = currentDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD (2025-04-22)

  const [profitData, setProfitData] = useState([]);
  const [totalProfitThisMonth, setTotalProfitThisMonth] = useState("0.00");
  const [highestProfit, setHighestProfit] = useState("0.00");
  const [highestProfitMonth, setHighestProfitMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: `${currentYear}-01-01`,
    end_date: defaultEndDate, // Set to Apr 22, 2025
    interval: "monthly",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch profit data
  const fetchProfitData = useCallback(() => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get("/analytics/profitsdash", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date || undefined,
          interval: filters.interval,
        },
      })
      .then((response) => {
        console.log("API response:", response.data);
        const data = response.data.data;
        const profitOverview = data.profit_overview || [];
        setProfitData(profitOverview);
        setTotalProfitThisMonth(data.total_profit_this_month || "0.00");
        setHighestProfit(data.highest_profit || "0.00");
        setHighestProfitMonth(data.highest_profit_month || "");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profit data:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error message:", error.message);
        const errorMessage = error.response?.data?.message || "Failed to load profit data. Please try again later.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 3000,
        });
        setLoading(false);
      });
  }, [filters.start_date, filters.end_date, filters.interval]);

  useEffect(() => {
    fetchProfitData();
  }, [fetchProfitData]);

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

    fetchProfitData();
    setIsFilterModalOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      start_date: `${currentYear}-01-01`,
      end_date: defaultEndDate,
      interval: "monthly",
    });
    fetchProfitData();
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
        const monthNum = parseInt(month, 10) - 1; // Months are 0-based in JavaScript
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

  // Format highest profit period for display based on interval
  const formatHighestProfitMonth = (period, interval) => {
    if (!period) return "N/A";
    try {
      if (interval === "daily") {
        return new Date(period).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).toUpperCase();
      } else if (interval === "weekly") {
        const [year, week] = period.split("-");
        const yearNum = parseInt(year, 10);
        const weekNum = parseInt(week, 10);
        if (isNaN(yearNum) || isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
          return `WEEK ${weekNum}, ${year} (INVALID)`;
        }
        const firstDayOfYear = new Date(Date.UTC(yearNum, 0, 1));
        const daysOffset = firstDayOfYear.getUTCDay() === 0 ? -6 : 1 - firstDayOfYear.getUTCDay();
        const firstMonday = new Date(firstDayOfYear);
        firstMonday.setDate(firstDayOfYear.getDate() + daysOffset);
        const startOfWeek = new Date(firstMonday);
        startOfWeek.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
        const actualYear = startOfWeek.getUTCFullYear();
        return `WEEK ${weekNum}, ${actualYear}`.toUpperCase();
      } else if (interval === "monthly") {
        const [year, monthNum] = period.split("-");
        return new Date(year, monthNum - 1).toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase();
      } else if (interval === "yearly") {
        return period.toString().toUpperCase();
      }
      return "N/A";
    } catch (error) {
      console.error(`Error formatting highest profit period ${period} for interval ${interval}:`, error);
      return "N/A";
    }
  };

  const profitChartData = {
    labels: profitData.map((data) => formatPeriodLabel(data.date, filters.interval)),
    datasets: [
      {
        label: "Profit",
        data: profitData.map((data) => parseFloat(data.profit) || 0),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "white" },
      },
      title: {
        display: true,
        text: "Profit Overview",
        color: "white",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Profit: ₱${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
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
          text: "Profit (₱)",
          color: "white",
        },
      },
    },
    barPercentage: 0.8,
    categoryPercentage: 0.9,
  };

  const formatNumber = (number) => {
    return parseFloat(number || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Check if all profits are zero
  const allProfitsZero = profitData.every((data) => parseFloat(data.profit) === 0);

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
          <p>Loading profit data...</p>
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
            onClick={fetchProfitData}
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
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/admindashboard")}
          className="bg-blue-500 px-4 py-2 rounded flex items-center"
        >
          <ArrowLeftCircle className="mr-2" /> Back
        </button>
        <div className="flex items-center">
          <h2 className="text-3xl font-semibold">Profits Dashboard</h2>
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
        {/* Profit Overview - Full Width */}
        <div className="bg-gray-700 p-4 rounded-lg">
          {profitData.length > 0 && !allProfitsZero ? (
            <div className="h-80">
              <Bar data={profitChartData} options={chartOptions} />
            </div>
          ) : (
            <p className="text-center text-gray-400">No profit data available for the selected period.</p>
          )}
        </div>

        {/* Total Profit This Month and Highest Profit - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl mb-4">Total Profit This Month</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">April 2025 (up to Apr 22)</p>
                <p className="text-2xl font-bold text-red-400">₱{formatNumber(totalProfitThisMonth)}</p>
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
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl mb-4">Highest Profit</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">{formatHighestProfitMonth(highestProfitMonth, filters.interval)}</p>
                <p className="text-2xl font-bold text-red-400">₱{formatNumber(highestProfit)}</p>
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
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg w-full max-w-md">
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
  );
}

export default ProfitsDashboard;