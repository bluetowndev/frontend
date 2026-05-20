import React, { useState, useEffect } from 'react';
import { useLeaves } from '../../hooks/useLeaves';
import toast from 'react-hot-toast';

const LeaveApproval = () => {
  const { getLeavesForApproval, approveOrRejectLeave, isLoading } = useLeaves();
  const [leaves, setLeaves] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await getLeavesForApproval();
      if (response.success) {
        setLeaves(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch leaves for approval');
    }
  };

  const handleApprove = async (leaveId) => {
    setProcessingId(leaveId);
    try {
      const response = await approveOrRejectLeave(leaveId, 'approve');
      if (response.success) {
        toast.success('Leave approved successfully');
        fetchLeaves();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to approve leave');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (leaveId) => {
    setSelectedLeaveId(leaveId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessingId(selectedLeaveId);
    try {
      const response = await approveOrRejectLeave(selectedLeaveId, 'reject', rejectionReason);
      if (response.success) {
        toast.success('Leave rejected successfully');
        setShowRejectModal(false);
        setSelectedLeaveId(null);
        setRejectionReason('');
        fetchLeaves();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reject leave');
    } finally {
      setProcessingId(null);
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

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center">
          <span className="text-white text-xl">✅</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leave Approvals</h2>
          <p className="text-sm text-gray-600">Review and approve/reject leave applications</p>
        </div>
      </div>

      {leaves.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No pending leave applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {leave.user?.fullName || leave.user?.email}
                    </h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
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
                  </div>
                  <div className="mt-2">
                    <span className="font-medium text-sm text-gray-700">Reason:</span>
                    <p className="text-sm text-gray-600 mt-1">{leave.reason}</p>
                  </div>
                  {leave.user?.email && (
                    <p className="text-xs text-gray-500 mt-2">Email: {leave.user.email}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleApprove(leave._id)}
                    disabled={processingId === leave._id || isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processingId === leave._id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleRejectClick(leave._id)}
                    disabled={processingId === leave._id || isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Leave Application</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter reason for rejection"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processingId ? 'Processing...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedLeaveId(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApproval;

