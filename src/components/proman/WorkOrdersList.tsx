import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";
import AppConstants from "../../config/constants";

const WorkOrdersList = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

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
      case 'pending':
        return 'secondary';
      default:
        return 'info';
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
                  {workOrders.length} work order{workOrders.length !== 1 ? 's' : ''}
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
            ) : workOrders.length === 0 ? (
              /* Empty State */
              <div className="text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#ccc' }}></i>
                <h5 className="mt-3">No Work Orders Found</h5>
                <p className="text-muted">You don't have any work orders assigned yet.</p>
              </div>
            ) : (
              /* Work Orders List */
              <div className="row g-3">
                {workOrders.map((workOrder) => (
                  <div key={workOrder.id} className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0 fw-bold">WO-{workOrder.id}</h6>
                          {workOrder.job_status?.name && (
                            <span className={`badge bg-${getStatusColor(workOrder.job_status.name)}`}>
                              {workOrder.job_status.name}
                            </span>
                          )}
                        </div>

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
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="filterOffcanvasLabel">
            Sort & Filter
          </h5>
          <button
            type="button"
            className="btn-close"
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
                onClick={() => {
                  setSortBy(sort);
                  // Implement sorting logic here
                }}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>

          <h6>Filter by Status</h6>
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn btn-sm ${filterStatus === null ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setFilterStatus(null);
                // Implement filter logic here
              }}
            >
              All
            </button>
            {['Pending', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => {
                  setFilterStatus(status);
                  // Implement filter logic here
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <FooterTwo />
    </>
  );
};

export default WorkOrdersList;




