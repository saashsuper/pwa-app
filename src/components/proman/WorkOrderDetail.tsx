import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";
import AppConstants from "../../config/constants";

const WorkOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingJob, setStartingJob] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [pausingJob, setPausingJob] = useState(false);
  const [resumingJob, setResumingJob] = useState(false);
  const [completingJob, setCompletingJob] = useState(false);
  const [completeSlideOffset, setCompleteSlideOffset] = useState(0);
  const [isDraggingComplete, setIsDraggingComplete] = useState(false);
  const completeSliderRef = useRef<HTMLDivElement>(null);
  
  // Modal states
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkOrder();
    }
  }, [id]);

  const loadWorkOrder = async () => {
    setLoading(true);
    setError("");
    setSlideOffset(0); // Reset slider when loading new work order
    setCompleteSlideOffset(0); // Reset complete slider
    
    try {
      const data = await workOrderService.getWorkOrderById(Number(id));
      setWorkOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to load work order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = useCallback(async () => {
    if (!workOrder || !id || startingJob) return;

    setStartingJob(true);
    setError("");
    
    try {
      const updatedWorkOrder = await workOrderService.startWorkOrder(Number(id));
      setWorkOrder(updatedWorkOrder);
      // Slider will automatically disappear as status is no longer scheduled/pending
    } catch (err: any) {
      setError(err.message || "Failed to start work order");
      setStartingJob(false);
      // Reset slider on error
      setSlideOffset(0);
    }
  }, [workOrder, id, startingJob]);

  const handlePauseJob = useCallback(async () => {
    if (!workOrder || !id || pausingJob) return;

    setPausingJob(true);
    setError("");
    
    try {
      const updatedWorkOrder = await workOrderService.pauseWorkOrder(Number(id));
      setWorkOrder(updatedWorkOrder);
    } catch (err: any) {
      setError(err.message || "Failed to pause work order");
    } finally {
      setPausingJob(false);
    }
  }, [workOrder, id, pausingJob]);

  const handleResumeJob = useCallback(async () => {
    if (!workOrder || !id || resumingJob) return;

    setResumingJob(true);
    setError("");
    
    try {
      const updatedWorkOrder = await workOrderService.resumeWorkOrder(Number(id));
      setWorkOrder(updatedWorkOrder);
    } catch (err: any) {
      setError(err.message || "Failed to resume work order");
    } finally {
      setResumingJob(false);
    }
  }, [workOrder, id, resumingJob]);

  const handleCompleteJob = useCallback(async () => {
    if (!workOrder || !id || completingJob) return;

    setCompletingJob(true);
    setError("");
    
    try {
      const updatedWorkOrder = await workOrderService.completeWorkOrder(Number(id));
      setWorkOrder(updatedWorkOrder);
    } catch (err: any) {
      setError(err.message || "Failed to complete work order");
      setCompletingJob(false);
      setCompleteSlideOffset(0);
    }
  }, [workOrder, id, completingJob]);

  const handleDrag = useCallback((clientX: number) => {
    if (startingJob || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const buttonWidth = 50;
    const padding = 5;
    const maxOffset = rect.width - buttonWidth - (padding * 2);
    const newOffset = Math.max(0, Math.min(clientX - rect.left - buttonWidth / 2 - padding, maxOffset));
    setSlideOffset(newOffset);
  }, [startingJob]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (startingJob) return;
    e.preventDefault();
    setIsDragging(true);
    handleDrag(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || startingJob) return;
    e.preventDefault();
    handleDrag(e.clientX);
  }, [isDragging, startingJob, handleDrag]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || startingJob) return;
    setIsDragging(false);
    
    if (sliderRef.current) {
      const sliderWidth = sliderRef.current.offsetWidth;
      const maxOffset = sliderWidth - 60;
      if (slideOffset >= maxOffset * 0.85) {
        handleStartJob();
      } else {
        setSlideOffset(0);
      }
    }
  }, [isDragging, startingJob, slideOffset, handleStartJob]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (startingJob) return;
    e.preventDefault();
    setIsDragging(true);
    handleTouchDrag(e.touches[0].clientX);
  };

  const handleTouchDrag = useCallback((clientX: number) => {
    if (startingJob || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const buttonWidth = 50;
    const padding = 5;
    const maxOffset = rect.width - buttonWidth - (padding * 2);
    const newOffset = Math.max(0, Math.min(clientX - rect.left - buttonWidth / 2 - padding, maxOffset));
    setSlideOffset(newOffset);
  }, [startingJob]);

  const handleTouchMoveMemo = useCallback((e: TouchEvent) => {
    if (!isDragging || startingJob) return;
    e.preventDefault();
    handleTouchDrag(e.touches[0].clientX);
  }, [isDragging, startingJob, handleTouchDrag]);

  const handleTouchEndMemo = useCallback(() => {
    if (!isDragging || startingJob) return;
    setIsDragging(false);
    
    if (sliderRef.current) {
      const sliderWidth = sliderRef.current.offsetWidth;
      const maxOffset = sliderWidth - 60;
      if (slideOffset >= maxOffset * 0.85) {
        handleStartJob();
      } else {
        setSlideOffset(0);
      }
    }
  }, [isDragging, startingJob, slideOffset, handleStartJob]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMoveMemo, { passive: false });
      window.addEventListener('touchend', handleTouchEndMemo);
      return () => {
        window.removeEventListener('touchmove', handleTouchMoveMemo);
        window.removeEventListener('touchend', handleTouchEndMemo);
      };
    }
  }, [isDragging, handleTouchMoveMemo, handleTouchEndMemo]);

  // Complete Job Slider Handlers
  const handleCompleteDrag = useCallback((clientX: number) => {
    if (completingJob || !completeSliderRef.current) return;
    
    const rect = completeSliderRef.current.getBoundingClientRect();
    const buttonWidth = 50;
    const padding = 5;
    const maxOffset = rect.width - buttonWidth - (padding * 2);
    const newOffset = Math.max(0, Math.min(clientX - rect.left - buttonWidth / 2 - padding, maxOffset));
    setCompleteSlideOffset(newOffset);
  }, [completingJob]);

  const handleCompleteMouseDown = (e: React.MouseEvent) => {
    if (completingJob) return;
    e.preventDefault();
    setIsDraggingComplete(true);
    handleCompleteDrag(e.clientX);
  };

  const handleCompleteMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingComplete || completingJob) return;
    e.preventDefault();
    handleCompleteDrag(e.clientX);
  }, [isDraggingComplete, completingJob, handleCompleteDrag]);

  const handleCompleteMouseUp = useCallback(() => {
    if (!isDraggingComplete || completingJob) return;
    setIsDraggingComplete(false);
    
    if (completeSliderRef.current) {
      const sliderWidth = completeSliderRef.current.offsetWidth;
      const maxOffset = sliderWidth - 60;
      if (completeSlideOffset >= maxOffset * 0.85) {
        handleCompleteJob();
      } else {
        setCompleteSlideOffset(0);
      }
    }
  }, [isDraggingComplete, completingJob, completeSlideOffset, handleCompleteJob]);

  useEffect(() => {
    if (isDraggingComplete) {
      window.addEventListener('mousemove', handleCompleteMouseMove);
      window.addEventListener('mouseup', handleCompleteMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCompleteMouseMove);
        window.removeEventListener('mouseup', handleCompleteMouseUp);
      };
    }
  }, [isDraggingComplete, handleCompleteMouseMove, handleCompleteMouseUp]);

  // Touch events for complete slider
  const handleCompleteTouchStart = (e: React.TouchEvent) => {
    if (completingJob) return;
    e.preventDefault();
    setIsDraggingComplete(true);
    handleCompleteDrag(e.touches[0].clientX);
  };

  const handleCompleteTouchDrag = useCallback((clientX: number) => {
    if (completingJob || !completeSliderRef.current) return;
    
    const rect = completeSliderRef.current.getBoundingClientRect();
    const buttonWidth = 50;
    const padding = 5;
    const maxOffset = rect.width - buttonWidth - (padding * 2);
    const newOffset = Math.max(0, Math.min(clientX - rect.left - buttonWidth / 2 - padding, maxOffset));
    setCompleteSlideOffset(newOffset);
  }, [completingJob]);

  const handleCompleteTouchMoveMemo = useCallback((e: TouchEvent) => {
    if (!isDraggingComplete || completingJob) return;
    e.preventDefault();
    handleCompleteTouchDrag(e.touches[0].clientX);
  }, [isDraggingComplete, completingJob, handleCompleteTouchDrag]);

  const handleCompleteTouchEndMemo = useCallback(() => {
    if (!isDraggingComplete || completingJob) return;
    setIsDraggingComplete(false);
    
    if (completeSliderRef.current) {
      const sliderWidth = completeSliderRef.current.offsetWidth;
      const maxOffset = sliderWidth - 60;
      if (completeSlideOffset >= maxOffset * 0.85) {
        handleCompleteJob();
      } else {
        setCompleteSlideOffset(0);
      }
    }
  }, [isDraggingComplete, completingJob, completeSlideOffset, handleCompleteJob]);

  useEffect(() => {
    if (isDraggingComplete) {
      window.addEventListener('touchmove', handleCompleteTouchMoveMemo, { passive: false });
      window.addEventListener('touchend', handleCompleteTouchEndMemo);
      return () => {
        window.removeEventListener('touchmove', handleCompleteTouchMoveMemo);
        window.removeEventListener('touchend', handleCompleteTouchEndMemo);
      };
    }
  }, [isDraggingComplete, handleCompleteTouchMoveMemo, handleCompleteTouchEndMemo]);

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

  const getStatusLabel = (status: any): string => {
    if (!status) return '';
    if (typeof status === 'string') return status;
    if (typeof status === 'object' && status !== null) {
      return status.name || status.label || status.value || '';
    }
    return String(status);
  };

  const getStatusColor = (status: any): string => {
    if (!status) return 'info';
    
    let statusStr = '';
    if (typeof status === 'string') {
      statusStr = status;
    } else if (typeof status === 'object' && status !== null) {
      statusStr = status.btn_class || status.name || status.label || '';
    } else {
      statusStr = String(status);
    }

    if (!statusStr) return 'info';

    const lowerStatus = statusStr.toLowerCase();
    
    // If btn_class is provided, use it (remove 'bg-' prefix if present)
    if (typeof status === 'object' && status !== null && status.btn_class) {
      return status.btn_class.replace('bg-', '');
    }
    
    switch (lowerStatus) {
      case 'completed':
        return 'success';
      case 'in progress':
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const getPriorityLabel = (priority: any): string => {
    if (!priority) return '';
    if (typeof priority === 'string') return priority;
    if (typeof priority === 'object' && priority !== null) {
      return priority.label || priority.priority || priority.value || '';
    }
    return String(priority);
  };

  const getPriorityColor = (priority: any): string => {
    if (!priority) return 'secondary';
    
    let priorityStr = '';
    if (typeof priority === 'string') {
      priorityStr = priority;
    } else if (typeof priority === 'object' && priority !== null) {
      priorityStr = priority.btn_class || priority.label || priority.priority || '';
    } else {
      priorityStr = String(priority);
    }

    if (!priorityStr) return 'secondary';

    const lowerPriority = priorityStr.toLowerCase();
    
    // If btn_class is provided, use it (remove 'bg-' prefix if present)
    if (typeof priority === 'object' && priority !== null && priority.btn_class) {
      return priority.btn_class.replace('bg-', '');
    }
    
    switch (lowerPriority) {
      case 'high':
      case 'urgent':
      case 'critical':
        return 'danger';
      case 'medium':
      case 'normal':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const isScheduledOrPending = (): boolean => {
    if (!workOrder) return false;
    
    const statusLabel = getStatusLabel(workOrder.job_status || workOrder.status);
    const statusLower = statusLabel.toLowerCase();
    
    // Check if status is "Scheduled", "Pending", or similar states where job can be started
    return statusLower === 'scheduled' || 
           statusLower === 'pending' || 
           statusLower === 'created' ||
           (workOrder.job_status && workOrder.job_status.name && 
            workOrder.job_status.name.toLowerCase() === 'scheduled');
  };

  const isInProgress = (): boolean => {
    if (!workOrder) return false;
    
    const statusLabel = getStatusLabel(workOrder.job_status || workOrder.status);
    const statusLower = statusLabel.toLowerCase();
    
    return statusLower === 'in progress' || 
           statusLower === 'in_progress' ||
           (workOrder.job_status && workOrder.job_status.name && 
            workOrder.job_status.name.toLowerCase() === 'in progress');
  };

  const isPaused = (): boolean => {
    if (!workOrder) return false;
    
    const statusLabel = getStatusLabel(workOrder.job_status || workOrder.status);
    const statusLower = statusLabel.toLowerCase();
    
    return statusLower === 'on hold' || 
           statusLower === 'on_hold' ||
           (workOrder.job_status && workOrder.job_status.name && 
            workOrder.job_status.name.toLowerCase() === 'on hold');
  };

  const hasJobStarted = (): boolean => {
    if (!workOrder) return false;
    
    const statusLabel = getStatusLabel(workOrder.job_status || workOrder.status);
    const statusLower = statusLabel.toLowerCase();
    
    // Job has started if it's not in scheduled/pending/created state
    // And not completed or cancelled
    const notStartedStatuses = ['scheduled', 'pending', 'created'];
    const finalStatuses = ['completed', 'cancelled'];
    
    return !notStartedStatuses.includes(statusLower) && 
           !finalStatuses.includes(statusLower) &&
           statusLower !== '';
  };

  const canShowCompleteJob = (): boolean => {
    if (!workOrder) return false;
    
    const statusLabel = getStatusLabel(workOrder.job_status || workOrder.status);
    const statusLower = statusLabel.toLowerCase();
    
    // Can complete if job has started and not already completed/cancelled
    const finalStatuses = ['completed', 'cancelled'];
    return hasJobStarted() && !finalStatuses.includes(statusLower);
  };


  const handleAddNotes = async () => {
    if (!notes.trim() || !id || savingNotes) return;

    setSavingNotes(true);
    setError("");
    
    try {
      // TODO: Implement notes save API call
      console.log('Saving notes:', notes);
      setShowNotesModal(false);
      setNotes("");
      // After successful save, reload work order to show new notes
      await loadWorkOrder();
    } catch (err: any) {
      setError(err.message || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const openNotesModal = () => {
    // Pre-fill with existing notes if any
    setNotes(workOrder?.notes || "");
    setShowNotesModal(true);
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
                <Link to="/work-orders" className="btn btn-sm btn-outline-secondary mb-2">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Work Orders
                </Link>
                <h4 className="mb-1">Work Order Details</h4>
                <p className="mb-0 text-muted small">WO-{workOrder.id}</p>
              </div>
              {workOrder.job_status && (
                <span className={`badge bg-${getStatusColor(workOrder.job_status.name)}`} style={{ fontSize: '14px' }}>
                  {workOrder.job_status.name}
                </span>
              )}
            </div>

            {/* Work Order Information */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-clipboard-data me-2" style={{ color: AppConstants.primaryColor }}></i>
                  Work Order Information
                </h6>
                <div className="row g-3">
                  <div className="col-12">
                    <small className="text-muted d-block mb-1">Description/Work</small>
                    <div className="fw-bold">{workOrder.work || workOrder.issue || 'No description provided'}</div>
                  </div>
                  {workOrder.ref_no && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Reference Number</small>
                      <div className="fw-bold">{workOrder.ref_no}</div>
                    </div>
                  )}
                  {workOrder.status && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Status</small>
                      <div>
                        <span className={`badge bg-${getStatusColor(workOrder.job_status || workOrder.status)}`}>
                          {getStatusLabel(workOrder.job_status || workOrder.status) || 'N/A'}
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
                  {workOrder.issued_date_time && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Issued Date & Time</small>
                      <div className="fw-bold">{formatDate(workOrder.issued_date_time)}</div>
                    </div>
                  )}
                  {workOrder.deadline_date && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Deadline</small>
                      <div className="fw-bold">{formatDateOnly(workOrder.deadline_date)}</div>
                    </div>
                  )}
                </div>
                
                {/* Start Job iPhone-Style Slider - Show only for scheduled/pending work orders */}
                {isScheduledOrPending() && (
                  <div className="mt-4 pt-3 border-top">
                    <div
                      ref={sliderRef}
                      id="startJobSlider"
                      className="position-relative mx-auto"
                      style={{
                        width: '100%',
                        maxWidth: '320px',
                        height: '60px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '30px',
                        overflow: 'hidden',
                        cursor: startingJob ? 'not-allowed' : 'default',
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.05)',
                        border: '1px solid #d0d0d0'
                      }}
                    >
                      {/* Slider Track Text */}
                      <div
                        className="position-absolute d-flex align-items-center justify-content-center h-100 w-100"
                        style={{
                          pointerEvents: 'none',
                          fontSize: '17px',
                          fontWeight: '600',
                          letterSpacing: '0.5px',
                          color: startingJob ? '#fff' : '#888',
                          transition: 'color 0.3s ease',
                          zIndex: 1,
                          userSelect: 'none'
                        }}
                      >
                        {startingJob ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                            Starting job...
                          </>
                        ) : (
                          'Slide to start the job'
                        )}
                      </div>

                      {/* Progress Background */}
                      <div
                        className="position-absolute"
                        style={{
                          left: 0,
                          top: 0,
                          width: `${slideOffset + 50}px`,
                          height: '100%',
                          background: `linear-gradient(135deg, ${AppConstants.primaryColor} 0%, ${AppConstants.primaryColor}dd 100%)`,
                          borderRadius: '30px',
                          transition: isDragging ? 'none' : 'width 0.2s ease',
                          zIndex: 0
                        }}
                      />

                      {/* Draggable Button */}
                      <div
                        className="position-absolute d-flex align-items-center justify-content-center"
                        style={{
                          left: `${slideOffset}px`,
                          top: '5px',
                          width: '50px',
                          height: '50px',
                          backgroundColor: startingJob ? '#28a745' : '#fff',
                          borderRadius: '50%',
                          boxShadow: startingJob 
                            ? '0 2px 8px rgba(40, 167, 69, 0.3)' 
                            : '0 3px 10px rgba(0,0,0,0.2), 0 4px 14px rgba(0,0,0,0.15)',
                          cursor: startingJob ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
                          transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          zIndex: 3,
                          userSelect: 'none',
                          touchAction: 'none',
                          border: startingJob ? 'none' : '2px solid #f0f0f0'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (!startingJob) handleMouseDown(e);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (!startingJob) handleTouchStart(e);
                        }}
                      >
                        {startingJob ? (
                          <span className="spinner-border spinner-border-sm text-white" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                        ) : (
                          <i className="bi bi-arrow-right" style={{ fontSize: '22px', color: AppConstants.primaryColor, fontWeight: 'bold' }}></i>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Actions - Show based on status */}
                {(isInProgress() || isPaused() || canShowCompleteJob()) && (
                  <div className="mt-4 pt-3 border-top">
                    {/* Resume Job Button - Show when paused */}
                    {isPaused() && (
                      <div className="mb-3">
                        <button
                          className="btn btn-success w-100"
                          onClick={handleResumeJob}
                          disabled={resumingJob}
                          style={{
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
                          }}
                        >
                          {resumingJob ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Resuming...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-play-circle me-2"></i>
                              Resume Job
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Pause Job Button - Show only when in progress */}
                    {isInProgress() && (
                      <div className="mb-3">
                        <button
                          className="btn btn-warning w-100"
                          onClick={handlePauseJob}
                          disabled={pausingJob}
                          style={{
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)'
                          }}
                        >
                          {pausingJob ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Pausing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-pause-circle me-2"></i>
                              Pause Job
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Complete Job iPhone-Style Slider - Show for all started jobs */}
                    {canShowCompleteJob() && (
                    <div
                      ref={completeSliderRef}
                      id="completeJobSlider"
                      className="position-relative mx-auto"
                      style={{
                        width: '100%',
                        maxWidth: '320px',
                        height: '60px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '30px',
                        overflow: 'hidden',
                        cursor: completingJob ? 'not-allowed' : 'default',
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.05)',
                        border: '1px solid #d0d0d0'
                      }}
                    >
                      {/* Slider Track Text */}
                      <div
                        className="position-absolute d-flex align-items-center justify-content-center h-100 w-100"
                        style={{
                          pointerEvents: 'none',
                          fontSize: '17px',
                          fontWeight: '600',
                          letterSpacing: '0.5px',
                          color: completingJob ? '#fff' : '#888',
                          transition: 'color 0.3s ease',
                          zIndex: 1,
                          userSelect: 'none'
                        }}
                      >
                        {completingJob ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                            Completing job...
                          </>
                        ) : (
                          'Slide to complete the job'
                        )}
                      </div>

                      {/* Progress Background */}
                      <div
                        className="position-absolute"
                        style={{
                          left: 0,
                          top: 0,
                          width: `${completeSlideOffset + 50}px`,
                          height: '100%',
                          background: 'linear-gradient(135deg, #dc3545 0%, #dc3545dd 100%)',
                          borderRadius: '30px',
                          transition: isDraggingComplete ? 'none' : 'width 0.2s ease',
                          zIndex: 0
                        }}
                      />

                      {/* Draggable Button */}
                      <div
                        className="position-absolute d-flex align-items-center justify-content-center"
                        style={{
                          left: `${completeSlideOffset}px`,
                          top: '5px',
                          width: '50px',
                          height: '50px',
                          backgroundColor: completingJob ? '#dc3545' : '#fff',
                          borderRadius: '50%',
                          boxShadow: completingJob 
                            ? '0 2px 8px rgba(220, 53, 69, 0.3)' 
                            : '0 3px 10px rgba(0,0,0,0.2), 0 4px 14px rgba(0,0,0,0.15)',
                          cursor: completingJob ? 'not-allowed' : isDraggingComplete ? 'grabbing' : 'grab',
                          transition: isDraggingComplete ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          zIndex: 3,
                          userSelect: 'none',
                          touchAction: 'none',
                          border: completingJob ? 'none' : '2px solid #f0f0f0'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (!completingJob) handleCompleteMouseDown(e);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (!completingJob) handleCompleteTouchStart(e);
                        }}
                      >
                        {completingJob ? (
                          <span className="spinner-border spinner-border-sm text-white" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                        ) : (
                          <i className="bi bi-check-lg" style={{ fontSize: '22px', color: '#dc3545', fontWeight: 'bold' }}></i>
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                )}
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
                        <div className="fw-bold">{workOrder.block_unit.unit_no || workOrder.block_unit.unit_name || `Unit #${workOrder.block_unit.id}`}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Below Location */}
            <div className="card mb-3">
              <div className="card-body">
                <div className="row g-2">
                  {/* Add Photo Button */}
                  <div className="col-12">
                    <button
                      className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                      onClick={() => navigate(`/work-order/${id}/photos`)}
                      style={{
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      <i className="bi bi-camera me-2" style={{ fontSize: '20px' }}></i>
                      Add Photo
                    </button>
                  </div>

                  {/* Add Notes Button */}
                  <div className="col-12">
                    <button
                      className="btn btn-outline-info w-100 d-flex align-items-center justify-content-center"
                      onClick={openNotesModal}
                      style={{
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      <i className="bi bi-pencil-square me-2" style={{ fontSize: '20px' }}></i>
                      Add Notes
                    </button>
                  </div>

                  {/* View My Team Button */}
                  <div className="col-12">
                    <button
                      className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center"
                      onClick={() => setShowTeamModal(true)}
                      style={{
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      <i className="bi bi-people me-2" style={{ fontSize: '20px' }}></i>
                      View My Team
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {(workOrder.contact_name || workOrder.contact_mobile || workOrder.contact_email) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-person-lines-fill me-2" style={{ color: '#17a2b8' }}></i>
                    Contact Information
                  </h6>
                  <div className="row g-3">
                    {workOrder.contact_name && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Contact Name</small>
                        <div className="fw-bold">{workOrder.contact_name}</div>
                      </div>
                    )}
                    {workOrder.contact_mobile && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Mobile</small>
                        <div className="fw-bold">
                          <a href={`tel:${workOrder.contact_mobile}`} className="text-decoration-none">
                            {workOrder.contact_mobile}
                          </a>
                        </div>
                      </div>
                    )}
                    {workOrder.contact_email && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Email</small>
                        <div className="fw-bold">
                          <a href={`mailto:${workOrder.contact_email}`} className="text-decoration-none">
                            {workOrder.contact_email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Preferred Time */}
            {(workOrder.preferred_start_date_time || workOrder.preferred_end_date_time) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-clock me-2" style={{ color: '#ffc107' }}></i>
                    Preferred Time
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
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {(workOrder.note_for_access || workOrder.comment || workOrder.note) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-file-text me-2" style={{ color: '#6f42c1' }}></i>
                    Additional Notes
                  </h6>
                  {workOrder.note_for_access && (
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Note for Access</small>
                      <div>{workOrder.note_for_access}</div>
                    </div>
                  )}
                  {workOrder.comment && (
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Comments</small>
                      <div>{workOrder.comment}</div>
                    </div>
                  )}
                  {workOrder.note && (
                    <div>
                      <small className="text-muted d-block mb-1">Notes</small>
                      <div>{workOrder.note}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related Issue */}
            {workOrder.block_issue && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-exclamation-triangle me-2" style={{ color: '#dc3545' }}></i>
                    Related Issue
                  </h6>
                  <div className="row g-3">
                    {workOrder.block_issue.issue && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Issue Description</small>
                        <div>{workOrder.block_issue.issue}</div>
                      </div>
                    )}
                    {workOrder.block_issue.ref_no && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Issue Reference</small>
                        <div className="fw-bold">{workOrder.block_issue.ref_no}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Images */}
            {workOrder.images && workOrder.images.length > 0 && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-images me-2" style={{ color: '#20c997' }}></i>
                    Images ({workOrder.images.length})
                  </h6>
                  <div className="row g-2">
                    {workOrder.images.map((image: any, index: number) => {
                      const getImageUrl = () => {
                        if (typeof image === 'string') {
                          return image.startsWith('http') ? image : `${AppConstants.baseUrl}/${image.replace(/^\//, '')}`;
                        }
                        const imgPath = image.image_path || image.url || image.path;
                        if (!imgPath) return '';
                        return imgPath.startsWith('http') ? imgPath : `${AppConstants.baseUrl}/${imgPath.replace(/^\//, '')}`;
                      };
                      const imageUrl = getImageUrl();
                      return (
                        <div key={index} className="col-6 col-md-4">
                          <img
                            src={imageUrl}
                            alt={`Work order image ${index + 1}`}
                            className="img-fluid rounded"
                            style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => window.open(imageUrl, '_blank')}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/assets/img/demo-img/default-image.jpg';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Information */}
            {(workOrder.contractor || workOrder.issued_by || workOrder.issuedBy) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-people me-2" style={{ color: '#fd7e14' }}></i>
                    Assignment Information
                  </h6>
                  <div className="row g-3">
                    {workOrder.contractor && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Contractor</small>
                        <div className="fw-bold">
                          {workOrder.contractor.name || workOrder.contractor.email || `User #${workOrder.contractor.id}`}
                        </div>
                      </div>
                    )}
                    {(workOrder.issued_by || workOrder.issuedBy) && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Issued By</small>
                        <div className="fw-bold">
                          {workOrder.issuedBy?.name || workOrder.issuedBy?.email || `User #${workOrder.issued_by || workOrder.issuedBy?.id}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-info-circle me-2" style={{ color: '#6c757d' }}></i>
                  Additional Information
                </h6>
                <div className="row g-3">
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
                  {workOrder.is_mobile !== undefined && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Source</small>
                      <div>
                        <span className="badge bg-info">
                          {workOrder.is_mobile ? 'Mobile App' : 'Web Portal'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PDF Document */}
            {workOrder.pdf_path && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-file-pdf me-2" style={{ color: '#dc3545' }}></i>
                    Document
                  </h6>
                  <a
                    href={workOrder.pdf_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-danger"
                  >
                    <i className="bi bi-file-pdf me-2"></i>
                    {workOrder.pdf_name || 'View PDF'}
                  </a>
                </div>
              </div>
            )}

            <div className="pb-3"></div>
          </div>
        </div>
      </div>
      <FooterTwo />


      {/* Add Notes Modal */}
      {showNotesModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  Add Notes
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowNotesModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder="Enter your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ borderRadius: '8px' }}
                  disabled={savingNotes}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowNotesModal(false);
                    setNotes("");
                  }}
                  disabled={savingNotes}
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddNotes}
                  disabled={savingNotes || !notes.trim()}
                  style={{ borderRadius: '8px' }}
                >
                  {savingNotes ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Notes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View My Team Modal */}
      {showTeamModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-people me-2"></i>
                  My Team
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTeamModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {workOrder?.contractor ? (
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <h6 className="mb-3">
                        <i className="bi bi-person-badge me-2"></i>
                        Assigned Contractor
                      </h6>
                      <div className="d-flex align-items-center">
                        {workOrder.contractor.avatar && (
                          <img
                            src={workOrder.contractor.avatar}
                            alt={workOrder.contractor.name}
                            className="rounded-circle me-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div className="fw-bold">{workOrder.contractor.name || 'N/A'}</div>
                          {workOrder.contractor.email && (
                            <small className="text-muted d-block">{workOrder.contractor.email}</small>
                          )}
                          {workOrder.contractor.phone && (
                            <small className="text-muted d-block">
                              <i className="bi bi-telephone me-1"></i>
                              {workOrder.contractor.phone}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-people" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                    <p className="text-muted mt-3 mb-0">No team members assigned to this work order</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkOrderDetail;

