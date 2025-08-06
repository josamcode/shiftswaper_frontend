import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Clock,
  RefreshCw,
  Eye,
  Search,
  Handshake,
  Zap,
  X,
  Plus,
  Loader,
  AlertCircle,
  User,
  ArrowRight,
  MessageSquare,
  CheckCircle,
  Calendar,
  Filter
} from 'lucide-react';
import Swal from 'sweetalert2';

const ShiftSwapsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Request states
  const [shiftRequests, setShiftRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('available'); // available, all
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, urgent

  // Date filter states
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Counter offer form data
  const [counterOfferData, setCounterOfferData] = useState({
    shiftStartDate: '',
    shiftEndDate: '',
    overtimeStart: '',
    overtimeEnd: ''
  });

  useEffect(() => {
    loadEmployeeData();
    loadShiftRequests();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [shiftRequests, searchTerm, statusFilter, sortBy, dateFilterStart, dateFilterEnd]);

  const loadEmployeeData = () => {
    try {
      const storedEmployeeData = Cookies.get('employee_data');
      if (storedEmployeeData) {
        const parsedData = JSON.parse(storedEmployeeData);
        if (parsedData && parsedData.id && !parsedData._id) {
          parsedData._id = parsedData.id;
        }
        setEmployeeData(parsedData);
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  };

  const loadShiftRequests = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('employee_token');
      if (!token) {
        setError('Authentication required, You have to login as Employee');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/shift-swap-requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Filter out own requests - employees shouldn't see their own requests here
        const otherEmployeesRequests = (data.data.requests || []).filter(
          request => request.requesterUserId?._id !== employeeData?.id
        );
        setShiftRequests(otherEmployeesRequests);
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

  const filterAndSortRequests = () => {
    let filtered = [...shiftRequests];

    // Filter by availability
    if (statusFilter === 'available') {
      filtered = filtered.filter(req =>
        (req.status === 'pending' || req.status === 'offers_received') &&
        !req.receiverUserId &&
        new Date(req.shiftStartDate) > new Date()
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.requesterUserId?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (dateFilterStart || dateFilterEnd) {
      filtered = filtered.filter(req => {
        const shiftStart = new Date(req.shiftStartDate);
        const filterStart = dateFilterStart ? new Date(dateFilterStart) : null;
        const filterEnd = dateFilterEnd ? new Date(dateFilterEnd + 'T23:59:59') : null;

        if (filterStart && filterEnd) {
          return shiftStart >= filterStart && shiftStart <= filterEnd;
        } else if (filterStart) {
          return shiftStart >= filterStart;
        } else if (filterEnd) {
          return shiftStart <= filterEnd;
        }
        return true;
      });
    }

    // Sort requests
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'urgent':
          return new Date(a.shiftStartDate) - new Date(b.shiftStartDate);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredRequests(filtered);
  };

  const clearDateFilters = () => {
    setDateFilterStart('');
    setDateFilterEnd('');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('available');
    setSortBy('newest');
    setDateFilterStart('');
    setDateFilterEnd('');
  };

  const showSuccessMessage = (message) => {
    const successElement = document.createElement('div');
    successElement.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    successElement.textContent = message;
    document.body.appendChild(successElement);
    setTimeout(() => {
      if (document.body.contains(successElement)) {
        document.body.removeChild(successElement);
      }
    }, 3000);
  };

  const isDateInRange = (dateString) => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 10);
    maxDate.setHours(23, 59, 59, 999);

    return selectedDate >= tomorrow && selectedDate <= maxDate;
  };

  const handleCounterOffer = async () => {
    try {
      setError('');

      if (!counterOfferData.shiftStartDate || !counterOfferData.shiftEndDate) {
        setError('Please fill in shift start and end dates.');
        return;
      }

      if (!isDateInRange(counterOfferData.shiftStartDate)) {
        setError('Shift Start Date must be between tomorrow and 10 days in the future.');
        return;
      }
      if (!isDateInRange(counterOfferData.shiftEndDate)) {
        setError('Shift End Date must be between tomorrow and 10 days in the future.');
        return;
      }

      const startDate = new Date(counterOfferData.shiftStartDate);
      const endDate = new Date(counterOfferData.shiftEndDate);
      if (endDate <= startDate) {
        setError('Shift End Date must be after Shift Start Date.');
        return;
      }

      const payload = {
        requestId: selectedRequest._id,
        shiftStartDate: startDate.toISOString(),
        shiftEndDate: endDate.toISOString(),
      };

      if (counterOfferData.overtimeStart) {
        const overtimeStart = new Date(counterOfferData.overtimeStart);
        if (isNaN(overtimeStart.getTime())) {
          setError('Invalid Overtime Start time.');
          return;
        }
        payload.overtimeStart = overtimeStart.toISOString();
      }
      if (counterOfferData.overtimeEnd) {
        const overtimeEnd = new Date(counterOfferData.overtimeEnd);
        if (isNaN(overtimeEnd.getTime())) {
          setError('Invalid Overtime End time.');
          return;
        }
        payload.overtimeEnd = overtimeEnd.toISOString();
      }

      const token = Cookies.get('employee_token');
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/shift-swap-requests/counter-offer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowCounterOfferModal(false);
        setCounterOfferData({
          shiftStartDate: '',
          shiftEndDate: '',
          overtimeStart: '',
          overtimeEnd: ''
        });
        await loadShiftRequests();
        showSuccessMessage('Counter offer submitted successfully!');
      } else {
        let errorMessage = 'Failed to submit counter offer.';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Counter Offer Network Error:", error);
      setError('Failed to submit counter offer due to a network error. Please try again.');
    }
  };

  const openCounterOfferModal = (request) => {
    setSelectedRequest(request);
    setCounterOfferData({
      shiftStartDate: '',
      shiftEndDate: '',
      overtimeStart: '',
      overtimeEnd: ''
    });
    setShowCounterOfferModal(true);
    setError('');
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'offers_received': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (shiftStartDate) => {
    const shiftDate = new Date(shiftStartDate);
    const now = new Date();
    const hoursUntilShift = (shiftDate - now) / (1000 * 60 * 60);

    if (hoursUntilShift <= 24) return 'bg-red-100 text-red-800 border-red-200';
    if (hoursUntilShift <= 48) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getUrgencyText = (shiftStartDate) => {
    const shiftDate = new Date(shiftStartDate);
    const now = new Date();
    const hoursUntilShift = (shiftDate - now) / (1000 * 60 * 60);

    if (hoursUntilShift <= 24) return 'Urgent';
    if (hoursUntilShift <= 48) return 'Soon';
    return 'Available';
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

  const canTakeAction = (request) => {
    if (!employeeData) return false;
    // Can't take action on own requests
    if (request.requesterUserId?._id === employeeData._id) return false;
    // Can only take action on available requests
    if (request.status !== 'pending' && request.status !== 'offers_received') return false;
    // Can't take action if shift already started
    if (new Date(request.shiftStartDate) <= new Date()) return false;
    // Can't take action if already accepted by someone
    if (request.receiverUserId) return false;
    return true;
  };

  const hasAlreadyOffered = (request) => {
    if (!request.negotiationHistory || !employeeData) return false;
    return request.negotiationHistory.some(offer =>
      offer.offeredBy._id === employeeData._id && offer.status === 'offered'
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-gray-600">Loading available shifts...</p>
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
              <Handshake className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Shift Swaps Board
                </h1>
                <p className="text-sm text-gray-500">Find shifts to swap with your colleagues</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {filteredRequests.length} Available Shifts
                </div>
                <div className="text-xs text-gray-500">
                  From {new Set(filteredRequests.map(req => req.requesterUserId?.fullName)).size} colleagues
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

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col space-y-4">
            {/* First Row - Main Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by reason or employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Available Only</option>
                  <option value="all">All Requests</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="urgent">Most Urgent</option>
                </select>

                {/* Date Filter Toggle */}
                <button
                  onClick={() => setShowDateFilters(!showDateFilters)}
                  className={`inline-flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${showDateFilters || dateFilterStart || dateFilterEnd
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Filter
                  {(dateFilterStart || dateFilterEnd) && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                      Active
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {/* Clear Filters */}
                {(searchTerm || statusFilter !== 'available' || sortBy !== 'newest' || dateFilterStart || dateFilterEnd) && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear All
                  </button>
                )}

                {/* Refresh */}
                <button
                  onClick={loadShiftRequests}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Second Row - Date Filters (Collapsible) */}
            {showDateFilters && (
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by shift date:</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600 whitespace-nowrap">From:</label>
                      <input
                        type="date"
                        value={dateFilterStart}
                        onChange={(e) => setDateFilterStart(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600 whitespace-nowrap">To:</label>
                      <input
                        type="date"
                        value={dateFilterEnd}
                        onChange={(e) => setDateFilterEnd(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {(dateFilterStart || dateFilterEnd) && (
                      <button
                        onClick={clearDateFilters}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 transition-colors duration-200"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear dates
                      </button>
                    )}
                  </div>
                </div>

                {(dateFilterStart || dateFilterEnd) && (
                  <div className="mt-2 text-sm text-gray-600">
                    {dateFilterStart && dateFilterEnd ? (
                      <>Showing shifts from {new Date(dateFilterStart).toLocaleDateString()} to {new Date(dateFilterEnd).toLocaleDateString()}</>
                    ) : dateFilterStart ? (
                      <>Showing shifts from {new Date(dateFilterStart).toLocaleDateString()} onwards</>
                    ) : (
                      <>Showing shifts until {new Date(dateFilterEnd).toLocaleDateString()}</>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Shift Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.requesterUserId?.fullName || 'Unknown Employee'}
                      </h3>
                      <p className="text-sm text-gray-500">{request.requesterUserId?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(request.shiftStartDate)}`}>
                      {getUrgencyText(request.shiftStartDate)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Reason */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                    <p className="text-sm text-gray-900 line-clamp-2">{request.reason}</p>
                  </div>

                  {/* Shift Details */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Shift Details:</p>
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(request.shiftStartDate)} - {formatDate(request.shiftEndDate)}</span>
                      </div>
                      {request.overtimeStart && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Plus className="h-3 w-3 mr-1" />
                          <span>Overtime: {formatDate(request.overtimeStart)} - {formatDate(request.overtimeEnd)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Offers Count */}
                  {request.negotiationHistory && request.negotiationHistory.length > 0 && (
                    <div className="flex items-center text-sm text-blue-600">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{request.negotiationHistory.length} offer{request.negotiationHistory.length !== 1 ? 's' : ''} received</span>
                    </div>
                  )}

                  {/* Your Offer Status */}
                  {hasAlreadyOffered(request) && (
                    <div className="flex items-center text-sm text-green-600 bg-green-50 rounded-lg p-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>You've already made an offer</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Posted {formatDateOnly(request.createdAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* View Details */}
                    <button
                      onClick={() => viewRequestDetails(request)}
                      className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>

                    {/* Action Buttons */}
                    {canTakeAction(request) && !hasAlreadyOffered(request) && (
                      <>
                        {/* Counter Offer */}
                        <button
                          onClick={() => openCounterOfferModal(request)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Swap now!
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Handshake className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shift swaps available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {shiftRequests.length === 0
                ? 'No one has posted any shift swap requests yet.'
                : 'Try adjusting your search or filters to find more shifts.'
              }
            </p>
            {(searchTerm || statusFilter !== 'available' || sortBy !== 'newest' || dateFilterStart || dateFilterEnd) && (
              <button
                onClick={clearAllFilters}
                className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </main>

      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Shift Swap Details</h3>
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
                      <label className="block text-sm font-medium text-gray-500">Requested By</label>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-900">{selectedRequest.requesterUserId?.fullName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{selectedRequest.requesterUserId?.email || ''}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Posted</label>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Urgency</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border mt-1 ${getUrgencyColor(selectedRequest.shiftStartDate)}`}>
                        {getUrgencyText(selectedRequest.shiftStartDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Reason for Swap</h4>
                  <p className="text-sm text-blue-800">{selectedRequest.reason}</p>
                </div>

                {/* Shift Details */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-3">Shift Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700">Shift Start</label>
                      <p className="text-sm text-purple-900">{formatDate(selectedRequest.shiftStartDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-700">Shift End</label>
                      <p className="text-sm text-purple-900">{formatDate(selectedRequest.shiftEndDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Overtime Details */}
                {(selectedRequest.overtimeStart || selectedRequest.overtimeEnd) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-3">Overtime Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRequest.overtimeStart && (
                        <div>
                          <label className="block text-sm font-medium text-orange-700">Overtime Start</label>
                          <p className="text-sm text-orange-900">{formatDate(selectedRequest.overtimeStart)}</p>
                        </div>
                      )}
                      {selectedRequest.overtimeEnd && (
                        <div>
                          <label className="block text-sm font-medium text-orange-700">Overtime End</label>
                          <p className="text-sm text-orange-900">{formatDate(selectedRequest.overtimeEnd)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Counter Offers Section */}
                {selectedRequest.negotiationHistory && selectedRequest.negotiationHistory.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3">Counter Offers ({selectedRequest.negotiationHistory.length})</h4>
                    <div className="space-y-3">
                      {selectedRequest.negotiationHistory.map((offer, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {offer.offeredBy?.fullName || 'Unknown Employee'}
                                  </p>
                                  <p className="text-xs text-gray-500">{offer.offeredBy?.email || 'Unknown Email'}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-600">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {formatDate(offer.shiftStartDate)} - {formatDate(offer.shiftEndDate)}
                                </p>
                                {offer.overtimeStart && (
                                  <p className="text-xs text-gray-600">
                                    <Plus className="h-3 w-3 inline mr-1" />
                                    Overtime: {formatDate(offer.overtimeStart)} - {formatDate(offer.overtimeEnd)}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Offered on {formatDate(offer.offeredAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                {offer.status.toUpperCase()}
                              </span>
                              {offer.offeredBy?._id === employeeData?.id && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  Your Offer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {canTakeAction(selectedRequest) && !hasAlreadyOffered(selectedRequest) && (
                    <>
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          openCounterOfferModal(selectedRequest);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Offer to get the shift
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showCounterOfferModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Make Offer</h3>
                <button
                  onClick={() => setShowCounterOfferModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Original Request Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Original Request</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>From:</strong> {selectedRequest.requesterUserId?.fullName}</p>
                  <p><strong>Shift:</strong> {formatDate(selectedRequest.shiftStartDate)} - {formatDate(selectedRequest.shiftEndDate)}</p>
                  <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Your Offer</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Propose your own shift times for the same day. The requester can then choose to accept your offer.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Shift Start *
                      </label>
                      <input
                        type="datetime-local"
                        value={counterOfferData.shiftStartDate}
                        onChange={(e) => setCounterOfferData({ ...counterOfferData, shiftStartDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Shift End *
                      </label>
                      <input
                        type="datetime-local"
                        value={counterOfferData.shiftEndDate}
                        onChange={(e) => setCounterOfferData({ ...counterOfferData, shiftEndDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Overtime Details */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-3">Overtime (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overtime Start
                      </label>
                      <input
                        type="datetime-local"
                        value={counterOfferData.overtimeStart}
                        onChange={(e) => setCounterOfferData({ ...counterOfferData, overtimeStart: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overtime End
                      </label>
                      <input
                        type="datetime-local"
                        value={counterOfferData.overtimeEnd}
                        onChange={(e) => setCounterOfferData({ ...counterOfferData, overtimeEnd: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Your offer must be for the same day as the original request</li>
                    <li>• Shift times can be different from the original request</li>
                    <li>• The requester will be notified of your offer via email</li>
                    <li>• Shifts must be scheduled between tomorrow and 10 days in the future</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCounterOfferModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCounterOffer}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Submit Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftSwapsPage;