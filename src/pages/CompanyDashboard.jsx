import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Bell,
  Search,
  Check,
  X,
  Eye,
  LogOut,
  AlertCircle,
  Loader,
  RefreshCw,
  Upload,
  Hash,
  Plus,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Swal from 'sweetalert2';

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

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [companyData, setCompanyData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalEmployees: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [processingRequest, setProcessingRequest] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [supervisors, setSupervisors] = useState([]);

  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [employeePositionFilter, setEmployeePositionFilter] = useState('all');

  const filterEmployeeIds = () => {
    let result = [...employeeIds];
    if (employeeSearchTerm) {
      const term = employeeSearchTerm.toLowerCase();
      result = result.filter(emp =>
        emp.name.toLowerCase().includes(term) ||
        emp.employeeId.toLowerCase().includes(term)
      );
    }
    if (employeePositionFilter !== 'all') result = result.filter(emp => emp.position === employeePositionFilter);
    return result;
  };

  // Employee IDs Management
  const [employeeIds, setEmployeeIds] = useState([]);
  const [employeeIdForm, setEmployeeIdForm] = useState({
    employeeId: '',
    name: '',
    position: 'expert',
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadCompanyData();
    loadRequests();
    loadSupervisors();
    if (activeTab === 'employeeIds') {
      loadEmployeeIds();
    }
  }, [activeTab]);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter, positionFilter]);

  // Close any open modal with Escape (same effect as its Cancel / close button)
  useEffect(() => {
    if (!showViewModal && !showActionModal && !uploadModalOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setShowActionModal(false);
      setShowViewModal(false);
      if (uploadModalOpen) {
        setUploadModalOpen(false);
        setFile(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showViewModal, showActionModal, uploadModalOpen]);

  const loadCompanyData = () => {
    const stored = Cookies.get('company_data');
    if (stored) setCompanyData(JSON.parse(stored));
  };

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = Cookies.get('company_token');
      if (!token) return handleLogout();

      const res = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/company/all-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) return handleLogout();

      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        calculateStats(data.requests || []);
      } else {
        setError(data.message || 'Failed to load requests');
      }
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployeeIds = async () => {
    try {
      const token = Cookies.get('company_token');
      const res = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employees-ids`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEmployeeIds(data.data || []);
      } else {
        setError('Failed to load employee IDs');
      }
    } catch {
      setError('Connection error');
    }
  };

  const loadSupervisors = async () => {
    try {
      const token = Cookies.get('company_token');
      const res = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employees/supervisors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSupervisors(data.supervisors || []);
      }
    } catch (err) {
      console.error('Load supervisors error:', err);
    }
  };

  const calculateStats = (reqs) => {
    const stats = {
      totalRequests: reqs.length,
      pendingRequests: reqs.filter(r => r.status === 'pending').length,
      approvedRequests: reqs.filter(r => r.status === 'approved').length,
      rejectedRequests: reqs.filter(r => r.status === 'rejected').length,
      totalEmployees: reqs.filter(r => r.status === 'approved').length,
    };
    setDashboardStats(stats);
  };

  const filterRequests = () => {
    let result = [...requests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.fullName.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.accountName.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);
    if (positionFilter !== 'all') result = result.filter(r => r.position === positionFilter);

    setFilteredRequests(result);
  };

  const handleRequestAction = async (requestId, action, data = {}) => {
    try {
      setProcessingRequest(requestId);
      const token = Cookies.get('company_token');
      const payload = { requestId, action, ...data };

      const res = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        await loadRequests();
        setShowActionModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        setSelectedSupervisor('');
        showSuccessToast(`Request ${action}d successfully!`);
      } else {
        setError(result.message);
      }
    } catch {
      setError(`Failed to ${action} request.`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const openActionModal = (req, action) => {
    setSelectedRequest(req);
    setActionType(action);
    setShowActionModal(true);
    setRejectionReason('');
    setSelectedSupervisor('');
  };

  const viewRequestDetails = (req) => {
    setSelectedRequest(req);
    setShowViewModal(true);
  };

  const confirmAction = () => {
    if (!selectedRequest) return;

    const additionalData = {};
    if (actionType === 'approve' && selectedRequest.position !== 'moderator') {
      if (!selectedSupervisor) return setError('Please select a supervisor.');
      additionalData.supervisorId = selectedSupervisor;
    } else if (actionType === 'reject') {
      if (!rejectionReason.trim()) return setError('Please provide a rejection reason.');
      additionalData.rejectionReason = rejectionReason.trim();
    }

    handleRequestAction(selectedRequest._id, actionType, additionalData);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2998FF',
      cancelButtonColor: '#A9A4B4',
      confirmButtonText: 'Yes, logout',
    });

    if (result.isConfirmed) {
      Cookies.remove('company_token');
      Cookies.remove('company_data');
      login();
      Swal.fire('Logged Out!', 'You have been signed out.', 'success').then(() => {
        navigate('/company_login');
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-butter-200 text-butter-700';
      case 'approved': return 'bg-mint-200 text-mint-700';
      case 'rejected': return 'bg-rose-200 text-rose-700';
      default: return 'bg-sand-200 text-ink/70';
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'supervisor': return 'bg-brand-100 text-brand-700';
      case 'expert': return 'bg-lavender-200 text-lavender-700';
      case 'sme': return 'bg-peach-200 text-peach-700';
      default: return 'bg-sand-200 text-ink/70';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const showSuccessToast = (msg) => {
    const el = document.createElement('div');
    el.className = 'fixed top-[86px] right-4 z-[70] max-w-[calc(100vw-2rem)] bg-ink text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-float animate-slide-down';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => document.body.removeChild(el), 3000);
  };

  // === Employee IDs Functions ===

  const generateAutoId = () => {
    const companyCode = companyData?.name?.substring(0, 4).toUpperCase() || 'COMP';
    const positionShort = {
      expert: 'EXP',
      supervisor: 'SUP',
      sme: 'SME',
    }[employeeIdForm.position] || 'EMP';
    const random = Math.floor(10000 + Math.random() * 90000);
    return `EMP-${companyCode}-${positionShort}-${random}`;
  };

  const handleAddEmployeeId = async (e) => {
    e.preventDefault();
    const { employeeId, name, position } = employeeIdForm;

    if (!employeeId.trim()) return setError('Employee ID is required.');
    if (!name.trim()) return setError('Name is required.');

    try {
      const token = Cookies.get('company_token');
      const res = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employees-ids`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId: employeeId.trim().toUpperCase(), name: name.trim(), position }),
      });

      const data = await res.json();
      if (data.success) {
        loadEmployeeIds();
        setEmployeeIdForm({ employeeId: '', name: '', position: 'expert' });
        setActiveTab('employeeIds');
        showSuccessToast('Employee ID created!');
      } else {
        setError(data.message || 'Failed to add employee ID.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    }
  };

  const handleDeleteEmployeeId = async (id) => {
    const confirm = await Swal.fire({
      title: 'Confirm Delete',
      text: 'Are you sure you want to delete this employee ID?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E0566E',
      cancelButtonColor: '#A9A4B4',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = Cookies.get('company_token');
      const res = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employees-ids/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        loadEmployeeIds();
        showSuccessToast('Employee ID deleted.');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete.');
      }
    } catch {
      setError('Connection error.');
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const openUploadModal = () => setUploadModalOpen(true);
  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setFile(null);
  };

  const handleFileUpload = async () => {
    if (!file) return setError('Please select a file.');

    const formData = new FormData();
    formData.append('file', file); // Must match field name in backend

    try {
      const token = Cookies.get('company_token');
      const res = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employees-ids/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set 'Content-Type' — let browser set it with boundary
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        loadEmployeeIds();
        closeUploadModal();
        showSuccessToast(`Added ${data.insertedCount} employees.`);
      } else {
        setError(data.message || 'Upload failed.');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
  };

  // === Tabs ===

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-200 text-lavender-700"><Users className="h-5 w-5" aria-hidden="true" /></span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">{dashboardStats.totalRequests}</p>
          <p className="mt-2 text-sm font-medium text-ink/55">Total Requests</p>
        </div>
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-butter-200 text-butter-700"><Clock className="h-5 w-5" aria-hidden="true" /></span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">{dashboardStats.pendingRequests}</p>
          <p className="mt-2 text-sm font-medium text-ink/55">Pending</p>
        </div>
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-200 text-mint-700"><UserCheck className="h-5 w-5" aria-hidden="true" /></span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">{dashboardStats.approvedRequests}</p>
          <p className="mt-2 text-sm font-medium text-ink/55">Approved</p>
        </div>
        <div className="stat-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-200 text-rose-700"><UserX className="h-5 w-5" aria-hidden="true" /></span>
          <p className="mt-4 font-display text-3xl leading-none text-ink">{dashboardStats.rejectedRequests}</p>
          <p className="mt-2 text-sm font-medium text-ink/55">Rejected</p>
        </div>
      </div>

      <section className="app-card overflow-hidden" aria-labelledby="company-recent-title">
        <div className="border-b border-ink/[0.07] px-5 py-4 sm:px-6">
          <h2 id="company-recent-title" className="font-display text-xl text-ink">Recent Requests</h2>
        </div>
        {filteredRequests.length > 0 ? (
          <ul className="divide-y divide-ink/[0.06]">
            {filteredRequests.slice(0, 5).map((req) => (
              <li key={req._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-200 text-[13px] font-semibold text-ink/70" aria-hidden="true">
                    {getInitials(req.fullName, '?')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{req.fullName}</p>
                    <p className="truncate text-xs text-ink/50">{req.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 pl-[52px] sm:pl-0">
                  <span className={`chip uppercase tracking-wide ${getPositionColor(req.position)}`}>{req.position}</span>
                  <span className={`chip capitalize ${getStatusColor(req.status)}`}>{req.status}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Users}
            title="No requests to show"
            text="When employees request to join your company, they will appear here."
          />
        )}
      </section>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="app-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search by name, email or account name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="field h-11 py-0 pl-10"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" className="field h-11 py-0 sm:w-40">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} aria-label="Filter by position" className="field h-11 py-0 sm:w-44">
              <option value="all">All Positions</option>
              <option value="expert">Expert</option>
              <option value="moderator">Moderator</option>
              <option value="supervisor">Supervisor</option>
              <option value="sme">SME</option>
            </select>
          </div>
          <button type="button" onClick={loadRequests} className="btn btn-white btn-md self-start lg:self-auto">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
          </button>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-sand-100">
              <tr>
                <th scope="col" className={TH}>Employee</th>
                <th scope="col" className={TH}>Position</th>
                <th scope="col" className={TH}>Status</th>
                <th scope="col" className={TH}>Submitted</th>
                <th scope="col" className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {filteredRequests.map((req) => (
                <tr key={req._id} className="transition-colors hover:bg-sand-50">
                  <td className={TD}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-200 text-[13px] font-semibold text-ink/70" aria-hidden="true">
                        {getInitials(req.fullName, '?')}
                      </span>
                      <div className="min-w-0">
                        <div className="whitespace-nowrap text-sm font-medium text-ink">{req.fullName}</div>
                        <div className="whitespace-nowrap text-[13px] text-ink/60">{req.email}</div>
                        <div className="whitespace-nowrap text-xs text-ink/45">@{req.accountName}</div>
                      </div>
                    </div>
                  </td>
                  <td className={TD}>
                    <span className={`chip tracking-wide ${getPositionColor(req.position)}`}>{req.position.toUpperCase()}</span>
                  </td>
                  <td className={TD}>
                    <span className={`chip capitalize ${getStatusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className={`${TD} whitespace-nowrap text-sm text-ink/55`}>{formatDate(req.createdAt)}</td>
                  <td className={TD}>
                    <div className="flex items-center justify-end gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => openActionModal(req, 'approve')}
                            disabled={processingRequest === req._id}
                            className={`${ICON_BTN} bg-mint-200 text-mint-700 hover:bg-mint-300`}
                            title="Approve"
                            aria-label={`Approve ${req.fullName}`}
                          >
                            {processingRequest === req._id ? <Loader className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal(req, 'reject')}
                            disabled={processingRequest === req._id}
                            className={`${ICON_BTN} bg-rose-200 text-rose-700 hover:bg-rose-300`}
                            title="Reject"
                            aria-label={`Reject ${req.fullName}`}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => viewRequestDetails(req)}
                        className={`${ICON_BTN} border border-ink/10 bg-white text-ink hover:bg-sand-100`}
                        title="View details"
                        aria-label={`View details for ${req.fullName}`}
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
        {filteredRequests.length === 0 && !isLoading && (
          <EmptyState
            icon={Users}
            title="No requests found"
            text={requests.length === 0 ? 'Join requests from your employees will appear here.' : 'Try adjusting your search or filters.'}
          />
        )}
      </div>
    </div>
  );

  const renderEmployeeIds = () => {
    const filteredEmployeeIds = filterEmployeeIds();

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink">Manage Employee IDs</h2>
            <p className="mt-1 max-w-xl text-sm text-ink/55">
              Employees need an ID from this list to request to join your company.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={openUploadModal}
              className="btn btn-white btn-md"
            >
              <Upload className="h-4 w-4" aria-hidden="true" /> Upload Excel
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add-id')}
              className="btn btn-primary btn-md"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Add ID
            </button>
          </div>
        </div>
        <div className="app-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-ink/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search by name or employee ID"
                value={employeeSearchTerm}
                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                className="field h-11 py-0 pl-10"
              />
            </div>
            <select value={employeePositionFilter} onChange={(e) => setEmployeePositionFilter(e.target.value)} aria-label="Filter by position" className="field h-11 py-0 sm:w-44">
              <option value="all">All Positions</option>
              <option value="expert">Expert</option>
              <option value="moderator">Moderator</option>
              <option value="supervisor">Supervisor</option>
              <option value="sme">SME</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-sand-100">
                <tr>
                  <th scope="col" className={TH}>ID</th>
                  <th scope="col" className={TH}>Name</th>
                  <th scope="col" className={TH}>Position</th>
                  <th scope="col" className={TH}>Created</th>
                  <th scope="col" className={`${TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.06]">
                {filteredEmployeeIds.map((emp) => (
                  <tr key={emp._id} className="transition-colors hover:bg-sand-50">
                    <td className={`${TD} whitespace-nowrap font-mono text-[13px] font-medium text-ink`}>{emp.employeeId}</td>
                    <td className={`${TD} whitespace-nowrap text-sm text-ink/80`}>{emp.name}</td>
                    <td className={TD}>
                      <span className={`chip tracking-wide ${getPositionColor(emp.position)}`}>
                        {emp.position.toUpperCase()}
                      </span>
                    </td>
                    <td className={`${TD} whitespace-nowrap text-sm text-ink/55`}>{formatDate(emp.createdAt)}</td>
                    <td className={`${TD} text-right`}>
                      <button
                        type="button"
                        onClick={() => handleDeleteEmployeeId(emp._id)}
                        className="btn btn-ghost btn-sm h-10 text-rose-700 hover:bg-rose-100"
                        aria-label={`Delete ${emp.employeeId}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEmployeeIds.length === 0 && (
            <EmptyState
              icon={Hash}
              title={employeeIds.length === 0 ? 'No employee IDs yet' : 'No employee IDs found'}
              text={employeeIds.length === 0 ? 'Add an ID or upload a spreadsheet to get started.' : 'Try adjusting your search or filters.'}
            />
          )}
        </div>
      </div>
    );
  };

  const renderAddIdForm = () => (
    <div className="app-card mx-auto max-w-lg p-6 sm:p-8">
      <h2 className="font-display text-2xl text-ink">Add New Employee ID</h2>
      <p className="mt-1 text-sm text-ink/55">Employees enter this ID when they request to join your company.</p>
      <form onSubmit={handleAddEmployeeId} className="mt-6 space-y-5">
        <div>
          <label htmlFor="employee-id-input" className="field-label">Employee ID</label>
          <div className="flex gap-2">
            <input
              id="employee-id-input"
              type="text"
              value={employeeIdForm.employeeId}
              onChange={(e) => setEmployeeIdForm({ ...employeeIdForm, employeeId: e.target.value })}
              placeholder="EMP-XXXX-EXP-12345"
              className="field min-w-0 flex-1 font-mono"
            />
            <button
              type="button"
              onClick={() => setEmployeeIdForm({ ...employeeIdForm, employeeId: generateAutoId() })}
              className="btn btn-white btn-md h-auto shrink-0 border border-ink/15"
              title="Generate ID"
              aria-label="Generate an employee ID"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Generate</span>
            </button>
          </div>
          <p className="field-hint">Type an ID or generate one automatically.</p>
        </div>
        <div>
          <label htmlFor="employee-name-input" className="field-label">Full Name</label>
          <input
            id="employee-name-input"
            type="text"
            value={employeeIdForm.name}
            onChange={(e) => setEmployeeIdForm({ ...employeeIdForm, name: e.target.value })}
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="employee-position-input" className="field-label">Position</label>
          <select
            id="employee-position-input"
            value={employeeIdForm.position}
            onChange={(e) => setEmployeeIdForm({ ...employeeIdForm, position: e.target.value })}
            className="field"
          >
            <option value="expert">Expert</option>
            <option value="moderator">Moderator</option>
            <option value="supervisor">Supervisor</option>
            <option value="sme">SME</option>
          </select>
        </div>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setActiveTab('employeeIds')}
            className="btn btn-ghost btn-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-md"
          >
            Save ID
          </button>
        </div>
      </form>
    </div>
  );

  if (isLoading && requests.length === 0) {
    return (
      <div className="app-page flex items-center justify-center px-5">
        <div className="text-center" role="status" aria-live="polite">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-500"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm text-ink/55">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      {/* Page hero: company identity + account actions */}
      <section className="app-hero">
        <div className="container-site py-6 sm:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {companyData?.logo ? (
                <img
                  src={`${process.env.REACT_APP_URI_API_URL}/images/companies/logos/${companyData.logo}`}
                  alt={`${companyData.name} Logo`}
                  className="h-14 w-14 shrink-0 rounded-2xl border border-ink/[0.07] bg-white object-contain p-1.5"
                />
              ) : (
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lavender-200 font-display text-xl text-lavender-700"
                  aria-hidden="true"
                >
                  {getInitials(companyData?.name, 'C')}
                </span>
              )}

              <div className="min-w-0">
                <span className="chip bg-sand-200 text-ink/70">Company admin</span>
                <h1 className="app-title mt-1.5 break-words">{companyData?.name || 'Dashboard'}</h1>
                <p className="mt-1 break-all text-sm text-ink/55">{companyData?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {dashboardStats.pendingRequests > 0 ? (
                <span className="chip h-9 bg-butter-200 px-3 text-butter-700">
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  {dashboardStats.pendingRequests} pending
                  <span className="sr-only"> join requests</span>
                </span>
              ) : (
                <span className="chip h-9 bg-sand-200 px-3 text-ink/60">
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  No pending requests
                </span>
              )}
              <button type="button" onClick={handleLogout} className="btn btn-white btn-md">
                <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-site py-8">
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
            Employee Requests
            {dashboardStats.pendingRequests > 0 && (
              <span className={`chip px-2 py-0.5 ${activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-butter-200 text-butter-700'}`}>
                {dashboardStats.pendingRequests}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'employeeIds' || activeTab === 'add-id'}
            onClick={() => setActiveTab('employeeIds')}
            className="app-tab"
          >
            Employee IDs
          </button>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'employeeIds' && renderEmployeeIds()}
        {activeTab === 'add-id' && renderAddIdForm()}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/[0.07] bg-white px-6 py-5">
              <h2 id="upload-modal-title" className="font-display text-2xl text-ink">Upload Employee IDs (Excel)</h2>
              <button
                type="button"
                onClick={closeUploadModal}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <p className="text-sm text-ink/60">Columns: Employee ID, Name, Position</p>
              <div className="overflow-hidden rounded-2xl border border-ink/[0.07]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-sand-100">
                      <tr>
                        <th scope="col" className={TH}>Employee ID</th>
                        <th scope="col" className={TH}>Name</th>
                        <th scope="col" className={TH}>Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/[0.06] text-sm text-ink/80">
                      <tr>
                        <td className="whitespace-nowrap px-5 py-2.5 font-mono text-[13px]">EMP001</td>
                        <td className="whitespace-nowrap px-5 py-2.5">Ahmed Mohamed</td>
                        <td className="whitespace-nowrap px-5 py-2.5">expert</td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-5 py-2.5 font-mono text-[13px]">EMP002</td>
                        <td className="whitespace-nowrap px-5 py-2.5">Sara Ali</td>
                        <td className="whitespace-nowrap px-5 py-2.5">expert</td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-5 py-2.5 font-mono text-[13px]">EMP003</td>
                        <td className="whitespace-nowrap px-5 py-2.5">Mohamed Essam</td>
                        <td className="whitespace-nowrap px-5 py-2.5">supervisor</td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-5 py-2.5 font-mono text-[13px]">EMP004</td>
                        <td className="whitespace-nowrap px-5 py-2.5">Mona Adel</td>
                        <td className="whitespace-nowrap px-5 py-2.5">expert</td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-5 py-2.5 font-mono text-[13px]">EMP005</td>
                        <td className="whitespace-nowrap px-5 py-2.5">Mostafa Hassan</td>
                        <td className="whitespace-nowrap px-5 py-2.5">expert</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <input id="employee-ids-file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="peer sr-only" />
                <label
                  htmlFor="employee-ids-file"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-sand-50 px-6 py-8 text-center transition-colors duration-200 hover:border-brand-400 hover:bg-brand-50 peer-focus-visible:border-brand-500 peer-focus-visible:shadow-ring"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="break-all text-sm font-semibold text-ink">{file ? file.name : 'Choose a file to upload'}</span>
                  <span className="text-[13px] text-ink/50">{file ? 'Choose a different file' : '.xlsx, .xls or .csv'}</span>
                </label>
              </div>
              {error && (
                <div className="alert alert-error" role="alert">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p className="flex-1">{error}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-ink/[0.07] px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeUploadModal} className="btn btn-ghost btn-md">Cancel</button>
              <button type="button" onClick={handleFileUpload} className="btn btn-primary btn-md">
                <Upload className="h-4 w-4" aria-hidden="true" /> Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="company-view-title">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/[0.07] bg-white px-6 py-5">
              <h2 id="company-view-title" className="font-display text-2xl text-ink">Request Details</h2>
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
              <section className="rounded-2xl bg-sand-100 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-ink">Employee Information</h3>
                <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><dt className={DT}>Full Name</dt><dd className="mt-1 break-words text-sm text-ink">{selectedRequest.fullName}</dd></div>
                  <div><dt className={DT}>Account Name</dt><dd className="mt-1 break-words text-sm text-ink">{selectedRequest.accountName}</dd></div>
                  <div><dt className={DT}>Email</dt><dd className="mt-1 break-all text-sm text-ink">{selectedRequest.email}</dd></div>
                  <div>
                    <dt className={DT}>Position</dt>
                    <dd className="mt-1">
                      <span className={`chip tracking-wide ${getPositionColor(selectedRequest.position)}`}>
                        {selectedRequest.position.toUpperCase()}
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="rounded-2xl bg-sand-100 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-ink">Request Status</h3>
                <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className={DT}>Status</dt>
                    <dd className="mt-1">
                      <span className={`chip capitalize ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </dd>
                  </div>
                  <div><dt className={DT}>Submitted</dt><dd className="mt-1 text-sm text-ink">{formatDate(selectedRequest.createdAt)}</dd></div>
                  {selectedRequest.approvedAt && (
                    <div><dt className={DT}>Approved</dt><dd className="mt-1 text-sm text-ink">{formatDate(selectedRequest.approvedAt)}</dd></div>
                  )}
                  {selectedRequest.rejectedAt && (
                    <div><dt className={DT}>Rejected</dt><dd className="mt-1 text-sm text-ink">{formatDate(selectedRequest.rejectedAt)}</dd></div>
                  )}
                </dl>
              </section>
              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <section className="rounded-2xl border border-rose-300 bg-rose-100 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-rose-700">Rejection Reason</h3>
                  <p className="mt-2 break-words text-sm text-ink/80">{selectedRequest.rejectionReason}</p>
                </section>
              )}
              {selectedRequest.status === 'approved' && selectedRequest.supervisorId && (
                <section className="rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-brand-700">Supervisor</h3>
                  <p className="mt-2 text-sm text-ink/80">
                    {supervisors.find(s => String(s._id) === String(selectedRequest.supervisorId?._id || selectedRequest.supervisorId))?.fullName || 'Unknown'}
                  </p>
                </section>
              )}
            </div>
            {selectedRequest.status === 'pending' && (
              <div className="flex flex-col-reverse gap-2 border-t border-ink/[0.07] px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => { setShowViewModal(false); openActionModal(selectedRequest, 'reject'); }}
                  className="btn btn-danger btn-md"
                >
                  <X className="h-4 w-4" aria-hidden="true" /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => { setShowViewModal(false); openActionModal(selectedRequest, 'approve'); }}
                  className="btn btn-primary btn-md"
                >
                  <Check className="h-4 w-4" aria-hidden="true" /> Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-lg" role="dialog" aria-modal="true" aria-labelledby="company-action-title">
            <div className="flex items-center justify-between gap-4 border-b border-ink/[0.07] px-6 py-5">
              <h2 id="company-action-title" className="font-display text-2xl text-ink">{actionType === 'approve' ? 'Approve' : 'Reject'} Request</h2>
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
              <div className="rounded-2xl bg-sand-100 p-4">
                <p className="break-words font-medium text-ink">{selectedRequest.fullName}</p>
                <p className="break-all text-sm text-ink/55">{selectedRequest.email}</p>
                <p className="mt-1 text-sm text-ink/55">Position: <span className="uppercase">{selectedRequest.position}</span></p>
              </div>
              {actionType === 'approve' && selectedRequest.position !== 'moderator' && (
                <div>
                  <label htmlFor="assign-supervisor" className="field-label">Assign Supervisor *</label>
                  <select
                    id="assign-supervisor"
                    value={selectedSupervisor}
                    onChange={(e) => setSelectedSupervisor(e.target.value)}
                    className="field"
                  >
                    <option value="">Select supervisor</option>
                    {supervisors.map((s) => (
                      <option key={s._id} value={s._id}>{s.fullName} (@{s.accountName})</option>
                    ))}
                  </select>
                </div>
              )}
              {actionType === 'reject' && (
                <div>
                  <label htmlFor="rejection-reason" className="field-label">Rejection Reason *</label>
                  <textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="field resize-none"
                    placeholder="Reason..."
                  />
                </div>
              )}
              {error && (
                <div className="alert alert-error" role="alert">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p className="flex-1">{error}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-ink/[0.07] px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowActionModal(false)} className="btn btn-ghost btn-md">Cancel</button>
              <button
                type="button"
                onClick={confirmAction}
                disabled={processingRequest === selectedRequest._id}
                className={`btn btn-md ${actionType === 'approve' ? 'btn-primary' : 'btn-danger'}`}
              >
                {processingRequest === selectedRequest._id ? <Loader className="animate-spin h-4 w-4" aria-hidden="true" /> : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
