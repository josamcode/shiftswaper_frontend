import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Shield,
  Clock,
  RefreshCw,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  Zap,
  CalendarDays,
  X,
  Loader,
  AlertCircle,
  User,
  Bell,
  LogOut,
  Plus,
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

const combineDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const dateTime = new Date(`${dateStr}T${timeStr}`);
  return isNaN(dateTime.getTime()) ? null : dateTime.toISOString();
};

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [supervisorData, setSupervisorData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Request states
  const [shiftRequests, setShiftRequests] = useState([]);
  const [dayOffRequests, setDayOffRequests] = useState([]);
  const [filteredShiftRequests, setFilteredShiftRequests] = useState([]);
  const [filteredDayOffRequests, setFilteredDayOffRequests] = useState([]);

  // Supervisor's own requests
  const [ownShiftRequests, setOwnShiftRequests] = useState([]);
  const [ownDayOffRequests, setOwnDayOffRequests] = useState([]);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalShiftRequests: 0,
    pendingShiftRequests: 0,
    totalDayOffRequests: 0,
    pendingDayOffRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    ownTotalRequests: 0,
    ownPendingRequests: 0
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('approve'); // approve, reject
  const [actionComment, setActionComment] = useState('');
  const [createType, setCreateType] = useState('shift');

  // Form states for creating requests
  const [formData, setFormData] = useState({
    reason: '',
    shiftStartDate: '',
    shiftEndDate: '',
    overtimeStart: '',
    overtimeEnd: '',
    originalDayOff: '',
    requestedDayOff: ''
  });

  useEffect(() => {
    loadSupervisorData();
  }, []);

  useEffect(() => {
    if (supervisorData) {
      loadShiftRequests();
      loadDayOffRequests();
      loadOwnRequests();
    }
  }, [supervisorData]);

  useEffect(() => {
    filterRequests();
  }, [shiftRequests, dayOffRequests, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    calculateStats(shiftRequests, dayOffRequests, ownShiftRequests, ownDayOffRequests);
  }, [shiftRequests, dayOffRequests, ownShiftRequests, ownDayOffRequests]);

  // Close any open modal with Escape (same effect as its Cancel / close button)
  useEffect(() => {
    if (!showCreateModal && !showViewModal && !showActionModal) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setShowCreateModal(false);
      setShowViewModal(false);
      setShowActionModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showCreateModal, showViewModal, showActionModal]);

  const loadSupervisorData = () => {
    try {
      const storedSupervisorData = Cookies.get('supervisor_data');
      if (storedSupervisorData) {
        const parsedData = JSON.parse(storedSupervisorData);
        if (parsedData && parsedData.id && !parsedData._id) {
          parsedData._id = parsedData.id;
        }
        setSupervisorData(parsedData);
      }
    } catch (error) {
      console.error('Error loading supervisor data:', error);
    }
  };

  const loadShiftRequests = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('supervisor_token');
      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/shift-swap-requests/`, {
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
        // Filter requests that require this supervisor's approval (excluding their own)
        const supervisorRequests = (data.data.requests || []).filter(request =>
          (request.firstSupervisorId?._id === supervisorData?._id ||
            request.secondSupervisorId?._id === supervisorData?._id) &&
          request.negotiationHistory.length > 0 &&
          request.status !== 'offers_received' &&
          request.requesterUserId?._id !== supervisorData?._id
        );
        setShiftRequests(supervisorRequests);
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
      const token = Cookies.get('supervisor_token');
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/day-off-swap-requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter requests that require this supervisor's approval (excluding their own)
          const supervisorRequests = (data.data.requests || []).filter(request =>
            (request.firstSupervisorId?._id === supervisorData?._id ||
              request.secondSupervisorId?._id === supervisorData?._id) &&
            request.status !== 'matched' &&
            request.requesterUserId?._id !== supervisorData?._id
          );
          setDayOffRequests(supervisorRequests);
        }
      }
    } catch (error) {
      console.error('Error loading day off requests:', error);
    }
  };

  // Load supervisor's own requests
  const loadOwnRequests = async () => {
    try {
      const token = Cookies.get('supervisor_token');
      if (!token) return;

      // Load own shift requests
      const shiftResponse = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/shift-swap-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (shiftResponse.ok) {
        const shiftData = await shiftResponse.json();
        if (shiftData.success) {
          const ownShifts = (shiftData.data.requests || []).filter(request => {
            const isOwnRequest = request.requesterUserId?._id === supervisorData?._id;
            const hasOfferedInNegotiation = request.negotiationHistory?.some(
              offer => offer.offeredBy?._id === supervisorData?._id
            );
            return isOwnRequest || hasOfferedInNegotiation;
          });
          setOwnShiftRequests(ownShifts);
        }
      }

      // Load own day off requests
      const dayOffResponse = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/day-off-swap-requests/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (dayOffResponse.ok) {
        const dayOffData = await dayOffResponse.json();
        if (dayOffData.success) {
          setOwnDayOffRequests(dayOffData.data.requests || []);
        }
      }
    } catch (error) {
      console.error('Error loading own requests:', error);
    }
  };

  const calculateStats = (shiftReqs, dayOffReqs, ownShiftReqs, ownDayOffReqs) => {
    const allRequests = [...shiftReqs, ...dayOffReqs];
    const allOwnRequests = [...ownShiftReqs, ...ownDayOffReqs];

    const stats = {
      totalShiftRequests: shiftReqs.length,
      pendingShiftRequests: shiftReqs.filter(req => req.status === 'pending' || req.status === 'offers_received').length,
      totalDayOffRequests: dayOffReqs.length,
      pendingDayOffRequests: dayOffReqs.filter(req => req.status === 'pending' || req.status === 'matched').length,
      approvedRequests: allRequests.filter(req => req.status === 'approved').length,
      rejectedRequests: allRequests.filter(req => req.status === 'rejected').length,
      ownTotalRequests: allOwnRequests.length,
      ownPendingRequests: allOwnRequests.filter(req =>
        req.status === 'pending' || req.status === 'offers_received' || req.status === 'matched'
      ).length
    };
    setDashboardStats(stats);
  };

  const filterRequests = () => {
    let allRequests = [];
    if (typeFilter === 'shift' || typeFilter === 'all') {
      allRequests = [...allRequests, ...shiftRequests.map(req => ({ ...req, type: 'shift' }))];
    }
    if (typeFilter === 'dayoff' || typeFilter === 'all') {
      allRequests = [...allRequests, ...dayOffRequests.map(req => ({ ...req, type: 'dayoff' }))];
    }

    // Search filter
    if (searchTerm) {
      allRequests = allRequests.filter(req =>
        req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.requesterUserId?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.receiverUserId?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        allRequests = allRequests.filter(req =>
          req.status === 'pending' || req.status === 'offers_received' || req.status === 'matched'
        );
      } else {
        allRequests = allRequests.filter(req => req.status === statusFilter);
      }
    }

    // Split back into shift and day off requests
    setFilteredShiftRequests(allRequests.filter(req => req.type === 'shift'));
    setFilteredDayOffRequests(allRequests.filter(req => req.type === 'dayoff'));
  };

  const showSuccessMessage = (message) => {
    const successElement = document.createElement('div');
    successElement.className = 'fixed top-[86px] right-4 z-[70] max-w-[calc(100vw-2rem)] bg-ink text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-float animate-slide-down';
    successElement.textContent = message;
    document.body.appendChild(successElement);
    setTimeout(() => {
      if (document.body.contains(successElement)) {
        document.body.removeChild(successElement);
      }
    }, 3000);
  };

  // Create request handler
  const handleCreateRequest = async () => {
    try {
      setError('');
      const token = Cookies.get('supervisor_token');
      let endpoint, payload;

      if (createType === 'shift') {
        endpoint = '/api/shift-swap-requests/';
        if (!formData.reason || !formData.shiftDate || !formData.shiftStartTime || !formData.shiftEndTime) {
          setError('Please fill in all required fields: Reason, Shift Date, Start Time, and End Time.');
          return;
        }

        const shiftStart = combineDateTime(formData.shiftDate, formData.shiftStartTime);
        const shiftEnd = combineDateTime(formData.shiftDate, formData.shiftEndTime);

        if (!shiftStart || !shiftEnd) {
          setError('Invalid shift date/time.');
          return;
        }

        if (new Date(shiftEnd) <= new Date(shiftStart)) {
          setError('Shift End Time must be after Start Time.');
          return;
        }

        payload = {
          reason: formData.reason.trim(),
          shiftStartDate: shiftStart,
          shiftEndDate: shiftEnd,
        };

        if (formData.overtimeStartTime && formData.overtimeEndTime) {
          const otDate = formData.overtimeDate || formData.shiftDate;
          const otStart = combineDateTime(otDate, formData.overtimeStartTime);
          const otEnd = combineDateTime(otDate, formData.overtimeEndTime);

          if (!otStart || !otEnd || new Date(otEnd) <= new Date(otStart)) {
            setError('Invalid overtime times.');
            return;
          }

          payload.overtimeStart = otStart;
          payload.overtimeEnd = otEnd;
        }
      } else {
        endpoint = '/api/day-off-swap-requests/';

        if (!formData.originalDayOff || !formData.requestedDayOff || !formData.reason) {
          setError('Please fill in all required fields: Original Day Off, Requested Day Off, and Reason.');
          return;
        }

        const shiftStartDate = combineDateTime(formData.shiftDate, formData.shiftStartTime);
        const shiftEndDate = combineDateTime(formData.shiftDate, formData.shiftEndTime);

        if (!shiftStartDate || !shiftEndDate) {
          setError('Shift Start and End times are required for Day Off Swap requests.');
          return;
        }

        if (new Date(shiftEndDate) <= new Date(shiftStartDate)) {
          setError('Shift End must be after Shift Start.');
          return;
        }

        payload = {
          originalDayOff: new Date(formData.originalDayOff).toISOString().split('T')[0],
          requestedDayOff: new Date(formData.requestedDayOff).toISOString().split('T')[0],
          reason: formData.reason.trim(),
          shiftStartDate,
          shiftEndDate
        };

        if (formData.overtimeStartTime && formData.overtimeEndTime) {
          const otDate = formData.overtimeDate || formData.shiftDate;
          const overtimeStart = combineDateTime(otDate, formData.overtimeStartTime);
          const overtimeEnd = combineDateTime(otDate, formData.overtimeEndTime);

          if (!overtimeStart || !overtimeEnd || new Date(overtimeEnd) <= new Date(overtimeStart)) {
            setError('Invalid overtime times.');
            return;
          }

          payload.overtimeStart = overtimeStart;
          payload.overtimeEnd = overtimeEnd;
        }
      }

      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowCreateModal(false);
        setFormData({
          reason: '',
          shiftStartDate: '',
          shiftEndDate: '',
          overtimeStart: '',
          overtimeEnd: '',
          originalDayOff: '',
          requestedDayOff: ''
        });
        await loadOwnRequests();
        showSuccessMessage(`${createType === 'shift' ? 'Shift' : 'Day off'} swap request created successfully!`);
      } else {
        let errorMessage = 'Failed to create request.';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Create Request Network Error:", error);
      setError('Failed to create request due to a network error. Please try again.');
    }
  };

  const handleRequestAction = async () => {
    try {
      setError('');
      const token = Cookies.get('supervisor_token');
      const endpoint = selectedRequest.type === 'shift'
        ? '/api/shift-swap-requests/status'
        : '/api/day-off-swap-requests/status';

      const payload = {
        requestId: selectedRequest._id,
        status: actionType === 'approve' ? 'approved' : 'rejected',
        comment: actionComment || undefined
      };

      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowActionModal(false);
        setActionComment('');
        await loadShiftRequests();
        await loadDayOffRequests();
        showSuccessMessage(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
      } else {
        setError(data.message || `Failed to ${actionType} request`);
      }
    } catch (error) {
      setError(`Failed to ${actionType} request. Please try again.`);
    }
  };

  const openActionModal = (request, type, action) => {
    setSelectedRequest({ ...request, type });
    setActionType(action);
    setActionComment('');
    setShowActionModal(true);
    setError('');
  };

  const viewRequestDetails = (request, type) => {
    setSelectedRequest({ ...request, type });
    setShowViewModal(true);
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
      Cookies.remove('supervisor_token');
      Cookies.remove('supervisor_data');
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
      case 'pending': return 'bg-butter-200 text-butter-700';
      case 'offers_received': return 'bg-lavender-200 text-lavender-700';
      case 'matched': return 'bg-lavender-200 text-lavender-700';
      case 'approved': return 'bg-mint-200 text-mint-700';
      case 'rejected': return 'bg-rose-200 text-rose-700';
      default: return 'bg-sand-200 text-ink/70';
    }
  };

  const getTypeColor = (type) => {
    return type === 'shift' ? 'bg-lavender-200 text-lavender-700' : 'bg-peach-200 text-peach-700';
  };

  const getPriorityColor = (request, type) => {
    if (type === 'shift') {
      const shiftDate = new Date(request.shiftStartDate);
      const now = new Date();
      const hoursUntilShift = (shiftDate - now) / (1000 * 60 * 60);

      if (hoursUntilShift <= 24) return 'bg-rose-200 text-rose-700 border-rose-300';
      if (hoursUntilShift <= 48) return 'bg-peach-200 text-peach-700 border-peach-300';
      return 'bg-sand-200 text-ink/70 border-sand-400';
    } else {
      const requestedDate = new Date(request.requestedDayOff);
      const now = new Date();
      const daysUntilRequested = Math.ceil((requestedDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilRequested <= 3) return 'bg-rose-200 text-rose-700 border-rose-300';
      if (daysUntilRequested <= 7) return 'bg-peach-200 text-peach-700 border-peach-300';
      return 'bg-sand-200 text-ink/70 border-sand-400';
    }
  };

  const getPriorityText = (request, type) => {
    if (type === 'shift') {
      const shiftDate = new Date(request.shiftStartDate);
      const now = new Date();
      const hoursUntilShift = (shiftDate - now) / (1000 * 60 * 60);

      if (hoursUntilShift <= 24) return 'Critical';
      if (hoursUntilShift <= 48) return 'High';
      return 'Normal';
    } else {
      const requestedDate = new Date(request.requestedDayOff);
      const now = new Date();
      const daysUntilRequested = Math.ceil((requestedDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilRequested <= 3) return 'Critical';
      if (daysUntilRequested <= 7) return 'High';
      return 'Normal';
    }
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
    return request.status === 'pending' || request.status === 'offers_received' || request.status === 'matched';
  };

  // Dashboard Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-200 text-lavender-700">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">{dashboardStats.totalShiftRequests}</p>
          <p className="mt-2 text-sm font-medium text-ink/55">Employee Shift Requests</p>
        </div>
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-peach-200 text-peach-700">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">{dashboardStats.totalDayOffRequests}</p>
          <p className="mt-2 text-sm font-medium text-ink/55">Employee Day Off Requests</p>
        </div>
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <User className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">{dashboardStats.ownTotalRequests}</p>
          <p className="mt-2 text-sm font-medium text-ink/55">My Requests</p>
        </div>
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-butter-200 text-butter-700">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">
            {dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests}
          </p>
          <p className="mt-2 text-sm font-medium text-ink/55">Pending Actions</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Requests Requiring Action */}
        <section className="app-card overflow-hidden" aria-labelledby="supervisor-action-title">
          <div className="border-b border-ink/[0.07] px-5 py-4 sm:px-6">
            <h2 id="supervisor-action-title" className="font-display text-xl text-ink">Employee Requests Requiring Action</h2>
          </div>
          {[...filteredShiftRequests, ...filteredDayOffRequests].filter(req => canTakeAction(req)).length > 0 ? (
            <ul className="divide-y divide-ink/[0.06]">
              {[...filteredShiftRequests, ...filteredDayOffRequests]
                .filter(req => canTakeAction(req))
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .slice(0, 5)
                .map((request) => (
                  <li key={request._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${request.type === 'shift' ? 'bg-lavender-200 text-lavender-700' : 'bg-peach-200 text-peach-700'}`}>
                        {request.type === 'shift' ? <Zap className="h-4 w-4" aria-hidden="true" /> : <CalendarDays className="h-4 w-4" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{request.reason}</p>
                        <p className="truncate text-xs text-ink/50">
                          From: {request.requesterUserId?.fullName}
                          {request.receiverUserId && ` & ${request.receiverUserId?.fullName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 pl-[52px] sm:pl-0">
                      <span className={`chip border ${getPriorityColor(request, request.type || (request.shiftStartDate ? 'shift' : 'dayoff'))}`}>
                        {getPriorityText(request, request.type || (request.shiftStartDate ? 'shift' : 'dayoff'))}
                      </span>
                      <span className={`chip capitalize ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="No pending requests"
              text="All employee requests have been processed."
            />
          )}
        </section>

        {/* My Recent Requests */}
        <section className="app-card overflow-hidden" aria-labelledby="supervisor-mine-title">
          <div className="border-b border-ink/[0.07] px-5 py-4 sm:px-6">
            <h2 id="supervisor-mine-title" className="font-display text-xl text-ink">My Recent Requests</h2>
          </div>
          {[...ownShiftRequests, ...ownDayOffRequests].length > 0 ? (
            <ul className="divide-y divide-ink/[0.06]">
              {[...ownShiftRequests.map(req => ({ ...req, type: 'shift' })), ...ownDayOffRequests.map(req => ({ ...req, type: 'dayoff' }))]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
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
                      <span className={`chip ${getTypeColor(request.type)}`}>
                        {request.type === 'shift' ? 'Shift' : 'Day Off'}
                      </span>
                      <span className={`chip capitalize ${getStatusColor(request.status)}`}>
                        {(request.status === 'matched' ? 'offers_received' : request.status).replace('_', ' ')}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <EmptyState
              icon={Shield}
              title="No personal requests"
              text="Create your first request to get started."
            />
          )}
        </section>
      </div>
    </div>
  );

  // My Requests Tab
  const renderMyRequests = () => (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink">My Requests</h2>
          <p className="mt-1 text-sm text-ink/55">Manage your own shift and day off swap requests</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadOwnRequests}
            className="btn btn-white btn-md"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-md"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Request
          </button>
        </div>
      </div>

      {/* My Requests Table */}
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
              {[...ownShiftRequests.map(req => ({ ...req, type: 'shift' })), ...ownDayOffRequests.map(req => ({ ...req, type: 'dayoff' }))]
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
                        {request.status === 'matched' ? 'offers received' : request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`${TD} whitespace-nowrap text-sm text-ink/55`}>
                      {formatDate(request.createdAt)}
                    </td>
                    <td className={TD}>
                      <div className="flex items-center justify-end gap-2">
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
        {[...ownShiftRequests, ...ownDayOffRequests].length === 0 && !isLoading && (
          <EmptyState
            icon={Shield}
            title="No requests found"
            text="Create your first request to get started."
          />
        )}
      </div>
    </div>
  );

  // Employee Requests Management Tab (existing functionality)
  const renderEmployeeRequests = () => (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="app-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Search */}
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by reason or employee..."
                aria-label="Search by reason or employee"
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
              <option value="pending">Pending Only</option>
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by type"
              className="field h-11 py-0 sm:w-44"
            >
              <option value="all">All Types</option>
              <option value="shift">Shift Swaps</option>
              <option value="dayoff">Day Off Swaps</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              loadShiftRequests();
              loadDayOffRequests();
            }}
            className="btn btn-white btn-md self-start lg:self-auto"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {/* Employee Requests Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-sand-100">
              <tr>
                <th scope="col" className={TH}>Request Details</th>
                <th scope="col" className={TH}>Type</th>
                <th scope="col" className={TH}>Priority</th>
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
                            From: {request.requesterUserId?.fullName}
                            {request.receiverUserId && ` & ${request.receiverUserId?.fullName}`}
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
                      <span className={`chip border ${getPriorityColor(request, request.type)}`}>
                        {getPriorityText(request, request.type)}
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
                    <td className={TD}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => viewRequestDetails(request, request.type)}
                          className={`${ICON_BTN} border border-ink/10 bg-white text-ink hover:bg-sand-100`}
                          title="View Details"
                          aria-label="View details"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>

                        {canTakeAction(request) && (
                          <>
                            <button
                              type="button"
                              onClick={() => openActionModal(request, request.type, 'approve')}
                              disabled={actionLoading === request._id}
                              className={`${ICON_BTN} bg-mint-200 text-mint-700 hover:bg-mint-300`}
                              title="Approve Request"
                              aria-label="Approve request"
                            >
                              {actionLoading === request._id ? <Loader className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle className="h-4 w-4" aria-hidden="true" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => openActionModal(request, request.type, 'reject')}
                              disabled={actionLoading === request._id}
                              className={`${ICON_BTN} bg-rose-200 text-rose-700 hover:bg-rose-300`}
                              title="Reject Request"
                              aria-label="Reject request"
                            >
                              {actionLoading === request._id ? <Loader className="h-4 w-4 animate-spin" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {[...filteredShiftRequests, ...filteredDayOffRequests].length === 0 && !isLoading && (
          <EmptyState
            icon={Shield}
            title="No requests found"
            text={[...shiftRequests, ...dayOffRequests].length === 0
              ? 'No employee swap requests require your attention.'
              : 'Try adjusting your search or filters.'
            }
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
          <p className="mt-4 text-sm text-ink/55">Loading supervisor dashboard...</p>
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
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 font-display text-xl text-brand-700"
                aria-hidden="true"
              >
                {getInitials(supervisorData?.fullName, 'S')}
              </span>
              <div className="min-w-0">
                <span className="chip bg-sand-200 text-ink/70">
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  Supervisor
                </span>
                <h1 className="app-title mt-1.5 break-words">
                  Welcome, {supervisorData?.fullName || 'Supervisor'}
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-ink/55">
                  <span className="break-all">{supervisorData?.email || 'Supervisor'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{supervisorData?.companyName || 'Company'}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests) > 0 ? (
                <span className="chip h-9 bg-butter-200 px-3 text-butter-700">
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  {dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests} pending
                  <span className="sr-only"> employee requests</span>
                </span>
              ) : (
                <span className="chip h-9 bg-sand-200 px-3 text-ink/60">
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  No pending requests
                </span>
              )}
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
            aria-selected={activeTab === 'my-requests'}
            onClick={() => setActiveTab('my-requests')}
            className="app-tab"
          >
            My Requests
            {dashboardStats.ownPendingRequests > 0 && (
              <span className={`chip px-2 py-0.5 ${activeTab === 'my-requests' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'}`}>
                {dashboardStats.ownPendingRequests}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'employee-requests'}
            onClick={() => setActiveTab('employee-requests')}
            className="app-tab"
          >
            Employee Requests
            {(dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests) > 0 && (
              <span className={`chip px-2 py-0.5 ${activeTab === 'employee-requests' ? 'bg-white/20 text-white' : 'bg-butter-200 text-butter-700'}`}>
                {dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'my-requests' && renderMyRequests()}
        {activeTab === 'employee-requests' && renderEmployeeRequests()}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="supervisor-create-title">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/[0.07] bg-white px-6 py-5">
              <h2 id="supervisor-create-title" className="font-display text-2xl text-ink">Create New Request</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Request Type Selection */}
              <fieldset>
                <legend className="field-label">Request Type</legend>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors duration-200 ${createType === 'shift' ? 'border-brand-500 bg-brand-50 text-ink' : 'border-ink/15 text-ink/70 hover:border-ink/25'}`}>
                    <input
                      type="radio"
                      value="shift"
                      checked={createType === 'shift'}
                      onChange={(e) => setCreateType(e.target.value)}
                      className="h-4 w-4 shrink-0 accent-brand-500"
                    />
                    Shift Swap
                  </label>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors duration-200 ${createType === 'dayoff' ? 'border-brand-500 bg-brand-50 text-ink' : 'border-ink/15 text-ink/70 hover:border-ink/25'}`}>
                    <input
                      type="radio"
                      value="dayoff"
                      checked={createType === 'dayoff'}
                      onChange={(e) => {
                        const type = e.target.value;
                        setCreateType(type);
                        if (type === 'dayoff') {
                          setFormData({
                            ...formData,
                            shiftStartDate: '',
                            shiftEndDate: '',
                            overtimeStart: '',
                            overtimeEnd: ''
                          });
                        }
                      }}
                      className="h-4 w-4 shrink-0 accent-brand-500"
                    />
                    Day Off Swap
                  </label>
                </div>
              </fieldset>

              {/* Reason */}
              <div>
                <label htmlFor="supervisor-reason" className="field-label">
                  Reason *
                </label>
                <textarea
                  id="supervisor-reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="field resize-none"
                  placeholder="Explain why you need this swap..."
                />
              </div>

              {/* Day Off Specific Fields */}
              {createType === 'dayoff' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="supervisor-original-day-off" className="field-label">
                      Your Original Day Off *
                    </label>
                    <input
                      id="supervisor-original-day-off"
                      type="date"
                      value={formData.originalDayOff}
                      onChange={(e) => setFormData({ ...formData, originalDayOff: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="supervisor-requested-day-off" className="field-label">
                      Requested Day Off *
                    </label>
                    <input
                      id="supervisor-requested-day-off"
                      type="date"
                      value={formData.requestedDayOff}
                      onChange={(e) => setFormData({ ...formData, requestedDayOff: e.target.value })}
                      className="field"
                    />
                  </div>
                </div>
              )}

              {/* Shift Details (Required) */}
              <div>
                <h3 className="mb-3 text-[15px] font-semibold text-ink">Shift Details *</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="supervisor-shift-date" className="field-label">Shift Date *</label>
                    <input
                      id="supervisor-shift-date"
                      type="date"
                      value={formData.shiftDate || ''}
                      onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="supervisor-shift-start" className="field-label">Start Time *</label>
                      <input
                        id="supervisor-shift-start"
                        type="time"
                        value={formData.shiftStartTime || ''}
                        onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                        className="field"
                      />
                    </div>
                    <div>
                      <label htmlFor="supervisor-shift-end" className="field-label">End Time *</label>
                      <input
                        id="supervisor-shift-end"
                        type="time"
                        value={formData.shiftEndTime || ''}
                        onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                        className="field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Overtime Details */}
              <div className="rounded-2xl bg-sand-100 p-4 sm:p-5">
                <h3 className="mb-3 text-[15px] font-semibold text-ink">Do you have Overtime? (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="supervisor-overtime-date" className="field-label">Overtime Date</label>
                    <input
                      id="supervisor-overtime-date"
                      type="date"
                      value={formData.overtimeDate || formData.shiftDate || ''}
                      onChange={(e) => setFormData({ ...formData, overtimeDate: e.target.value })}
                      className="field"
                      placeholder="Same as shift date if left empty"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="supervisor-overtime-start" className="field-label">Start Time</label>
                      <input
                        id="supervisor-overtime-start"
                        type="time"
                        value={formData.overtimeStartTime || ''}
                        onChange={(e) => setFormData({ ...formData, overtimeStartTime: e.target.value })}
                        className="field"
                      />
                    </div>
                    <div>
                      <label htmlFor="supervisor-overtime-end" className="field-label">End Time</label>
                      <input
                        id="supervisor-overtime-end"
                        type="time"
                        value={formData.overtimeEndTime || ''}
                        onChange={(e) => setFormData({ ...formData, overtimeEndTime: e.target.value })}
                        className="field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-error" role="alert">
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
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-2 border-t border-ink/[0.07] px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost btn-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRequest}
                className="btn btn-primary btn-md"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="supervisor-view-title">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/[0.07] bg-white px-6 py-5">
              <h2 id="supervisor-view-title" className="font-display text-2xl text-ink">Request Details</h2>
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
                    <dt className={DT}>Request ID</dt>
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
                  {selectedRequest.type === 'shift' && (
                    <div>
                      <dt className={DT}>Priority</dt>
                      <dd className="mt-1">
                        <span className={`chip border ${getPriorityColor(selectedRequest, selectedRequest.type)}`}>
                          {getPriorityText(selectedRequest, selectedRequest.type)}
                        </span>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className={DT}>Requester</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      <User className="h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="break-words text-sm text-ink">{selectedRequest.requesterUserId?.fullName || 'Unknown'}</p>
                        <p className="break-all text-xs text-ink/50">{selectedRequest.requesterUserId?.email || ''}</p>
                      </div>
                    </dd>
                  </div>
                  {selectedRequest.receiverUserId && (
                    <div>
                      <dt className={DT}>Receiver</dt>
                      <dd className="mt-1 flex items-center gap-2">
                        <User className="h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="break-words text-sm text-ink">{selectedRequest.receiverUserId?.fullName || 'Unknown'}</p>
                          <p className="break-all text-xs text-ink/50">{selectedRequest.receiverUserId?.email || ''}</p>
                        </div>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className={DT}>Created</dt>
                    <dd className="mt-1 text-sm text-ink">{formatDate(selectedRequest.createdAt)}</dd>
                  </div>
                  {selectedRequest.statusEditedBy && (
                    <div>
                      <dt className={DT}>Last Action By</dt>
                      <dd className="mt-1 text-sm text-ink">{selectedRequest.statusEditedBy?.fullName || 'Unknown'}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* Reason */}
              <section className="rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-brand-700">Reason for Swap</h3>
                <p className="mt-2 break-words text-sm text-ink/80">{selectedRequest.reason}</p>
              </section>

              {/* Day Off Details (for day off requests) */}
              {selectedRequest.type === 'dayoff' && (
                <section className="rounded-2xl border border-peach-300 bg-peach-100 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-peach-700">Day Off Swap Details</h3>
                  <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className={DT}>Giving Up (Original Day Off)</dt>
                      <dd className="mt-1 text-sm text-ink">{formatDateOnly(selectedRequest.originalDayOff)}</dd>
                    </div>
                    <div>
                      <dt className={DT}>Wants (Requested Day Off)</dt>
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
                <section className="rounded-2xl border border-sand-300 bg-sand-100 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-ink">Overtime Details</h3>
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

              {/* Offers/Matches */}
              {selectedRequest.type === 'shift' && selectedRequest.negotiationHistory && selectedRequest.negotiationHistory.length > 0 && (
                <section className="rounded-2xl border border-ink/[0.07] bg-sand-50 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-ink">Counter Offers ({selectedRequest.negotiationHistory.length})</h3>
                  <ul className="mt-3 space-y-2">
                    {selectedRequest.negotiationHistory.map((offer, index) => (
                      <li key={index} className="rounded-xl border border-ink/[0.07] bg-white p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium text-ink">
                              {offer.offeredBy?.fullName || 'Unknown Employee'}
                            </p>
                            <p className="break-all text-xs text-ink/50">{offer.offeredBy?.email || 'Unknown Email'}</p>
                            <p className="mt-1 text-xs text-ink/65">
                              {formatDate(offer.shiftStartDate)} - {formatDate(offer.shiftEndDate)}
                            </p>
                            {offer.overtimeStart && (
                              <p className="text-xs text-ink/65">
                                Overtime: {formatDate(offer.overtimeStart)} - {formatDate(offer.overtimeEnd)}
                              </p>
                            )}
                          </div>
                          <span className={`chip shrink-0 capitalize ${offer.status === 'accepted' ? 'bg-mint-200 text-mint-700' :
                            offer.status === 'rejected' ? 'bg-rose-200 text-rose-700' :
                              'bg-butter-200 text-butter-700'
                            }`}>
                            {offer.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {selectedRequest.type === 'dayoff' && selectedRequest.matches && selectedRequest.matches.length > 0 && (
                <section className="rounded-2xl border border-ink/[0.07] bg-sand-50 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-ink">Match Proposals ({selectedRequest.matches.length})</h3>
                  <ul className="mt-3 space-y-2">
                    {selectedRequest.matches.map((match, index) => (
                      <li key={index} className="rounded-xl border border-ink/[0.07] bg-white p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium text-ink">
                              {match.matchedBy?.fullName || 'Unknown Employee'}
                            </p>
                            <p className="break-all text-xs text-ink/50">{match.matchedBy?.email || 'Unknown Email'}</p>
                            <p className="mt-1 text-xs text-ink/65">
                              Their day off: {formatDateOnly(match.originalDayOff)}
                            </p>
                            {match.shiftStartDate && match.shiftEndDate && (
                              <p className="text-xs text-ink/65">
                                Shift: {formatDate(match.shiftStartDate)} - {formatDate(match.shiftEndDate)}
                              </p>
                            )}
                          </div>
                          <span className={`chip shrink-0 capitalize ${match.status === 'accepted' ? 'bg-mint-200 text-mint-700' :
                            match.status === 'rejected' ? 'bg-rose-200 text-rose-700' :
                              'bg-butter-200 text-butter-700'
                            }`}>
                            {match.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
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

            {/* Action Buttons */}
            {/* Only show action buttons for employee requests, not own requests */}
            {canTakeAction(selectedRequest) && selectedRequest.requesterUserId?._id !== supervisorData?._id && (
              <div className="flex flex-col-reverse gap-2 border-t border-ink/[0.07] px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setTimeout(() => openActionModal(selectedRequest, selectedRequest.type, 'reject'), 100);
                  }}
                  className="btn btn-danger btn-md"
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setTimeout(() => openActionModal(selectedRequest, selectedRequest.type, 'approve'), 100);
                  }}
                  className="btn btn-primary btn-md"
                >
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  Approve Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject) */}
      {showActionModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-lg" role="dialog" aria-modal="true" aria-labelledby="supervisor-action-title">
            <div className="flex items-center justify-between gap-4 border-b border-ink/[0.07] px-6 py-5">
              <h2 id="supervisor-action-title" className="font-display text-2xl text-ink">
                {actionType === 'approve' ? 'Approve' : 'Reject'} Request
              </h2>
              <button
                type="button"
                onClick={() => setShowActionModal(false)}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Request Summary */}
              <div className="rounded-2xl bg-sand-100 p-4">
                <h3 className="text-sm font-semibold text-ink">Request Summary</h3>
                <div className="mt-2 space-y-1 break-words text-sm text-ink/65">
                  <p><span className="font-semibold text-ink">Type:</span> {selectedRequest.type === 'shift' ? 'Shift Swap' : 'Day Off Swap'}</p>
                  <p><span className="font-semibold text-ink">From:</span> {selectedRequest.requesterUserId?.fullName}</p>
                  {selectedRequest.receiverUserId && (
                    <p><span className="font-semibold text-ink">With:</span> {selectedRequest.receiverUserId?.fullName}</p>
                  )}
                  <p><span className="font-semibold text-ink">Reason:</span> {selectedRequest.reason}</p>
                </div>
              </div>

              {/* Comment Field */}
              <div>
                <label htmlFor="supervisor-action-comment" className="field-label">
                  Comment {actionType === 'reject' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  id="supervisor-action-comment"
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  rows={3}
                  className="field resize-none"
                  placeholder={
                    actionType === 'approve'
                      ? "Add an approval comment (optional)..."
                      : "Please provide a reason for rejection..."
                  }
                />
              </div>

              {error && (
                <div className="alert alert-error" role="alert">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p className="flex-1">{error}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-2 border-t border-ink/[0.07] px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowActionModal(false)}
                className="btn btn-ghost btn-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestAction}
                disabled={actionType === 'reject' && !actionComment.trim()}
                className={`btn btn-md ${actionType === 'approve' ? 'btn-primary' : 'btn-danger'}`}
              >
                {actionType === 'approve' ? (
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                )}
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
