/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaPlus, FaTimes, FaTrash, FaTag, FaList } from "react-icons/fa";
import axiosInstance from "../../../context/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // Fetch Products with Discounts
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/products/");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
    }
  }, []);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/products/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
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

      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      if (editingId) {
        await axiosInstance.put(`/products/update/${editingId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully", { position: "top-center", autoClose: 3000 });
      } else {
        await axiosInstance.post("/products/", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product added successfully", { position: "top-center", autoClose: 3000 });
      }

      await fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Error submitting product:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to submit product", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      price: product.price ? String(product.price) : "",
      quantity: product.quantity ? String(product.quantity) : "",
      category_id: product.category_id ? String(product.category_id) : "",
      image: null,
      is_active: product.is_active !== undefined ? product.is_active : true,
    });

    setEditingId(product.id);
    setPreviewImage(
      product.image
        ? product.image.startsWith("http")
          ? product.image
          : `http://localhost:5050${product.image}`
        : ""
    );
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast.success("Product deleted successfully", { position: "top-center", autoClose: 3000 });
    } catch (error) {
      console.error("Error deleting product:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to delete product", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

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

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredProducts = products.filter((product) => {
    const productNameMatch = product.name.toLowerCase().includes(search.toLowerCase());
    const categoryName =
      categories.find((cat) => cat.id === product.category_id)?.name || "";
    const categoryMatch = categoryName.toLowerCase().includes(search.toLowerCase());
    const categoryFilter =
      selectedCategory === "All" || product.category_id === parseInt(selectedCategory, 10);
    return (productNameMatch || categoryMatch) && categoryFilter;
  });

  // Helper function to find active discount and calculate discounted price
  const getActiveDiscount = (product) => {
    if (!product.discounts || !Array.isArray(product.discounts)) return null;

    const now = new Date();
    const activeDiscount = product.discounts.find((discount) => {
      const startDate = new Date(discount.start_date);
      const endDate = discount.end_date ? new Date(discount.end_date) : null;
      return startDate <= now && (!endDate || endDate >= now);
    });

    if (!activeDiscount) return null;

    const price = Number(product.price);
    const discountValue = Number(activeDiscount.value);
    let discountedPrice;

    if (activeDiscount.type === "fixed") {
      discountedPrice = price - discountValue;
    } else if (activeDiscount.type === "percentage") {
      discountedPrice = price * (1 - discountValue / 100);
    }

    return {
      ...activeDiscount,
      discountedPrice: discountedPrice >= 0 ? discountedPrice : 0,
    };
  };

  // Helper function to get the correct image URL
  const getImageUrl = (image) => {
    if (!image) return "https://placehold.co/150"; // Fallback if no image
    return image.startsWith("http") ? image : `http://localhost:5050${image}`;
  };

  return (
    <div className="bg-gray-800 gap-2 flex flex-col h-screen p-2 text-white overflow-hidden">
      <div className="p-6 bg-gray-900 rounded-lg text-white h-auto min-h-full">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Product Management</h2>

        {/* Button Group */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
          <div className="flex gap-2">
            <button
              onClick={openModal}
              className="bg-green-500 px-2 py-2 rounded flex items-center"
            >
              <FaPlus className="mr-2" /> Add Product
            </button>
            <button
              onClick={() => navigate("/categories")}
              className="bg-blue-500 px-2 py-2 rounded flex items-center"
            >
              <FaList className="mr-2" /> Manage Categories
            </button>
            <button
              onClick={() => navigate("/discounts")}
              className="bg-purple-500 px-2 py-2 rounded flex items-center"
            >
              <FaTag className="mr-2" /> Manage Discounts
            </button>
          </div>
          <div className="p-2 rounded">
            <button
              onClick={() => navigate("/products/deleted")}
              className="bg-red-500 px-2 py-2 rounded flex items-center"
            >
              <FaTrash className="mr-2" /> Archived Products
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="flex justify-between items-center bg-gray-800 p-2 rounded mb-4">
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
        <div className="flex-1 overflow-y-auto p-2 flex-col h-screen" style={{ maxHeight: "67vh" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5  rounded-lg" style={{ maxHeight: "50vh" }}>
            {filteredProducts.map((product) => {
              const imageUrl = getImageUrl(product.image);
              const categoryName =
                categories.find((cat) => cat.id === product.category_id)?.name || "Unknown";
              const activeDiscount = getActiveDiscount(product);

              return (
                <div
                  key={product.id}
                  className="bg-gray-800 p-4 rounded-lg shadow-md relative"
                >
                  {activeDiscount && (
                    <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded flex items-center">
                      <FaTag className="mr-1" />
                      Discount: {activeDiscount.type === "fixed" ? `₱${activeDiscount.value}` : `${activeDiscount.value}%`}
                    </span>
                  )}
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                    onError={(e) => {
                      console.error(`Failed to load image for ${product.name}: ${imageUrl}`);
                      e.target.src = "https://placehold.co/150";
                    }}
                  />
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-400">{categoryName}</p>
                  <p className="text-green-400 font-bold">
                    {activeDiscount ? (
                      <>
                        <span className="line-through text-gray-500 mr-2">
                          ₱{Number(product.price).toFixed(2)}
                        </span>
                        ₱{Number(activeDiscount.discountedPrice).toFixed(2)}
                      </>
                    ) : (
                      `₱${Number(product.price).toFixed(2)}`
                    )}
                  </p>
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
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                  className="p-2 rounded bg-gray-700 w-full text-white"
                />
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
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  required
                  className="p-2 rounded bg-gray-700 w-full text-white"
                />
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Quantity"
                  required
                  className="p-2 rounded bg-gray-700 w-full text-white"
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt={formData.name || "Product Image"}
                    className="w-full h-40 object-cover rounded-md mb-3"
                    onError={(e) => {
                      console.error("Error loading preview image:", previewImage);
                      e.target.src = "https://placehold.co/150";
                    }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="p-2 rounded bg-gray-700 w-full text-white"
                />
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
      <ToastContainer />
    </div>
  );
}

export default ProductManager;