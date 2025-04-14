import React from "react";

function HelpSupport() {
  return (
    <div className="bg-gray-800 min-h-screen p-6 text-white">
      <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Help & Support</h1>

        {/* Introduction Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-gray-300">
            Welcome to the system! This guide will help you understand how to navigate and use the features effectively.
          </p>
        </section>

        {/* Navigation Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Navigation</h2>
          <ul className="list-disc list-inside text-gray-300">
            <li>
              <strong>Dashboard:</strong> View an overview of your data, including sales, expenses, and trends.
            </li>
            <li>
              <strong>Orders:</strong> Manage orders, including completed, cancelled, and pending orders.
            </li>
            <li>
              <strong>Expenses:</strong> Track and manage your expenses, including categories and payment statuses.
            </li>
            <li>
              <strong>Reports:</strong> Generate detailed reports for analysis.
            </li>
            <li>
              <strong>Settings:</strong> Customize system preferences and user profiles.
            </li>
          </ul>
        </section>

        {/* Features Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside text-gray-300">
            <li>
              <strong>Real-Time Updates:</strong> Get live updates on orders and sales.
            </li>
            <li>
              <strong>Search and Filters:</strong> Easily find data using search and advanced filters.
            </li>
            <li>
              <strong>Analytics:</strong> View charts and trends to make informed decisions.
            </li>
            <li>
              <strong>Notifications:</strong> Stay informed with system notifications.
            </li>
          </ul>
        </section>

        {/* FAQs Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions (FAQs)</h2>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white">How do I add a new order?</h3>
            <p className="text-gray-300">
              Navigate to the "Orders" section and click on the "Add Order" button. Fill in the required details and submit.
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white">How can I generate a report?</h3>
            <p className="text-gray-300">
              Go to the "Reports" section, select the type of report you need, and click "Generate Report."
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white">Who can I contact for support?</h3>
            <p className="text-gray-300">
              If you need further assistance, please contact our support team at <a href="mailto:support@example.com" className="text-blue-400">support@example.com</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HelpSupport;