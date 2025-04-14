import React, { useState, useEffect } from "react";
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
import axiosInstance from "../../../context/axiosInstance";
import { FaFileExport } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SalesDashboard() {
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    const startDate = `${selectedYear}-01-01`;
    const endDate = `${selectedYear}-12-31`;

    axiosInstance
      .get(`/analytics/sales?start_date=${startDate}&end_date=${endDate}`)
      .then((response) => {
        setSalesData(response.data.data.sales_over_time || []);
        setTotalSalesThisMonth(response.data.data.total_sales_this_month || 0);
        setAverageDailySales(response.data.data.average_daily_sales || 0);
        setOrderTypeBreakdown(response.data.data.order_type_breakdown || {});
        setPaymentMethodBreakdown(response.data.data.payment_method_breakdown || {});
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
        setError("Failed to load sales data. Please try again later.");
        setLoading(false);
      });
  }, [selectedYear]); // Only selectedYear is a dependency

  const salesChartData = {
    labels: salesData.map((data) => {
      const monthIndex = parseInt(data.date.split("-")[1]) - 1;
      return new Date(selectedYear, monthIndex).toLocaleString("default", { month: "short" });
    }),
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
        <div className="flex items-center">
          <h2 className="text-3xl font-semibold">Total Sales</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview */}
        <div className="lg:col-span-2 bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Sales Overview</h3>
          {salesData.length > 0 ? (
            <Bar data={salesChartData} options={chartOptions} />
          ) : (
            <p>No sales data available for the selected period.</p>
          )}
        </div>

        {/* Right Column: Sales Breakdown */}
        <div className="space-y-6">
          <button className="w-full bg-teal-600 text-white py-2 rounded-lg flex items-center justify-center">
            <FaFileExport className="mr-2" />
            Generate Report
          </button>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg mb-2 flex items-center">
              <span className="mr-2">🍽️</span> Dine-in Sales
            </h3>
            <p className="text-2xl font-bold">{formatNumber(orderTypeBreakdown.dine_in)}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg mb-2 flex items-center">
              <span className="mr-2">🛒</span> Take-out Sales
            </h3>
            <p className="text-2xl font-bold">{formatNumber(orderTypeBreakdown.take_out)}</p>
          </div>

        </div>

        {/* Average Daily Sales and Total Sales This Month */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Average Daily Sales</h3>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-400">Total Sales This Month</p>
              <p className="text-2xl font-bold">{formatNumber(totalSalesThisMonth)}</p>
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
          <p className="text-2xl font-bold">{formatNumber(averageDailySales)}</p>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg mb-2 flex items-center">
            <span className="mr-2">💵</span> Cash
          </h3>
          <p className="text-2xl font-bold">{formatNumber(paymentMethodBreakdown.cash)}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg mb-2 flex items-center">
            <span className="mr-2">💳</span> Credit Card
          </h3>
          <p className="text-2xl font-bold">{formatNumber(paymentMethodBreakdown.credit_card)}</p>
        </div>
      </div>
    </div>
  );
}

export default SalesDashboard;