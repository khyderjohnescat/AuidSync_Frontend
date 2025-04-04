/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { ArrowLeftCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import axiosInstance from "../../../context/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExpenseCategories = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const limit = 10;

    const { register, handleSubmit, reset, setValue } = useForm();

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get(
                `/expensescategory?page=${page}&limit=${limit}&search=${search}`
            );
            setCategories(res.data.categories);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Error fetching categories:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to fetch categories", {
                position: "top-center",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Handle form submission
    const onSubmit = async (data) => {
        try {
            const dataToSend = {
                name: data.name,
                description: data.description || null,
            };

            if (!dataToSend.name) {
                setError("Category name is required");
                return;
            }

            let response;
            if (editingId) {
                response = await axiosInstance.put(`/expensescategory/${editingId}`, dataToSend);
                toast.success(response.data.message || "Category updated successfully", {
                    position: "top-center",
                    autoClose: 3000,
                });
            } else {
                response = await axiosInstance.post("/expensescategory", dataToSend);
                toast.success(response.data.message || "Category added successfully", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }

            await fetchCategories();
            closeModal();
        } catch (error) {
            setError(error.response?.data?.message || "Error submitting category");
            console.error("Error submitting category:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to submit category", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    };

    // Handle edit
    const handleEdit = (category) => {
        setValue("name", category.name);
        setValue("description", category.description || "");
        setEditingId(category.id);
        setIsModalOpen(true);
        setError("");
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const response = await axiosInstance.delete(`/expensescategory/${id}`);
                await fetchCategories();
                toast.success(response.data.message || "Category deleted successfully", {
                    position: "top-center",
                    autoClose: 3000,
                });
            } catch (error) {
                console.error("Error deleting category:", error.response?.data || error.message);
                toast.error(error.response?.data?.message || "Failed to delete category", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        }
    };

    // Open modal for adding
    const openModal = () => {
        setEditingId(null);
        reset({ name: "", description: "" });
        setIsModalOpen(true);
        setError("");
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setError("");
    };

    // Filter categories based on search
    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-gray-800 gap-2 flex flex-col h-screen p-2 text-white">
            <div className="p-6 bg-gray-900 rounded-lg text-white h-auto min-h-full">
                <h2 className="text-2xl font-bold mb-4 text-white text-center">Expense Categories</h2>

                {/* Button Group */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                    <div className="flex w-full justify-between">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-blue-500 px-4 py-2 rounded flex items-center"
                        >
                            <ArrowLeftCircle className="mr-2" /> Back
                        </button>
                        <button
                            onClick={openModal}
                            className="bg-green-500 px-4 py-2 rounded flex items-center"
                        >
                            <FaPlus className="mr-2" /> Add Category
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex items-center bg-gray-700 p-2 rounded mb-4">
                    <FaSearch className="text-gray-400 mx-2" />
                    <input
                        type="text"
                        placeholder="Search categories by name..."
                        className="bg-transparent outline-none text-white w-full px-2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Categories Table */}
                <div className="overflow-x-auto bg-gray-800 shadow-md rounded-md">
                    <table className="min-w-full table-auto text-base">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                {["ID", "Name", "Description", "Actions"].map((header) => (
                                    <th key={header} className="p-3 text-left">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="p-3 text-center text-gray-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-3 text-center text-gray-400">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-700">
                                        <td className="p-3">{category.id}</td>
                                        <td className="p-3">{category.name}</td>
                                        <td className="p-3">{category.description || "N/A"}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded text-sm"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded text-sm"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Conditionally Rendered */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-between items-center">
                        <button
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            className="bg-gray-700 hoverV hover:bg-gray-600 px-4 py-2 rounded text-white disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            disabled={page >= totalPages || isLoading}
                            onClick={() => setPage((p) => p + 1)}
                            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Category Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-white">
                                    {editingId ? "Edit Category" : "Add New Category"}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-white p-2 rounded-full bg-gray-800"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-2 bg-red-600 text-white rounded text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Category Name
                                    </label>
                                    <input
                                        {...register("name")}
                                        required
                                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        {...register("description")}
                                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                                        rows="3"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="mt-6 bg-green-500 hover:bg-green-600 px-4 py-2 rounded w-full text-white font-medium transition duration-200"
                                >
                                    {editingId ? "Update Category" : "Add Category"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Container */}
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
    );
};

export default ExpenseCategories;