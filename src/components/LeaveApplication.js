import React, { useState, useEffect } from 'react';
import { useLeaves } from '../hooks/useLeaves';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const LeaveApplication = () => {
  const { applyForLeave, getCurrentUserLeaves, isLoading } = useLeaves();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [isSingleDay, setIsSingleDay] = useState(false);
  const [myLeaves, setMyLeaves] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await getCurrentUserLeaves();
      if (response.success) {
        setMyLeaves(response.data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  // Format date to YYYY-MM-DD using local time (not UTC)
  const formatDateForSubmission = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle single day toggle
  useEffect(() => {
    if (isSingleDay && startDate) {
      setEndDate(startDate);
    }
  }, [isSingleDay, startDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // For single day, end date is same as start date
    const finalEndDate = isSingleDay ? startDate : endDate;

    if (!isSingleDay && !finalEndDate) {
      toast.error('Please select end date');
      return;
    }

    if (!isSingleDay && startDate >= finalEndDate) {
      toast.error('End date must be after start date');
      return;
    }

    if (startDate < new Date().setHours(0, 0, 0, 0)) {
      toast.error('Start date cannot be in the past');
      return;
    }

    setSubmitting(true);
    try {
      const response = await applyForLeave({
        startDate: formatDateForSubmission(startDate),
        endDate: formatDateForSubmission(finalEndDate),
        reason: reason.trim(),
        leaveType,
      });

      if (response.success) {
        toast.success('Leave application submitted successfully');
        setStartDate(null);
        setEndDate(null);
        setReason('');
        setLeaveType('Casual Leave');
        setIsSingleDay(false);
        fetchMyLeaves();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-12 h-12 rounded-xl flex items-center justify-center">
          <span className="text-white text-xl">📅</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Apply for Leave</h2>
          <p className="text-sm text-gray-600">Submit your leave application</p>
        </div>
      </div>

      {/* Leave Application Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* Single Day Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="singleDay"
            checked={isSingleDay}
            onChange={(e) => setIsSingleDay(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="singleDay" className="text-sm font-medium text-gray-700 cursor-pointer">
            Single Day Leave
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isSingleDay ? 'Leave Date' : 'Start Date'} <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholderText={isSingleDay ? "Select leave date" : "Select start date"}
              required
            />
          </div>

          {!isSingleDay && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                minDate={startDate || new Date()}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select end date"
                required
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leave Type
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Personal Leave">Personal Leave</option>
            <option value="Emergency Leave">Emergency Leave</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter reason for leave"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting || isLoading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting || isLoading ? 'Submitting...' : 'Submit Leave Application'}
        </button>
      </form>

      {/* My Leave Applications */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Leave Applications</h3>
        {myLeaves.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No leave applications yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {myLeaves.map((leave) => (
              <div
                key={leave._id}
                className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-gray-50"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-900">
                      {formatDate(leave.startDate) === formatDate(leave.endDate) 
                        ? formatDate(leave.startDate)
                        : `${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                    <span className="text-xs text-gray-500">{leave.leaveType}</span>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2">
                    <span className="font-medium">Reason:</span> {leave.reason}
                  </p>
                  {leave.approver && (
                    <p className="text-xs text-gray-500">
                      {leave.status === 'Approved' ? 'Approved' : 'Rejected'} by {leave.approver.fullName || leave.approver.email}
                      {leave.approvedAt && ` on ${formatDate(leave.approvedAt)}`}
                    </p>
                  )}
                  {leave.rejectionReason && (
                    <p className="text-xs text-red-600">
                      <span className="font-medium">Rejection:</span> {leave.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApplication;

