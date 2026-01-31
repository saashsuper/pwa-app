import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";
import DragToggle from "../common/DragToggle";

const WorkOrdersList = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterStatus, setFilterStatus] = useState<string>("active"); // "active" = non-completed, "all", or specific status
  const [resumeToggles, setResumeToggles] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await workOrderService.getMyWorkOrders();
      // Ensure data is always an array
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load work orders");
      setWorkOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusName = (wo: WorkOrder): string => {
    const js = wo.job_status;
    if (!js) return '';
    if (typeof js === 'object' && js !== null) {
      const name = (js as { name?: string; label?: string }).name || (js as { name?: string; label?: string }).label;
      return (name || '').toString().toLowerCase().trim();
    }
    return String(js).toLowerCase().trim();
  };

  const getPriorityRank = (wo: WorkOrder): number => {
    const p = wo.priority;
    const label = typeof p === 'object' && p ? (p.label || (p as any).priority || '') : String(p || '');
    const lower = label.toLowerCase();
    if (lower === 'high' || lower === 'urgent') return 3;
    if (lower === 'medium') return 2;
    return 1;
  };

  const COMPLETED_STATUSES = ['completed', 'cancelled', 'rejected'];

  const displayedWorkOrders = (() => {
    let list = [...workOrders];

    if (filterStatus === 'active') {
      list = list.filter((wo) => !COMPLETED_STATUSES.includes(getStatusName(wo)));
    } else if (filterStatus === 'all') {
      // Show all - no filter
    } else if (filterStatus) {
      const target = filterStatus.toLowerCase();
      list = list.filter((wo) => getStatusName(wo) === target);
    }

    if (sortBy === 'latest') {
      list.sort((a, b) => (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()));
    } else if (sortBy === 'priority') {
      list.sort((a, b) => getPriorityRank(b) - getPriorityRank(a));
    }

    return list;
  })();

  const getStatusColor = (status: string | undefined | null): string => {
    if (!status || typeof status !== 'string') {
      return 'info';
    }
    switch (status.toLowerCase()) {
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

  const getStatusLabel = (status: string | undefined | null): string => {
    if (!status || typeof status !== 'string') {
      return 'N/A';
    }
    // Map "On Hold" to "Paused" for display
    if (status.toLowerCase() === 'on hold' || status.toLowerCase() === 'on_hold') {
      return 'Paused';
    }
    return status;
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

  const handleResume = async (workOrderId: number, checked: boolean) => {
    if (!checked) {
      setResumeToggles(prev => ({ ...prev, [workOrderId]: false }));
      return;
    }

    try {
      setError("");
      setResumeToggles(prev => ({ ...prev, [workOrderId]: true }));
      await workOrderService.resume(workOrderId);
      // Reload work orders after resume
      await loadWorkOrders();
      setResumeToggles(prev => ({ ...prev, [workOrderId]: false }));
    } catch (err: any) {
      setError(err.message || "Failed to resume work order");
      setResumeToggles(prev => ({ ...prev, [workOrderId]: false }));
    }
  };

  const getPriorityColor = (priority: string | undefined | null): string => {
    if (!priority || typeof priority !== 'string') {
      return 'secondary';
    }
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <HeaderTwo />
      <div className="page-content-wrapper">
        {/* Header */}
        <div className="container">
          <div className="pt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="mb-1">My Work Orders</h4>
                <p className="mb-0 text-muted small">
                  {displayedWorkOrders.length} work order{displayedWorkOrders.length !== 1 ? 's' : ''}
                  {filterStatus !== 'all' && filterStatus !== 'active' && ` (filtered)`}
                </p>
              </div>
              <button
                className="btn btn-sm btn-primary"
                data-bs-toggle="offcanvas"
                data-bs-target="#filterOffcanvas"
              >
                <i className="bi bi-filter"></i>
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading work orders...</p>
              </div>
            ) : displayedWorkOrders.length === 0 ? (
              /* Empty State */
              <div className="text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#ccc' }}></i>
                <h5 className="mt-3">No Work Orders Found</h5>
                <p className="text-muted">
                  {filterStatus !== 'all' && filterStatus !== 'active'
                    ? 'No work orders match the selected filter.'
                    : filterStatus === 'active'
                    ? "You don't have any active work orders assigned yet."
                    : "You don't have any work orders assigned yet."}
                </p>
              </div>
            ) : (
              /* Work Orders List */
              <div className="row g-3">
                {displayedWorkOrders.map((workOrder) => (
                  <div key={workOrder.id} className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0 fw-bold">WO-{workOrder.id}</h6>
                          {workOrder.job_status && (() => {
                            const statusName = typeof workOrder.job_status === 'object' 
                              ? workOrder.job_status.name || workOrder.job_status.label || ''
                              : workOrder.job_status;
                            return (
                              <span className={`badge bg-${getStatusColor(statusName)}`}>
                                {getStatusLabel(statusName)}
                              </span>
                            );
                          })()}
                        </div>
                        
                        {/* Resume Toggle for Paused Work Orders */}
                        {isPaused(workOrder.job_status) && (
                          <div className="mb-2">
                            <small className="text-muted d-block mb-1">
                              <i className="bi bi-pause-circle me-1 text-warning"></i>
                              Slide to resume
                            </small>
                            <DragToggle
                              id={`resumeToggle-${workOrder.id}`}
                              checked={resumeToggles[workOrder.id] || false}
                              onChange={(checked) => handleResume(workOrder.id, checked)}
                              variant="warning"
                            />
                          </div>
                        )}

                        <p className="mb-2 text-muted small" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {workOrder.work || 'No description'}
                        </p>

                        <div className="d-flex align-items-center gap-3 mb-2">
                          {workOrder.priority && (() => {
                            const priorityLabel = typeof workOrder.priority === 'object' 
                              ? (workOrder.priority.label || workOrder.priority.priority || '')
                              : workOrder.priority;
                            const priorityValue = typeof workOrder.priority === 'object'
                              ? priorityLabel
                              : priorityLabel;
                            
                            return priorityValue ? (
                              <div className="d-flex align-items-center">
                                <i className={`bi bi-flag-fill me-1 text-${getPriorityColor(priorityValue)}`}></i>
                                <small className={`text-${getPriorityColor(priorityValue)} fw-bold`}>
                                  {priorityValue}
                                </small>
                              </div>
                            ) : null;
                          })()}

                          {workOrder.block_unit && (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-geo-alt me-1 text-muted"></i>
                              <small className="text-muted">
                                {workOrder.block_unit.unit_no}
                              </small>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/work-order/${workOrder.id}`}
                          className="btn btn-sm btn-outline-primary w-100"
                        >
                          View Details <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pb-3"></div>
          </div>
        </div>
      </div>

      {/* Filter Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="filterOffcanvas"
        aria-labelledby="filterOffcanvasLabel"
      >
        <div className="offcanvas-header d-flex justify-content-between align-items-center">
          <h5 className="offcanvas-title mb-0 me-3 flex-grow-1" id="filterOffcanvasLabel">
            Sort & Filter
          </h5>
          <button
            type="button"
            className="btn-close flex-shrink-0"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <h6>Sort By</h6>
          <div className="d-flex flex-wrap gap-2 mb-4">
            {['latest', 'oldest', 'priority'].map((sort) => (
              <button
                key={sort}
                className={`btn btn-sm ${sortBy === sort ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSortBy(sort)}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>

          <h6>Filter by Status</h6>
          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              className={`btn btn-sm ${filterStatus === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterStatus('active')}
            >
              Active
            </button>
            <button
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            {['Scheduled', 'Accepted', 'In Progress', 'Completed', 'On Hold'].map((status) => (
              <button
                key={status}
                className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary w-100"
            data-bs-dismiss="offcanvas"
          >
            <i className="bi bi-check-lg me-2"></i>
            Apply
          </button>
        </div>
      </div>

      <FooterTwo />
    </>
  );
};

export default WorkOrdersList;




