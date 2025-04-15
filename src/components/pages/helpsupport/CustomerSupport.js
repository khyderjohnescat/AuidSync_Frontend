import React, { useState } from "react";
import { FaBook, FaVideo, FaUserShield, FaLock, FaTags, FaQuestionCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function CustomerSupport() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const navigate = useNavigate(); // Initialize navigate

    const openModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent("");
    };

    return (
        <div className="bg-gray-900 min-h-screen p-6 shadow-md">
            {/* Back to Login Button */}
            <button
                onClick={() => navigate("/")} // Navigate to the login page
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
                Return to Login
            </button>
            {/* Header Section */}
            <div className="bg-gray-700 text-white p-6 rounded-lg shadow-md text-center">
                <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
                <p className="text-lg mb-4">Find answers to common questions or explore the topics below.</p>
                <div className="max-w-2xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search our knowledge base..."
                        className="w-full p-3 rounded-lg text-gray-700"
                    />
                </div>
            </div>

            {/* Help Topics Section */}
            <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                    className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                    onClick={() => openModal("Getting Started: Learn how to sign up, log in, and navigate the platform.")}
                >
                    <FaBook className="text-blue-500 text-4xl mb-4 mx-auto" />
                    <h3 className="text-xl text-white font-semibold mb-2">Getting Started</h3>
                    <p className="text-white">Learn how to sign up, log in, and navigate the platform.</p>
                </div>
                <div
                    className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                    onClick={() => openModal("Video Tutorials: Watch step-by-step guides to learn the features.")}
                >
                    <FaVideo className="text-red-500 text-4xl mb-4 mx-auto" />
                    <h3 className="text-xl text-white font-semibold mb-2">Video Tutorials</h3>
                    <p className="text-white">Watch step-by-step guides to learn the features.</p>
                </div>
                <div
                    className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                    onClick={() => openModal("Account Management: Learn how to reset your password and manage your account.")}
                >
                    <FaUserShield className="text-green-500 text-4xl mb-4 mx-auto" />
                    <h3 className="text-xl text-white font-semibold mb-2">Account Management</h3>
                    <p className="text-white">Learn how to reset your password and manage your account.</p>
                </div>
                <div
                    className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                    onClick={() => openModal("Privacy & Terms: Understand our privacy policies and terms of use.")}
                >
                    <FaLock className="text-yellow-500 text-4xl mb-4 mx-auto" />
                    <h3 className="text-xl text-white font-semibold mb-2">Privacy & Terms</h3>
                    <p className="text-white">Understand our privacy policies and terms of use.</p>
                </div>
                <div
                    className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                    onClick={() => openModal("Features Overview: Explore the features and how to use them effectively.")}
                >
                    <FaTags className="text-purple-500 text-4xl mb-4 mx-auto" />
                    <h3 className="text-xl text-white font-semibold mb-2">Features Overview</h3>
                    <p className="text-white">Explore the features and how to use them effectively.</p>
                </div>
                <div
                    className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                    onClick={() => openModal("Miscellaneous: Find answers to other questions you may have.")}
                >
                    <FaQuestionCircle className="text-teal-500 text-4xl mb-4 mx-auto" />
                    <h3 className="text-xl text-white font-semibold mb-2">Miscellaneous</h3>
                    <p className="text-white">Find answers to other questions you may have.</p>
                </div>
            </div>

            {/* Popular Articles Section */}
            <div className="max-w-6xl mx-auto mt-10">
                <h2 className="text-2xl font-bold mb-6 text-white">Popular Articles</h2>
                <ul className="bg-gray-700 p-6 rounded-lg shadow-md space-y-4">
                    <li
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={() => openModal("How to sign up and create an account.")}
                    >
                        <span className="text-white font-bold">1.</span>
                        <p className="text-white underline">How to sign up and create an account</p>
                    </li>
                    <li
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={() => openModal("How to reset your password.")}
                    >
                        <span className="text-white font-bold">2.</span>
                        <p className="text-white underline">How to reset your password</p>
                    </li>
                    <li
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={() => openModal("How to navigate the platform.")}
                    >
                        <span className="text-white font-bold">3.</span>
                        <p className="text-white underline">How to navigate the platform</p>
                    </li>
                    <li
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={() => openModal("Understanding our privacy policies.")}
                    >
                        <span className="text-white font-bold">4.</span>
                        <p className="text-white underline">Understanding our privacy policies</p>
                    </li>
                    <li
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={() => openModal("How to contact customer support.")}
                    >
                        <span className="text-white font-bold">5.</span>
                        <p className="text-white underline">How to contact customer support</p>
                    </li>
                </ul>
            </div>



            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Details</h3>
                        <p className="text-gray-700 whitespace-pre-line">{modalContent}</p>
                        <button
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerSupport;