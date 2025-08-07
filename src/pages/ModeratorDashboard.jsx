import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  User,
  Calendar,
  RefreshCw,
  Eye,
  X,
  LogOut,
  ChevronDown,
  AlertCircle,
  Loader,
  Search,
  Bell,
  CalendarDays,
  Zap,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [moderatorData, setModeratorData] = useState(null);
  // Request states
  const [shiftRequests, setShiftRequests] = useState([]);
  const [dayOffRequests, setDayOffRequests] = useState([]);
  const [filteredShiftRequests, setFilteredShiftRequests] = useState([]);
  const [filteredDayOffRequests, setFilteredDayOffRequests] = useState([]);
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadModeratorData();
    loadShiftRequests();
    loadDayOffRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [shiftRequests, dayOffRequests, searchTerm, statusFilter]);

  const loadModeratorData = () => {
    try {
      const storedModeratorData = Cookies.get('moderator_data');
      if (storedModeratorData) {
        const parsedData = JSON.parse(storedModeratorData);
        setModeratorData(parsedData);
      }
    } catch (error) {
      console.error('Error loading moderator data:', error);
    }
  };

  const loadShiftRequests = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('moderator_token');
      if (!token) {
        handleLogout();
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/shift-swap-requests/?status=approved&status=rejected`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      const data = await response.json();
      if (response.ok && data.success) {
        setShiftRequests(data.data.requests || []);
      } else {
        setError(data.message || 'Failed to load shift requests');
      }
    } catch (error) {
      console.error('Error loading shift requests:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDayOffRequests = async () => {
    try {
      const token = Cookies.get('moderator_token');
      if (!token) return;
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/day-off-swap-requests/?status=approved&status=rejected`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDayOffRequests(data.data.requests || []);
        }
      }
    } catch (error) {
      console.error('Error loading day off requests:', error);
    }
  };

  const filterRequests = () => {
    let allRequests = [...shiftRequests.map(req => ({ ...req, type: 'shift' })), ...dayOffRequests.map(req => ({ ...req, type: 'dayoff' }))];

    // Search filter
    if (searchTerm) {
      allRequests = allRequests.filter(req =>
        req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.requesterUserId?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Status filter
    if (statusFilter !== 'all') {
      allRequests = allRequests.filter(req => req.status === statusFilter);
    }
    // Split back into shift and day off requests
    setFilteredShiftRequests(allRequests.filter(req => req.type === 'shift'));
    setFilteredDayOffRequests(allRequests.filter(req => req.type === 'dayoff'));
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      Cookies.remove('moderator_token');
      Cookies.remove('moderator_data');
      login();
      Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        if (navigate) {
          navigate('/');
        } else {
          window.location.href = '/';
        }
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    return type === 'shift' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewRequestDetails = (request, type) => {
    setSelectedRequest({ ...request, type });
    setShowViewModal(true);
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Dashboard Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6 w-full">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shift Requests</p>
              <p className="text-2xl font-bold text-gray-900">{shiftRequests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 w-full">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <CalendarDays className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Day Off Requests</p>
              <p className="text-2xl font-bold text-gray-900">{dayOffRequests.length}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
        </div>
        <div className="p-6">
          {[...filteredShiftRequests, ...filteredDayOffRequests]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((request) => (
              <div key={request._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    {request.type === 'shift' ? <Zap className="h-4 w-4 text-purple-600" /> : <CalendarDays className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.reason}</p>
                    <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(request.type || (request.shiftStartDate ? 'shift' : 'dayoff'))}`}>
                    {request.type === 'shift' ? 'Shift' : 'Day Off'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  // Requests Management Tab
  const renderRequests = () => (
    <div className="space-y-6">
      {/* Filters and Create Button */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                loadShiftRequests();
                loadDayOffRequests();
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>
      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...filteredShiftRequests.map(req => ({ ...req, type: 'shift' })), ...filteredDayOffRequests.map(req => ({ ...req, type: 'dayoff' }))]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-full p-2 mr-3">
                          {request.type === 'shift' ? <Zap className="h-4 w-4 text-purple-600" /> : <CalendarDays className="h-4 w-4 text-orange-600" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.reason}</div>
                          <div className="text-sm text-gray-500">
                            {request.type === 'shift'
                              ? `${formatDate(request.shiftStartDate)} - ${formatDate(request.shiftEndDate)}`
                              : `${formatDateOnly(request.originalDayOff)} â†’ ${formatDateOnly(request.requestedDayOff)}`
                            }
                          </div>
                          <div className="text-xs text-gray-400">
                            By: {request.requesterUserId?.fullName || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(request.type)}`}>
                        {request.type === 'shift' ? 'Shift Swap' : 'Day Off Swap'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        {/* View Button - Always available */}
                        <button
                          onClick={() => viewRequestDetails(request, request.type)}
                          className="inline-flex items-center px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {[...filteredShiftRequests, ...filteredDayOffRequests].length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading && shiftRequests.length === 0 && dayOffRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="pt-2 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-0 sm:justify-between sm:items-center py-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {moderatorData?.fullName || 'Moderator'}
                </h1>
                <p className="text-sm text-gray-500">{moderatorData?.email || 'Your Email'}</p>
                <p className="text-sm text-gray-500">{moderatorData?.companyName || 'Your Company'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="bg-blue-100 rounded-full p-2">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{moderatorData?.fullName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              All Requests
            </button>
          </nav>
        </div>
        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'requests' && renderRequests()}
      </main>
      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                {/* Request Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Request Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">ID</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedRequest._id)}`}>
                        {selectedRequest._id}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Type</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedRequest.type)}`}>
                        {selectedRequest.type === 'shift' ? 'Shift Swap' : 'Day Off Swap'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Requested By</label>
                      <p className="text-sm text-gray-900">{selectedRequest.requesterUserId?.fullName || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Reason</label>
                      <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
                    </div>
                  </div>
                </div>
                {/* Day Off Details (for day off requests) */}
                {selectedRequest.type === 'dayoff' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-3">Day Off Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-700">Original Day Off</label>
                        <p className="text-sm text-orange-900">{formatDateOnly(selectedRequest.originalDayOff)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-700">Requested Day Off</label>
                        <p className="text-sm text-orange-900">{formatDateOnly(selectedRequest.requestedDayOff)}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Shift Details */}
                {(selectedRequest.shiftStartDate || selectedRequest.shiftEndDate) && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-3">Shift Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRequest.shiftStartDate && (
                        <div>
                          <label className="block text-sm font-medium text-purple-700">Shift Start</label>
                          <p className="text-sm text-purple-900">{formatDate(selectedRequest.shiftStartDate)}</p>
                        </div>
                      )}
                      {selectedRequest.shiftEndDate && (
                        <div>
                          <label className="block text-sm font-medium text-purple-700">Shift End</label>
                          <p className="text-sm text-purple-900">{formatDate(selectedRequest.shiftEndDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Overtime Details */}
                {(selectedRequest.overtimeStart || selectedRequest.overtimeEnd) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Overtime Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRequest.overtimeStart && (
                        <div>
                          <label className="block text-sm font-medium text-blue-700">Overtime Start</label>
                          <p className="text-sm text-blue-900">{formatDate(selectedRequest.overtimeStart)}</p>
                        </div>
                      )}
                      {selectedRequest.overtimeEnd && (
                        <div>
                          <label className="block text-sm font-medium text-blue-700">Overtime End</label>
                          <p className="text-sm text-blue-900">{formatDate(selectedRequest.overtimeEnd)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Rejection/Approval Comment */}
                {(selectedRequest.status === 'rejected' || selectedRequest.status === 'approved') && selectedRequest.comment && (
                  <div className={`${selectedRequest.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                    <h4 className={`font-medium ${selectedRequest.status === 'rejected' ? 'text-red-900' : 'text-green-900'} mb-2`}>
                      {selectedRequest.status === 'rejected' ? 'Rejection' : 'Approval'} Comment
                    </h4>
                    <p className={`text-sm ${selectedRequest.status === 'rejected' ? 'text-red-800' : 'text-green-800'}`}>
                      {selectedRequest.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorDashboard;