/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { ArrowLeftCircle } from "lucide-react";
import axiosInstance from "../../../context/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManageSupport() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("categories"); // Tabs: categories, articles, faqs
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category_id: "", type: "" }); // For articles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    title: "",
    content: "",
    type: "article",
    video_url: "",
    category_id: "",
    question: "",
    answer: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [useVideoUrl, setUseVideoUrl] = useState(true); // Toggle between URL and file upload

  // Map plural tab names to singular forms
  const tabSingularMap = {
    categories: "Category",
    articles: "Article",
    faqs: "FAQ",
  };

  // Fetch Support Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/support/categories");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch categories", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, []);

  // Fetch Support Articles
  const fetchArticles = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        ...(filters.category_id && { category_id: filters.category_id }),
        ...(filters.type && { type: filters.type }),
        ...(search && { search }),
      }).toString();
      const response = await axiosInstance.get(`/support/articles${queryParams ? `?${queryParams}` : ""}`);
      setArticles(response.data.data);
    } catch (error) {
      console.error("Error fetching articles:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch articles", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [filters, search]);

  // Fetch FAQs
  const fetchFAQs = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/support/faqs${search ? `?search=${search}` : ""}`);
      setFaqs(response.data.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch FAQs", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [search]);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
    fetchFAQs();
  }, [fetchCategories, fetchArticles, fetchFAQs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
        setError("Only mp4, webm, or ogg video files are allowed");
        setVideoFile(null);
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("Video file size must be less than 100MB");
        setVideoFile(null);
        return;
      }
      setVideoFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let endpoint, method, dataToSend;
      if (activeTab === "categories") {
        endpoint = editingId ? `/support/categories/${editingId}` : "/support/categories";
        method = editingId ? "PUT" : "POST";
        dataToSend = {
          name: formData.name.trim(),
          description: formData.description ? formData.description.trim() : null,
        };
        if (!dataToSend.name) {
          setError("Category name is required");
          setIsSubmitting(false);
          return;
        }
      } else if (activeTab === "articles") {
        endpoint = editingId ? `/support/articles/${editingId}` : "/support/articles";
        method = editingId ? "PUT" : "POST";

        if (!formData.title.trim()) {
          setError("Article title is required");
          setIsSubmitting(false);
          return;
        }
        if (!formData.content.trim()) {
          setError("Article content is required");
          setIsSubmitting(false);
          return;
        }
        if (formData.type === "video" && !useVideoUrl && !videoFile && !editingId) {
          setError("Video file is required for video type");
          setIsSubmitting(false);
          return;
        }
        if (formData.type === "video" && useVideoUrl && !formData.video_url.trim()) {
          setError("Video URL is required when using URL");
          setIsSubmitting(false);
          return;
        }

        dataToSend = new FormData();
        dataToSend.append("title", formData.title.trim());
        dataToSend.append("content", formData.content.trim());
        dataToSend.append("type", formData.type);
        if (formData.type === "video" && useVideoUrl) {
          dataToSend.append("video_url", formData.video_url.trim());
        } else if (formData.type === "video" && videoFile) {
          dataToSend.append("video", videoFile);
        }
        if (formData.category_id) {
          dataToSend.append("category_id", parseInt(formData.category_id));
        }
      } else if (activeTab === "faqs") {
        endpoint = editingId ? `/support/faqs/${editingId}` : "/support/faqs";
        method = editingId ? "PUT" : "POST";
        dataToSend = {
          question: formData.question.trim(),
          answer: formData.answer.trim(),
        };
        if (!dataToSend.question) {
          setError("Question is required");
          setIsSubmitting(false);
          return;
        }
        if (!dataToSend.answer) {
          setError("Answer is required");
          setIsSubmitting(false);
          return;
        }
      }

      const response = await axiosInstance({
        method,
        url: endpoint,
        data: dataToSend,
        headers: activeTab === "articles" && dataToSend instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
      });

      if (activeTab === "categories") {
        await fetchCategories();
      } else if (activeTab === "articles") {
        await fetchArticles();
      } else if (activeTab === "faqs") {
        await fetchFAQs();
      }

      toast.success(response.data.message, { position: "top-center", autoClose: 3000 });
      closeModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Error submitting ${tabSingularMap[activeTab].toLowerCase()}`;
      setError(errorMessage);
      console.error(`Error submitting ${activeTab}:`, error.response?.data || error.message);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    if (activeTab === "categories") {
      setFormData({
        name: item.name,
        description: item.description || "",
      });
    } else if (activeTab === "articles") {
      setFormData({
        title: item.title,
        content: item.content,
        type: item.type,
        video_url: item.video_url || "",
        category_id: item.category?.id ? item.category.id.toString() : "",
      });
      setUseVideoUrl(!!item.video_url); // Use URL if video_url exists
      setVideoFile(null);
    } else if (activeTab === "faqs") {
      setFormData({
        question: item.question,
        answer: item.answer,
      });
    }
    setEditingId(item.id);
    setIsModalOpen(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${tabSingularMap[activeTab].toLowerCase()}?`)) {
      try {
        const endpoint = `/support/${activeTab}/${id}`;
        const response = await axiosInstance.delete(endpoint);
        if (activeTab === "categories") {
          setCategories((prev) => prev.filter((item) => item.id !== id));
        } else if (activeTab === "articles") {
          setArticles((prev) => prev.filter((item) => item.id !== id));
        } else if (activeTab === "faqs") {
          setFaqs((prev) => prev.filter((item) => item.id !== id));
        }
        toast.success(response.data.message, { position: "top-center", autoClose: 3000 });
      } catch (error) {
        console.error(`Error deleting ${activeTab}:`, error.response?.data || error.message);
        toast.error(error.response?.data?.message || `Failed to delete ${tabSingularMap[activeTab].toLowerCase()}`, {
          position: "top-center",
          autoClose: 3000,
        });
      }
    }
  };

  const openModal = () => {
    setEditingId(null);
    if (activeTab === "categories") {
      setFormData({ name: "", description: "" });
    } else if (activeTab === "articles") {
      setFormData({ title: "", content: "", type: "article", video_url: "", category_id: "" });
      setVideoFile(null);
      setUseVideoUrl(true);
    } else if (activeTab === "faqs") {
      setFormData({ question: "", answer: "" });
    }
    setIsModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", description: "", title: "", content: "", type: "article", video_url: "", category_id: "", question: "", answer: "" });
    setVideoFile(null);
    setUseVideoUrl(true);
    setError("");
  };

  // Filter data based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.content.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-800 gap-2 flex flex-col h-screen p-2 text-white">
      <div className="p-6 bg-gray-900 rounded-lg text-white h-auto min-h-full">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Support Management</h2>

        {/* Button Group */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <div className="flex w-full justify-between">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-500 px-4 py-2 rounded flex items-center hover:bg-blue-600 transition duration-200"
            >
              <ArrowLeftCircle className="mr-2" /> Back
            </button>
            <button
              onClick={openModal}
              className="bg-green-500 px-4 py-2 rounded flex items-center hover:bg-green-600 transition duration-200"
            >
              <FaPlus className="mr-2" /> Add {tabSingularMap[activeTab]}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 ${activeTab === "categories" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"} hover:text-blue-300 transition duration-200`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-4 py-2 ${activeTab === "articles" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"} hover:text-blue-300 transition duration-200`}
          >
            Articles
          </button>
          <button
            onClick={() => setActiveTab("faqs")}
            className={`px-4 py-2 ${activeTab === "faqs" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"} hover:text-blue-300 transition duration-200`}
          >
            FAQs
          </button>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex items-center justify-between bg-gray-700 p-2 rounded mb-4">
          <div className="flex items-center w-2/3">
            <FaSearch className="text-gray-400 mx-2" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="bg-transparent outline-none text-white w-full px-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {activeTab === "articles" && (
            <div className="flex space-x-2 w-1/3">
              <select
                value={filters.category_id}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                className="bg-gray-700 p-2 rounded text-white w-1/2"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="bg-gray-700 p-2 rounded text-white w-1/2"
              >
                <option value="">All Types</option>
                <option value="article">Article</option>
                <option value="video">Video</option>
              </select>
            </div>
          )}
        </div>

        {/* Categories Table */}
        {activeTab === "categories" && (
          <div className="overflow-x-auto bg-gray-800 shadow-md rounded-md">
            <table className="min-w-full table-auto text-base">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
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
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
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
        )}

        {/* Articles Table */}
        {activeTab === "articles" && (
          <div className="overflow-x-auto bg-gray-800 shadow-md rounded-md">
            <table className="min-w-full table-auto text-base">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Content</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Video URL</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-3 text-center text-gray-400">
                      No articles found.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-700">
                      <td className="p-3">{article.id}</td>
                      <td className="p-3">{article.title}</td>
                      <td className="p-3">{article.content.slice(0, 50)}...</td>
                      <td className="p-3">{article.type}</td>
                      <td className="p-3">{article.video_url || "N/A"}</td>
                      <td className="p-3">{article.category?.name || "None"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(article)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
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
        )}

        {/* FAQs Table */}
        {activeTab === "faqs" && (
          <div className="overflow-x-auto bg-gray-800 shadow-md rounded-md">
            <table className="min-w-full table-auto text-base">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Question</th>
                  <th className="p-3 text-left">Answer</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFAQs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-400">
                      No FAQs found.
                    </td>
                  </tr>
                ) : (
                  filteredFAQs.map((faq) => (
                    <tr key={faq.id} className="hover:bg-gray-700">
                      <td className="p-3">{faq.id}</td>
                      <td className="p-3">{faq.question}</td>
                      <td className="p-3">{faq.answer.slice(0, 50)}...</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(faq)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
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
        )}

        {/* Modal for Create/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingId ? `Edit ${tabSingularMap[activeTab]}` : `Add New ${tabSingularMap[activeTab]}`}
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "categories" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Category Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Technical Support"
                        required
                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g., Support for technical issues"
                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                {activeTab === "articles" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Article Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., How to Reset Your Device"
                        required
                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Content
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="e.g., Follow these steps to reset..."
                        required
                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                      >
                        <option value="article">Article</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    {formData.type === "video" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Video Input Method
                        </label>
                        <div className="flex space-x-4 mb-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={useVideoUrl}
                              onChange={() => setUseVideoUrl(true)}
                              className="mr-2"
                            />
                            Use URL
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={!useVideoUrl}
                              onChange={() => setUseVideoUrl(false)}
                              className="mr-2"
                            />
                            Upload File
                          </label>
                        </div>
                        {useVideoUrl ? (
                          <input
                            type="text"
                            name="video_url"
                            value={formData.video_url}
                            onChange={handleChange}
                            placeholder="e.g., https://youtube.com/watch?v=..."
                            required
                            className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg"
                            onChange={handleFileChange}
                            required={!editingId || !formData.video_url}
                            className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                          />
                        )}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Category (Optional)
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">No Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {activeTab === "faqs" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        placeholder="e.g., How do I contact support?"
                        required
                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Answer
                      </label>
                      <textarea
                        name="answer"
                        value={formData.answer}
                        onChange={handleChange}
                        placeholder="e.g., You can contact support via..."
                        required
                        className="p-2 rounded bg-gray-700 w-full text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`mt-6 w-full text-white font-medium transition duration-200 rounded py-2 px-4 ${isSubmitting ? "bg-green-300" : "bg-green-500 hover:bg-green-600"}`}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : editingId
                    ? `Update ${tabSingularMap[activeTab]}`
                    : `Add ${tabSingularMap[activeTab]}`}
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
}

export default ManageSupport;