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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ProfitsDashboard() {
  const [profitData, setProfitData] = useState([]);
  const [totalProfitThisMonth, setTotalProfitThisMonth] = useState(0);
  const [highestProfit, setHighestProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  const years = Array.from(
    { length: new Date().getFullYear() - 2019 + 1 }, // Include current year
    (_, i) => 2020 + i
  );

  const navigate = useNavigate();

  const fetchProfitData = useCallback(() => {
    setLoading(true);
    setError(null);

    const startDate = new Date(Date.UTC(selectedYear, 0, 1)).toISOString().split("T")[0];
    const endDate = new Date(Date.UTC(selectedYear, 11, 31)).toISOString().split("T")[0];

    console.log("Fetching profits for:", { startDate, endDate });

    axiosInstance
      .get(`/analytics/profitsdash?start_date=${startDate}&end_date=${endDate}&interval=monthly`)
      .then((response) => {
        console.log("API response:", response.data);
        setProfitData(response.data.data.profit_overview || []);
        setTotalProfitThisMonth(response.data.data.total_profit_this_month || 0);
        setHighestProfit(response.data.data.highest_profit || 0);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profit data:", error);
        console.error("Error response:", error.response);
        console.error("Error message:", error.message);
        setError(
          error.response?.data?.message || "Failed to load profit data. Please try again later."
        );
        setLoading(false);
      });
  }, [selectedYear]);

  useEffect(() => {
    fetchProfitData();
  }, [fetchProfitData]);

  const profitChartData = {
    labels: profitData.map((data) => {
      const monthIndex = parseInt(data.date.split("-")[1]) - 1;
      return new Date(selectedYear, monthIndex).toLocaleString("default", { month: "short" });
    }),
    datasets: [
      {
        label: "Profit",
        data: profitData.map((data) => data.profit),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${(value / 1000).toFixed(0)}K`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
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
      <button
          onClick={() => navigate("/admindashboard")}
          className="bg-blue-500 px-4 py-2 rounded flex items-center mb-4"
        >
          <ArrowLeftCircle className="mr-2" /> Back
        </button>
        <div className="flex items-center">
          <h2 className="text-3xl font-semibold">Profits</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Overview */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Profit Overview</h3>
          {profitData.length > 0 ? (
            <Bar data={profitChartData} options={chartOptions} />
          ) : (
            <p>No profit data available for the selected period.</p>
          )}
        </div>

        {/* Total Profit This Month and Highest Profit */}
        <div className="space-y-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl mb-4">Total Profit</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Total Profit This Month</p>
                <p className="text-2xl font-bold">{formatNumber(totalProfitThisMonth)}</p>
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
                <p className="text-sm text-gray-400">Total Profit</p>
                <p className="text-2xl font-bold">{formatNumber(highestProfit)}</p>
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
    </div>
  );
}

export default ProfitsDashboard;