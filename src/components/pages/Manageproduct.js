/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import axiosInstance from "../../context/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";


function ProductManager() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category_id: "",
    image: "",
    is_active: 1,
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/products/");
      setProducts(response.data);
    } catch (error) {
      console.error(
        "Error fetching products:",
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
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      // Create object URL for previewing
      const previewImage = URL.createObjectURL(file);
      setPreviewImage(previewImage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("price", formData.price);
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("is_active", formData.is_active ? 1 : 0);

      // Append image only if it's a new file
      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      if (editingId) {
        await axiosInstance.put(
          `/products/update/${editingId}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axiosInstance.post("/products/", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await fetchProducts(); // Ensure products update after submission
      closeModal(); // Reset state and close modal
    } catch (error) {
      console.error(
        "Error submitting product:",
        error.response?.data || error.message
      );
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      price: product.price ? String(product.price) : "",
      quantity: product.quantity ? String(product.quantity) : "",
      category_id: product.category_id ? String(product.category_id) : "",
      image: null, // Reset image for edit
      is_active: product.is_active !== undefined ? product.is_active : true,
    });

    setEditingId(product.id);
    setPreviewImage(
      product.image?.startsWith("http")
        ? product.image
        : product.image?.includes("uploads/")
          ? `http://localhost:5050/${product.image.replace(/^\/+/, "")}`
          : product.image
            ? `http://localhost:5050/uploads/${product.image.replace(/^\/+/, "")}`
            : ""
    );


    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      console.error(
        "Error deleting product:",
        error.response?.data || error.message
      );
    }
  };

  // Open modal
  const openModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      quantity: "",
      category_id: "",
      image: null,
      is_active: true,
    });
    setPreviewImage("");
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const productNameMatch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryName =
      categories.find((cat) => cat.id === product.category_id)?.name || "";
    const categoryMatch = categoryName
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryFilter =
      selectedCategory === "All" ||
      product.category_id === parseInt(selectedCategory, 10);

    return (productNameMatch || categoryMatch) && categoryFilter;
  });

  return (
    <div className="bg-gray-800 gap-2 h-[500px] p-2 text-white">
      <div className="p-6 bg-gray-900 rounded-lg text-white h-auto min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-White text-center">Product Management</h2>

        {/* Button Group */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-3">
          <div className="flex gap-3 justify-start"> {/* Ensures left alignment */}
            <button
              onClick={openModal}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-sm px-5 py-2.5 rounded-lg shadow-md transition-all duration-200"
            >
              <Plus size={18} /> Add Product
            </button>
            <button
              onClick={() => navigate("/products/deleted")}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-sm px-5 py-2.5 rounded-lg shadow-md transition-all duration-200"
            >
              <Trash2 size={18} /> Archived Products
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="flex justify-between items-center bg-gray-800 p-2 rounded mb-4">
          {/* Search Input */}
          <div className="flex items-center bg-gray-700 p-2 rounded w-2/3">
            <FaSearch className="text-gray-400 mx-2" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent outline-none text-white w-full px-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="bg-gray-700 p-2 rounded text-white w-1/3 ml-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>



        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 rounded-lg">
          {filteredProducts.map((product) => {
            const imageUrl =
              product.image && product.image.startsWith("http")
                ? product.image
                : product.image?.includes("uploads/")
                  ? `http://localhost:5050/${product.image}`
                  : `http://localhost:5050/uploads/${product.image}`;

            const categoryName =
              categories.find((cat) => cat.id === product.category_id)?.name ||
              "Unknown";

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
                <p className="text-gray-400">{categoryName}</p>
                <p className="text-green-400 font-bold">₱{product.price}</p>
                <p className="text-gray-300">Stock: {product.quantity} pcs</p>
                <div className="mt-4 flex justify-between">
                  <button
                    className="bg-blue-500 px-3 py-1 rounded"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 px-3 py-1 rounded"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h3>
                <FaTimes
                  className="cursor-pointer text-gray-400 hover:text-white"
                  onClick={closeModal}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name */}
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                  className="p-2 rounded bg-gray-700 w-full text-white"
                />

                {/* Category */}
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="p-2 rounded bg-gray-700 w-full text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Price */}
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  required
                  className="p-2 rounded bg-gray-700 w-full text-white"
                />

                {/* Quantity */}
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Quantity"
                  required
                  className="p-2 rounded bg-gray-700 w-full text-white"
                />

                {/* Preview Image */}
                {previewImage && (
                  <img
                    src={previewImage}
                    alt={formData.name || "Product Image"}
                    className="w-full h-40 object-cover rounded-md mb-3"
                    onError={(e) => {
                      console.error("Error loading image:", previewImage);
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/150"; // Fallback image
                    }}
                  />
                )}

                {/* Upload New Image */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="p-2 rounded bg-gray-700 w-full text-white"
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="mt-4 bg-green-500 hover:bg-green-600 px-4 py-2 rounded w-full text-white"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductManager;
