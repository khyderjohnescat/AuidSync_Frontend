import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axiosInstance from "../../../../context/axiosInstance";
import { FaUtensils, FaLightbulb, FaCoffee, FaTools, FaQuestion, FaFilter, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ExpensesDashboard() {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date(); // Current date: Apr 22, 2025
  const defaultEndDate = currentDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD (2025-04-22)

  const [expensesData, setExpensesData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [totalExpensesThisMonth, setTotalExpensesThisMonth] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: `${currentYear}-01-01`,
    end_date: defaultEndDate, // Set to Apr 22, 2025
    interval: "monthly",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch expenses data
  const fetchExpensesData = useCallback(() => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get("/analytics/expenses", {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date || undefined,
          interval: filters.interval,
        },
      })
      .then((response) => {
        setExpensesData(response.data.data.expenses_over_time || []);
        setExpenseCategories(response.data.data.expense_categories || []);
        setTotalExpensesThisMonth(response.data.data.total_expenses_this_month || "0.00");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching expenses data:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to load expenses data. Please try again later.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 3000,
        });
        setLoading(false);
      });
  }, [filters.start_date, filters.end_date, filters.interval]);

  useEffect(() => {
    fetchExpensesData();
  }, [fetchExpensesData]);

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

    fetchExpensesData();
    setIsFilterModalOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      start_date: `${currentYear}-01-01`,
      end_date: defaultEndDate,
      interval: "monthly",
    });
    fetchExpensesData();
    setIsFilterModalOpen(false);
  };

  // Define a color palette for categories
  const colorPalette = [
    { border: "rgba(255, 165, 0, 1)", background: "rgba(255, 165, 0, 0.2)" }, // Orange
    { border: "rgba(255, 99, 132, 1)", background: "rgba(255, 99, 132, 0.2)" }, // Red
    { border: "rgba(75, 192, 192, 1)", background: "rgba(75, 192, 192, 0.2)" }, // Cyan
    { border: "rgba(54, 162, 235, 1)", background: "rgba(54, 162, 235, 0.2)" }, // Blue
    { border: "rgba(255, 206, 86, 1)", background: "rgba(255, 206, 86, 0.2)" }, // Yellow
    { border: "rgba(153, 102, 255, 1)", background: "rgba(153, 102, 255, 0.2)" }, // Purple
    { border: "rgba(255, 159, 64, 1)", background: "rgba(255, 159, 64, 0.2)" }, // Light Orange
  ];

  // Define icon mapping for categories
  const iconMap = {
    "Food & Ingredients": <FaUtensils className="mr-2 text-orange-500" />,
    "Utilities": <FaLightbulb className="mr-2 text-red-500" />,
    "Beverages": <FaCoffee className="mr-2 text-cyan-500" />,
    "Equipment & Maintenance": <FaTools className="mr-2 text-blue-500" />,
    "Uncategorized": <FaQuestion className="mr-2 text-gray-500" />,
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

  // Dynamically generate chart datasets based on expenseCategories
  const expensesChartData = {
    labels: expensesData.map((data) => formatPeriodLabel(data.date, filters.interval)),
    datasets: expenseCategories.map((category, index) => {
      const colorIndex = index % colorPalette.length;
      return {
        label: category.name,
        data: expensesData.map((data) => parseFloat(data[category.name] || 0)),
        borderColor: colorPalette[colorIndex].border,
        backgroundColor: colorPalette[colorIndex].background,
        fill: false,
        tension: 0.1,
      };
    }),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { color: "white" },
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
          <p>Loading expenses data...</p>
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
            onClick={fetchExpensesData}
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
          <h2 className="text-3xl font-semibold">Expenses</h2>
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

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-xl mb-4">Expenses Overview</h3>
        {expensesData.length > 0 && expenseCategories.length > 0 ? (
          <Line data={expensesChartData} options={chartOptions} />
        ) : (
          <p>No expenses data available for the selected period.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Total Expenses This Month</h3>
          <p className="text-sm text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold">₱{formatNumber(totalExpensesThisMonth)}</p>
        </div>
        {expenseCategories.map((category) => (
          <div key={category.name} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              {iconMap[category.name] || <FaQuestion className="mr-2 text-gray-500" />}
              <h3 className="text-xl">{category.name}</h3>
            </div>
            <p className="text-2xl font-bold">
              ₱{formatNumber(category.amount)}
            </p>
          </div>
        ))}
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

export default ExpensesDashboard;