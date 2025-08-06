import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Building,
  Bell,
  Search,
  Check,
  X,
  Eye,
  LogOut,
  ChevronDown,
  AlertCircle,
  Loader,
  RefreshCw,
  FileDown,
  Upload,
  RefreshCw as RefreshIcon,
  Hash,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Swal from 'sweetalert2';

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
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'sme': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
    el.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full"><Users className="h-6 w-6 text-blue-600" /></div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalRequests}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full"><Clock className="h-6 w-6 text-yellow-600" /></div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingRequests}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-full"><UserCheck className="h-6 w-6 text-green-600" /></div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.approvedRequests}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-red-100 p-3 rounded-full"><UserX className="h-6 w-6 text-red-600" /></div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.rejectedRequests}</p>
          </div>
        </div>
        {/* <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full"><Building className="h-6 w-6 text-purple-600" /></div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Active Employees</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalEmployees}</p>
          </div>
        </div> */}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Recent Requests</h3>
        </div>
        <div className="p-6">
          {filteredRequests.slice(0, 5).map((req) => (
            <div key={req._id} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 rounded-full p-2"><Users className="h-4 w-4 text-gray-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{req.fullName}</p>
                  <p className="text-xs text-gray-500">{req.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getPositionColor(req.position)}`}>{req.position}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(req.status)}`}>{req.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none">
              <option value="all">All Positions</option>
              <option value="expert">Expert</option>
              <option value="moderator">Moderator</option>
              <option value="supervisor">Supervisor</option>
              <option value="sme">SME</option>
            </select>
          </div>
          <button onClick={loadRequests} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshIcon className="h-4 w-4 mr-2" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-2 mr-3"><Users className="h-4 w-4 text-gray-600" /></div>
                      <div>
                        <div className="text-sm font-medium">{req.fullName}</div>
                        <div className="text-sm text-gray-500">{req.email}</div>
                        <div className="text-xs text-gray-400">@{req.accountName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPositionColor(req.position)}`}>{req.position.toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(req.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => openActionModal(req, 'approve')} disabled={processingRequest === req._id} className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                            {processingRequest === req._id ? <Loader className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          </button>
                          <button onClick={() => openActionModal(req, 'reject')} disabled={processingRequest === req._id} className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      )}
                      <button onClick={() => viewRequestDetails(req)} className="flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRequests.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">No requests found</h3>
          </div>
        )}
      </div>
    </div>
  );

  const renderEmployeeIds = () => {
    const filteredEmployeeIds = filterEmployeeIds();

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Manage Employee IDs</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openUploadModal}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" /> Upload Excel
            </button>
            <button
              onClick={() => setActiveTab('add-id')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Add ID
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={employeeSearchTerm}
                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select value={employeePositionFilter} onChange={(e) => setEmployeePositionFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none">
              <option value="all">All Positions</option>
              <option value="expert">Expert</option>
              <option value="moderator">Moderator</option>
              <option value="supervisor">Supervisor</option>
              <option value="sme">SME</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployeeIds.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.employeeId}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{emp.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPositionColor(emp.position)}`}>
                        {emp.position.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(emp.createdAt)}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleDeleteEmployeeId(emp._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEmployeeIds.length === 0 && (
            <div className="text-center py-8">
              <FileDown className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">No employee IDs found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAddIdForm = () => (
    <div className="bg-white rounded-lg shadow p-6 max-w-lg mx-auto">
      <h2 className="text-lg font-medium mb-4">Add New Employee ID</h2>
      <form onSubmit={handleAddEmployeeId} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee ID</label>
          <div className="flex">
            <input
              type="text"
              value={employeeIdForm.employeeId}
              onChange={(e) => setEmployeeIdForm({ ...employeeIdForm, employeeId: e.target.value })}
              placeholder="EMP-XXXX-EXP-12345"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setEmployeeIdForm({ ...employeeIdForm, employeeId: generateAutoId() })}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-lg hover:bg-gray-300"
            >
              <RefreshIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={employeeIdForm.name}
            onChange={(e) => setEmployeeIdForm({ ...employeeIdForm, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <select
            value={employeeIdForm.position}
            onChange={(e) => setEmployeeIdForm({ ...employeeIdForm, position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
          >
            <option value="expert">Expert</option>
            <option value="moderator">Moderator</option>
            <option value="supervisor">Supervisor</option>
            <option value="sme">SME</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('employeeIds')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save ID
          </button>
        </div>
      </form>
    </div>
  );

  if (isLoading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="pt-2 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              {companyData?.logo ? (
                <img
                  src={`${process.env.REACT_APP_URI_API_URL}/images/companies/logos/${companyData.logo}`}
                  alt={`${companyData.name} Logo`}
                  className="h-10 w-10 object-contain mr-3 rounded-full"
                />
              ) : (
                <Building className="h-8 w-8 text-blue-600 mr-2 flex-shrink-0" />
              )}

              <div>
                <h1 className="text-2xl font-bold text-gray-900">{companyData?.name || 'Dashboard'}</h1>
                <p className="text-sm text-gray-500">{companyData?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
                {dashboardStats.pendingRequests > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {dashboardStats.pendingRequests}
                  </span>
                )}
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="bg-blue-100 rounded-full p-2"><Building className="h-4 w-4 text-blue-600" /></div>
                  <span className="text-sm font-medium">{companyData?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-600 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-500"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              Employee Requests
              {dashboardStats.pendingRequests > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">{dashboardStats.pendingRequests}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('employeeIds')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'employeeIds' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              Employee IDs
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'employeeIds' && renderEmployeeIds()}
        {activeTab === 'add-id' && renderAddIdForm()}
      </main>

      {/* Upload Modal */}
      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Upload Employee IDs (Excel)</h3>
            <p className="text-sm text-gray-600 mb-4">Columns: Employee ID, Name, Position</p>
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Position</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-800">EMP001</td>
                  <td className="px-6 py-4 text-sm text-gray-800">Ahmed Mohamed</td>
                  <td className="px-6 py-4 text-sm text-gray-800">expert</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-800">EMP002</td>
                  <td className="px-6 py-4 text-sm text-gray-800">Sara Ali</td>
                  <td className="px-6 py-4 text-sm text-gray-800">expert</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-800">EMP003</td>
                  <td className="px-6 py-4 text-sm text-gray-800">Mohamed Essam</td>
                  <td className="px-6 py-4 text-sm text-gray-800">supervisor</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-800">EMP004</td>
                  <td className="px-6 py-4 text-sm text-gray-800">Mona Adel</td>
                  <td className="px-6 py-4 text-sm text-gray-800">expert</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-800">EMP005</td>
                  <td className="px-6 py-4 text-sm text-gray-800">Mostafa Hassan</td>
                  <td className="px-6 py-4 text-sm text-gray-800">expert</td>
                </tr>
              </tbody>
            </table>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="w-full mb-4" />
            <div className="flex justify-end space-x-3">
              <button onClick={closeUploadModal} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
              <button onClick={handleFileUpload} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Request Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Employee Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-500">Full Name</label><p>{selectedRequest.fullName}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500">Account Name</label><p>{selectedRequest.accountName}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500">Email</label><p>{selectedRequest.email}</p></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Position</label>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getPositionColor(selectedRequest.position)}`}>
                        {selectedRequest.position.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Request Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-500">Submitted</label><p>{formatDate(selectedRequest.createdAt)}</p></div>
                    {selectedRequest.approvedAt && (
                      <div><label className="block text-sm font-medium text-gray-500">Approved</label><p>{formatDate(selectedRequest.approvedAt)}</p></div>
                    )}
                    {selectedRequest.rejectedAt && (
                      <div><label className="block text-sm font-medium text-gray-500">Rejected</label><p>{formatDate(selectedRequest.rejectedAt)}</p></div>
                    )}
                  </div>
                </div>
                {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Rejection Reason</h4>
                    <p className="text-sm text-red-800">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
                {selectedRequest.status === 'approved' && selectedRequest.supervisorId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Supervisor</h4>
                    <p className="text-sm text-blue-800">
                      {supervisors.find(s => String(s._id) === String(selectedRequest.supervisorId?._id || selectedRequest.supervisorId))?.fullName || 'Unknown'}
                    </p>
                  </div>
                )}
                {selectedRequest.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => { setShowViewModal(false); openActionModal(selectedRequest, 'reject'); }}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X className="h-4 w-4 mr-2" /> Reject
                    </button>
                    <button
                      onClick={() => { setShowViewModal(false); openActionModal(selectedRequest, 'approve'); }}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" /> Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">{actionType === 'approve' ? 'Approve' : 'Reject'} Request</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedRequest.fullName}</p>
              <p className="text-sm text-gray-500">{selectedRequest.email}</p>
              <p className="text-sm text-gray-500">Position: {selectedRequest.position}</p>
            </div>
            {actionType === 'approve' && selectedRequest.position !== 'moderator' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Assign Supervisor *</label>
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select supervisor</option>
                  {supervisors.map((s) => (
                    <option key={s._id} value={s._id}>{s.fullName} (@{s.accountName})</option>
                  ))}
                </select>
              </div>
            )}
            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Reason..."
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowActionModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
              <button
                onClick={confirmAction}
                disabled={processingRequest === selectedRequest._id}
                className={`px-4 py-2 text-white rounded-lg ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {processingRequest === selectedRequest._id ? <Loader className="animate-spin h-4 w-4" /> : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;