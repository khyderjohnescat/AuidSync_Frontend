/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import { ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../context/axiosInstance";

function DeletedProducts() {
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");


  // Fetch Deleted Products
  const fetchDeletedProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/products/deleted");
      console.log("Deleted Products:", response.data); // Debugging
      setDeletedProducts(response.data);
    } catch (error) {
      console.error(
        "Error fetching deleted products:",
        error.response?.data || error.message
      );
    }
  }, []);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/products/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error(
        "Error fetching categories:",
        error.response?.data || error.message
      );
    }
  }, []);

  useEffect(() => {
    fetchDeletedProducts();
    fetchCategories();
  }, [fetchDeletedProducts, fetchCategories]);

  const handleRestore = async (id) => {
    try {
      await axiosInstance.put(`/products/restore/${id}`);
      fetchDeletedProducts(); // Refresh list after restore
    } catch (error) {
      console.error(
        "Error restoring product:",
        error.response?.data || error.message
      );
    }
  };

  const filteredProducts = deletedProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const navigate = useNavigate();


  return (
    <div className="bg-gray-800 gap-2 flex flex-col h-screen p-2 text-white">
      <div className="p-6 bg-gray-900 text-white shadow-md rounded-lg min-h-full">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Archived Products</h2>
        <button
          onClick={() => navigate("/manageproduct")}
          className="bg-blue-500 px-4 py-2 rounded flex items-center"
        >
          <ArrowLeftCircle className="mr-2" /> Back
        </button>

        {/* Search */}
        <div className="flex items-center bg-gray-800 p-2 rounded mt-5">
          <FaSearch className="text-gray-400 mx-2" />
          <input
            type="text"
            placeholder="Search deleted products..."
            className="bg-transparent outline-none text-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Show a message if no deleted products exist */}
        {filteredProducts.length === 0 ? (
          <p className="text-gray-400 text-center mt-4">
            No deleted products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const imageUrl =
                product.image && product.image.startsWith("http")
                  ? product.image
                  : product.image?.includes("uploads/")
                    ? `http://localhost:5050/${product.image}`
                    : `http://localhost:5050/uploads/${product.image}`;

              return (
                <div
                  key={product.id}
                  className="bg-gray-800 p-4 rounded-lg shadow-md"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-400">
                    Category:{" "}
                    {categories.find((cat) => cat.id === product.category_id)
                      ?.name || "Unknown"}
                  </p>
                  <p className="text-green-400 font-bold">₱{product.price}</p>
                  <button
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => handleRestore(product.id)}
                  >
                    Restore
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeletedProducts;
