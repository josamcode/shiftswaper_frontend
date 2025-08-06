import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  User,
  Clock,
  Calendar,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Check,
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

const combineDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const dateTime = new Date(`${dateStr}T${timeStr}`);
  return isNaN(dateTime.getTime()) ? null : dateTime.toISOString();
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Request states
  const [shiftRequests, setShiftRequests] = useState([]);
  const [dayOffRequests, setDayOffRequests] = useState([]);
  const [filteredShiftRequests, setFilteredShiftRequests] = useState([]);
  const [filteredDayOffRequests, setFilteredDayOffRequests] = useState([]);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalShiftRequests: 0,
    pendingShiftRequests: 0,
    totalDayOffRequests: 0,
    pendingDayOffRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // Note: Removed showCounterOfferModal and showMatchModal as per previous instructions
  // These actions should happen on the "Swap Board" page.
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [createType, setCreateType] = useState('shift');

  // Form states
  const [formData, setFormData] = useState({
    reason: '',
    shiftStartDate: '',
    shiftEndDate: '',
    overtimeStart: '',
    overtimeEnd: '',
    originalDayOff: '',
    requestedDayOff: ''
  });
  // Note: Removed counterOfferData and matchData as modals are removed

  useEffect(() => {
    loadEmployeeData();
  }, []);

  useEffect(() => {
    if (employeeData) {
      loadShiftRequests();
      loadDayOffRequests();
    }
  }, [employeeData]);

  useEffect(() => {
    filterRequests();
  }, [shiftRequests, dayOffRequests, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    calculateStats(shiftRequests, dayOffRequests);
  }, [shiftRequests, dayOffRequests]);

  const loadEmployeeData = () => {
    try {
      const storedEmployeeData = Cookies.get('employee_data');
      if (storedEmployeeData) {
        const parsedData = JSON.parse(storedEmployeeData);
        // Ensure employee ID is correctly set for comparisons
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
        handleLogout();
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/shift-swap-requests`, {
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
        const relevantRequests = (data.data.requests || []).filter(request => {
          // Check if they made the request
          const isOwnRequest = request.requesterUserId?._id === employeeData?.id;

          // Check if they made any offers in negotiation history
          const hasOfferedInNegotiation = request.negotiationHistory?.some(
            offer => offer.offeredBy?._id === employeeData?.id
          );

          return isOwnRequest || hasOfferedInNegotiation;
        });

        setShiftRequests(relevantRequests);
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
      const token = Cookies.get('employee_token');
      if (!token) return;
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/day-off-swap-requests/my`, {
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

  const calculateStats = (shiftReqs, dayOffReqs) => {
    const allRequests = [...shiftReqs, ...dayOffReqs];
    const stats = {
      totalShiftRequests: shiftReqs.length,
      pendingShiftRequests: shiftReqs.filter(req => req.status === 'pending' || req.status === 'offers_received').length,
      totalDayOffRequests: dayOffReqs.length,
      pendingDayOffRequests: dayOffReqs.filter(req => req.status === 'pending' || req.status === 'matched').length,
      approvedRequests: allRequests.filter(req => req.status === 'approved').length,
      rejectedRequests: allRequests.filter(req => req.status === 'rejected').length
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

  // Helper function to check if a date is within the allowed range for shift swaps
  const isDateInRange = (dateString) => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 10); // 10 days from today
    maxDate.setHours(23, 59, 59, 999); // Normalize to end of day

    return selectedDate >= tomorrow && selectedDate <= maxDate;
  };

  const handleCreateRequest = async () => {
    try {
      setError(''); // Clear previous errors
      const token = Cookies.get('employee_token');
      let endpoint, payload;

      if (createType === 'shift') {
        endpoint = '/api/shift-swap-requests/';
        if (!formData.reason || !formData.shiftDate || !formData.shiftStartTime || !formData.shiftEndTime) {
          setError('Please fill in all required fields: Reason, Shift Date, Start Time, and End Time.');
          return;
        }

        // Combine shift date + time
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

        // Handle overtime
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
      } else { // Day Off Swap
        endpoint = '/api/day-off-swap-requests/';

        // Validate required fields
        if (!formData.originalDayOff || !formData.requestedDayOff || !formData.reason) {
          setError('Please fill in all required fields: Original Day Off, Requested Day Off, and Reason.');
          return;
        }

        // ✅ Combine shift date and time
        const shiftStartDate = combineDateTime(formData.shiftDate, formData.shiftStartTime);
        const shiftEndDate = combineDateTime(formData.shiftDate, formData.shiftEndTime);

        // ✅ Validate that both shift start and end are provided
        if (!shiftStartDate || !shiftEndDate) {
          setError('Shift Start and End times are required for Day Off Swap requests.');
          return;
        }

        if (new Date(shiftEndDate) <= new Date(shiftStartDate)) {
          setError('Shift End must be after Shift Start.');
          return;
        }

        // ✅ Build payload
        payload = {
          originalDayOff: new Date(formData.originalDayOff).toISOString().split('T')[0],
          requestedDayOff: new Date(formData.requestedDayOff).toISOString().split('T')[0],
          reason: formData.reason.trim(),
          shiftStartDate,   // ISO string
          shiftEndDate      // ISO string
        };

        // ✅ Optional: Add overtime if provided
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
        await loadShiftRequests();
        await loadDayOffRequests();
        showSuccessMessage(`${createType === 'shift' ? 'Shift' : 'Day off'} swap request created successfully!`);
      } else {
        let errorMessage = 'Failed to create request.';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
        }
        console.error("Create Request Error Response:", data); // Log for debugging
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Create Request Network Error:", error); // Log for debugging
      setError('Failed to create request due to a network error. Please try again.');
    }
  };

  const handleUpdateRequest = async () => {
    try {
      const token = Cookies.get('employee_token');
      let endpoint, payload;
      if (selectedRequest.type === 'shift') {
        endpoint = `/api/shift-swap-requests/update/${selectedRequest._id}`;

        const shiftStart = combineDateTime(formData.shiftDate, formData.shiftStartTime);
        const shiftEnd = combineDateTime(formData.shiftDate, formData.shiftEndTime);

        if (!shiftStart || !shiftEnd) {
          setError('Invalid shift date/time.');
          return;
        }

        payload = {
          reason: formData.reason,
          shiftStartDate: shiftStart,
          shiftEndDate: shiftEnd,
          overtimeStart: null,
          overtimeEnd: null
        };

        if (formData.overtimeStartTime && formData.overtimeEndTime) {
          const otDate = formData.overtimeDate || formData.shiftDate;
          const otStart = combineDateTime(otDate, formData.overtimeStartTime);
          const otEnd = combineDateTime(otDate, formData.overtimeEndTime);

          if (otStart && otEnd && new Date(otEnd) > new Date(otStart)) {
            payload.overtimeStart = otStart;
            payload.overtimeEnd = otEnd;
          } else {
            setError('Invalid overtime times.');
            return;
          }
        }
      } else {
        // Day off requests don't have an update endpoint in the routes provided
        setError('Day off requests cannot be updated. Please delete and create a new request.');
        return;
      }

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
        setShowEditModal(false);
        await loadShiftRequests();
        await loadDayOffRequests();
        showSuccessMessage('Request updated successfully!');
      } else {
        setError(data.message || 'Failed to update request');
      }
    } catch (error) {
      setError('Failed to update request. Please try again.');
    }
  };

  const handleDeleteRequest = async (request, type) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        setActionLoading(request._id);
        const token = Cookies.get('employee_token');
        const endpoint = type === 'shift'
          ? `/api/shift-swap-requests/delete/${request._id}`
          : `/api/day-off-swap-requests/delete/${request._id}`;
        const response = await fetch(`${process.env.REACT_APP_URI_API_URL}${endpoint}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          await loadShiftRequests();
          await loadDayOffRequests();
          showSuccessMessage('Request deleted successfully!');
        } else {
          setError(data.message || 'Failed to delete request');
        }
      } catch (error) {
        setError('Failed to delete request. Please try again.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleAcceptOffer = async (offerId) => {
    const result = await Swal.fire({
      title: 'Accept this offer?',
      text: "You will be accepting this counter offer.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, accept it!'
    });
    if (result.isConfirmed) {
      try {
        setActionLoading(offerId);
        const token = Cookies.get('employee_token');
        const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/shift-swap-requests/accept-specific-offer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requestId: selectedRequest._id,
            offerId: offerId
          })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          await loadShiftRequests();
          setShowViewModal(false);
          showSuccessMessage('Offer accepted successfully!');
        } else {
          setError(data.message || 'Failed to accept offer');
        }
      } catch (error) {
        setError('Failed to accept offer. Please try again.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleAcceptMatch = async (matchId) => {
    const result = await Swal.fire({
      title: 'Accept this match?',
      text: "You will be accepting this day off match.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, accept it!'
    });
    if (result.isConfirmed) {
      try {
        setActionLoading(matchId);
        const token = Cookies.get('employee_token');
        const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/day-off-swap-requests/accept-match`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requestId: selectedRequest._id,
            matchId: matchId
          })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          await loadDayOffRequests();
          setShowViewModal(false);
          showSuccessMessage('Match accepted successfully!');
        } else {
          setError(data.message || 'Failed to accept match');
        }
      } catch (error) {
        setError('Failed to accept match. Please try again.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const openEditModal = (request, type) => {
    const getLocalDate = (isoStr) => isoStr ? new Date(isoStr).toISOString().slice(0, 10) : '';
    const getLocalTime = (isoStr) => isoStr ? new Date(isoStr).toISOString().slice(11, 16) : '';

    const shiftStartDate = request.shiftStartDate ? new Date(request.shiftStartDate) : null;
    const shiftDate = shiftStartDate ? shiftStartDate.toISOString().slice(0, 10) : '';

    setSelectedRequest({ ...request, type });
    setFormData({
      reason: request.reason || '',
      shiftDate,
      shiftStartTime: getLocalTime(request.shiftStartDate),
      shiftEndTime: getLocalTime(request.shiftEndDate),
      overtimeDate: request.overtimeStart ? new Date(request.overtimeStart).toISOString().slice(0, 10) : '',
      overtimeStartTime: getLocalTime(request.overtimeStart),
      overtimeEndTime: getLocalTime(request.overtimeEnd),
      originalDayOff: request.originalDayOff ? new Date(request.originalDayOff).toISOString().slice(0, 10) : '',
      requestedDayOff: request.requestedDayOff ? new Date(request.requestedDayOff).toISOString().slice(0, 10) : ''
    });
    setShowEditModal(true);
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
      Cookies.remove('employee_token');
      Cookies.remove('employee_data');
      login();
      Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        if (navigate) {
          navigate('/employee_login');
        } else {
          window.location.href = '/employee_login';
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

  const canEdit = (request) => {
    if (!employeeData) return false;
    // Can only edit own requests
    if (request.requesterUserId?._id !== employeeData._id) return false;
    // Can only edit if not accepted by someone else
    if (request.receiverUserId || request.secondSupervisorId) return false;
    // Prevent editing if offers/matches have been received (as it changes the nature of the request)
    if (request.type === 'shift' && request.negotiationHistory && request.negotiationHistory.length > 0) return false;
    if (request.type === 'dayoff' && request.matches && request.matches.length > 0) return false;
    // Can edit pending, offers_received, or matched requests (if no offers/matches yet)
    return ['pending', 'offers_received', 'matched'].includes(request.status);
  };

  const canDelete = (request) => {
    if (!employeeData) return false;
    // Can only delete own requests
    if (request.requesterUserId?._id !== employeeData._id) return false;
    // Can only delete if not accepted by someone else
    if (request.receiverUserId || request.secondSupervisorId) return false;
    // Prevent deleting if offers/matches have been received/proposed
    if (request.type === 'shift' && request.negotiationHistory && request.negotiationHistory.length > 0) return false;
    if (request.type === 'dayoff' && request.matches && request.matches.length > 0) return false;
    return true;
  };

  // Dashboard Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shift Requests</p>
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
              <p className="text-sm font-medium text-gray-600">Day Off Requests</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalDayOffRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Shifts</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingShiftRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Days Off</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingDayOffRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.approvedRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.rejectedRequests}</p>
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
                    {request.status === 'matched' ? 'offers_received' : request.status}
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
              <option value="pending">Pending</option>
              <option value="offers_received">Offers Received</option>
              <option value="matched">Offered</option>
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
                .map((request) => {
                  // const isOwnRequest = request.requesterUserId?._id === employeeData?.id; // Not used anymore
                  return (
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
                          {request.status === 'matched'
                            ? 'OFFERS RECEIVED'
                            : request.status.replace('_', ' ').toUpperCase()}
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

                          {canEdit(request) && (
                            <button
                              onClick={() => openEditModal(request, request.type)}
                              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors duration-200"
                              title="Edit Request"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          )}
                          {canDelete(request) && (
                            <button
                              onClick={() => handleDeleteRequest(request, request.type)}
                              disabled={actionLoading === request._id}
                              className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                              title="Delete Request"
                            >
                              {actionLoading === request._id ? <Loader className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        {[...filteredShiftRequests, ...filteredDayOffRequests].length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {[...shiftRequests, ...dayOffRequests].length === 0 ? 'Create your first request to get started.' : 'Try adjusting your search or filters.'}
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
                  Welcome, {employeeData?.fullName || 'Employee'}
                </h1>
                <p className="text-sm text-gray-500">{employeeData?.email || 'Your Eamil'}</p>
                <p className="text-sm text-gray-500">{employeeData?.companyName || 'Your Company'}</p>
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
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{employeeData?.fullName}</span>
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
        {activeTab === 'requests' && renderRequests()}
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
                      // In your type radio buttons, add:
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
                    {/* Overtime Date (same as shift date) */}
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
      {/* Edit Request Modal */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Request</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
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
                {/* Shift Details (only for shift requests) */}
                {selectedRequest.type === 'shift' && (
                  <>
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Shift Details *</h4>
                      <div className="space-y-4">
                        {/* Shift Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Shift Date *</label>
                          <input
                            type="date"
                            value={formData.shiftDate}
                            onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                            <input
                              type="time"
                              value={formData.shiftStartTime}
                              onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                            <input
                              type="time"
                              value={formData.shiftEndTime}
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
                  </>
                )}
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateRequest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update Request
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
                {/* Offers/Matches Section */}
                {selectedRequest.type === 'shift' && selectedRequest.negotiationHistory && selectedRequest.negotiationHistory.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3">Offers ({selectedRequest.negotiationHistory.length})</h4>
                    <div className="space-y-3">
                      {selectedRequest.negotiationHistory.map((offer, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {offer.offeredBy?.fullName || 'Unknown Employee'}
                              </p>
                              <span className='my-2'>{offer.offeredBy?.email || 'Unknown Email'}</span>
                              <p className="text-xs text-gray-500">
                                {formatDate(offer.shiftStartDate)} - {formatDate(offer.shiftEndDate)}
                              </p>
                              {offer.overtimeStart && (
                                <p className="text-xs text-gray-500">
                                  Overtime: {formatDate(offer.overtimeStart)} - {formatDate(offer.overtimeEnd)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                {offer.status.toUpperCase()}
                              </span>
                              {/* Only show Accept button if user is the requester and the offer is from someone else */}
                              {offer.status === 'offered' &&
                                employeeData?._id === selectedRequest.requesterUserId?._id &&
                                offer.offeredBy?._id !== employeeData?._id && (
                                  <button
                                    onClick={() => handleAcceptOffer(offer._id)}
                                    disabled={actionLoading === offer._id}
                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                                  >
                                    {actionLoading === offer._id ? <Loader className="h-3 w-3 animate-spin" /> : 'Accept'}
                                  </button>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRequest.type === 'dayoff' && selectedRequest.matches && selectedRequest.matches.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3">Matches ({selectedRequest.matches.length})</h4>
                    <div className="space-y-3">
                      {selectedRequest.matches.map((match, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {match.matchedBy?.fullName || 'Unknown Employee'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Original day off: {formatDateOnly(match.originalDayOff)}
                              </p>
                              {match.shiftStartDate && (
                                <p className="text-xs text-gray-500">
                                  Shift: {formatDate(match.shiftStartDate)} - {formatDate(match.shiftEndDate)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${match.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                match.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                {match.status.toUpperCase()}
                              </span>
                              {/* Only show Accept button if user is the requester and the match is from someone else */}
                              {match.status === 'proposed' &&
                                employeeData?._id === selectedRequest.requesterUserId?._id &&
                                match.matchedBy?._id !== employeeData?._id && (
                                  <button
                                    onClick={() => handleAcceptMatch(match._id)}
                                    disabled={actionLoading === match._id}
                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                                  >
                                    {actionLoading === match._id ? <Loader className="h-3 w-3 animate-spin" /> : 'Accept'}
                                  </button>
                                )}
                            </div>
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
                {/* Action Buttons - Only for Own Requests */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {canEdit(selectedRequest) && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        openEditModal(selectedRequest, selectedRequest.type);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Request
                    </button>
                  )}
                  {canDelete(selectedRequest) && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleDeleteRequest(selectedRequest, selectedRequest.type);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;