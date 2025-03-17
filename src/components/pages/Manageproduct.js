import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import axiosInstance from "../../context/axiosInstance";
import { useNavigate } from "react-router-dom";


function ProductManager() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category_id: "",
        image: "",
        is_active: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch Products
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axiosInstance.put(`/products/update/${editingId}`, formData);
            } else {
                await axiosInstance.post("/products/", formData);
            }
            fetchProducts();
            closeModal();
        } catch (error) {
            console.error("Error submitting product:", error.response?.data || error.message);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price ? String(product.price) : "",
            quantity: product.quantity ? String(product.quantity) : "",
            category_id: product.category_id ? String(product.category_id) : "",
            image: product.image || "",
            is_active: product.is_active !== undefined ? product.is_active : true,
        });
        setEditingId(product.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/products/${id}`);
            setProducts((prev) => prev.filter((product) => product.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error.response?.data || error.message);
        }
    };

    const openModal = () => {
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            quantity: "",
            category_id: "",
            image: "",
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const filteredProducts = products.filter((product) => {
        const productNameMatch = product.name.toLowerCase().includes(search.toLowerCase());

        const categoryName = categories.find((cat) => cat.id === product.category_id)?.name || "";
        const categoryMatch = categoryName.toLowerCase().includes(search.toLowerCase());

        const categoryFilter = selectedCategory === "All" || product.category_id === parseInt(selectedCategory, 10);

        return (productNameMatch || categoryMatch) && categoryFilter;
    });

    return (
        <div className="p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 text-black">Product Management</h2>
    
            {/* Button Group */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <div className="flex gap-2">
                    <button onClick={openModal} className="bg-green-500 px-4 py-2 rounded flex items-center">
                        <FaPlus className="mr-2" /> Add Product
                    </button>
                    <button onClick={() => navigate("/products/deleted")} className="bg-red-500 px-4 py-2 rounded flex items-center">
                        <FaTrash className="mr-2" /> Deleted Products
                    </button>
                </div>
                <select
                    className="bg-gray-800 p-2 rounded text-white"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="All">All</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                    ))}
                </select>
            </div>
    
            {/* Search Bar */}
            <div className="flex items-center bg-gray-800 p-2 rounded mb-4">
                <FaSearch className="text-gray-400 mx-2" />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="bg-transparent outline-none text-white w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                    const imageUrl = product.image.startsWith("http")
                        ? product.image
                        : `https://your-api-url.com/uploads/${product.image}`;

                    const categoryName = categories.find((cat) => cat.id === product.category_id)?.name || "Unknown";

                    return (
                        <div key={product.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-40 object-cover rounded-md mb-3"
                                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                            />
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-gray-400">{categoryName}</p>
                            <p className="text-green-400 font-bold">₱{product.price}</p>
                            <p className="text-gray-300">Stock: {product.quantity} pcs</p>
                            <div className="mt-4 flex justify-between">
                                <button className="bg-blue-500 px-3 py-1 rounded" onClick={() => handleEdit(product)}>
                                    Edit
                                </button>
                                <button className="bg-red-500 px-3 py-1 rounded" onClick={() => handleDelete(product.id)}>
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
                    <div className="bg-gray-800 p-6 rounded-lg w-1/3">
                        <div className="flex justify-between">
                            <h3 className="text-lg font-semibold">{editingId ? "Edit Product" : "Add New Product"}</h3>
                            <FaTimes className="cursor-pointer" onClick={closeModal} />
                        </div>
                        <form onSubmit={handleSubmit} className="mt-4">
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="p-2 rounded bg-gray-700 w-full mb-2" />
                            <select name="category_id" value={formData.category_id} onChange={handleChange} required className="p-2 rounded bg-gray-700 w-full mb-2">
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" required className="p-2 rounded bg-gray-700 w-full mb-2" />
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required className="p-2 rounded bg-gray-700 w-full mb-2" />
                            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" className="p-2 rounded bg-gray-700 w-full mb-2" />
                            <button type="submit" className="mt-4 bg-green-500 px-4 py-2 rounded w-full">
                                {editingId ? "Update Product" : "Add Product"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductManager;
