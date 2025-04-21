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

function StaffOrdersDashboard() {
  const [ordersData, setOrdersData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [leastSellingProducts, setLeastSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = Array.from(
    { length: new Date().getFullYear() - 2019 + 1 },
    (_, i) => 2020 + i
  );

  const navigate = useNavigate();

  const fetchOrdersData = useCallback(() => {
    setLoading(true);
    setError(null);

    const startDate = `${selectedYear}-01-01`;
    const endDate = `${selectedYear}-12-31`;

    axiosInstance
      .get(`/analytics/orders?start_date=${startDate}&end_date=${endDate}&interval=monthly`)
      .then((response) => {
        setOrdersData(response.data.data.orders_over_time || []);
        setTopSellingProducts(response.data.data.top_selling_products || []);
        setLeastSellingProducts(response.data.data.least_selling_products || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders data:", error);
        setError("Failed to load orders data. Please try again later.");
        setLoading(false);
      });
  }, [selectedYear]);

  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  const ordersChartData = {
    labels: ordersData.map((data) => {
      const monthIndex = parseInt(data.date.split("-")[1]) - 1;
      return new Date(selectedYear, monthIndex).toLocaleString("default", { month: "short" });
    }),
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
    maintainAspectRatio: true, // Ensure aspect ratio is respected
    aspectRatio: 4, // Increase aspect ratio to make the chart shorter (default is 2)
    plugins: {
      legend: {
        display: false, // Hide legend as it’s not in the image
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
          onClick={() => navigate("/dashboard")}
          className="bg-blue-500 px-4 py-2 rounded flex items-center mb-4"
        >
          <ArrowLeftCircle className="mr-2" /> Back
        </button>
        <div className="flex items-center">
          <h2 className="text-3xl font-semibold">Order</h2>
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

      <div className="flex flex-col gap-6">
        {/* Order Overview (Bar Chart) - Full Width */}
        <div className="bg-gray-700 p-4 rounded-lg">
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
          <div className="bg-gray-700 p-4 rounded-lg">
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
          <div className="bg-gray-700 p-4 rounded-lg">
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
    </div>
  );
}

export default StaffOrdersDashboard;