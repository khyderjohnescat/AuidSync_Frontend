import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:2000/api/products"; // Adjust API URL if needed

function ProductManager() {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
        image: ""
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Create or Update Product with Auth Token
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token"); // Ensure user is logged in

        try {
            if (editingId) {
                await axios.put(`${API_BASE_URL}/update/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(API_BASE_URL, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchProducts();
            setFormData({ name: "", description: "", price: "", quantity: "", category: "", image: "" });
            setEditingId(null);
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    // ✅ Edit Product
    const handleEdit = (product) => {
        setFormData(product);
        setEditingId(product.id);
    };

    // ✅ Soft Delete Product with Auth Token
    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");

        try {
            await axios.delete(`${API_BASE_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    // ✅ Restore Soft Deleted Product
    const handleRestore = async (id) => {
        const token = localStorage.getItem("token");

        try {
            await axios.put(`${API_BASE_URL}/restore/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProducts();
        } catch (error) {
            console.error("Error restoring product:", error);
        }
    };

    return (
        <div>
            <h2>Product Management</h2>

            {/* Product Form */}
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" required />
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required />
                <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" />
                <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" />
                <button type="submit">{editingId ? "Update Product" : "Add Product"}</button>
            </form>

            {/* Product List */}
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <strong>{product.name}</strong> - ${product.price} - {product.quantity} pcs
                        <button onClick={() => handleEdit(product)}>Edit</button>
                        <button onClick={() => handleDelete(product.id)}>Delete</button>
                        {product.deleted_at && <button onClick={() => handleRestore(product.id)}>Restore</button>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductManager;
