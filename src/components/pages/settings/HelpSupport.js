import React, { useState, useEffect } from "react";
import { FaBook, FaVideo, FaUserShield, FaLock, FaTags, FaQuestionCircle } from "react-icons/fa";
import axiosInstance from "../../../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function HelpSupport() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: "", data: [] });
    const [articles, setArticles] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [popularArticles, setPopularArticles] = useState([]);
    const [search, setSearch] = useState("");

    // Helper function to extract YouTube video ID from URL
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // Fetch articles
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await axiosInstance.get("/support/articles");
                setArticles(response.data.data);
            } catch (error) {
                console.error("Error fetching articles:", error);
                toast.error("Failed to fetch articles", { position: "top-center", autoClose: 3000 });
            }
        };
        fetchArticles();
    }, []);

    // Fetch FAQs
    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const response = await axiosInstance.get("/support/faqs");
                setFaqs(response.data.data);
            } catch (error) {
                console.error("Error fetching FAQs:", error);
                toast.error("Failed to fetch FAQs", { position: "top-center", autoClose: 3000 });
            }
        };
        fetchFAQs();
    }, []);

    // Fetch popular articles
    useEffect(() => {
        const fetchPopularArticles = async () => {
            try {
                const response = await axiosInstance.get("/support/popular-articles");
                setPopularArticles(response.data.data);
            } catch (error) {
                console.error("Error fetching popular articles:", error);
                toast.error("Failed to fetch popular articles", { position: "top-center", autoClose: 3000 });
            }
        };
        fetchPopularArticles();
    }, []);

    // Filter articles by category name
    const getArticlesByCategory = (categoryName) => {
        return articles.filter((article) => article.category?.name.toLowerCase() === categoryName.toLowerCase());
    };

    // Filter video tutorials
    const getVideoTutorials = () => {
        return articles.filter((article) => article.type === "video");
    };

    // Open modal with dynamic content
    const openModal = (title, data) => {
        console.log(`Opening modal for ${title}:`, data);
        setModalContent({ title, data });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent({ title: "", data: [] });
    };

    return (
        <div className="bg-gray-900 min-h-screen p-6 shadow-md">
            <div className="bg-gray-900 shadow-md">
                {/* Header Section */}
                <div className="bg-gray-700 text-white p-6 rounded-lg shadow-md text-center">
                    <h1 className="text-4xl font-bold mb-4">Customer Support & Help</h1>
                    <p className="text-lg mb-4">Search for answers or explore the topics below to get help.</p>
                    <div className="max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search our knowledge base..."
                            className="w-full p-3 rounded-lg text-gray-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Help Topics Section */}
                <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() =>
                            openModal(
                                "Getting Started",
                                getArticlesByCategory("Getting Started").length > 0
                                    ? getArticlesByCategory("Getting Started")
                                    : [{ title: "Learn how to log in, navigate the dashboard, and access key features like orders, reports, and settings." }]
                            )
                        }
                    >
                        <FaBook className="text-blue-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">Getting Started</h3>
                        <p className="text-white">Learn how to log in and explore the dashboard.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() =>
                            openModal(
                                "Video Tutorials",
                                getVideoTutorials().length > 0
                                    ? getVideoTutorials()
                                    : [{
                                        title: "Step-by-step guides showing how to track sales, monitor expenses, and manage your kitchen orders.",
                                        content: "Step-by-step guides showing how to track sales, monitor expenses, and manage your kitchen orders."
                                    }]
                            )
                        }
                    >
                        <FaVideo className="text-red-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">Video Tutorials</h3>
                        <p className="text-white">Watch guides on tracking orders, sales, and more.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() =>
                            openModal(
                                "Account Management",
                                getArticlesByCategory("Account Management").length > 0
                                    ? getArticlesByCategory("Account Management")
                                    : [{ title: "Reset your password, update login credentials, and manage user roles." }]
                            )
                        }
                    >
                        <FaUserShield className="text-green-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">Account Management</h3>
                        <p className="text-white">Manage your login and profile settings.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() =>
                            openModal(
                                "Privacy & Terms",
                                getArticlesByCategory("Privacy & Terms").length > 0
                                    ? getArticlesByCategory("Privacy & Terms")
                                    : [{ title: "Learn about user data protection and the responsibilities of users under our system." }]
                            )
                        }
                    >
                        <FaLock className="text-yellow-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">Privacy & Terms</h3>
                        <p className="text-white">Understand our policies and terms of service.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() =>
                            openModal(
                                "System Features",
                                getArticlesByCategory("System Features").length > 0
                                    ? getArticlesByCategory("System Features")
                                    : [
                                        {
                                            title: "System Features",
                                            content: [
                                                "View real-time sales and profit metrics on the Admin Dashboard.",
                                                "Track and manage customer orders in the kitchen.",
                                                "Analyze expenses and generate financial reports.",
                                                "Monitor order status and mark them as completed.",
                                                "Easily manage login credentials with password reset functionality.",
                                            ],
                                        },
                                    ]
                            )
                        }
                    >
                        <FaTags className="text-purple-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">System Features</h3>
                        <p className="text-white">Explore features and how to use them effectively.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() =>
                            openModal(
                                "FAQs",
                                faqs.length > 0
                                    ? faqs
                                    : [{ title: "If you can't find what you're looking for, contact support or check FAQs for more insights." }]
                            )
                        }
                    >
                        <FaQuestionCircle className="text-teal-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">Can't find what you're looking for?</h3>
                        <p className="text-white">Contact support or explore FAQs.</p>
                    </div>
                </div>

                {/* Popular Articles Section */}
                <div className="max-w-6xl mx-auto mt-10">
                    <h2 className="text-2xl font-bold mb-6 text-white">Popular Articles</h2>
                    <ul className="bg-gray-700 p-6 rounded-lg shadow-md space-y-4">
                        {popularArticles.length > 0 ? (
                            popularArticles.map((article, index) => (
                                <li
                                    key={article.id}
                                    className="flex items-center space-x-4 cursor-pointer"
                                    onClick={() => openModal(article.title, [article])}
                                >
                                    <span className="text-white font-bold">{index + 1}.</span>
                                    <p className="text-white underline">{article.title}</p>
                                </li>
                            ))
                        ) : (
                            <li className="text-white">No popular articles available.</li>
                        )}
                    </ul>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4">{modalContent.title}</h3>
                            <ul>
                                {modalContent.data.map((item, index) => (
                                    <li key={index} className="mb-6">
                                        {modalContent.title === "FAQs" ? (
                                            <>
                                                <p className="text-gray-700 font-semibold">{item.question || item.title}</p>
                                                <p className="text-gray-700 mt-2">{item.answer}</p>
                                            </>
                                        ) : modalContent.title === "System Features" && item.content ? (
                                            <ul className="text-gray-700 list-disc list-inside">
                                                {item.content.map((feature, idx) => (
                                                    <li key={idx}>{feature}</li>
                                                ))}
                                            </ul>
                                        ) : modalContent.title === "Video Tutorials" ? (
                                            <>
                                                <p className="text-gray-700 font-semibold">{item.title}</p>
                                                <p className="text-gray-700 mt-2">
                                                    {item.content && item.content.length > 0
                                                        ? item.content.slice(0, 100) + "..."
                                                        : "No content available."}
                                                </p>
                                                {item.video_url && (
                                                    <div className="mt-4">
                                                        {getYouTubeVideoId(item.video_url) ? (
                                                            <div className="relative pb-[56.25%] h-0">
                                                                <iframe
                                                                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(item.video_url)}`}
                                                                    title={item.title}
                                                                    frameBorder="0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                                ></iframe>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-700 italic">Video preview not available.</p>
                                                        )}
                                                        <a
                                                            href={item.video_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 underline mt-2 inline-block"
                                                        >
                                                            {getYouTubeVideoId(item.video_url) ? "Watch on YouTube" : "Watch Video"}
                                                        </a>
                                                    </div>
                                                )}
                                                {index < modalContent.data.length - 1 && (
                                                    <hr className="my-6 border-gray-300" />
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-gray-700 font-semibold">{item.title}</p>
                                                <p className="text-gray-700 whitespace-pre-line mt-2">
                                                    {(item.content || item.title).slice(0, 100)}...
                                                </p>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

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
        </div>
    );
}

export default HelpSupport;