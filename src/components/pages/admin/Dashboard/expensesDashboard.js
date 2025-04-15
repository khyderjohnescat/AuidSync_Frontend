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
import { FaUtensils, FaLightbulb, FaCoffee, FaTools, FaQuestion } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ExpensesDashboard() {
  const [expensesData, setExpensesData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [totalExpensesThisMonth, setTotalExpensesThisMonth] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = Array.from(
    { length: new Date().getFullYear() - 2019 + 1 },
    (_, i) => 2020 + i
  );

  const fetchExpensesData = useCallback(() => {
    setLoading(true);
    setError(null);

    const startDate = `${selectedYear}-01-01`;
    const endDate = `${selectedYear}-12-31`;

    axiosInstance
      .get(`/analytics/expenses?start_date=${startDate}&end_date=${endDate}&interval=monthly`)
      .then((response) => {
        setExpensesData(response.data.data.expenses_over_time || []);
        setExpenseCategories(response.data.data.expense_categories || []);
        setTotalExpensesThisMonth(response.data.data.total_expenses_this_month || "0.00");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching expenses data:", error);
        setError("Failed to load expenses data. Please try again later.");
        setLoading(false);
      });
  }, [selectedYear]);

  useEffect(() => {
    fetchExpensesData();
  }, [fetchExpensesData]);

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

  // Dynamically generate chart datasets based on expenseCategories
  const expensesChartData = {
    labels: expensesData.map((data) => {
      const monthIndex = parseInt(data.date.split("-")[1]) - 1;
      return new Date(selectedYear, monthIndex).toLocaleString("default", { month: "short" });
    }),
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

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  if (loading) {
    return <div className="bg-gray-800 min-h-screen p-6 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="bg-gray-800 min-h-screen p-6 text-white">{error}</div>;
  }

  return (
    <div className="bg-gray-800 min-h-screen p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-3xl font-semibold">Expenses</h2>
        </div>
        <div className="flex items-center">
          <label htmlFor="year-select" className="mr-2 text-lg">
            Select Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={handleYearChange}
            className="bg-gray-700 text-white p-2 rounded-lg"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-xl mb-4">Expenses Overview</h3>
        {expensesData.length > 0 && expenseCategories.length > 0 ? (
          <Line data={expensesChartData} options={chartOptions} />
        ) : (
          <p>No expenses data available for the selected period.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Total Expenses This Month</h3>
          <p className="text-sm text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold">₱{formatNumber(totalExpensesThisMonth)}</p>
        </div>
        {expenseCategories.map((category) => (
          <div key={category.name} className="bg-gray-700 p-4 rounded-lg">
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
    </div>
  );
}

export default ExpensesDashboard;