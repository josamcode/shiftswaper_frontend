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
import { StatusBadge } from '../components/product/Mockups';

const combineDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const dateTime = new Date(`${dateStr}T${timeStr}`);
  return isNaN(dateTime.getTime()) ? null : dateTime.toISOString();
};

/* Presentational helpers ------------------------------------------------ */
const POSITION_LABELS = { expert: 'Expert', sme: 'SME', supervisor: 'Supervisor', moderator: 'Moderator' };
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

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [showOvertimeFields, setShowOvertimeFields] = useState(false);

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
    desiredShiftStartDate: '',
    desiredShiftEndDate: '',
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

  // Escape closes an open modal (same as its close button); ignored while a SweetAlert is open.
  useEffect(() => {
    if (!showCreateModal && !showEditModal && !showViewModal) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape' || Swal.isVisible()) return;
      setShowCreateModal(false);
      setShowEditModal(false);
      setShowViewModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showCreateModal, showEditModal, showViewModal]);

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
    successElement.className = 'fixed left-4 right-4 top-[86px] z-[70] rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-float animate-slide-down sm:left-auto sm:max-w-sm';
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
        if (!formData.reason || !formData.shiftDate || !formData.shiftStartTime || !formData.shiftEndTime || !formData.desiredShiftDate || !formData.desiredShiftStartTime || !formData.desiredShiftEndTime) {
          setError('Please fill in all required fields: Reason, Shift Date, Start Time, End Time, Desired Shift Date, Desired Start Time, and Desired End Time.');
          return;
        }

        // Combine shift date + time
        const shiftStart = combineDateTime(formData.shiftDate, formData.shiftStartTime);
        const shiftEnd = combineDateTime(formData.shiftDate, formData.shiftEndTime);
        const desiredShiftStart = combineDateTime(formData.desiredShiftDate, formData.desiredShiftStartTime);
        const desiredShiftEnd = combineDateTime(formData.desiredShiftDate, formData.desiredShiftEndTime);

        if (!shiftStart || !shiftEnd || !desiredShiftStart || !desiredShiftEnd) {
          setError('Invalid shift date/time or desired shift date/time.');
          return;
        }

        if (new Date(shiftEnd) <= new Date(shiftStart)) {
          setError('Shift End Time must be after Start Time.');
          return;
        }

        if (new Date(desiredShiftEnd) <= new Date(desiredShiftStart)) {
          setError('Desired Shift End Time must be after Desired Shift Start Time.');
          return;
        }

        payload = {
          reason: formData.reason.trim(),
          shiftStartDate: shiftStart,
          shiftEndDate: shiftEnd,
          desiredShiftStartDate: desiredShiftStart,
          desiredShiftEndDate: desiredShiftEnd,
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
          desiredShiftStartDate: '',
          desiredShiftEndDate: '',
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
        const desiredShiftStart = combineDateTime(formData.desiredShiftDate, formData.desiredShiftStartTime);
        const desiredShiftEnd = combineDateTime(formData.desiredShiftDate, formData.desiredShiftEndTime);

        if (!shiftStart || !shiftEnd || !desiredShiftStart || !desiredShiftEnd) {
          setError('Invalid shift date/time or desired shift date/time.');
          return;
        }

        payload = {
          reason: formData.reason,
          shiftStartDate: shiftStart,
          shiftEndDate: shiftEnd,
          desiredShiftStartDate: desiredShiftStart,
          desiredShiftEndDate: desiredShiftEnd,
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
      confirmButtonColor: '#E0566E',
      cancelButtonColor: '#A9A4B4',
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
      confirmButtonColor: '#2998FF',
      cancelButtonColor: '#A9A4B4',
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
      confirmButtonColor: '#2998FF',
      cancelButtonColor: '#A9A4B4',
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
      desiredShiftDate: request.desiredShiftStartDate ? new Date(request.desiredShiftStartDate).toISOString().slice(0, 10) : '',
      desiredShiftStartTime: getLocalTime(request.desiredShiftStartDate),
      desiredShiftEndTime: getLocalTime(request.desiredShiftEndDate),
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
      confirmButtonColor: '#2998FF',
      cancelButtonColor: '#A9A4B4',
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

  // Shared empty state for the request lists
  const renderEmptyState = () => (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sand-200 text-ink/60" aria-hidden="true">
        <Calendar className="h-7 w-7" />
      </span>
      <h3 className="mt-5 font-display text-2xl text-ink">No requests found</h3>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink/55">
        {[...shiftRequests, ...dayOffRequests].length === 0 ? 'Create your first request to get started.' : 'Try adjusting your search or filters.'}
      </p>
      {[...shiftRequests, ...dayOffRequests].length === 0 && (
        <button type="button" onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-md mt-6">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Request
        </button>
      )}
    </div>
  );

  // Dashboard Overview Tab
  const renderOverview = () => {
    const statCards = [
      { label: 'Shift Requests', value: dashboardStats.totalShiftRequests, icon: Zap, tile: 'bg-lavender-200 text-lavender-700' },
      { label: 'Day Off Requests', value: dashboardStats.totalDayOffRequests, icon: CalendarDays, tile: 'bg-peach-200 text-peach-700' },
      { label: 'Pending Shifts', value: dashboardStats.pendingShiftRequests, icon: Clock, tile: 'bg-butter-200 text-butter-700' },
      { label: 'Pending Days Off', value: dashboardStats.pendingDayOffRequests, icon: Calendar, tile: 'bg-brand-100 text-brand-700' },
      { label: 'Approved', value: dashboardStats.approvedRequests, icon: Check, tile: 'bg-mint-200 text-mint-700' },
      { label: 'Rejected', value: dashboardStats.rejectedRequests, icon: X, tile: 'bg-rose-200 text-rose-700' },
    ];
    const recentRequests = [...filteredShiftRequests, ...filteredDayOffRequests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map(({ label, value, icon: Icon, tile }) => (
            <div key={label} className="stat-card p-4 sm:p-5">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tile}`} aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-3xl leading-none text-ink">{value}</p>
              <p className="mt-2 text-sm leading-snug text-ink/55">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent Requests */}
        <section className="app-card overflow-hidden" aria-labelledby="recent-requests-title">
          <div className="border-b border-ink/[0.06] px-5 py-4 sm:px-6">
            <h2 id="recent-requests-title" className="font-display text-xl text-ink">Recent Requests</h2>
          </div>
          {recentRequests.length > 0 ? (
            <ul className="divide-y divide-ink/[0.06]">
              {recentRequests.map((request) => (
                <li key={request._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${request.type === 'shift' ? 'bg-lavender-200 text-lavender-700' : 'bg-peach-200 text-peach-700'}`}
                      aria-hidden="true"
                    >
                      {request.type === 'shift' ? <Zap className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-ink">{request.reason}</p>
                      <p className="mt-0.5 text-xs text-ink/50">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 pl-[52px] sm:pl-0">
                    <span className={`chip ${getTypeColor(request.type || (request.shiftStartDate ? 'shift' : 'dayoff'))}`}>
                      {request.type === 'shift' ? 'Shift' : 'Day Off'}
                    </span>
                    <StatusBadge status={request.status === 'matched' ? 'offers_received' : request.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            renderEmptyState()
          )}
        </section>
      </div>
    );
  };

  // Requests Management Tab
  const renderRequests = () => {
    const allRequests = [...filteredShiftRequests.map(req => ({ ...req, type: 'shift' })), ...filteredDayOffRequests.map(req => ({ ...req, type: 'dayoff' }))]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const rowGrid = 'lg:grid lg:grid-cols-[minmax(0,1fr)_128px_150px_170px_136px] lg:items-center lg:gap-4';

    return (
      <div className="space-y-5">
        {/* Filters and Create Button */}
        <div className="app-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <label htmlFor="request-search" className="sr-only">Search requests</label>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
                <input
                  id="request-search"
                  type="text"
                  placeholder="Search by reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="field h-11 py-2 pl-10"
                />
              </div>
              {/* Status Filter */}
              <label htmlFor="request-status-filter" className="sr-only">Status</label>
              <select
                id="request-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field h-11 w-auto min-w-0 flex-1 px-3 py-2 text-sm sm:flex-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="offers_received">Offers Received</option>
                <option value="matched">Offered</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              {/* Type Filter */}
              <label htmlFor="request-type-filter" className="sr-only">Type</label>
              <select
                id="request-type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="field h-11 w-auto min-w-0 flex-1 px-3 py-2 text-sm sm:flex-none"
              >
                <option value="all">All Types</option>
                <option value="shift">Shift Swaps</option>
                <option value="dayoff">Day Off Swaps</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  loadShiftRequests();
                  loadDayOffRequests();
                }}
                className="btn btn-white btn-md flex-1 border border-ink/10 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-md flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Request
              </button>
            </div>
          </div>
        </div>

        {/* Requests list (table layout on large screens, stacked cards on small screens) */}
        <div className="app-card overflow-hidden">
          {allRequests.length > 0 && (
            <div className={`hidden border-b border-ink/[0.06] bg-sand-100 px-6 py-3 ${rowGrid}`} aria-hidden="true">
              <span className={EYEBROW}>Request Details</span>
              <span className={EYEBROW}>Type</span>
              <span className={EYEBROW}>Status</span>
              <span className={EYEBROW}>Created</span>
              <span className={EYEBROW}>Actions</span>
            </div>
          )}
          <ul className="divide-y divide-ink/[0.06]">
            {allRequests.map((request) => {
              // const isOwnRequest = request.requesterUserId?._id === employeeData?.id; // Not used anymore
              return (
                <li key={request._id} className={`flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-sand-50 sm:px-6 ${rowGrid}`}>
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${request.type === 'shift' ? 'bg-lavender-200 text-lavender-700' : 'bg-peach-200 text-peach-700'}`}
                      aria-hidden="true"
                    >
                      {request.type === 'shift' ? <Zap className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-[15px] font-medium text-ink">{request.reason}</p>
                      <p className="mt-0.5 text-sm text-ink/55">
                        {request.type === 'shift'
                          ? `${formatDate(request.shiftStartDate)} - ${formatDate(request.shiftEndDate)}`
                          : `${formatDateOnly(request.originalDayOff)} → ${formatDateOnly(request.requestedDayOff)}`
                        }
                      </p>
                      <p className="mt-0.5 text-xs text-ink/45">
                        By: {request.requesterUserId?.fullName || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pl-[52px] lg:contents">
                    <div>
                      <span className={`chip ${getTypeColor(request.type)}`}>
                        {request.type === 'shift' ? 'Shift Swap' : 'Day Off Swap'}
                      </span>
                    </div>
                    <div>
                      <StatusBadge status={request.status === 'matched' ? 'offers_received' : request.status} />
                    </div>
                    <div className="w-full text-xs text-ink/50 lg:w-auto lg:text-sm lg:text-ink/55">
                      <span className="lg:hidden">Created </span>
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pl-[52px] lg:gap-1.5 lg:pl-0">
                    {/* View Button - Always available */}
                    <button
                      type="button"
                      onClick={() => viewRequestDetails(request, request.type)}
                      className="btn h-10 border border-ink/10 bg-white px-4 text-[13px] text-ink hover:bg-sand-100 lg:w-10 lg:px-0"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      <span className="lg:sr-only">View</span>
                    </button>

                    {canEdit(request) && (
                      <button
                        type="button"
                        onClick={() => openEditModal(request, request.type)}
                        className="btn h-10 bg-brand-50 px-4 text-[13px] text-brand-700 hover:bg-brand-100 lg:w-10 lg:px-0"
                        title="Edit Request"
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                        <span className="lg:sr-only">Edit</span>
                      </button>
                    )}
                    {canDelete(request) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(request, request.type)}
                        disabled={actionLoading === request._id}
                        className="btn h-10 bg-rose-100 px-4 text-[13px] text-rose-700 hover:bg-rose-200 lg:w-10 lg:px-0"
                        title="Delete Request"
                      >
                        {actionLoading === request._id ? <Loader className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                        <span className="lg:sr-only">Delete</span>
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          {[...filteredShiftRequests, ...filteredDayOffRequests].length === 0 && !isLoading && renderEmptyState()}
        </div>
      </div>
    );
  };

  if (isLoading && shiftRequests.length === 0 && dayOffRequests.length === 0) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center" role="status">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-500" aria-hidden="true" />
          <p className="mt-4 text-sm text-ink/55">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingTotal = dashboardStats.pendingShiftRequests + dashboardStats.pendingDayOffRequests;

  return (
    <div className="app-page">
      {/* Page hero */}
      <section className="app-hero">
        <div className="container-site py-6 sm:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lavender-200 text-lavender-700 sm:flex" aria-hidden="true">
                <User className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="app-title break-words">
                  Welcome, {employeeData?.fullName || 'Employee'}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink/55">
                  {employeeData?.position && (
                    <span className="chip bg-sand-200 text-ink/70">
                      {POSITION_LABELS[employeeData.position] || employeeData.position}
                    </span>
                  )}
                  <span className="min-w-0 break-all">{employeeData?.email || 'Your email'}</span>
                  <span className="text-ink/25" aria-hidden="true">•</span>
                  <span>{employeeData?.companyName || 'Your Company'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand-200 text-ink/70" title="Pending requests">
                <Bell className="h-5 w-5" aria-hidden="true" />
                {pendingTotal > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
                    {pendingTotal}
                    <span className="sr-only"> pending requests</span>
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-md flex-1 md:flex-none"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Request
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-white btn-md border border-ink/10"
              >
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
              className="-my-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-rose-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
        {/* Tabs */}
        <div className="mb-6 inline-flex max-w-full rounded-full border border-ink/[0.07] bg-white p-1 shadow-soft">
          <div role="tablist" aria-label="Dashboard sections" className="app-tabs">
            <button
              type="button"
              role="tab"
              id="tab-overview"
              aria-selected={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              className="app-tab"
            >
              Overview
            </button>
            <button
              type="button"
              role="tab"
              id="tab-requests"
              aria-selected={activeTab === 'requests'}
              onClick={() => setActiveTab('requests')}
              className="app-tab"
            >
              All Requests
              {pendingTotal > 0 && (
                <span className="rounded-full bg-butter-200 px-2 py-0.5 text-xs font-semibold text-butter-700">
                  {pendingTotal}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Tab Content */}
        <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'requests' && renderRequests()}
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="create-request-title">
            <ModalHeader id="create-request-title" title="Create New Request" onClose={() => setShowCreateModal(false)} />
            <div className="space-y-6 p-6">
              {/* Request Type Selection */}
              <fieldset>
                <legend className="field-label">Request Type</legend>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${createType === 'shift' ? 'border-lavender-500 bg-lavender-100' : 'border-ink/15 hover:border-ink/25'}`}
                  >
                    <input
                      type="radio"
                      name="create-request-type"
                      value="shift"
                      checked={createType === 'shift'}
                      onChange={(e) => setCreateType(e.target.value)}
                      className="h-4 w-4 shrink-0 accent-brand-500"
                    />
                    <span className="text-sm font-medium text-ink">Shift Swap</span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${createType === 'dayoff' ? 'border-peach-500 bg-peach-100' : 'border-ink/15 hover:border-ink/25'}`}
                  >
                    <input
                      type="radio"
                      name="create-request-type"
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
                      className="h-4 w-4 shrink-0 accent-brand-500"
                    />
                    <span className="text-sm font-medium text-ink">Day Off Swap</span>
                  </label>
                </div>
              </fieldset>
              {/* Reason */}
              <div>
                <label htmlFor="create-reason" className="field-label">
                  Reason *
                </label>
                <textarea
                  id="create-reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="field resize-none"
                  placeholder="Explain why you need this swap..."
                />
              </div>
              {/* Day Off Specific Fields */}
              {createType === 'dayoff' && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="create-original-dayoff" className="field-label">
                        Your Original Day Off *
                      </label>
                      <input
                        id="create-original-dayoff"
                        type="date"
                        value={formData.originalDayOff}
                        onChange={(e) => setFormData({ ...formData, originalDayOff: e.target.value })}
                        className="field"
                      />
                    </div>
                    <div>
                      <label htmlFor="create-requested-dayoff" className="field-label">
                        Requested Day Off *
                      </label>
                      <input
                        id="create-requested-dayoff"
                        type="date"
                        value={formData.requestedDayOff}
                        onChange={(e) => setFormData({ ...formData, requestedDayOff: e.target.value })}
                        className="field"
                      />
                    </div>
                  </div>
                </>
              )}
              {/* Shift Details (Required) */}
              <section>
                <h3 className="mb-3 text-[15px] font-semibold text-ink">Shift Details *</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="create-shift-date" className="field-label">Shift Date *</label>
                    <input
                      id="create-shift-date"
                      type="date"
                      value={formData.shiftDate || ''}
                      onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="create-shift-start" className="field-label">Start Time *</label>
                      <input
                        id="create-shift-start"
                        type="time"
                        value={formData.shiftStartTime || ''}
                        onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                        className="field"
                      />
                    </div>
                    <div>
                      <label htmlFor="create-shift-end" className="field-label">End Time *</label>
                      <input
                        id="create-shift-end"
                        type="time"
                        value={formData.shiftEndTime || ''}
                        onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                        className="field"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Desired Shift Details (Required for Shift Swap) */}
              {createType === 'shift' && (
                <section>
                  <h3 className="mb-3 text-[15px] font-semibold text-ink">Desired Shift Details *</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="create-desired-date" className="field-label">Desired Shift Date *</label>
                      <input
                        id="create-desired-date"
                        type="date"
                        value={formData.desiredShiftDate || ''}
                        onChange={(e) => setFormData({ ...formData, desiredShiftDate: e.target.value })}
                        className="field"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="create-desired-start" className="field-label">Desired Start Time *</label>
                        <input
                          id="create-desired-start"
                          type="time"
                          value={formData.desiredShiftStartTime || ''}
                          onChange={(e) => setFormData({ ...formData, desiredShiftStartTime: e.target.value })}
                          className="field"
                        />
                      </div>
                      <div>
                        <label htmlFor="create-desired-end" className="field-label">Desired End Time *</label>
                        <input
                          id="create-desired-end"
                          type="time"
                          value={formData.desiredShiftEndTime || ''}
                          onChange={(e) => setFormData({ ...formData, desiredShiftEndTime: e.target.value })}
                          className="field"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Overtime Details */}
              <section>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showOvertime"
                    checked={showOvertimeFields}
                    onChange={(e) => {
                      const showFields = e.target.checked;
                      setShowOvertimeFields(showFields);
                      // Clear overtime data when unchecked
                      if (!showFields) {
                        setFormData({
                          ...formData,
                          overtimeDate: '',
                          overtimeStartTime: '',
                          overtimeEndTime: ''
                        });
                      }
                    }}
                    className="h-5 w-5 shrink-0 cursor-pointer rounded accent-brand-500"
                  />
                  <label htmlFor="showOvertime" className="cursor-pointer text-[15px] font-semibold text-ink">
                    Do you have Overtime?
                  </label>
                </div>

                {showOvertimeFields && (
                  <div className="mt-4 space-y-4 rounded-2xl bg-sand-100 p-4">
                    {/* Overtime Date (same as shift date) */}
                    <div>
                      <label htmlFor="create-ot-date" className="field-label">Overtime Date</label>
                      <input
                        id="create-ot-date"
                        type="date"
                        value={formData.overtimeDate || formData.shiftDate || ''}
                        onChange={(e) => setFormData({ ...formData, overtimeDate: e.target.value })}
                        className="field"
                        placeholder="Same as shift date if left empty"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="create-ot-start" className="field-label">Start Time</label>
                        <input
                          id="create-ot-start"
                          type="time"
                          value={formData.overtimeStartTime || ''}
                          onChange={(e) => setFormData({ ...formData, overtimeStartTime: e.target.value })}
                          className="field"
                        />
                      </div>
                      <div>
                        <label htmlFor="create-ot-end" className="field-label">End Time</label>
                        <input
                          id="create-ot-end"
                          type="time"
                          value={formData.overtimeEndTime || ''}
                          onChange={(e) => setFormData({ ...formData, overtimeEndTime: e.target.value })}
                          className="field"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                onClick={() => setShowCreateModal(false)}
                className="btn btn-white btn-md border border-ink/10"
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
            </ModalFooter>
          </div>
        </div>
      )}
      {/* Edit Request Modal */}
      {showEditModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="edit-request-title">
            <ModalHeader id="edit-request-title" title="Edit Request" onClose={() => setShowEditModal(false)} />
            <div className="space-y-6 p-6">
              {/* Reason */}
              <div>
                <label htmlFor="edit-reason" className="field-label">
                  Reason *
                </label>
                <textarea
                  id="edit-reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="field resize-none"
                  placeholder="Explain why you need this swap..."
                />
              </div>
              {/* Shift Details (only for shift requests) */}
              {selectedRequest.type === 'shift' && (
                <>
                  <section>
                    <h3 className="mb-3 text-[15px] font-semibold text-ink">Shift Details *</h3>
                    <div className="space-y-4">
                      {/* Shift Date */}
                      <div>
                        <label htmlFor="edit-shift-date" className="field-label">Shift Date *</label>
                        <input
                          id="edit-shift-date"
                          type="date"
                          value={formData.shiftDate}
                          onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                          className="field"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="edit-shift-start" className="field-label">Start Time *</label>
                          <input
                            id="edit-shift-start"
                            type="time"
                            value={formData.shiftStartTime}
                            onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                            className="field"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-shift-end" className="field-label">End Time *</label>
                          <input
                            id="edit-shift-end"
                            type="time"
                            value={formData.shiftEndTime}
                            onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                            className="field"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Desired Shift Details */}
                  <section>
                    <h3 className="mb-3 text-[15px] font-semibold text-ink">Desired Shift Details *</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="edit-desired-date" className="field-label">Desired Shift Date *</label>
                        <input
                          id="edit-desired-date"
                          type="date"
                          value={formData.desiredShiftDate}
                          onChange={(e) => setFormData({ ...formData, desiredShiftDate: e.target.value })}
                          className="field"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="edit-desired-start" className="field-label">Desired Start Time *</label>
                          <input
                            id="edit-desired-start"
                            type="time"
                            value={formData.desiredShiftStartTime}
                            onChange={(e) => setFormData({ ...formData, desiredShiftStartTime: e.target.value })}
                            className="field"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-desired-end" className="field-label">Desired End Time *</label>
                          <input
                            id="edit-desired-end"
                            type="time"
                            value={formData.desiredShiftEndTime}
                            onChange={(e) => setFormData({ ...formData, desiredShiftEndTime: e.target.value })}
                            className="field"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Overtime Details */}
                  <section className="rounded-2xl bg-sand-100 p-4">
                    <h3 className="mb-3 text-[15px] font-semibold text-ink">Do you have Overtime? (Optional)</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="edit-ot-date" className="field-label">Overtime Date</label>
                        <input
                          id="edit-ot-date"
                          type="date"
                          value={formData.overtimeDate || formData.shiftDate || ''}
                          onChange={(e) => setFormData({ ...formData, overtimeDate: e.target.value })}
                          className="field"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="edit-ot-start" className="field-label">Start Time</label>
                          <input
                            id="edit-ot-start"
                            type="time"
                            value={formData.overtimeStartTime || ''}
                            onChange={(e) => setFormData({ ...formData, overtimeStartTime: e.target.value })}
                            className="field"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-ot-end" className="field-label">End Time</label>
                          <input
                            id="edit-ot-end"
                            type="time"
                            value={formData.overtimeEndTime || ''}
                            onChange={(e) => setFormData({ ...formData, overtimeEndTime: e.target.value })}
                            className="field"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}
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
                onClick={() => setShowEditModal(false)}
                className="btn btn-white btn-md border border-ink/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateRequest}
                className="btn btn-primary btn-md"
              >
                <Edit className="h-4 w-4" aria-hidden="true" />
                Update Request
              </button>
            </ModalFooter>
          </div>
        </div>
      )}
      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="view-request-title">
            <ModalHeader id="view-request-title" title="Request Details" onClose={() => setShowViewModal(false)} />
            <div className="space-y-4 p-6">
              {/* Request Information */}
              <DetailSection title="Request Information">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail label="ID" className="sm:col-span-2">
                    <code className="break-all text-xs text-ink/70">{selectedRequest._id}</code>
                  </Detail>
                  <Detail label="Type">
                    <span className={`chip ${getTypeColor(selectedRequest.type)}`}>
                      {selectedRequest.type === 'shift' ? 'Shift Swap' : 'Day Off Swap'}
                    </span>
                  </Detail>
                  <Detail label="Status">
                    <StatusBadge status={selectedRequest.status} />
                  </Detail>
                  <Detail label="Requested By">{selectedRequest.requesterUserId?.fullName || 'Unknown'}</Detail>
                  <Detail label="Created">{formatDate(selectedRequest.createdAt)}</Detail>
                  <Detail label="Reason" className="sm:col-span-2">
                    <span className="break-words">{selectedRequest.reason}</span>
                  </Detail>
                </dl>
              </DetailSection>
              {/* Day Off Details (for day off requests) */}
              {selectedRequest.type === 'dayoff' && (
                <DetailSection title="Day Off Details" tone="bg-peach-100" titleClass="text-peach-700">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Detail label="Original Day Off">{formatDateOnly(selectedRequest.originalDayOff)}</Detail>
                    <Detail label="Requested Day Off">{formatDateOnly(selectedRequest.requestedDayOff)}</Detail>
                  </dl>
                </DetailSection>
              )}
              {/* Shift Details */}
              {(selectedRequest.shiftStartDate || selectedRequest.shiftEndDate) && (
                <DetailSection title="Shift Details" tone="bg-lavender-100" titleClass="text-lavender-700">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedRequest.shiftStartDate && (
                      <Detail label="Shift Start">{formatDate(selectedRequest.shiftStartDate)}</Detail>
                    )}
                    {selectedRequest.shiftEndDate && (
                      <Detail label="Shift End">{formatDate(selectedRequest.shiftEndDate)}</Detail>
                    )}
                  </dl>
                </DetailSection>
              )}
              {/* Desired Shift Details */}
              {(selectedRequest.desiredShiftStartDate || selectedRequest.desiredShiftEndDate) && (
                <DetailSection title="Desired Shift Details" tone="bg-brand-50" titleClass="text-brand-700">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedRequest.desiredShiftStartDate && (
                      <Detail label="Desired Shift Start">{formatDate(selectedRequest.desiredShiftStartDate)}</Detail>
                    )}
                    {selectedRequest.desiredShiftEndDate && (
                      <Detail label="Desired Shift End">{formatDate(selectedRequest.desiredShiftEndDate)}</Detail>
                    )}
                  </dl>
                </DetailSection>
              )}
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
              {/* Offers/Matches Section */}
              {selectedRequest.type === 'shift' && selectedRequest.negotiationHistory && selectedRequest.negotiationHistory.length > 0 && (
                <DetailSection title={`Offers (${selectedRequest.negotiationHistory.length})`} tone="border border-ink/[0.07] bg-white">
                  <ul className="space-y-3">
                    {selectedRequest.negotiationHistory.map((offer, index) => (
                      <li key={index} className="rounded-xl border border-ink/[0.07] bg-sand-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink">
                              {offer.offeredBy?.fullName || 'Unknown Employee'}
                            </p>
                            <p className="break-all text-xs text-ink/55">{offer.offeredBy?.email || 'Unknown Email'}</p>
                            <p className="mt-2 text-xs text-ink/60">
                              {formatDate(offer.shiftStartDate)} - {formatDate(offer.shiftEndDate)}
                            </p>
                            {offer.overtimeStart && (
                              <p className="mt-0.5 text-xs text-ink/60">
                                Overtime: {formatDate(offer.overtimeStart)} - {formatDate(offer.overtimeEnd)}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className={`chip capitalize ${offer.status === 'accepted' ? 'bg-mint-200 text-mint-700' :
                              offer.status === 'rejected' ? 'bg-rose-200 text-rose-700' :
                                'bg-butter-200 text-butter-700'
                              }`}>
                              {offer.status}
                            </span>
                            {/* Only show Accept button if user is the requester and the offer is from someone else */}
                            {offer.status === 'offered' &&
                              employeeData?._id === selectedRequest.requesterUserId?._id &&
                              offer.offeredBy?._id !== employeeData?._id && (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptOffer(offer._id)}
                                  disabled={actionLoading === offer._id}
                                  className="btn btn-primary btn-sm"
                                >
                                  {actionLoading === offer._id ? <Loader className="h-4 w-4 animate-spin" aria-label="Accepting" /> : 'Accept'}
                                </button>
                              )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              )}
              {selectedRequest.type === 'dayoff' && selectedRequest.matches && selectedRequest.matches.length > 0 && (
                <DetailSection title={`Matches (${selectedRequest.matches.length})`} tone="border border-ink/[0.07] bg-white">
                  <ul className="space-y-3">
                    {selectedRequest.matches.map((match, index) => (
                      <li key={index} className="rounded-xl border border-ink/[0.07] bg-sand-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink">
                              {match.matchedBy?.fullName || 'Unknown Employee'}
                            </p>
                            <p className="mt-1 text-xs text-ink/60">
                              Original day off: {formatDateOnly(match.originalDayOff)}
                            </p>
                            {match.shiftStartDate && (
                              <p className="mt-0.5 text-xs text-ink/60">
                                Shift: {formatDate(match.shiftStartDate)} - {formatDate(match.shiftEndDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className={`chip capitalize ${match.status === 'accepted' ? 'bg-mint-200 text-mint-700' :
                              match.status === 'rejected' ? 'bg-rose-200 text-rose-700' :
                                'bg-butter-200 text-butter-700'
                              }`}>
                              {match.status}
                            </span>
                            {/* Only show Accept button if user is the requester and the match is from someone else */}
                            {match.status === 'proposed' &&
                              employeeData?._id === selectedRequest.requesterUserId?._id &&
                              match.matchedBy?._id !== employeeData?._id && (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptMatch(match._id)}
                                  disabled={actionLoading === match._id}
                                  className="btn btn-primary btn-sm"
                                >
                                  {actionLoading === match._id ? <Loader className="h-4 w-4 animate-spin" aria-label="Accepting" /> : 'Accept'}
                                </button>
                              )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              )}
              {/* Rejection/Approval Comment */}
              {(selectedRequest.status === 'rejected' || selectedRequest.status === 'approved') && selectedRequest.comment && (
                <div className={`${selectedRequest.status === 'rejected' ? 'border-rose-300 bg-rose-100' : 'border-mint-300 bg-mint-100'} rounded-2xl border p-4 sm:p-5`}>
                  <h3 className={`mb-2 text-[15px] font-semibold ${selectedRequest.status === 'rejected' ? 'text-rose-700' : 'text-mint-700'}`}>
                    {selectedRequest.status === 'rejected' ? 'Rejection' : 'Approval'} Comment
                  </h3>
                  <p className="break-words text-sm text-ink/80">
                    {selectedRequest.comment}
                  </p>
                </div>
              )}
            </div>
            {/* Action Buttons - Only for Own Requests */}
            <ModalFooter>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="btn btn-white btn-md border border-ink/10"
              >
                Close
              </button>
              {canDelete(selectedRequest) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    handleDeleteRequest(selectedRequest, selectedRequest.type);
                  }}
                  className="btn btn-danger btn-md"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete Request
                </button>
              )}
              {canEdit(selectedRequest) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedRequest, selectedRequest.type);
                  }}
                  className="btn btn-primary btn-md"
                >
                  <Edit className="h-4 w-4" aria-hidden="true" />
                  Edit Request
                </button>
              )}
            </ModalFooter>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
