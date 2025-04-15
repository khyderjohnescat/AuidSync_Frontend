import React, { useState } from "react";
import { FaBook, FaVideo, FaUserShield, FaLock, FaTags, FaQuestionCircle } from "react-icons/fa";

function HelpSupport() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");

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
                        />
                    </div>
                </div>

                {/* Help Topics Section */}
                <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() => openModal("Getting Started: Learn how to log in, navigate the dashboard, and access key features like orders, reports, and settings.")}
                    >
                        <FaBook className="text-blue-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">Getting Started</h3>
                        <p className="text-white">Learn how to log in and explore the dashboard.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() => openModal("Video Tutorials: Step-by-step guides showing how to track sales, monitor expenses, and manage your kitchen orders.")}
                    >
                        <FaVideo className="text-red-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">Video Tutorials</h3>
                        <p className="text-white">Watch guides on tracking orders, sales, and more.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() => openModal("Account Management: Reset your password, update login credentials, and manage user roles.")}
                    >
                        <FaUserShield className="text-green-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">Account Management</h3>
                        <p className="text-white">Manage your login and profile settings.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() => openModal("Privacy & Terms: Learn about user data protection and the responsibilities of users under our system.")}
                    >
                        <FaLock className="text-yellow-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">Privacy & Terms</h3>
                        <p className="text-white">Understand our policies and terms of service.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() => openModal("System Features: \n1. View real-time sales and profit metrics on the Admin Dashboard.\n2. Track and manage customer orders in the kitchen.\n3. Analyze expenses and generate financial reports.\n4. Monitor order status and mark them as completed.\n5. Easily manage login credentials with password reset functionality.")}
                    >
                        <FaTags className="text-purple-500 text-4xl mb-4 mx-auto" />
                        <h3 className="text-xl text-white font-semibold mb-2">System Features</h3>
                        <p className="text-white">Explore features and how to use them effectively.</p>
                    </div>
                    <div
                        className="bg-gray-700 p-6 rounded-lg shadow-md text-center cursor-pointer"
                        onClick={() => openModal("Miscellaneous: If you can't find what you're looking for, contact support or check FAQs for more insights.")}
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
    <li className="flex items-center space-x-4 cursor-pointer" onClick={() => openModal("How to log in and reset your password.")}>
      <span className="text-white font-bold">1.</span>
      <p className="text-white underline">How to log in and reset your password</p>
    </li>
    <li className="flex items-center space-x-4 cursor-pointer" onClick={() => openModal("Navigating the admin dashboard and viewing key performance metrics.")}>
      <span className="text-white font-bold">2.</span>
      <p className="text-white underline">Navigating the admin dashboard and viewing key performance metrics</p>
    </li>
    <li className="flex items-center space-x-4 cursor-pointer" onClick={() => openModal("Managing incoming and completed kitchen orders.")}>
      <span className="text-white font-bold">3.</span>
      <p className="text-white underline">Managing incoming and completed kitchen orders</p>
    </li>
    <li className="flex items-center space-x-4 cursor-pointer" onClick={() => openModal("Tracking your monthly sales, expenses, and profits.")}>
      <span className="text-white font-bold">4.</span>
      <p className="text-white underline">Tracking your monthly sales, expenses, and profits</p>
    </li>
    <li className="flex items-center space-x-4 cursor-pointer" onClick={() => openModal("Generating reports for decision making.")}>
      <span className="text-white font-bold">5.</span>
      <p className="text-white underline">Generating reports for decision making</p>
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
        </div>
    );
}

export default HelpSupport;
