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
  AlertCircle,
  User,
  ArrowRight,
  MessageSquare,
  CheckCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { StatusBadge, UrgencyBadge } from '../components/product/Mockups';

/* Presentational helpers ------------------------------------------------ */
const EYEBROW = 'text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45';

const ModalHeader = ({ id, title, onClose }) => (
  <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/[0.07] bg-white px-6 py-4">
    <h2 id={id} className="font-display text-[22px] leading-tight text-ink sm:text-2xl">{title}</h2>
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
);

const ModalFooter = ({ children }) => (
  <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-ink/[0.07] bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end">
    {children}
  </div>
);

const DetailSection = ({ title, tone = 'bg-sand-100', titleClass = 'text-ink/45', children }) => (
  <section className={`rounded-2xl p-4 sm:p-5 ${tone}`}>
    <h3 className={`mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] ${titleClass}`}>{title}</h3>
    {children}
  </section>
);

const Detail = ({ label, className = '', children }) => (
  <div className={className}>
    <dt className="text-xs font-medium text-ink/50">{label}</dt>
    <dd className="mt-1 text-sm text-ink">{children}</dd>
  </div>
);

const ShiftSwapsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);

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

  // Escape closes an open modal (same as its close button).
  useEffect(() => {
    if (!showViewModal && !showCounterOfferModal) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setShowViewModal(false);
      setShowCounterOfferModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showViewModal, showCounterOfferModal]);

  const loadEmployeeData = () => {
    try {
      const storedEmployeeData = Cookies.get('employee_data') || Cookies.get('supervisor_data') || Cookies.get('sme_data');
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
      const employeeToken = Cookies.get('employee_token');
      const supervisorToken = Cookies.get('supervisor_token');
      const smeToken = Cookies.get('sme_token');

      let token = null;
      let userRole = null;

      if (supervisorToken) {
        token = supervisorToken;
        userRole = 'supervisor';
      } else if (employeeToken) {
        token = employeeToken;
        userRole = 'employee';
      } else if (smeToken) {
        token = smeToken;
        userRole = 'employee';
      } else {
        // No valid token found
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
    successElement.className = 'fixed left-4 right-4 top-[86px] z-[70] rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-float animate-slide-down sm:left-auto sm:max-w-sm';
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
      <div className="app-page flex items-center justify-center">
        <div className="text-center" role="status">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-500" aria-hidden="true" />
          <p className="mt-4 text-sm text-ink/55">Loading available shifts...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'available' || sortBy !== 'newest' || dateFilterStart || dateFilterEnd;

  return (
    <div className="app-page">
      {/* Page hero */}
      <section className="app-hero">
        <div className="container-site py-6 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lavender-200 text-lavender-700 sm:h-14 sm:w-14" aria-hidden="true">
                <Handshake className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="app-title">
                  Shift Swaps Board
                </h1>
                <p className="mt-1 text-[15px] text-ink/55">Find shifts to swap with your colleagues</p>
              </div>
            </div>
            <div className="self-start rounded-2xl bg-sand-200 px-5 py-3 sm:self-auto sm:text-right">
              <p className="text-sm font-medium text-ink">
                <span className="font-display text-2xl leading-none">{filteredRequests.length}</span> Available Shifts
              </p>
              <p className="mt-0.5 text-xs text-ink/55">
                From {new Set(filteredRequests.map(req => req.requesterUserId?.fullName)).size} colleagues
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-site py-8">
        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-6" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
              className="-my-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-rose-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="app-card mb-6 p-4">
          {/* First Row - Main Filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <label htmlFor="shift-board-search" className="sr-only">Search by reason or employee</label>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
                <input
                  id="shift-board-search"
                  type="text"
                  placeholder="Search by reason or employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="field h-11 py-2 pl-10"
                />
              </div>

              {/* Status Filter */}
              <label htmlFor="shift-board-status" className="sr-only">Show</label>
              <select
                id="shift-board-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field h-11 w-auto min-w-0 flex-1 basis-[calc(50%_-_4px)] px-3 py-2 text-sm sm:flex-none sm:basis-auto"
              >
                <option value="available">Available Only</option>
                <option value="all">All Requests</option>
              </select>

              {/* Sort By */}
              <label htmlFor="shift-board-sort" className="sr-only">Sort by</label>
              <select
                id="shift-board-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="field h-11 w-auto min-w-0 flex-1 basis-[calc(50%_-_4px)] px-3 py-2 text-sm sm:flex-none sm:basis-auto"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="urgent">Most Urgent</option>
              </select>

              {/* Date Filter Toggle */}
              <button
                type="button"
                onClick={() => setShowDateFilters(!showDateFilters)}
                aria-expanded={showDateFilters}
                className={`btn btn-md border ${showDateFilters || dateFilterStart || dateFilterEnd
                  ? 'border-brand-200 bg-brand-50 text-brand-700'
                  : 'border-ink/10 bg-white text-ink hover:bg-sand-100'
                  }`}
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Date Filter
                {(dateFilterStart || dateFilterEnd) && (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                    Active
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn btn-ghost btn-md"
                >
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  Clear All
                </button>
              )}

              {/* Refresh */}
              <button
                type="button"
                onClick={loadShiftRequests}
                className="btn btn-white btn-md border border-ink/10"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>

          {/* Second Row - Date Filters (Collapsible) */}
          {showDateFilters && (
            <div className="mt-4 border-t border-ink/[0.06] pt-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-ink/45" aria-hidden="true" />
                  <span className="text-sm font-medium text-ink/80">Filter by shift date:</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor="shift-board-from" className="w-10 text-sm text-ink/60 sm:w-auto">From:</label>
                    <input
                      id="shift-board-from"
                      type="date"
                      value={dateFilterStart}
                      onChange={(e) => setDateFilterStart(e.target.value)}
                      className="field h-11 w-auto py-2"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="shift-board-to" className="w-10 text-sm text-ink/60 sm:w-auto">To:</label>
                    <input
                      id="shift-board-to"
                      type="date"
                      value={dateFilterEnd}
                      onChange={(e) => setDateFilterEnd(e.target.value)}
                      className="field h-11 w-auto py-2"
                    />
                  </div>

                  {(dateFilterStart || dateFilterEnd) && (
                    <button
                      type="button"
                      onClick={clearDateFilters}
                      className="btn btn-ghost btn-sm"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Clear dates
                    </button>
                  )}
                </div>
              </div>

              {(dateFilterStart || dateFilterEnd) && (
                <p className="mt-3 text-sm text-ink/55">
                  {dateFilterStart && dateFilterEnd ? (
                    <>Showing shifts from {new Date(dateFilterStart).toLocaleDateString()} to {new Date(dateFilterEnd).toLocaleDateString()}</>
                  ) : dateFilterStart ? (
                    <>Showing shifts from {new Date(dateFilterStart).toLocaleDateString()} onwards</>
                  ) : (
                    <>Showing shifts until {new Date(dateFilterEnd).toLocaleDateString()}</>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Shift Requests Grid */}
        {filteredRequests.length > 0 && (
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRequests.map((request) => (
              <li
                key={request._id}
                className="app-card flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lift"
              >
                {/* Card Header */}
                <div className="p-5 pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lavender-200 text-lavender-700" aria-hidden="true">
                      <Zap className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-ink">
                        {request.requesterUserId?.fullName || 'Unknown Employee'}
                      </h2>
                      <p className="truncate text-sm text-ink/50">{request.requesterUserId?.email || ''}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <UrgencyBadge level={getUrgencyText(request.shiftStartDate).toLowerCase()} />
                    <StatusBadge status={request.status} />
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex-1 space-y-4 px-5 pb-5">
                  {/* Reason */}
                  <div>
                    <p className={EYEBROW}>Reason</p>
                    <p className="mt-1 line-clamp-2 break-words text-sm text-ink/80">{request.reason}</p>
                  </div>

                  {/* Shift Details */}
                  <div className="rounded-xl bg-sand-100 p-3.5">
                    <p className={`${EYEBROW} mb-2`}>Shift Details</p>
                    <ul className="space-y-1.5 text-[13px] text-ink/70">
                      <li className="flex items-start gap-2">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/40" aria-hidden="true" />
                        <span>{formatDate(request.shiftStartDate)} - {formatDate(request.shiftEndDate)}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/40" aria-hidden="true" />
                        <span>Desired: {formatDate(request.desiredShiftStartDate)} - {formatDate(request.desiredShiftEndDate)}</span>
                      </li>
                      {request.overtimeStart && (
                        <li className="flex items-start gap-2">
                          <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/40" aria-hidden="true" />
                          <span>Overtime: {formatDate(request.overtimeStart)} - {formatDate(request.overtimeEnd)}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Offers Count */}
                  {request.negotiationHistory && request.negotiationHistory.length > 0 && (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-lavender-700">
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      <span>{request.negotiationHistory.length} offer{request.negotiationHistory.length !== 1 ? 's' : ''} received</span>
                    </p>
                  )}

                  {/* Your Offer Status */}
                  {hasAlreadyOffered(request) && (
                    <p className="flex items-center gap-2 rounded-xl bg-mint-100 px-3 py-2 text-sm font-medium text-mint-700">
                      <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>You've already made an offer</span>
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/[0.06] bg-sand-50 px-5 py-3.5">
                  <p className="text-xs text-ink/50">
                    Posted {formatDateOnly(request.createdAt)}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => viewRequestDetails(request)}
                      className="btn btn-white btn-sm border border-ink/10"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      View
                    </button>

                    {/* Action Buttons */}
                    {canTakeAction(request) && !hasAlreadyOffered(request) && (
                      <>
                        {/* Offer */}
                        <button
                          type="button"
                          onClick={() => openCounterOfferModal(request)}
                          className="btn btn-primary btn-sm btn-arrow"
                        >
                          Make offer
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="app-card flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lavender-200 text-lavender-700" aria-hidden="true">
              <Handshake className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-2xl text-ink">No shift swaps available</h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink/55">
              {shiftRequests.length === 0
                ? 'No one has posted any shift swap requests yet.'
                : 'Try adjusting your search or filters to find more shifts.'
              }
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn btn-primary btn-md mt-6"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="shift-view-title">
            <ModalHeader id="shift-view-title" title="Shift Swap Details" onClose={() => setShowViewModal(false)} />

            <div className="space-y-4 p-6">
              {/* Request Information */}
              <DetailSection title="Request Information">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail label="Requested By">
                    <span className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block">{selectedRequest.requesterUserId?.fullName || 'Unknown'}</span>
                        <span className="block break-all text-xs text-ink/55">{selectedRequest.requesterUserId?.email || ''}</span>
                      </span>
                    </span>
                  </Detail>
                  <Detail label="Status">
                    <StatusBadge status={selectedRequest.status} />
                  </Detail>
                  <Detail label="Posted">{formatDate(selectedRequest.createdAt)}</Detail>
                  <Detail label="Urgency">
                    <UrgencyBadge level={getUrgencyText(selectedRequest.shiftStartDate).toLowerCase()} />
                  </Detail>
                </dl>
              </DetailSection>

              {/* Reason */}
              <DetailSection title="Reason for Swap" tone="border border-ink/[0.07] bg-white">
                <p className="break-words text-sm text-ink/80">{selectedRequest.reason}</p>
              </DetailSection>

              {/* Shift Details */}
              <DetailSection title="Shift Details" tone="bg-lavender-100" titleClass="text-lavender-700">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail label="Shift Start">{formatDate(selectedRequest.shiftStartDate)}</Detail>
                  <Detail label="Shift End">{formatDate(selectedRequest.shiftEndDate)}</Detail>
                </dl>
              </DetailSection>

              {/* Overtime Details */}
              {(selectedRequest.overtimeStart || selectedRequest.overtimeEnd) && (
                <DetailSection title="Overtime Details" tone="bg-butter-100" titleClass="text-butter-700">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedRequest.overtimeStart && (
                      <Detail label="Overtime Start">{formatDate(selectedRequest.overtimeStart)}</Detail>
                    )}
                    {selectedRequest.overtimeEnd && (
                      <Detail label="Overtime End">{formatDate(selectedRequest.overtimeEnd)}</Detail>
                    )}
                  </dl>
                </DetailSection>
              )}

              {/* Counter Offers Section */}
              {selectedRequest.negotiationHistory && selectedRequest.negotiationHistory.length > 0 && (
                <DetailSection title={`Counter Offers (${selectedRequest.negotiationHistory.length})`} tone="border border-ink/[0.07] bg-white">
                  <ul className="space-y-3">
                    {selectedRequest.negotiationHistory.map((offer, index) => (
                      <li key={index} className="rounded-xl border border-ink/[0.07] bg-sand-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-start gap-2">
                              <User className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">
                                  {offer.offeredBy?.fullName || 'Unknown Employee'}
                                </p>
                                <p className="break-all text-xs text-ink/55">{offer.offeredBy?.email || 'Unknown Email'}</p>
                              </div>
                            </div>
                            <div className="space-y-1 text-xs text-ink/60">
                              <p className="flex items-start gap-1.5">
                                <Clock className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
                                <span>{formatDate(offer.shiftStartDate)} - {formatDate(offer.shiftEndDate)}</span>
                              </p>
                              {offer.overtimeStart && (
                                <p className="flex items-start gap-1.5">
                                  <Plus className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
                                  <span>Overtime: {formatDate(offer.overtimeStart)} - {formatDate(offer.overtimeEnd)}</span>
                                </p>
                              )}
                              <p className="text-ink/50">
                                Offered on {formatDate(offer.offeredAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <span className={`chip capitalize ${offer.status === 'accepted' ? 'bg-mint-200 text-mint-700' :
                              offer.status === 'rejected' ? 'bg-rose-200 text-rose-700' :
                                'bg-butter-200 text-butter-700'
                              }`}>
                              {offer.status}
                            </span>
                            {offer.offeredBy?._id === employeeData?.id && (
                              <span className="chip bg-brand-100 text-brand-700">
                                Your Offer
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              )}
            </div>

            {/* Action Buttons */}
            <ModalFooter>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="btn btn-white btn-md border border-ink/10"
              >
                Close
              </button>
              {canTakeAction(selectedRequest) && !hasAlreadyOffered(selectedRequest) && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      openCounterOfferModal(selectedRequest);
                    }}
                    className="btn btn-primary btn-md btn-arrow"
                  >
                    Make offer
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </ModalFooter>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showCounterOfferModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="shift-offer-title">
            <ModalHeader id="shift-offer-title" title="Make Offer" onClose={() => setShowCounterOfferModal(false)} />

            <div className="space-y-5 p-6">
              {/* Original Request Info */}
              <DetailSection title="Original Request">
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Detail label="From">{selectedRequest.requesterUserId?.fullName}</Detail>
                  <Detail label="Shift">{formatDate(selectedRequest.shiftStartDate)} - {formatDate(selectedRequest.shiftEndDate)}</Detail>
                  <Detail label="Desired">{formatDate(selectedRequest.desiredShiftStartDate)} - {formatDate(selectedRequest.desiredShiftEndDate)}</Detail>
                  <Detail label="Reason">
                    <span className="break-words">{selectedRequest.reason}</span>
                  </Detail>
                </dl>
              </DetailSection>

              <section>
                <h3 className="text-[15px] font-semibold text-ink">Your Offer</h3>
                <p className="mb-4 mt-1 text-sm text-ink/55">
                  Propose your own shift times for the same day. The requester can then choose to accept your offer.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="offer-shift-start" className="field-label">
                      Your Shift Start *
                    </label>
                    <input
                      id="offer-shift-start"
                      type="datetime-local"
                      value={counterOfferData.shiftStartDate}
                      onChange={(e) => setCounterOfferData({ ...counterOfferData, shiftStartDate: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="offer-shift-end" className="field-label">
                      Your Shift End *
                    </label>
                    <input
                      id="offer-shift-end"
                      type="datetime-local"
                      value={counterOfferData.shiftEndDate}
                      onChange={(e) => setCounterOfferData({ ...counterOfferData, shiftEndDate: e.target.value })}
                      className="field"
                    />
                  </div>
                </div>
              </section>

              {/* Overtime Details */}
              <section className="rounded-2xl bg-sand-100 p-4 sm:p-5">
                <h3 className="mb-3 text-[15px] font-semibold text-ink">Overtime (Optional)</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="offer-ot-start" className="field-label">
                      Overtime Start
                    </label>
                    <input
                      id="offer-ot-start"
                      type="datetime-local"
                      value={counterOfferData.overtimeStart}
                      onChange={(e) => setCounterOfferData({ ...counterOfferData, overtimeStart: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="offer-ot-end" className="field-label">
                      Overtime End
                    </label>
                    <input
                      id="offer-ot-end"
                      type="datetime-local"
                      value={counterOfferData.overtimeEnd}
                      onChange={(e) => setCounterOfferData({ ...counterOfferData, overtimeEnd: e.target.value })}
                      className="field"
                    />
                  </div>
                </div>
              </section>

              {/* Important Notes */}
              <section className="rounded-2xl border border-butter-300 bg-butter-100 p-4 sm:p-5">
                <h3 className="mb-2 text-[15px] font-semibold text-butter-700">Important Notes</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-ink/70 marker:text-butter-500">
                  <li>Your offer must be for the same day as the original request</li>
                  <li>Shift times can be different from the original request</li>
                  <li>The requester will be notified of your offer via email</li>
                  <li>Shifts must be scheduled between tomorrow and 10 days in the future</li>
                </ul>
              </section>

              {error && (
                <div className="alert alert-error" role="alert">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p className="flex-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    aria-label="Dismiss error"
                    className="-my-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-rose-200"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <ModalFooter>
              <button
                type="button"
                onClick={() => setShowCounterOfferModal(false)}
                className="btn btn-white btn-md border border-ink/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCounterOffer}
                className="btn btn-primary btn-md btn-arrow"
              >
                Submit Offer
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </ModalFooter>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftSwapsPage;
