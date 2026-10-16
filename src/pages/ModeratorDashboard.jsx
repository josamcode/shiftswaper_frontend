import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Calendar,
  RefreshCw,
  Eye,
  X,
  LogOut,
  AlertCircle,
  Search,
  CalendarDays,
  Zap,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// Shared presentation classes
const TH = 'whitespace-nowrap px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.1em] text-ink/50';
const TD = 'px-5 py-4 align-middle';
const DT = 'text-[12px] font-semibold uppercase tracking-[0.1em] text-ink/45';
const ICON_BTN = 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55';

const getInitials = (name, fallback) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
};

const EmptyState = ({ icon: Icon, title, text }) => (
  <div className="px-6 py-14 text-center">
    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-200 text-ink/60">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <p className="mt-4 font-display text-xl text-ink">{title}</p>
    {text && <p className="mx-auto mt-1 max-w-sm text-sm text-ink/55">{text}</p>}
  </div>
);

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
      confirmButtonColor: '#2998FF',
      cancelButtonColor: '#A9A4B4',
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
      case 'approved': return 'bg-mint-200 text-mint-700';
      case 'rejected': return 'bg-rose-200 text-rose-700';
      default: return 'bg-sand-200 text-ink/70';
    }
  };

  const getTypeColor = (type) => {
    return type === 'shift' ? 'bg-lavender-200 text-lavender-700' : 'bg-peach-200 text-peach-700';
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

  // Close the details modal with Escape
  useEffect(() => {
    if (!showViewModal) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowViewModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showViewModal]);

  // Dashboard Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-200 text-lavender-700">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">{shiftRequests.length}</p>
          <p className="mt-2 text-sm font-medium text-ink/55">Shift Requests</p>
        </div>
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-peach-200 text-peach-700">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">{dayOffRequests.length}</p>
          <p className="mt-2 text-sm font-medium text-ink/55">Day Off Requests</p>
        </div>
      </div>
      {/* Recent Requests */}
      <section className="app-card overflow-hidden" aria-labelledby="moderator-recent-title">
        <div className="border-b border-ink/[0.07] px-5 py-4 sm:px-6">
          <h2 id="moderator-recent-title" className="font-display text-xl text-ink">Recent Requests</h2>
        </div>
        {[...filteredShiftRequests, ...filteredDayOffRequests].length > 0 ? (
          <ul className="divide-y divide-ink/[0.06]">
            {[...filteredShiftRequests, ...filteredDayOffRequests]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((request) => (
                <li key={request._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${request.type === 'shift' ? 'bg-lavender-200 text-lavender-700' : 'bg-peach-200 text-peach-700'}`}>
                      {request.type === 'shift' ? <Zap className="h-4 w-4" aria-hidden="true" /> : <CalendarDays className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{request.reason}</p>
                      <p className="text-xs text-ink/50">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 pl-[52px] sm:pl-0">
                    <span className={`chip ${getTypeColor(request.type || (request.shiftStartDate ? 'shift' : 'dayoff'))}`}>
                      {request.type === 'shift' ? 'Shift' : 'Day Off'}
                    </span>
                    <span className={`chip capitalize ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No requests to show"
            text="Approved and rejected swap requests will appear here."
          />
        )}
      </section>
    </div>
  );

  // Requests Management Tab
  const renderRequests = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="app-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by reason..."
                aria-label="Search requests by reason or employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="field h-11 py-0 pl-10"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="field h-11 py-0 sm:w-44"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              loadShiftRequests();
              loadDayOffRequests();
            }}
            className="btn btn-white btn-md self-start md:self-auto"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>
      {/* Requests Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-sand-100">
              <tr>
                <th scope="col" className={TH}>Request Details</th>
                <th scope="col" className={TH}>Type</th>
                <th scope="col" className={TH}>Status</th>
                <th scope="col" className={TH}>Created</th>
                <th scope="col" className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {[...filteredShiftRequests.map(req => ({ ...req, type: 'shift' })), ...filteredDayOffRequests.map(req => ({ ...req, type: 'dayoff' }))]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((request) => (
                  <tr key={request._id} className="transition-colors hover:bg-sand-50">
                    <td className={TD}>
                      <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${request.type === 'shift' ? 'bg-lavender-200 text-lavender-700' : 'bg-peach-200 text-peach-700'}`}>
                          {request.type === 'shift' ? <Zap className="h-4 w-4" aria-hidden="true" /> : <CalendarDays className="h-4 w-4" aria-hidden="true" />}
                        </span>
                        <div className="min-w-0">
                          <div className="max-w-[280px] truncate text-sm font-medium text-ink" title={request.reason}>{request.reason}</div>
                          <div className="whitespace-nowrap text-[13px] text-ink/60">
                            {request.type === 'shift'
                              ? `${formatDate(request.shiftStartDate)} - ${formatDate(request.shiftEndDate)}`
                              : `${formatDateOnly(request.originalDayOff)} → ${formatDateOnly(request.requestedDayOff)}`
                            }
                          </div>
                          <div className="whitespace-nowrap text-xs text-ink/45">
                            By: {request.requesterUserId?.fullName || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={TD}>
                      <span className={`chip whitespace-nowrap ${getTypeColor(request.type)}`}>
                        {request.type === 'shift' ? 'Shift Swap' : 'Day Off Swap'}
                      </span>
                    </td>
                    <td className={TD}>
                      <span className={`chip whitespace-nowrap capitalize ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`${TD} whitespace-nowrap text-sm text-ink/55`}>
                      {formatDate(request.createdAt)}
                    </td>
                    <td className={`${TD} text-right`}>
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button - Always available */}
                        <button
                          type="button"
                          onClick={() => viewRequestDetails(request, request.type)}
                          className={`${ICON_BTN} border border-ink/10 bg-white text-ink hover:bg-sand-100`}
                          title="View Details"
                          aria-label="View details"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {[...filteredShiftRequests, ...filteredDayOffRequests].length === 0 && !isLoading && (
          <EmptyState
            icon={Calendar}
            title="No requests found"
            text="Try adjusting your search or filters."
          />
        )}
      </div>
    </div>
  );

  if (isLoading && shiftRequests.length === 0 && dayOffRequests.length === 0) {
    return (
      <div className="app-page flex items-center justify-center px-5">
        <div className="text-center" role="status" aria-live="polite">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-500"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm text-ink/55">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      {/* Page hero: identity + account actions */}
      <section className="app-hero">
        <div className="container-site py-6 sm:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mint-200 font-display text-xl text-mint-700"
                aria-hidden="true"
              >
                {getInitials(moderatorData?.fullName, 'M')}
              </span>
              <div className="min-w-0">
                <span className="chip bg-sand-200 text-ink/70">Moderator</span>
                <h1 className="app-title mt-1.5 break-words">
                  Welcome, {moderatorData?.fullName || 'Moderator'}
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-ink/55">
                  <span className="break-all">{moderatorData?.email || 'Your Email'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{moderatorData?.companyName || 'Your Company'}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip h-9 bg-sand-200 px-3 text-ink/70">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Read-only view
              </span>
              <button type="button" onClick={handleLogout} className="btn btn-white btn-md">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </button>
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
              className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-rose-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="app-tabs mb-6 w-fit max-w-full rounded-full border border-ink/[0.07] bg-white p-1 shadow-soft"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className="app-tab"
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'requests'}
            onClick={() => setActiveTab('requests')}
            className="app-tab"
          >
            All Requests
          </button>
        </div>
        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'requests' && renderRequests()}
      </div>
      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="moderator-view-title">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/[0.07] bg-white px-6 py-5">
              <h2 id="moderator-view-title" className="font-display text-2xl text-ink">Request Details</h2>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {/* Request Information */}
              <section className="rounded-2xl bg-sand-100 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-ink">Request Information</h3>
                <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className={DT}>ID</dt>
                    <dd className="mt-1 break-all font-mono text-sm text-ink">{selectedRequest._id}</dd>
                  </div>
                  <div>
                    <dt className={DT}>Type</dt>
                    <dd className="mt-1">
                      <span className={`chip ${getTypeColor(selectedRequest.type)}`}>
                        {selectedRequest.type === 'shift' ? 'Shift Swap' : 'Day Off Swap'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className={DT}>Status</dt>
                    <dd className="mt-1">
                      <span className={`chip capitalize ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.replace('_', ' ')}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className={DT}>Requested By</dt>
                    <dd className="mt-1 text-sm text-ink">{selectedRequest.requesterUserId?.fullName || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className={DT}>Created</dt>
                    <dd className="mt-1 text-sm text-ink">{formatDate(selectedRequest.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className={DT}>Reason</dt>
                    <dd className="mt-1 break-words text-sm text-ink">{selectedRequest.reason}</dd>
                  </div>
                </dl>
              </section>
              {/* Day Off Details (for day off requests) */}
              {selectedRequest.type === 'dayoff' && (
                <section className="rounded-2xl border border-peach-300 bg-peach-100 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-peach-700">Day Off Details</h3>
                  <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className={DT}>Original Day Off</dt>
                      <dd className="mt-1 text-sm text-ink">{formatDateOnly(selectedRequest.originalDayOff)}</dd>
                    </div>
                    <div>
                      <dt className={DT}>Requested Day Off</dt>
                      <dd className="mt-1 text-sm text-ink">{formatDateOnly(selectedRequest.requestedDayOff)}</dd>
                    </div>
                  </dl>
                </section>
              )}
              {/* Shift Details */}
              {(selectedRequest.shiftStartDate || selectedRequest.shiftEndDate) && (
                <section className="rounded-2xl border border-lavender-300 bg-lavender-100 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-lavender-700">Shift Details</h3>
                  <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedRequest.shiftStartDate && (
                      <div>
                        <dt className={DT}>Shift Start</dt>
                        <dd className="mt-1 text-sm text-ink">{formatDate(selectedRequest.shiftStartDate)}</dd>
                      </div>
                    )}
                    {selectedRequest.shiftEndDate && (
                      <div>
                        <dt className={DT}>Shift End</dt>
                        <dd className="mt-1 text-sm text-ink">{formatDate(selectedRequest.shiftEndDate)}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}
              {/* Overtime Details */}
              {(selectedRequest.overtimeStart || selectedRequest.overtimeEnd) && (
                <section className="rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-brand-700">Overtime Details</h3>
                  <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedRequest.overtimeStart && (
                      <div>
                        <dt className={DT}>Overtime Start</dt>
                        <dd className="mt-1 text-sm text-ink">{formatDate(selectedRequest.overtimeStart)}</dd>
                      </div>
                    )}
                    {selectedRequest.overtimeEnd && (
                      <div>
                        <dt className={DT}>Overtime End</dt>
                        <dd className="mt-1 text-sm text-ink">{formatDate(selectedRequest.overtimeEnd)}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}
              {/* Rejection/Approval Comment */}
              {(selectedRequest.status === 'rejected' || selectedRequest.status === 'approved') && selectedRequest.comment && (
                <section className={`${selectedRequest.status === 'rejected' ? 'border-rose-300 bg-rose-100' : 'border-mint-300 bg-mint-100'} rounded-2xl border p-4 sm:p-5`}>
                  <h3 className={`text-sm font-semibold ${selectedRequest.status === 'rejected' ? 'text-rose-700' : 'text-mint-700'}`}>
                    {selectedRequest.status === 'rejected' ? 'Rejection' : 'Approval'} Comment
                  </h3>
                  <p className="mt-2 break-words text-sm text-ink/80">
                    {selectedRequest.comment}
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorDashboard;
