import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../context/axiosInstance.js";

const AuditLogScreen = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [accountLogs, setAccountLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditPage, setAuditPage] = useState(1);
  const [accountPage, setAccountPage] = useState(1);
  const [auditPageInput, setAuditPageInput] = useState("");
  const [accountPageInput, setAccountPageInput] = useState("");
  const logsPerPage = 5;
  const maxVisiblePages = 5;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [auditResponse, accountResponse] = await Promise.all([
        axiosInstance.get("/audit/audit"),
        axiosInstance.get("/audit/account"),
      ]);

      console.log("Raw Audit Logs Response:", auditResponse.data);
      console.log("Raw Account Logs Response:", accountResponse.data);

      setAuditLogs(auditResponse.data);
      setAccountLogs(accountResponse.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      console.error("Error response:", error.response?.data);
      if (error.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError(
          error.response?.data?.message || "Failed to load logs. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    fetchLogs();
    setAuditPage(1);
    setAccountPage(1);
    setAuditPageInput("");
    setAccountPageInput("");
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400">{error}</div>;
  }

  const formatDate = (dateString) => {
    console.log("Raw date string:", dateString);

    if (!dateString || typeof dateString !== "string") {
      console.warn("Invalid date string:", dateString);
      return "Invalid Date";
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Failed to parse date:", dateString);
      return "Invalid Date";
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  const paginateLogs = (logs, page) => {
    const startIndex = (page - 1) * logsPerPage;
    return logs.slice(startIndex, startIndex + logsPerPage);
  };

  const totalAuditPages = Math.ceil(auditLogs.length / logsPerPage);
  const totalAccountPages = Math.ceil(accountLogs.length / logsPerPage);

  const getPageRange = (currentPage, totalPages) => {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handleAuditPageInputChange = (e) => {
    setAuditPageInput(e.target.value);
  };

  const handleAuditPageJump = () => {
    const pageNum = parseInt(auditPageInput, 10);
    if (pageNum && pageNum >= 1 && pageNum <= totalAuditPages) {
      setAuditPage(pageNum);
      setAuditPageInput("");
    } else {
      setAuditPageInput("");
      alert(`Please enter a valid page number between 1 and ${totalAuditPages}.`);
    }
  };

  const handleAccountPageInputChange = (e) => {
    setAccountPageInput(e.target.value);
  };

  const handleAccountPageJump = () => {
    const pageNum = parseInt(accountPageInput, 10);
    if (pageNum && pageNum >= 1 && pageNum <= totalAccountPages) {
      setAccountPage(pageNum);
      setAccountPageInput("");
    } else {
      setAccountPageInput("");
      alert(`Please enter a valid page number between 1 and ${totalAccountPages}.`);
    }
  };

  return (
    <div className="bg-gray-800 min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="w-full mb-4 flex justify-end">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh Logs
          </button>
        </div>
        <div className="flex w-full space-x-6 flex-wrap">
          {/* Audit Log Table */}
          <div className="flex-1 bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6 min-w-[300px]">
            <h2 className="text-lg font-semibold text-white bg-gray-700 p-4">Audit Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-white">
                <thead className="text-xs uppercase bg-gray-700 text-white">
                  <tr>
                    <th className="py-2 px-2 max-w-[150px] truncate">Date & Time</th>
                    <th className="py-2 px-2 max-w-[100px] truncate">User</th>
                    <th className="py-2 px-2 max-w-[100px] truncate">Action</th>
                    <th className="py-2 px-2 max-w-[100px] truncate">Category</th>
                    <th className="py-2 px-2 max-w-[200px] whitespace-normal break-words">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-2 px-2 text-center text-gray-400">
                        No audit logs available
                      </td>
                    </tr>
                  ) : (
                    paginateLogs(auditLogs, auditPage).map((log, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-2 px-2 max-w-[150px] truncate">{formatDate(log.date_time)}</td>
                        <td className="py-2 px-2 max-w-[100px] truncate">{log.user}</td>
                        <td className="py-2 px-2 max-w-[100px] truncate">{log.action}</td>
                        <td className="py-2 px-2 max-w-[100px] truncate">{log.category}</td>
                        <td className="py-2 px-2 max-w-[200px] whitespace-normal break-words">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Audit Log Pagination */}
            <div className="mt-4 flex flex-col items-center space-y-4 pb-4">
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setAuditPage((prev) => Math.max(1, prev - 1))}
                  disabled={auditPage === 1}
                  className={`px-3 py-1 border border-gray-600 rounded ${
                    auditPage === 1
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>
                {getPageRange(auditPage, totalAuditPages).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setAuditPage(pageNum)}
                    className={`px-3 py-1 border border-gray-600 rounded ${
                      auditPage === pageNum
                        ? "bg-blue-500 text-white"
                        : "bg-gray-600 text-white hover:bg-blue-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setAuditPage((prev) => Math.min(totalAuditPages, prev + 1))}
                  disabled={auditPage === totalAuditPages}
                  className={`px-3 py-1 border border-gray-600 rounded ${
                    auditPage === totalAuditPages
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={auditPageInput}
                  onChange={handleAuditPageInputChange}
                  placeholder={`1-${totalAuditPages}`}
                  className="w-24 p-2 rounded bg-gray-600 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAuditPageJump}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Go
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Page {auditPage} of {totalAuditPages} (Total Logs: {auditLogs.length})
              </p>
            </div>
          </div>

          {/* Account Log Table */}
          <div className="flex-1 bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6 min-w-[300px]">
            <h2 className="text-lg font-semibold text-white bg-gray-700 p-4">Account Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-white">
                <thead className="text-xs uppercase bg-gray-700 text-white">
                  <tr>
                    <th className="py-2 px-2 max-w-[150px] truncate">Date & Time</th>
                    <th className="py-2 px-2 max-w-[100px] truncate">Performed By</th>
                    <th className="py-2 px-2 max-w-[100px] truncate">Action</th>
                    <th className="py-2 px-2 max-w-[200px] whitespace-normal break-words">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {accountLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-2 px-2 text-center text-gray-400">
                        No account logs available
                      </td>
                    </tr>
                  ) : (
                    paginateLogs(accountLogs, accountPage).map((log, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-2 px-2 max-w-[150px] truncate">{formatDate(log.date_time)}</td>
                        <td className="py-2 px-2 max-w-[100px] truncate">{log.performed_by}</td>
                        <td className="py-2 px-2 max-w-[100px] truncate">{log.action}</td>
                        <td className="py-2 px-2 max-w-[200px] whitespace-normal break-words">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Account Log Pagination */}
            <div className="mt-4 flex flex-col items-center space-y-4 pb-4">
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setAccountPage((prev) => Math.max(1, prev - 1))}
                  disabled={accountPage === 1}
                  className={`px-3 py-1 border border-gray-600 rounded ${
                    accountPage === 1
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>
                {getPageRange(accountPage, totalAccountPages).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setAccountPage(pageNum)}
                    className={`px-3 py-1 border border-gray-600 rounded ${
                      accountPage === pageNum
                        ? "bg-blue-500 text-white"
                        : "bg-gray-600 text-white hover:bg-blue-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setAccountPage((prev) => Math.min(totalAccountPages, prev + 1))}
                  disabled={accountPage === totalAccountPages}
                  className={`px-3 py-1 border border-gray-600 rounded ${
                    accountPage === totalAccountPages
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={accountPageInput}
                  onChange={handleAccountPageInputChange}
                  placeholder={`1-${totalAccountPages}`}
                  className="w-24 p-2 rounded bg-gray-600 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAccountPageJump}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Go
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Page {accountPage} of {totalAccountPages} (Total Logs: {accountLogs.length})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogScreen;