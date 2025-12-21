import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";
import AppConstants from "../../config/constants";
import DragToggle from "../common/DragToggle";
import ConfirmModal from "../common/ConfirmModal";
import "./WorkOrderDetail.css";

const WorkOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumeToggle, setResumeToggle] = useState(false);
  const [completeToggle, setCompleteToggle] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back
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

            {/* Status Change Toggles - Only show if not completed */}
            {!isCompleted(workOrder.job_status) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-sliders me-2" style={{ color: AppConstants.primaryColor }}></i>
                    Status Actions
                  </h6>
                  
                  {/* Resume Toggle for Paused Work Orders */}
                  {isPaused(workOrder.job_status) && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-pause-circle me-2 text-warning"></i>
                        <strong>Resume Job</strong>
                      </div>
                      <small className="text-muted d-block mb-2">Slide to resume the paused work order</small>
                      <DragToggle
                        id="resumeToggle"
                        checked={resumeToggle}
                        onChange={handleResume}
                        variant="warning"
                      />
                    </div>
                  )}

                  {/* Complete Toggle for In Progress Work Orders */}
                  {isInProgress(workOrder.job_status) && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-check-circle me-2 text-success"></i>
                        <strong>Complete Job</strong>
                      </div>
                      <small className="text-muted d-block mb-2">Slide to complete. Work docket will be generated.</small>
                      <DragToggle
                        id="completeToggle"
                        checked={completeToggle}
                        onChange={handleComplete}
                        variant="success"
                      />
                    </div>
                  )}

                  {!isPaused(workOrder.job_status) && !isInProgress(workOrder.job_status) && (
                    <p className="text-muted mb-0 small">No status actions available for this work order.</p>
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
                  {workOrder.acceptance_status && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Acceptance Status</small>
                      <div>
                        <span className={`badge bg-${workOrder.acceptance_status === 'accepted' ? 'success' : workOrder.acceptance_status === 'rejected' ? 'danger' : 'warning'}`}>
                          {workOrder.acceptance_status.charAt(0).toUpperCase() + workOrder.acceptance_status.slice(1)}
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
                  {workOrder.acceptance_status && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Acceptance Status</small>
                      <div>
                        <span className={`badge bg-${workOrder.acceptance_status === 'accepted' ? 'success' : workOrder.acceptance_status === 'rejected' ? 'danger' : 'warning'}`}>
                          {workOrder.acceptance_status.charAt(0).toUpperCase() + workOrder.acceptance_status.slice(1)}
                        </span>
                      </div>
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

      <FooterTwo />
    </>
  );
};

export default WorkOrderDetail;
