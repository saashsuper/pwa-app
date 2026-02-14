import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";
import AppConstants from "../../config/constants";
import DragToggle from "../common/DragToggle";
import ConfirmModal from "../common/ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import "./WorkOrderDetail.css";

const WorkOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumeToggle, setResumeToggle] = useState(false);
  const [completeToggle, setCompleteToggle] = useState(false);
  const [startToggle, setStartToggle] = useState(false);
  const [pauseToggle, setPauseToggle] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessingAccept, setIsProcessingAccept] = useState(false);
  const [isProcessingReject, setIsProcessingReject] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkOrder();
    }
  }, [id]);

  const loadWorkOrder = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await workOrderService.getWorkOrderById(Number(id));
      setWorkOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to load work order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr.toString();
    }
  };

  const formatDateOnly = (dateStr?: string | null): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return dateStr.toString();
    }
  };

  const getPriorityColor = (priority: any): string => {
    if (!priority) return 'secondary';
    
    let priorityStr = '';
    if (typeof priority === 'string') {
      priorityStr = priority;
    } else if (typeof priority === 'object' && priority !== null) {
      priorityStr = priority.label || priority.priority || '';
    } else {
      priorityStr = String(priority);
    }

    if (!priorityStr) return 'secondary';

    const lowerPriority = priorityStr.toLowerCase();
    
    switch (lowerPriority) {
      case 'high':
      case 'urgent':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getPriorityLabel = (priority: any): string => {
    if (!priority) return 'N/A';
    
    if (typeof priority === 'string') {
      return priority;
    } else if (typeof priority === 'object' && priority !== null) {
      return priority.label || priority.priority || 'N/A';
    }
    
    return String(priority);
  };

  const getStatusColor = (status: any): string => {
    if (!status) return 'info';
    
    let statusStr = '';
    if (typeof status === 'string') {
      statusStr = status;
    } else if (typeof status === 'object' && status !== null) {
      statusStr = status.name || status.label || '';
    } else {
      statusStr = String(status);
    }

    if (!statusStr) return 'info';

    const lowerStatus = statusStr.toLowerCase();
    
    switch (lowerStatus) {
      case 'completed':
        return 'success';
      case 'in progress':
      case 'in_progress':
        return 'warning';
      case 'on hold':
      case 'on_hold':
      case 'paused':
        return 'warning';
      case 'pending':
      case 'scheduled':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: any): string => {
    if (!status) return 'N/A';
    
    let statusStr = '';
    if (typeof status === 'string') {
      statusStr = status;
    } else if (typeof status === 'object' && status !== null) {
      statusStr = status.name || status.label || 'N/A';
    } else {
      statusStr = String(status);
    }

    // Map "On Hold" to "Paused" for display
    if (statusStr.toLowerCase() === 'on hold' || statusStr.toLowerCase() === 'on_hold') {
      return 'Paused';
    }
    
    return statusStr;
  };

  const isPaused = (status: any): boolean => {
    if (status == null) return false;
    if (typeof status === 'object' && status !== null) {
      const name = (status.name || status.label || '').toLowerCase();
      return name === 'on hold' || name === 'on_hold' || name === 'paused';
    }
    if (typeof status === 'number') {
      return status === 5 || status === 6; // On Hold (ID varies by seed order)
    }
    const lowerStatus = String(status).toLowerCase();
    return lowerStatus === 'on hold' || lowerStatus === 'on_hold' || lowerStatus === 'paused';
  };

  const handleResume = async (checked: boolean) => {
    if (!id || !workOrder || !checked) {
      setResumeToggle(false);
      return;
    }
    
    try {
      setError("");
      setResumeToggle(true);
      const updated = await workOrderService.resume(Number(id));
      setWorkOrder(updated);
      setResumeToggle(false);
      setSuccessMessage("Work order resumed successfully!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to resume work order");
      setResumeToggle(false);
    }
  };

  const isInProgress = (status: any): boolean => {
    if (status == null) return false;
    if (typeof status === 'object' && status !== null) {
      const name = (status.name || status.label || '').toLowerCase();
      return name === 'in progress' || name === 'in_progress';
    }
    if (typeof status === 'number') {
      return status === 3; // In Progress
    }
    const lowerStatus = String(status).toLowerCase();
    return lowerStatus === 'in progress' || lowerStatus === 'in_progress';
  };

  const isCompleted = (status: any): boolean => {
    if (!status) return false;
    
    let statusStr = '';
    if (typeof status === 'string') {
      statusStr = status;
    } else if (typeof status === 'object' && status !== null) {
      statusStr = status.name || status.label || '';
    } else {
      statusStr = String(status);
    }

    const lowerStatus = statusStr.toLowerCase();
    return lowerStatus === 'completed';
  };

  const isScheduled = (status: any): boolean => {
    if (!status) return false;
    
    let statusValue = null;
    if (typeof status === 'number') {
      statusValue = status;
    } else if (typeof status === 'object' && status !== null) {
      statusValue = status.id || status.value;
    } else if (typeof status === 'string') {
      // If status is a string, check if it's "Scheduled" or status 1
      const lowerStatus = status.toLowerCase();
      return lowerStatus === 'scheduled';
    }

    // Status 1 = Scheduled
    return statusValue === 1;
  };

  const isAccepted = (status: any): boolean => {
    if (status == null) return false;
    
    if (typeof status === 'string') {
      return status.toLowerCase() === 'accepted';
    }
    if (typeof status === 'object' && status !== null) {
      const name = (status.name || status.label || '').toLowerCase();
      return name === 'accepted';
    }
    if (typeof status === 'number') {
      // Accepted status ID (can be 2 or 8 depending on seed order)
      return status === 2 || status === 8;
    }
    return String(status).toLowerCase() === 'accepted';
  };

  /** Any contractor or company member can accept/reject a job */
  const canAcceptOrReject = (): boolean => {
    const type = user?.user_type?.name;
    return type === 'Contractor Admin' || type === 'Contractor User';
  };

  const handleAccept = async () => {
    if (!id) return;
    
    try {
      setIsProcessingAccept(true);
      setError("");
      const updated = await workOrderService.accept(Number(id));
      setWorkOrder(updated);
      setSuccessMessage("Work order accepted successfully!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to accept work order");
    } finally {
      setIsProcessingAccept(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!id || !rejectionReason.trim()) {
      setError("Please provide a rejection reason (minimum 10 characters)");
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setError("Rejection reason must be at least 10 characters long");
      return;
    }

    try {
      setIsProcessingReject(true);
      setError("");
      const updated = await workOrderService.reject(Number(id), rejectionReason.trim());
      setWorkOrder(updated);
      setShowRejectModal(false);
      setRejectionReason("");
      setSuccessMessage("Work order rejected successfully!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to reject work order");
    } finally {
      setIsProcessingReject(false);
    }
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectionReason("");
    setError("");
  };

  const handleStart = async (checked: boolean) => {
    if (!id || !workOrder || !checked) {
      setStartToggle(false);
      return;
    }
    
    try {
      setError("");
      setStartToggle(true);
      const updated = await workOrderService.start(Number(id));
      setWorkOrder(updated);
      setStartToggle(false);
      setSuccessMessage("Work order started successfully!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to start work order");
      setStartToggle(false);
    }
  };

  const handlePause = async (checked: boolean) => {
    if (!id || !workOrder || !checked) {
      setPauseToggle(false);
      return;
    }
    
    try {
      setError("");
      setPauseToggle(true);
      const updated = await workOrderService.pause(Number(id));
      setWorkOrder(updated);
      setPauseToggle(false);
      setSuccessMessage("Work order paused successfully!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to pause work order");
      setPauseToggle(false);
    }
  };

  const handleComplete = async (checked: boolean) => {
    if (!id || !workOrder || !checked) {
      setCompleteToggle(false);
      return;
    }
    
    try {
      setError("");
      setCompleteToggle(true);
      const updated = await workOrderService.complete(Number(id));
      setWorkOrder(updated);
      setCompleteToggle(false);
      setSuccessMessage("Work order completed successfully! You can now download the work docket.");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to complete work order");
      setCompleteToggle(false);
    }
  };

  const handleDownloadWorkDocket = async () => {
    if (!id) return;
    
    try {
      setError("");
      await workOrderService.downloadWorkDocket(Number(id));
    } catch (err: any) {
      setError(err.message || "Failed to download work docket");
    }
  };

  if (loading) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading work order details...</p>
          </div>
        </div>
        <FooterTwo />
      </>
    );
  }

  if (error || !workOrder) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper">
          <div className="container">
            <div className="pt-3">
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error || "Work order not found"}
              </div>
              <Link to="/work-orders" className="btn btn-primary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Work Orders
              </Link>
            </div>
          </div>
        </div>
        <FooterTwo />
      </>
    );
  }

  return (
    <>
      <HeaderTwo />
      <div className="page-content-wrapper">
        <div className="container">
          <div className="pt-3">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary mb-2"
                  onClick={() => navigate('/work-orders')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to list
                </button>
                <h4 className="mb-1">Work Order Details</h4>
                <p className="mb-0 text-muted small">{workOrder.ref_no || `WO-${workOrder.id}`}</p>
              </div>
              {workOrder.job_status && (
                <span className={`badge bg-${getStatusColor(workOrder.job_status)}`} style={{ fontSize: '14px' }}>
                  {getStatusLabel(workOrder.job_status)}
                </span>
              )}
            </div>

            {/* Completed Status Banner */}
            {isCompleted(workOrder.job_status) && (
              <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                <i className="bi bi-check-circle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                <div className="flex-grow-1">
                  <strong>Work Order Completed</strong>
                  <p className="mb-0 small">This work order has been completed and cannot be edited.</p>
                </div>
                {workOrder.pdf_path && workOrder.pdf_name && (
                  <button
                    className="btn btn-success"
                    onClick={handleDownloadWorkDocket}
                  >
                    <i className="bi bi-download me-2"></i>
                    Download Work Docket
                  </button>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="row g-3 mb-3">
              <div className="col-6">
                <Link to={`/work-order/${id}/photos`} className="text-decoration-none">
                  <div className="card shadow-sm" style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}>
                    <div className="card-body text-center">
                      <i className="bi bi-images mb-2" style={{ fontSize: '24px', color: AppConstants.primaryColor }}></i>
                      <h6 className="mb-0 small">Photos</h6>
                      {workOrder.images && workOrder.images.length > 0 && (
                        <small className="text-muted">{workOrder.images.length} photo(s)</small>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-6">
                <Link to={`/work-order/${id}/notes`} className="text-decoration-none">
                  <div className="card shadow-sm" style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}>
                    <div className="card-body text-center">
                      <i className="bi bi-journal-text mb-2" style={{ fontSize: '24px', color: '#17a2b8' }}></i>
                      <h6 className="mb-0 small">Notes</h6>
                      {workOrder.notes && workOrder.notes.length > 0 && (
                        <small className="text-muted">{workOrder.notes.length} note(s)</small>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-6">
                <Link to={`/work-order/${id}/team`} className="text-decoration-none">
                  <div className="card shadow-sm" style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}>
                    <div className="card-body text-center">
                      <i className="bi bi-people mb-2" style={{ fontSize: '24px', color: '#20c997' }}></i>
                      <h6 className="mb-0 small">Team</h6>
                    </div>
                  </div>
                </Link>
              </div>
              {workOrder.block_issue && (
                <div className="col-6">
                  <Link to={`/issue/${workOrder.block_issue.id}`} className="text-decoration-none">
                    <div className="card shadow-sm" style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}>
                      <div className="card-body text-center">
                        <i className="bi bi-exclamation-triangle mb-2" style={{ fontSize: '24px', color: '#dc3545' }}></i>
                        <h6 className="mb-0 small">Related Issue</h6>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Accept/Reject Actions - Any contractor or company member on Scheduled Work Orders (status = 1) */}
            {canAcceptOrReject() && isScheduled(workOrder.job_status) && (
              <div className="card mb-3 border-warning">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-check-circle me-2" style={{ color: '#28a745' }}></i>
                    Work Order Acceptance
                  </h6>
                  <p className="text-muted small mb-3">This work order is scheduled and awaiting your acceptance or rejection.</p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success flex-fill"
                      onClick={handleAccept}
                      disabled={isProcessingAccept}
                    >
                      {isProcessingAccept ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Accept Work Order
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-danger flex-fill"
                      onClick={() => setShowRejectModal(true)}
                      disabled={isProcessingReject}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Reject Work Order
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Status Change Toggles - Only team members can change status after acceptance */}
            {!isCompleted(workOrder.job_status ?? workOrder.status) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-sliders me-2" style={{ color: AppConstants.primaryColor }}></i>
                    Status Actions
                  </h6>
                  {(() => {
                    const canChangeStatus = workOrder.is_team_member === true;
                    const isAcceptedOrLater = isAccepted(workOrder.job_status ?? workOrder.status) || isPaused(workOrder.job_status ?? workOrder.status) || isInProgress(workOrder.job_status ?? workOrder.status);
                    if (isAcceptedOrLater && !canChangeStatus) {
                      return (
                        <p className="text-muted mb-0 small">
                          Only team members can change work order status after it has been accepted.
                        </p>
                      );
                    }
                    if (!isAcceptedOrLater) {
                      return (
                        <p className="text-muted mb-0 small">No status actions available for this work order.</p>
                      );
                    }
                    return null;
                  })()}
                  {workOrder.is_team_member === true && (isAccepted(workOrder.job_status ?? workOrder.status) || isPaused(workOrder.job_status ?? workOrder.status) || isInProgress(workOrder.job_status ?? workOrder.status)) && (
                  <>
                  {/* Start Toggle for Accepted Work Orders */}
                  {isAccepted(workOrder.job_status ?? workOrder.status) && (
                    <div className="mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <div className="status-action-icon-wrapper me-2" style={{ 
                          backgroundColor: '#e7f1ff', 
                          borderRadius: '50%', 
                          width: '32px', 
                          height: '32px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <i className="bi bi-play-circle-fill" style={{ color: '#0d6efd', fontSize: '18px' }}></i>
                        </div>
                        <div>
                          <strong style={{ fontSize: '16px' }}>Start Job</strong>
                          <small className="text-muted d-block" style={{ fontSize: '12px' }}>Slide to start the work order</small>
                        </div>
                      </div>
                      <DragToggle
                        id="startToggle"
                        checked={startToggle}
                        onChange={handleStart}
                        variant="primary"
                        height="3rem"
                      />
                    </div>
                  )}

                  {/* Resume Toggle for Paused Work Orders */}
                  {isPaused(workOrder.job_status ?? workOrder.status) && (
                    <div className="mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <div className="status-action-icon-wrapper me-2" style={{ 
                          backgroundColor: '#cffafe', 
                          borderRadius: '50%', 
                          width: '32px', 
                          height: '32px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <i className="bi bi-play-circle-fill" style={{ color: '#06b6d4', fontSize: '18px' }}></i>
                        </div>
                        <div>
                          <strong style={{ fontSize: '16px' }}>Resume Job</strong>
                          <small className="text-muted d-block" style={{ fontSize: '12px' }}>Slide to resume the paused work order</small>
                        </div>
                      </div>
                      <DragToggle
                        id="resumeToggle"
                        checked={resumeToggle}
                        onChange={handleResume}
                        variant="info"
                        height="3rem"
                      />
                    </div>
                  )}

                  {/* Pause Toggle for In Progress Work Orders */}
                  {isInProgress(workOrder.job_status ?? workOrder.status) && (
                    <>
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <div className="status-action-icon-wrapper me-2" style={{ 
                            backgroundColor: '#fff3e0', 
                            borderRadius: '50%', 
                            width: '32px', 
                            height: '32px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <i className="bi bi-pause-circle-fill" style={{ color: '#ff9800', fontSize: '18px' }}></i>
                          </div>
                          <div>
                            <strong style={{ fontSize: '16px' }}>Pause Job</strong>
                            <small className="text-muted d-block" style={{ fontSize: '12px' }}>Slide to pause the work order</small>
                          </div>
                        </div>
                        <DragToggle
                          id="pauseToggle"
                          checked={pauseToggle}
                          onChange={handlePause}
                          variant="warning"
                          height="3rem"
                        />
                      </div>

                      {/* Complete Toggle for In Progress Work Orders */}
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <div className="status-action-icon-wrapper me-2" style={{ 
                            backgroundColor: '#d1fae5', 
                            borderRadius: '50%', 
                            width: '32px', 
                            height: '32px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <i className="bi bi-check-circle-fill" style={{ color: '#10b981', fontSize: '18px' }}></i>
                          </div>
                          <div>
                            <strong style={{ fontSize: '16px' }}>Complete Job</strong>
                            <small className="text-muted d-block" style={{ fontSize: '12px' }}>Slide to complete. Work docket will be generated.</small>
                          </div>
                        </div>
                        <DragToggle
                          id="completeToggle"
                          checked={completeToggle}
                          onChange={handleComplete}
                          variant="success"
                          height="3rem"
                        />
                      </div>
                    </>
                  )}

                  {!isAccepted(workOrder.job_status ?? workOrder.status) && !isPaused(workOrder.job_status ?? workOrder.status) && !isInProgress(workOrder.job_status ?? workOrder.status) && (
                    <p className="text-muted mb-0 small">No status actions available for this work order.</p>
                  )}
                  </>
                  )}
                </div>
              </div>
            )}

            {/* Work Order Information */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-clipboard-check me-2" style={{ color: AppConstants.primaryColor }}></i>
                  Work Order Information
                </h6>
                <div className="row g-3">
                  <div className="col-12">
                    <small className="text-muted d-block mb-1">Work Description</small>
                    <div className="fw-bold">{workOrder.work || 'No description provided'}</div>
                  </div>
                  {workOrder.ref_no && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Reference Number</small>
                      <div className="fw-bold">{workOrder.ref_no}</div>
                    </div>
                  )}
                  {workOrder.job_status && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Status</small>
                      <div>
                        <span className={`badge bg-${getStatusColor(workOrder.job_status)}`}>
                          {getStatusLabel(workOrder.job_status) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                  {workOrder.priority && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Priority</small>
                      <div>
                        <span className={`badge bg-${getPriorityColor(workOrder.priority)}`}>
                          {getPriorityLabel(workOrder.priority) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                  {workOrder.created_at && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Created At</small>
                      <div className="fw-bold">{formatDate(workOrder.created_at)}</div>
                    </div>
                  )}
                  {workOrder.updated_at && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Last Updated</small>
                      <div className="fw-bold">{formatDate(workOrder.updated_at)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            {(workOrder.block || workOrder.block_unit || workOrder.block_building) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-geo-alt me-2" style={{ color: '#28a745' }}></i>
                    Location Information
                  </h6>
                  <div className="row g-3">
                    {workOrder.block && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Block</small>
                        <div className="fw-bold">{workOrder.block.name || workOrder.block.block_name || `Block #${workOrder.block.id}`}</div>
                        {workOrder.block.address1 && (
                          <small className="text-muted">{workOrder.block.address1}</small>
                        )}
                      </div>
                    )}
                    {workOrder.block_building && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Building</small>
                        <div className="fw-bold">{workOrder.block_building.name || `Building #${workOrder.block_building.id}`}</div>
                      </div>
                    )}
                    {workOrder.block_unit && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Unit</small>
                        <div className="fw-bold">
                          {workOrder.block_unit.unit_no || workOrder.block_unit.unit_name || workOrder.block_unit.unit_code || `Unit #${workOrder.block_unit.id}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dates & Deadlines */}
            {(workOrder.preferred_start_date_time || workOrder.preferred_end_date_time || workOrder.deadline_date) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-clock me-2" style={{ color: '#ffc107' }}></i>
                    Dates & Deadlines
                  </h6>
                  <div className="row g-3">
                    {workOrder.preferred_start_date_time && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Preferred Start</small>
                        <div className="fw-bold">{formatDate(workOrder.preferred_start_date_time)}</div>
                      </div>
                    )}
                    {workOrder.preferred_end_date_time && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Preferred End</small>
                        <div className="fw-bold">{formatDate(workOrder.preferred_end_date_time)}</div>
                      </div>
                    )}
                    {workOrder.deadline_date && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Deadline</small>
                        <div className="fw-bold">{formatDateOnly(workOrder.deadline_date)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contractor Information */}
            {workOrder.contractor && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-person-badge me-2" style={{ color: '#6f42c1' }}></i>
                    Contractor Information
                  </h6>
                  <div className="row g-3">
                    {workOrder.contractor.name && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Contractor Name</small>
                        <div className="fw-bold">{workOrder.contractor.name}</div>
                      </div>
                    )}
                    {workOrder.contractor.email && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Email</small>
                        <div className="fw-bold">
                          <a href={`mailto:${workOrder.contractor.email}`} className="text-decoration-none">
                            {workOrder.contractor.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {workOrder.comment && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-file-text me-2" style={{ color: '#6f42c1' }}></i>
                    Additional Comments
                  </h6>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{workOrder.comment}</div>
                </div>
              </div>
            )}

            {/* Issue Details (if related to an issue) */}
            {workOrder.block_issue && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-exclamation-triangle me-2" style={{ color: '#dc3545' }}></i>
                    Related Issue Details
                  </h6>
                  <div className="row g-3">
                    {workOrder.block_issue.id && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Issue ID</small>
                        <div className="fw-bold">#{workOrder.block_issue.id}</div>
                      </div>
                    )}
                    {workOrder.block_issue.title && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Issue Title</small>
                        <div className="fw-bold">{workOrder.block_issue.title}</div>
                      </div>
                    )}
                    {workOrder.block_issue.issue && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Issue Description</small>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{workOrder.block_issue.issue}</div>
                      </div>
                    )}
                    {workOrder.block_issue.description && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Additional Details</small>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{workOrder.block_issue.description}</div>
                      </div>
                    )}
                    <div className="col-12">
                      <Link 
                        to={`/issue/${workOrder.block_issue.id}`} 
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-arrow-right me-2"></i>
                        View Full Issue Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Work Order Metadata */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-info-circle me-2" style={{ color: '#17a2b8' }}></i>
                  Metadata
                </h6>
                <div className="row g-3">
                  {workOrder.creator && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Created By</small>
                      <div className="fw-bold">{workOrder.creator.name || workOrder.creator.email || 'N/A'}</div>
                    </div>
                  )}
                  {workOrder.updater && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Last Updated By</small>
                      <div className="fw-bold">{workOrder.updater.name || workOrder.updater.email || 'N/A'}</div>
                    </div>
                  )}
                  {workOrder.issuedBy && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Issued By</small>
                      <div className="fw-bold">{workOrder.issuedBy.name || workOrder.issuedBy.email || 'N/A'}</div>
                    </div>
                  )}
                  {workOrder.note_for_access && (
                    <div className="col-12">
                      <small className="text-muted d-block mb-1">Note for Access</small>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{workOrder.note_for_access}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Work Order Files/Attachments Info */}
            {workOrder.images && workOrder.images.length > 0 && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-paperclip me-2" style={{ color: '#6f42c1' }}></i>
                    Files & Attachments
                  </h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Photos</small>
                      <div className="fw-bold">
                        {workOrder.images.length} photo{workOrder.images.length !== 1 ? 's' : ''}
                      </div>
                      <Link to={`/work-order/${id}/photos`} className="btn btn-sm btn-outline-primary mt-2">
                        View Photos
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pb-3"></div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ConfirmModal
        show={showSuccessModal}
        title="Success"
        message={successMessage}
        confirmText="OK"
        cancelText=""
        confirmButtonVariant="success"
        onConfirm={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
      />

      {/* Reject Work Order Modal */}
      {showRejectModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isProcessingReject) {
              handleRejectCancel();
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Reject Work Order
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleRejectCancel}
                  aria-label="Close"
                  disabled={isProcessingReject}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">Please provide a reason for rejecting this work order (minimum 10 characters):</p>
                <textarea
                  className="form-control"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  disabled={isProcessingReject}
                  minLength={10}
                />
                {error && (
                  <div className="alert alert-danger mt-2 mb-0 small">
                    {error}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleRejectCancel}
                  disabled={isProcessingReject}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleRejectConfirm}
                  disabled={isProcessingReject || rejectionReason.trim().length < 10}
                >
                  {isProcessingReject ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle me-2"></i>
                      Reject Work Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FooterTwo />
    </>
  );
};

export default WorkOrderDetail;
