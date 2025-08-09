import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Shield,
  Clock,
  Calendar,
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
  ChevronDown,
  User,
  Bell,
  LogOut,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    successElement.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
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
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'offers_received': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    return type === 'shift' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  const getPriorityColor = (request, type) => {
    if (type === 'shift') {
      const shiftDate = new Date(request.shiftStartDate);
      const now = new Date();
      const hoursUntilShift = (shiftDate - now) / (1000 * 60 * 60);

      if (hoursUntilShift <= 24) return 'bg-red-100 text-red-800 border-red-200';
      if (hoursUntilShift <= 48) return 'bg-orange-100 text-orange-800 border-orange-200';
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      const requestedDate = new Date(request.requestedDayOff);
      const now = new Date();
      const daysUntilRequested = Math.ceil((requestedDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilRequested <= 3) return 'bg-red-100 text-red-800 border-red-200';
      if (daysUntilRequested <= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
      return 'bg-green-100 text-green-800 border-green-200';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Employee Shift Requests</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalShiftRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <CalendarDays className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Employee Day Off Requests</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalDayOffRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Requests</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.ownTotalRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Actions</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* My Recent Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">My Recent Requests</h3>
        </div>
        <div className="p-6">
          {[...ownShiftRequests.map(req => ({ ...req, type: 'shift' })), ...ownDayOffRequests.map(req => ({ ...req, type: 'dayoff' }))]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(request.type)}`}>
                    {request.type === 'shift' ? 'Shift' : 'Day Off'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status === 'matched' ? 'offers_received' : request.status}
                  </span>
                </div>
              </div>
            ))}
          {[...ownShiftRequests, ...ownDayOffRequests].length === 0 && (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No personal requests</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first request to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Requests Requiring Action */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee Requests Requiring Action</h3>
        </div>
        <div className="p-6">
          {[...filteredShiftRequests, ...filteredDayOffRequests]
            .filter(req => canTakeAction(req))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .slice(0, 5)
            .map((request) => (
              <div key={request._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    {request.type === 'shift' ? <Zap className="h-4 w-4 text-purple-600" /> : <CalendarDays className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.reason}</p>
                    <p className="text-xs text-gray-500">
                      From: {request.requesterUserId?.fullName}
                      {request.receiverUserId && ` & ${request.receiverUserId?.fullName}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request, request.type || (request.shiftStartDate ? 'shift' : 'dayoff'))}`}>
                    {getPriorityText(request, request.type || (request.shiftStartDate ? 'shift' : 'dayoff'))}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          {[...filteredShiftRequests, ...filteredDayOffRequests].filter(req => canTakeAction(req)).length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
              <p className="mt-1 text-sm text-gray-500">All employee requests have been processed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // My Requests Tab
  const renderMyRequests = () => (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h3 className="text-lg font-medium text-gray-900">My Requests</h3>
            <p className="text-sm text-gray-600">Manage your own shift and day off swap requests</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadOwnRequests}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* My Requests Table */}
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
              {[...ownShiftRequests.map(req => ({ ...req, type: 'shift' })), ...ownDayOffRequests.map(req => ({ ...req, type: 'dayoff' }))]
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
                              : `${formatDateOnly(request.originalDayOff)} → ${formatDateOnly(request.requestedDayOff)}`
                            }
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
                        {request.status === 'matched' ? 'OFFERS RECEIVED' : request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
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
        {[...ownShiftRequests, ...ownDayOffRequests].length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first request to get started.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Employee Requests Management Tab (existing functionality)
  const renderEmployeeRequests = () => (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by reason or employee..."
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
              <option value="pending">Pending Only</option>
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="shift">Shift Swaps</option>
              <option value="dayoff">Day Off Swaps</option>
            </select>
          </div>
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

      {/* Employee Requests Table */}
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
                  Priority
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
                              : `${formatDateOnly(request.originalDayOff)} → ${formatDateOnly(request.requestedDayOff)}`
                            }
                          </div>
                          <div className="text-xs text-gray-400">
                            From: {request.requesterUserId?.fullName}
                            {request.receiverUserId && ` & ${request.receiverUserId?.fullName}`}
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request, request.type)}`}>
                        {getPriorityText(request, request.type)}
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
                        <button
                          onClick={() => viewRequestDetails(request, request.type)}
                          className="inline-flex items-center px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </button>

                        {canTakeAction(request) && (
                          <>
                            <button
                              onClick={() => openActionModal(request, request.type, 'approve')}
                              disabled={actionLoading === request._id}
                              className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                              title="Approve Request"
                            >
                              {actionLoading === request._id ? <Loader className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                            </button>
                            <button
                              onClick={() => openActionModal(request, request.type, 'reject')}
                              disabled={actionLoading === request._id}
                              className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                              title="Reject Request"
                            >
                              {actionLoading === request._id ? <Loader className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
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
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {[...shiftRequests, ...dayOffRequests].length === 0
                ? 'No employee swap requests require your attention.'
                : 'Try adjusting your search or filters.'
              }
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
          <p className="mt-2 text-gray-600">Loading supervisor dashboard...</p>
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
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {supervisorData?.fullName || 'Supervisor'}
                </h1>
                <p className="text-sm text-gray-500">{supervisorData?.email || 'Supervisor'}</p>
                <p className="text-sm text-gray-500">{supervisorData?.companyName || 'Company'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
                {(dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests}
                  </span>
                )}
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{supervisorData?.fullName}</span>
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
              onClick={() => setActiveTab('my-requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              My Requests
              {dashboardStats.ownPendingRequests > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                  {dashboardStats.ownPendingRequests}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('employee-requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'employee-requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Employee Requests
              {(dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests) > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                  {dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'my-requests' && renderMyRequests()}
        {activeTab === 'employee-requests' && renderEmployeeRequests()}
      </main>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Request</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Request Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="shift"
                      checked={createType === 'shift'}
                      onChange={(e) => setCreateType(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-900">Shift Swap</span>
                  </label>
                  <label className="flex items-center">
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-900">Day Off Swap</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Explain why you need this swap..."
                  />
                </div>

                {/* Day Off Specific Fields */}
                {createType === 'dayoff' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Original Day Off *
                        </label>
                        <input
                          type="date"
                          value={formData.originalDayOff}
                          onChange={(e) => setFormData({ ...formData, originalDayOff: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Requested Day Off *
                        </label>
                        <input
                          type="date"
                          value={formData.requestedDayOff}
                          onChange={(e) => setFormData({ ...formData, requestedDayOff: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Shift Details (Required) */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Shift Details *</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shift Date *</label>
                      <input
                        type="date"
                        value={formData.shiftDate || ''}
                        onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                        <input
                          type="time"
                          value={formData.shiftStartTime || ''}
                          onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                        <input
                          type="time"
                          value={formData.shiftEndTime || ''}
                          onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overtime Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Do you have Overtime? (Optional)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Date</label>
                      <input
                        type="date"
                        value={formData.overtimeDate || formData.shiftDate || ''}
                        onChange={(e) => setFormData({ ...formData, overtimeDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Same as shift date if left empty"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={formData.overtimeStartTime || ''}
                          onChange={(e) => setFormData({ ...formData, overtimeStartTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <input
                          type="time"
                          value={formData.overtimeEndTime || ''}
                          onChange={(e) => setFormData({ ...formData, overtimeEndTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

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

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRequest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      <label className="block text-sm font-medium text-gray-500">Request ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedRequest._id}</p>
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
                    {selectedRequest.type === 'shift' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Priority</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(selectedRequest, selectedRequest.type)}`}>
                          {getPriorityText(selectedRequest, selectedRequest.type)}
                        </span>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Requester</label>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-900">{selectedRequest.requesterUserId?.fullName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{selectedRequest.requesterUserId?.email || ''}</p>
                        </div>
                      </div>
                    </div>
                    {selectedRequest.receiverUserId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Receiver</label>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-900">{selectedRequest.receiverUserId?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{selectedRequest.receiverUserId?.email || ''}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                    {selectedRequest.statusEditedBy && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Last Action By</label>
                        <p className="text-sm text-gray-900">{selectedRequest.statusEditedBy?.fullName || 'Unknown'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Reason for Swap</h4>
                  <p className="text-sm text-blue-800">{selectedRequest.reason}</p>
                </div>

                {/* Day Off Details (for day off requests) */}
                {selectedRequest.type === 'dayoff' && (
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

                {/* Offers/Matches */}
                {selectedRequest.type === 'shift' && selectedRequest.negotiationHistory && selectedRequest.negotiationHistory.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3">Counter Offers ({selectedRequest.negotiationHistory.length})</h4>
                    <div className="space-y-3">
                      {selectedRequest.negotiationHistory.map((offer, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {offer.offeredBy?.fullName || 'Unknown Employee'}
                              </p>
                              <p className="text-xs text-gray-500">{offer.offeredBy?.email || 'Unknown Email'}</p>
                              <p className="text-xs text-gray-600">
                                {formatDate(offer.shiftStartDate)} - {formatDate(offer.shiftEndDate)}
                              </p>
                              {offer.overtimeStart && (
                                <p className="text-xs text-gray-600">
                                  Overtime: {formatDate(offer.overtimeStart)} - {formatDate(offer.overtimeEnd)}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {offer.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.type === 'dayoff' && selectedRequest.matches && selectedRequest.matches.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3">Match Proposals ({selectedRequest.matches.length})</h4>
                    <div className="space-y-3">
                      {selectedRequest.matches.map((match, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {match.matchedBy?.fullName || 'Unknown Employee'}
                              </p>
                              <p className="text-xs text-gray-500">{match.matchedBy?.email || 'Unknown Email'}</p>
                              <p className="text-xs text-gray-600">
                                Their day off: {formatDateOnly(match.originalDayOff)}
                              </p>
                              {match.shiftStartDate && match.shiftEndDate && (
                                <p className="text-xs text-gray-600">
                                  Shift: {formatDate(match.shiftStartDate)} - {formatDate(match.shiftEndDate)}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${match.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              match.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {match.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
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

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {/* Only show action buttons for employee requests, not own requests */}
                  {canTakeAction(selectedRequest) && selectedRequest.requesterUserId?._id !== supervisorData?._id && (
                    <>
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          setTimeout(() => openActionModal(selectedRequest, selectedRequest.type, 'approve'), 100);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Request
                      </button>
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          setTimeout(() => openActionModal(selectedRequest, selectedRequest.type, 'reject'), 100);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Request
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject) */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === 'approve' ? 'Approve' : 'Reject'} Request
                </h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Request Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Request Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Type:</strong> {selectedRequest.type === 'shift' ? 'Shift Swap' : 'Day Off Swap'}</p>
                    <p><strong>From:</strong> {selectedRequest.requesterUserId?.fullName}</p>
                    {selectedRequest.receiverUserId && (
                      <p><strong>With:</strong> {selectedRequest.receiverUserId?.fullName}</p>
                    )}
                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                  </div>
                </div>

                {/* Comment Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment {actionType === 'reject' ? '(Required)' : '(Optional)'}
                  </label>
                  <textarea
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder={
                      actionType === 'approve'
                        ? "Add an approval comment (optional)..."
                        : "Please provide a reason for rejection..."
                    }
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestAction}
                    disabled={actionType === 'reject' && !actionComment.trim()}
                    className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    {actionType === 'approve' ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {actionType === 'approve' ? 'Approve' : 'Reject'}
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

export default SupervisorDashboard;