import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import HeaderTwo from '../../layouts/headers/HeaderTwo';
import FooterTwo from '../../layouts/footers/FooterTwo';
import blockService, { Block, BlockUnit } from '../../services/blockService';
import issueService, { Issue } from '../../services/issueService';
import workOrderService, { WorkOrder } from '../../services/workOrderService';
import AppConstants from '../../config/constants';

const UNITS_PER_PAGE = 10;

const BlockDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [block, setBlock] = useState<Block | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [units, setUnits] = useState<BlockUnit[]>([]);
  const [unitsMeta, setUnitsMeta] = useState<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null);
  const [unitsPage, setUnitsPage] = useState(1);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'issues' | 'workOrders'>('info');

  useEffect(() => {
    if (id) {
      fetchBlockData(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (id && block) {
      fetchUnits(parseInt(id), unitsPage);
    }
  }, [id, block, unitsPage]);

  const fetchBlockData = async (blockId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch block details
      const blockData = await blockService.getBlockById(blockId);
      setBlock(blockData);
      
      // Fetch issues for this block
      try {
        const issuesData = await issueService.getIssuesByBlock(blockId);
        setIssues(issuesData);
      } catch (err) {
        console.error('Failed to fetch issues:', err);
      }
      
      // Fetch work orders (filtered by block)
      try {
        const workOrdersData = await workOrderService.getWorkOrders({ block_id: blockId });
        setWorkOrders(workOrdersData);
      } catch (err) {
        console.error('Failed to fetch work orders:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load block details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async (blockId: number, page: number) => {
    setUnitsLoading(true);
    try {
      const { units: unitsData, meta } = await blockService.getUnitsByBlock(blockId, {
        page,
        per_page: UNITS_PER_PAGE,
      });
      setUnits(unitsData);
      setUnitsMeta(meta);
    } catch (err) {
      console.error('Failed to fetch units:', err);
      setUnits([]);
      setUnitsMeta(null);
    } finally {
      setUnitsLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper">
          <div className="container">
            <div className="pt-3">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading block details...</p>
              </div>
            </div>
          </div>
        </div>
        <FooterTwo />
      </>
    );
  }

  if (error || !block) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper">
          <div className="container">
            <div className="pt-3">
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error || 'Block not found'}
              </div>
              <Link to="/blocks" className="btn btn-primary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Blocks
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
            {/* Back Button */}
            <Link to="/blocks" className="btn btn-sm btn-outline-secondary mb-3">
              <i className="bi bi-arrow-left me-1"></i>
              Back
            </Link>

            {/* Block Header */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0 fw-bold">{block.name}</h5>
                  <span
                    className={`badge ${block.status === 1 ? 'bg-success' : 'bg-secondary'}`}
                  >
                    {block.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {block.address && (
                  <p className="mb-2 text-muted">
                    <i className="bi bi-geo-alt me-1"></i>
                    {block.address}
                    {block.city && `, ${block.city}`}
                    {block.state && `, ${block.state}`}
                    {block.zip_code && ` ${block.zip_code}`}
                  </p>
                )}
                
                {block.description && (
                  <p className="mb-3 text-muted small">{block.description}</p>
                )}

                {/* Quick Stats */}
                <div className="d-flex gap-2 flex-wrap">
                  {block.units_count !== undefined && (
                    <span className="badge bg-light text-dark">
                      <i className="bi bi-door-closed me-1"></i>
                      {block.units_count} Units
                    </span>
                  )}
                  <span className="badge bg-warning">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    {issues.length} Issues
                  </span>
                  <span className="badge bg-info">
                    <i className="bi bi-clipboard-check me-1"></i>
                    {workOrders.length} Work Orders
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <i className="bi bi-info-circle me-1"></i>
                  Info
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'issues' ? 'active' : ''}`}
                  onClick={() => setActiveTab('issues')}
                >
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Issues ({issues.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'workOrders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('workOrders')}
                >
                  <i className="bi bi-clipboard-check me-1"></i>
                  Work Orders ({workOrders.length})
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content pb-3">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="mb-3">Block Information</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th width="40%">Name:</th>
                          <td>{block.name}</td>
                        </tr>
                        {block.address && (
                          <tr>
                            <th>Address:</th>
                            <td>{block.address}</td>
                          </tr>
                        )}
                        {block.city && (
                          <tr>
                            <th>City:</th>
                            <td>{block.city}</td>
                          </tr>
                        )}
                        {block.state && (
                          <tr>
                            <th>State:</th>
                            <td>{block.state}</td>
                          </tr>
                        )}
                        {block.country && (
                          <tr>
                            <th>Country:</th>
                            <td>{block.country}</td>
                          </tr>
                        )}
                        {block.zip_code && (
                          <tr>
                            <th>Zip Code:</th>
                            <td>{block.zip_code}</td>
                          </tr>
                        )}
                        {block.property_manager && (
                          <tr>
                            <th>Property Manager:</th>
                            <td>{block.property_manager.name}</td>
                          </tr>
                        )}
                        <tr>
                          <th>Status:</th>
                          <td>
                            <span className={`badge ${block.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                              {block.status === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Units List - Paginated */}
                <div className="card shadow-sm mt-3">
                  <div className="card-body">
                    <h6 className="mb-3">
                      <i className="bi bi-door-closed me-2"></i>
                      Units
                      {unitsMeta && (
                        <span className="text-muted small ms-2">
                          ({unitsMeta.total} total)
                        </span>
                      )}
                    </h6>
                    {unitsLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted small mb-0">Loading units...</p>
                      </div>
                    ) : units.length === 0 ? (
                      <p className="text-muted small mb-0">No units in this block.</p>
                    ) : (
                      <>
                        <div className="table-responsive">
                          <table className="table table-sm table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Issues</th>
                                <th>Work Orders</th>
                              </tr>
                            </thead>
                            <tbody>
                              {units.map((unit) => (
                                <tr key={unit.id}>
                                  <td>
                                    <Link
                                      to={`/blocks/${id}/units/${unit.id}`}
                                      className="text-primary fw-medium text-decoration-none"
                                    >
                                      {unit.unit_code || `Unit #${unit.id}`}
                                    </Link>
                                  </td>
                                  <td>{unit.unit_name || '-'}</td>
                                  <td>
                                    {unit.active_issues_count > 0 ? (
                                      <span className="badge bg-warning">{unit.active_issues_count}</span>
                                    ) : (
                                      <span className="text-muted">0</span>
                                    )}
                                  </td>
                                  <td>
                                    {unit.active_work_orders_count > 0 ? (
                                      <span className="badge bg-info">{unit.active_work_orders_count}</span>
                                    ) : (
                                      <span className="text-muted">0</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {unitsMeta && unitsMeta.last_page > 1 && (
                          <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                            <small className="text-muted">
                              Showing {unitsMeta.from} to {unitsMeta.to} of {unitsMeta.total}
                            </small>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-secondary"
                                disabled={unitsPage <= 1}
                                onClick={() => setUnitsPage((p) => Math.max(1, p - 1))}
                              >
                                <i className="bi bi-chevron-left"></i>
                              </button>
                              <span className="btn btn-outline-secondary disabled">
                                {unitsPage} / {unitsMeta.last_page}
                              </span>
                              <button
                                className="btn btn-outline-secondary"
                                disabled={unitsPage >= unitsMeta.last_page}
                                onClick={() => setUnitsPage((p) => Math.min(unitsMeta.last_page, p + 1))}
                              >
                                <i className="bi bi-chevron-right"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                </>
              )}

              {/* Issues Tab */}
              {activeTab === 'issues' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span></span>
                    <Link
                      to={`/blocks/${id}/create-issue`}
                      className="btn btn-primary"
                    >
                      <i className="bi bi-plus-lg me-1"></i>
                      Create Issue
                    </Link>
                  </div>
                  {issues.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-check-circle" style={{ fontSize: '48px', color: '#28a745' }}></i>
                      <p className="text-muted mt-3">No issues for this block</p>
                      <Link
                        to={`/blocks/${id}/create-issue`}
                        className="btn btn-outline-primary mt-2"
                      >
                        <i className="bi bi-plus-lg me-1"></i>
                        Create First Issue
                      </Link>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {issues.map((issue) => (
                        <div key={issue.id} className="col-12">
                          <Link to={`/issues/${issue.id}`} className="text-decoration-none text-dark">
                            <div className="card shadow-sm hover-lift" style={{ cursor: 'pointer' }}>
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="flex-grow-1">
                                    <h6 className="mb-2 fw-bold text-dark">
                                      {issue.issue || (issue as { title?: string }).title || `Issue #${issue.id}`}
                                    </h6>
                                    {issue.description && (
                                      <p className="mb-2 text-muted small">{issue.description}</p>
                                    )}
                                    {issue.block_unit && (
                                      <p className="mb-1 text-muted small">
                                        <i className="bi bi-door-closed me-1"></i>
                                        Unit: {issue.block_unit.unit_name || issue.block_unit.unit_code}
                                      </p>
                                    )}
                                    {(issue.assigned_to || (issue as { assignedTo?: { name?: string } }).assignedTo) && (
                                      <p className="mb-1 text-muted small">
                                        <i className="bi bi-person me-1"></i>
                                        Assigned: {(issue.assigned_to as { name?: string })?.name || (issue as { assignedTo?: { name?: string } }).assignedTo?.name}
                                      </p>
                                    )}
                                    <div className="d-flex gap-2 mt-2 flex-wrap">
                                      {issue.priority && (
                                        <span className={`badge ${
                                          issue.priority.id === 1 ? 'bg-success' :
                                          issue.priority.id === 2 ? 'bg-info' :
                                          issue.priority.id === 3 ? 'bg-warning' :
                                          issue.priority.id === 4 ? 'bg-danger' : 'bg-secondary'
                                        }`}>
                                          {issue.priority.name}
                                        </span>
                                      )}
                                      <span className="badge bg-secondary">{issue.status_name || 'Pending'}</span>
                                      <span className="badge bg-info">
                                        <i className="bi bi-clipboard-check me-1"></i>
                                        {issue.active_work_orders_count ?? 0} WOs
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Work Orders Tab */}
              {activeTab === 'workOrders' && (
                <div>
                  {workOrders.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-clipboard-check" style={{ fontSize: '48px', color: AppConstants.primaryColor }}></i>
                      <p className="text-muted mt-3">No work orders for this block</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {workOrders.map((wo) => (
                        <div key={wo.id} className="col-12">
                          <Link to={`/work-orders/${wo.id}`} className="text-decoration-none">
                            <div className="card shadow-sm hover-lift">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-2">
                                      <span className="badge bg-secondary me-2">{wo.ref_no}</span>
                                      {wo.job_status?.name && (
                                        <span className={`badge ${
                                          wo.job_status.name === 'Completed' ? 'bg-success' :
                                          wo.job_status.name === 'In Progress' ? 'bg-primary' :
                                          wo.job_status.name === 'On Hold' ? 'bg-warning' : 'bg-secondary'
                                        }`}>
                                          {wo.job_status.name}
                                        </span>
                                      )}
                                    </div>
                                    <h6 className="mb-2 fw-bold text-dark">{wo.issue}</h6>
                                    {wo.contractor && (
                                      <p className="mb-1 text-muted small">
                                        <i className="bi bi-person me-1"></i>
                                        {wo.contractor.name}
                                      </p>
                                    )}
                                    {wo.priority && (
                                      <span className={`badge ${
                                        wo.priority.id === 1 ? 'bg-success' :
                                        wo.priority.id === 2 ? 'bg-info' :
                                        wo.priority.id === 3 ? 'bg-warning' :
                                        wo.priority.id === 4 ? 'bg-danger' : 'bg-secondary'
                                      }`}>
                                        {wo.priority.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <FooterTwo />

      <style>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </>
  );
};

export default BlockDetail;
