import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Clock,
  Calendar,
  RefreshCw,
  Eye,
  Search,
  Filter,
  Users,
  Handshake,
  CalendarDays,
  X,
  Plus,
  Loader,
  AlertCircle,
  ChevronDown,
  User,
  ArrowRight,
  MessageSquare,
  CheckCircle,
  ArrowLeftRight
} from 'lucide-react';
import Swal from 'sweetalert2';

const DayOffSwapsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Request states
  const [dayOffRequests, setDayOffRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('available'); // available, all
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, urgent

  // Date filter states
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [dateFilterType, setDateFilterType] = useState('requested'); // requested, original, either
  const [showDateFilters, setShowDateFilters] = useState(false);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Match proposal form data
  const [matchData, setMatchData] = useState({
    originalDayOff: '',
    shiftStartDate: '',
    shiftEndDate: '',
    overtimeStart: '',
    overtimeEnd: ''
  });

  useEffect(() => {
    loadEmployeeData();
    loadDayOffRequests();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [dayOffRequests, searchTerm, statusFilter, sortBy, dateFilterStart, dateFilterEnd, dateFilterType]);

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

  const loadDayOffRequests = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('employee_token');
      if (!token) {
        setError('Authentication required, You have to login as Employee');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/day-off-swap-requests/`, {
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
        const otherEmployeesRequests = (data.data.requests || []).filter(
          request => request.requesterUserId?._id !== employeeData?.id
        );
        setDayOffRequests(otherEmployeesRequests);
      } else {
        setError(data.message || 'Failed to load day off requests');
      }
    } catch (error) {
      console.error('Error loading day off requests:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortRequests = () => {
    let filtered = [...dayOffRequests];

    // Filter by availability
    if (statusFilter === 'available') {
      filtered = filtered.filter(req =>
        // Show requests that are pending (waiting for matches) OR matched but not accepted yet
        (req.status === 'pending' || (req.status === 'matched' && !req.receiverUserId)) &&
        new Date(req.originalDayOff) > new Date() &&
        new Date(req.requestedDayOff) > new Date()
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
        const originalDayOff = new Date(req.originalDayOff);
        const requestedDayOff = new Date(req.requestedDayOff);
        const filterStart = dateFilterStart ? new Date(dateFilterStart) : null;
        const filterEnd = dateFilterEnd ? new Date(dateFilterEnd + 'T23:59:59') : null;

        let dateToCheck;
        switch (dateFilterType) {
          case 'original':
            dateToCheck = originalDayOff;
            break;
          case 'requested':
            dateToCheck = requestedDayOff;
            break;
          case 'either':
            // Check if either date falls within the range
            const checkDateInRange = (date) => {
              if (filterStart && filterEnd) {
                return date >= filterStart && date <= filterEnd;
              } else if (filterStart) {
                return date >= filterStart;
              } else if (filterEnd) {
                return date <= filterEnd;
              }
              return true;
            };
            return checkDateInRange(originalDayOff) || checkDateInRange(requestedDayOff);
          default:
            dateToCheck = requestedDayOff;
        }

        if (filterStart && filterEnd) {
          return dateToCheck >= filterStart && dateToCheck <= filterEnd;
        } else if (filterStart) {
          return dateToCheck >= filterStart;
        } else if (filterEnd) {
          return dateToCheck <= filterEnd;
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
          return new Date(a.requestedDayOff) - new Date(b.requestedDayOff);
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
    setDateFilterType('requested');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('available');
    setSortBy('newest');
    setDateFilterStart('');
    setDateFilterEnd('');
    setDateFilterType('requested');
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

  const isDateValid = (dateString) => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate > today;
  };

  const handleMatchDayOff = async () => {
    try {
      setError('');

      if (!matchData.originalDayOff) {
        setError('Please select your original day off.');
        return;
      }

      if (!isDateValid(matchData.originalDayOff)) {
        setError('Your original day off must be a future date.');
        return;
      }

      // Validate that the matcher's original day off matches the requester's requested day off
      const requesterRequestedDay = new Date(selectedRequest.requestedDayOff).toISOString().split('T')[0];
      const matcherOriginalDay = new Date(matchData.originalDayOff).toISOString().split('T')[0];

      if (requesterRequestedDay !== matcherOriginalDay) {
        setError('Your original day off must match the requester\'s requested day off.');
        return;
      }

      // Validate shift times if provided
      if (matchData.shiftStartDate && matchData.shiftEndDate) {
        const startDate = new Date(matchData.shiftStartDate);
        const endDate = new Date(matchData.shiftEndDate);
        if (endDate <= startDate) {
          setError('Shift End Date must be after Shift Start Date.');
          return;
        }
      }

      const payload = {
        requestId: selectedRequest._id,
        originalDayOff: new Date(matchData.originalDayOff).toISOString().split('T')[0],
      };

      if (matchData.shiftStartDate) {
        const shiftStart = new Date(matchData.shiftStartDate);
        if (isNaN(shiftStart.getTime())) {
          setError('Invalid Shift Start time.');
          return;
        }
        payload.shiftStartDate = shiftStart.toISOString();
      }
      if (matchData.shiftEndDate) {
        const shiftEnd = new Date(matchData.shiftEndDate);
        if (isNaN(shiftEnd.getTime())) {
          setError('Invalid Shift End time.');
          return;
        }
        payload.shiftEndDate = shiftEnd.toISOString();
      }
      if (matchData.overtimeStart) {
        const overtimeStart = new Date(matchData.overtimeStart);
        if (isNaN(overtimeStart.getTime())) {
          setError('Invalid Overtime Start time.');
          return;
        }
        payload.overtimeStart = overtimeStart.toISOString();
      }
      if (matchData.overtimeEnd) {
        const overtimeEnd = new Date(matchData.overtimeEnd);
        if (isNaN(overtimeEnd.getTime())) {
          setError('Invalid Overtime End time.');
          return;
        }
        payload.overtimeEnd = overtimeEnd.toISOString();
      }

      const token = Cookies.get('employee_token');
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/day-off-swap-requests/match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowMatchModal(false);
        setMatchData({
          originalDayOff: '',
          shiftStartDate: '',
          shiftEndDate: '',
          overtimeStart: '',
          overtimeEnd: ''
        });
        await loadDayOffRequests();
        showSuccessMessage('Match proposal submitted successfully!');
      } else {
        let errorMessage = 'Failed to submit match proposal.';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Match Day Off Network Error:", error);
      setError('Failed to submit match proposal due to a network error. Please try again.');
    }
  };

  const openMatchModal = (request) => {
    setSelectedRequest(request);
    setMatchData({
      originalDayOff: request.requestedDayOff ? new Date(request.requestedDayOff).toISOString().split('T')[0] : '',
      shiftStartDate: '',
      shiftEndDate: '',
      overtimeStart: '',
      overtimeEnd: ''
    });
    setShowMatchModal(true);
    setError('');
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'matched': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (requestedDayOff) => {
    const requestedDate = new Date(requestedDayOff);
    const now = new Date();
    const daysUntilRequested = Math.ceil((requestedDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilRequested <= 3) return 'bg-red-100 text-red-800 border-red-200';
    if (daysUntilRequested <= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getUrgencyText = (requestedDayOff) => {
    const requestedDate = new Date(requestedDayOff);
    const now = new Date();
    const daysUntilRequested = Math.ceil((requestedDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilRequested <= 3) return 'Urgent';
    if (daysUntilRequested <= 7) return 'Soon';
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
    if (request.status !== 'pending' && request.status !== 'matched') return false;
    // Can't take action if dates already passed
    if (new Date(request.originalDayOff) <= new Date()) return false;
    if (new Date(request.requestedDayOff) <= new Date()) return false;
    // Can't take action if already accepted by someone
    if (request.receiverUserId) return false;
    return true;
  };

  const hasAlreadyMatched = (request) => {
    if (!request.matches || !employeeData) return false;
    return request.matches.some(match =>
      match.matchedBy._id === employeeData._id && match.status === 'proposed'
    );
  };

  const canMatchRequest = (request) => {
    if (!employeeData) return false;
    // Must have at least one day off that matches the requester's requested day
    // This would typically be checked against the employee's schedule
    // For now, we'll allow the match and validate on the backend
    return true;
  };

  const getDateFilterDescription = () => {
    const typeText = {
      'requested': 'requested day off',
      'original': 'original day off',
      'either': 'either day off'
    }[dateFilterType];

    if (dateFilterStart && dateFilterEnd) {
      return `Showing swaps where ${typeText} is between ${new Date(dateFilterStart).toLocaleDateString()} and ${new Date(dateFilterEnd).toLocaleDateString()}`;
    } else if (dateFilterStart) {
      return `Showing swaps where ${typeText} is from ${new Date(dateFilterStart).toLocaleDateString()} onwards`;
    } else if (dateFilterEnd) {
      return `Showing swaps where ${typeText} is until ${new Date(dateFilterEnd).toLocaleDateString()}`;
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-gray-600">Loading available day off swaps...</p>
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
              <ArrowLeftRight className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Day Off Swaps Board
                </h1>
                <p className="text-sm text-gray-500">Find day off swaps with your colleagues</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {filteredRequests.length} Available Swaps
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
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Filter
                  {(dateFilterStart || dateFilterEnd) && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                      Active
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {/* Clear Filters */}
                {(searchTerm || statusFilter !== 'available' || sortBy !== 'newest' || dateFilterStart || dateFilterEnd || dateFilterType !== 'requested') && (
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
                  onClick={filterAndSortRequests}
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
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by date:</span>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                    {/* Date Type Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600 whitespace-nowrap">Filter by:</label>
                      <select
                        value={dateFilterType}
                        onChange={(e) => setDateFilterType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="requested">Requested Day Off</option>
                        <option value="original">Original Day Off</option>
                        <option value="either">Either Day Off</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 whitespace-nowrap">From:</label>
                        <input
                          type="date"
                          value={dateFilterStart}
                          onChange={(e) => setDateFilterStart(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 whitespace-nowrap">To:</label>
                        <input
                          type="date"
                          value={dateFilterEnd}
                          onChange={(e) => setDateFilterEnd(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                      {getDateFilterDescription()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Day Off Requests Grid */}
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
                    <div className="bg-orange-100 rounded-full p-2">
                      <CalendarDays className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.requesterUserId?.fullName || 'Unknown Employee'}
                      </h3>
                      <p className="text-sm text-gray-500">{request.requesterUserId?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(request.requestedDayOff)}`}>
                      {getUrgencyText(request.requestedDayOff)}
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

                  {/* Day Off Swap Details */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Day Off Swap:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-red-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Giving up: {formatDateOnly(request.originalDayOff)}</span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <div className="flex items-center text-green-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Wants: {formatDateOnly(request.requestedDayOff)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shift Details (if provided) */}
                  {request.shiftStartDate && request.shiftEndDate && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-700 mb-2">Shift Details:</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-blue-600">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDate(request.shiftStartDate)} - {formatDate(request.shiftEndDate)}</span>
                        </div>
                        {request.overtimeStart && (
                          <div className="flex items-center text-xs text-blue-600">
                            <Plus className="h-3 w-3 mr-1" />
                            <span>Overtime: {formatDate(request.overtimeStart)} - {formatDate(request.overtimeEnd)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Matches Count */}
                  {request.matches && request.matches.length > 0 && (
                    <div className="flex items-center text-sm text-blue-600">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{request.matches.length} match{request.matches.length !== 1 ? 'es' : ''} proposed</span>
                    </div>
                  )}

                  {/* Your Match Status */}
                  {hasAlreadyMatched(request) && (
                    <div className="flex items-center text-sm text-green-600 bg-green-50 rounded-lg p-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>You've already proposed a match</span>
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
                    {canTakeAction(request) && !hasAlreadyMatched(request) && canMatchRequest(request) && (
                      <button
                        onClick={() => openMatchModal(request)}
                        className="inline-flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors duration-200"
                      >
                        <ArrowLeftRight className="h-3 w-3 mr-1" />
                        Swap now!
                      </button>
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
            <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No day off swaps available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {dayOffRequests.length === 0
                ? 'No one has posted any day off swap requests yet.'
                : 'Try adjusting your search or filters to find more swaps.'
              }
            </p>
            {(searchTerm || statusFilter !== 'available' || sortBy !== 'newest' || dateFilterStart || dateFilterEnd || dateFilterType !== 'requested') && (
              <button
                onClick={clearAllFilters}
                className="mt-3 inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors duration-200"
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
                <h3 className="text-lg font-medium text-gray-900">Day Off Swap Details</h3>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border mt-1 ${getUrgencyColor(selectedRequest.requestedDayOff)}`}>
                        {getUrgencyText(selectedRequest.requestedDayOff)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Reason for Swap</h4>
                  <p className="text-sm text-blue-800">{selectedRequest.reason}</p>
                </div>

                {/* Day Off Swap Details */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-3">Day Off Swap Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-orange-700">Giving Up (Original Day Off)</label>
                      <p className="text-sm text-orange-900">{formatDateOnly(selectedRequest.originalDayOff)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-700">Wants (Requested Day Off)</label>
                      <p className="text-sm text-orange-900">{formatDateOnly(selectedRequest.requestedDayOff)}</p>
                    </div>
                  </div>
                </div>

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
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-900 mb-3">Overtime Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRequest.overtimeStart && (
                        <div>
                          <label className="block text-sm font-medium text-indigo-700">Overtime Start</label>
                          <p className="text-sm text-indigo-900">{formatDate(selectedRequest.overtimeStart)}</p>
                        </div>
                      )}
                      {selectedRequest.overtimeEnd && (
                        <div>
                          <label className="block text-sm font-medium text-indigo-700">Overtime End</label>
                          <p className="text-sm text-indigo-900">{formatDate(selectedRequest.overtimeEnd)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Matches Section */}
                {selectedRequest.matches && selectedRequest.matches.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3">Match Proposals ({selectedRequest.matches.length})</h4>
                    <div className="space-y-3">
                      {selectedRequest.matches.map((match, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {match.matchedBy?.fullName || 'Unknown Employee'}
                                  </p>
                                  <p className="text-xs text-gray-500">{match.matchedBy?.email || 'Unknown Email'}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-600">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  Their day off: {formatDateOnly(match.originalDayOff)}
                                </p>
                                {match.shiftStartDate && match.shiftEndDate && (
                                  <p className="text-xs text-gray-600">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    Shift: {formatDate(match.shiftStartDate)} - {formatDate(match.shiftEndDate)}
                                  </p>
                                )}
                                {match.overtimeStart && (
                                  <p className="text-xs text-gray-600">
                                    <Plus className="h-3 w-3 inline mr-1" />
                                    Overtime: {formatDate(match.overtimeStart)} - {formatDate(match.overtimeEnd)}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Proposed on {formatDate(match.matchedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${match.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                match.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                {match.status.toUpperCase()}
                              </span>
                              {match.matchedBy?._id === employeeData?.id && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  Your Proposal
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
                  {canTakeAction(selectedRequest) && !hasAlreadyMatched(selectedRequest) && canMatchRequest(selectedRequest) && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        openMatchModal(selectedRequest);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center"
                    >
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Offer to get
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Proposal Modal */}
      {showMatchModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Propose Day Off Match</h3>
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Original Request Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Original Request</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>From:</strong> {selectedRequest.requesterUserId?.fullName}</p>
                  <p><strong>Giving up:</strong> {formatDateOnly(selectedRequest.originalDayOff)}</p>
                  <p><strong>Wants:</strong> {formatDateOnly(selectedRequest.requestedDayOff)}</p>
                  <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-3">Your Match Proposal</h4>
                  <p className="text-sm text-orange-800 mb-4">
                    To match this request, your original day off must be the same as their requested day off ({formatDateOnly(selectedRequest.requestedDayOff)}).
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Original Day Off *
                        <span className="text-xs text-gray-500 block">
                          (Must match their requested day: {formatDateOnly(selectedRequest.requestedDayOff)})
                        </span>
                      </label>
                      <input
                        type="date"
                        value={matchData.originalDayOff}
                        onChange={(e) => setMatchData({ ...matchData, originalDayOff: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Shift Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Shift Details (Optional)</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Include your shift details for the day you're giving up, if applicable.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift Start
                      </label>
                      <input
                        type="datetime-local"
                        value={matchData.shiftStartDate}
                        onChange={(e) => setMatchData({ ...matchData, shiftStartDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift End
                      </label>
                      <input
                        type="datetime-local"
                        value={matchData.shiftEndDate}
                        onChange={(e) => setMatchData({ ...matchData, shiftEndDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Overtime Details */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-900 mb-3">Overtime (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overtime Start
                      </label>
                      <input
                        type="datetime-local"
                        value={matchData.overtimeStart}
                        onChange={(e) => setMatchData({ ...matchData, overtimeStart: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overtime End
                      </label>
                      <input
                        type="datetime-local"
                        value={matchData.overtimeEnd}
                        onChange={(e) => setMatchData({ ...matchData, overtimeEnd: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Your original day off must exactly match their requested day off</li>
                    <li>• You will get their original day off ({formatDateOnly(selectedRequest.originalDayOff)}) in return</li>
                    <li>• The requester will be notified of your match proposal via email</li>
                    <li>• All dates must be in the future</li>
                    <li>• If both parties accept, supervisors will need to approve the swap</li>
                  </ul>
                </div>

                {/* Match Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Match Summary</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>You give up:</strong> {matchData.originalDayOff ? formatDateOnly(matchData.originalDayOff) : 'Not selected'}</p>
                    <p><strong>You get:</strong> {formatDateOnly(selectedRequest.originalDayOff)}</p>
                    <p><strong>He give up:</strong> {formatDateOnly(selectedRequest.originalDayOff)}</p>
                    <p><strong>He get:</strong> {matchData.originalDayOff ? formatDateOnly(matchData.originalDayOff) : 'Not selected'}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowMatchModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMatchDayOff}
                    disabled={!matchData.originalDayOff}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Offer to get
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

export default DayOffSwapsPage;