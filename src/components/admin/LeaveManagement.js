import React, { useState, useEffect } from 'react';
import { useLeaves } from '../../hooks/useLeaves';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const LeaveManagement = () => {
  const { getAllLeaves, getLeaveStatistics, isLoading } = useLeaves();
  const [leaves, setLeaves] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: null,
    endDate: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLeaves();
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  const fetchLeaves = async () => {
    try {
      const filterParams = {};
      if (filters.status) filterParams.status = filters.status;
      if (filters.startDate) filterParams.startDate = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) filterParams.endDate = filters.endDate.toISOString().split('T')[0];

      const response = await getAllLeaves(filterParams);
      if (response.success) {
        setLeaves(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch leaves');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getLeaveStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: null,
      endDate: null,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">📋</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Leave Management</h2>
            <p className="text-sm text-gray-600">View and manage all leave applications</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-700">Total Leaves</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-700">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-700">Approved</p>
            <p className="text-2xl font-bold text-green-600">{statistics.approved}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-700">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date })}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date })}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select end date"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaves Table */}
      <div className="overflow-x-auto">
        {leaves.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No leave applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div
                key={leave._id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {leave.user?.fullName || leave.user?.email}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        {formatDate(leave.startDate) === formatDate(leave.endDate)
                          ? formatDate(leave.startDate)
                          : `${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`}
                      </div>
                      <div>
                        <span className="font-medium">Days:</span> {calculateDays(leave.startDate, leave.endDate)} {calculateDays(leave.startDate, leave.endDate) === 1 ? 'day' : 'days'}
                      </div>
                      <div>
                        <span className="font-medium">Leave Type:</span> {leave.leaveType}
                      </div>
                      <div>
                        <span className="font-medium">Applied On:</span> {formatDate(leave.createdAt)}
                      </div>
                      {leave.approver && (
                        <div>
                          <span className="font-medium">Approved/Rejected By:</span> {leave.approver.fullName || leave.approver.email}
                        </div>
                      )}
                      {leave.approvedAt && (
                        <div>
                          <span className="font-medium">Processed On:</span> {formatDate(leave.approvedAt)}
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="font-medium text-sm text-gray-700">Reason:</span>
                      <p className="text-sm text-gray-600 mt-1">{leave.reason}</p>
                    </div>
                    {leave.rejectionReason && (
                      <div className="mt-2">
                        <span className="font-medium text-sm text-red-700">Rejection Reason:</span>
                        <p className="text-sm text-red-600 mt-1">{leave.rejectionReason}</p>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      <span>Email: {leave.user?.email}</span>
                      {leave.user?.state && <span className="ml-3">State: {leave.user.state}</span>}
                      {leave.user?.reportingManager && <span className="ml-3">Manager: {leave.user.reportingManager}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;

