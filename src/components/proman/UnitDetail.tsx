import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import HeaderTwo from '../../layouts/headers/HeaderTwo';
import FooterTwo from '../../layouts/footers/FooterTwo';
import blockService, { UnitDetail as UnitDetailType } from '../../services/blockService';

const UnitDetail = () => {
  const { blockId, unitId } = useParams<{ blockId: string; unitId: string }>();
  const [unit, setUnit] = useState<UnitDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blockId && unitId) {
      loadUnit();
    }
  }, [blockId, unitId]);

  const loadUnit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blockService.getUnitById(Number(blockId), Number(unitId));
      setUnit(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load unit details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper">
          <div className="container">
            <div className="pt-3 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading unit details...</p>
            </div>
          </div>
        </div>
        <FooterTwo />
      </>
    );
  }

  if (error || !unit) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper">
          <div className="container">
            <div className="pt-3">
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error || 'Unit not found'}
              </div>
              <Link to={blockId ? `/blocks/${blockId}` : '/blocks'} className="btn btn-primary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Block
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
            <Link
              to={blockId ? `/blocks/${blockId}` : '/blocks'}
              className="btn btn-sm btn-outline-secondary mb-3"
            >
              <i className="bi bi-arrow-left me-1"></i>
              Back to Block
            </Link>

            {/* Unit Header */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1 fw-bold">
                      {unit.unit_code || `Unit #${unit.id}`}
                      {unit.unit_name && ` - ${unit.unit_name}`}
                    </h5>
                    {unit.block && (
                      <p className="mb-0 text-muted small">
                        <i className="bi bi-building me-1"></i>
                        {(unit.block as { name?: string }).name || 'Block'}
                        {(unit.block as { address?: string }).address && ` • ${(unit.block as { address?: string }).address}`}
                      </p>
                    )}
                  </div>
                  <span
                    className={`badge ${(unit.status || 'active') === 'active' ? 'bg-success' : 'bg-secondary'}`}
                  >
                    {unit.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Unit Information */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  Unit Information
                </h6>
                <table className="table table-sm mb-0">
                  <tbody>
                    <tr>
                      <th width="35%">Unit Code</th>
                      <td>{unit.unit_code || '-'}</td>
                    </tr>
                    <tr>
                      <th>Unit Name</th>
                      <td>{unit.unit_name || '-'}</td>
                    </tr>
                    {unit.unit_type && (
                      <tr>
                        <th>Unit Type</th>
                        <td>{typeof unit.unit_type === 'object' ? (unit.unit_type as { name?: string }).name : String(unit.unit_type)}</td>
                      </tr>
                    )}
                    {unit.building && (
                      <tr>
                        <th>Building</th>
                        <td>{typeof unit.building === 'object' ? (unit.building as { name?: string }).name : String(unit.building)}</td>
                      </tr>
                    )}
                    {unit.owners_name && (
                      <tr>
                        <th>Owner</th>
                        <td>{unit.owners_name}</td>
                      </tr>
                    )}
                    {unit.email && (
                      <tr>
                        <th>Email</th>
                        <td>
                          <a href={`mailto:${unit.email}`}>{unit.email}</a>
                        </td>
                      </tr>
                    )}
                    {unit.mobile_no && (
                      <tr>
                        <th>Mobile</th>
                        <td>
                          <a href={`tel:${unit.mobile_no}`}>{unit.mobile_no}</a>
                        </td>
                      </tr>
                    )}
                    {unit.phone_number && (
                      <tr>
                        <th>Phone</th>
                        <td>
                          <a href={`tel:${unit.phone_number}`}>{unit.phone_number}</a>
                        </td>
                      </tr>
                    )}
                    {(unit.address1 || unit.address2 || unit.address3) && (
                      <tr>
                        <th>Address</th>
                        <td>
                          {[unit.address1, unit.address2, unit.address3].filter(Boolean).join(', ')}
                        </td>
                      </tr>
                    )}
                    {(unit.state || unit.country || unit.zip) && (
                      <tr>
                        <th>Location</th>
                        <td>
                          {[
                            typeof unit.state === 'string' ? unit.state : (unit.state as { name?: string })?.name,
                            typeof unit.country === 'string' ? unit.country : (unit.country as { name?: string })?.name,
                            unit.zip,
                          ].filter(Boolean).join(', ')}
                        </td>
                      </tr>
                    )}
                    {unit.letting_agent && (
                      <tr>
                        <th>Letting Agent</th>
                        <td>{unit.letting_agent}</td>
                      </tr>
                    )}
                    {unit.misc_info && (
                      <tr>
                        <th>Misc Info</th>
                        <td>{unit.misc_info}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Issues */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
                  Issues ({unit.issues?.length ?? 0})
                </h6>
                {!unit.issues || unit.issues.length === 0 ? (
                  <p className="text-muted small mb-0">No issues for this unit.</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {unit.issues.map((issue: any) => {
                      const priority = issue.priority ?? issue.priority_id;
                      const priorityName = typeof priority === 'object' ? priority?.name : null;
                      const priorityId = typeof priority === 'object' ? priority?.id : null;
                      const assignedTo = issue.assigned_to ?? issue.assignedTo;
                      const assignedName = typeof assignedTo === 'object' ? assignedTo?.name : null;
                      return (
                        <Link
                          key={issue.id}
                          to={`/issues/${issue.id}`}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <span className="fw-bold">
                              {issue.issue || issue.title || issue.issue_details || `Issue #${issue.id}`}
                            </span>
                            {assignedName && (
                              <span className="text-muted small ms-2">
                                <i className="bi bi-person me-1"></i>
                                {assignedName}
                              </span>
                            )}
                            {priorityName && (
                              <span className={`badge ms-2 bg-${
                                priorityId === 1 ? 'success' :
                                priorityId === 2 ? 'info' :
                                priorityId === 3 ? 'warning' :
                                priorityId === 4 ? 'danger' : 'secondary'
                              }`}>
                                {priorityName}
                              </span>
                            )}
                            <span className="badge ms-2 bg-info">
                              <i className="bi bi-clipboard-check me-1"></i>
                              {issue.active_work_orders_count ?? 0} WOs
                            </span>
                          </div>
                          <i className="bi bi-chevron-right"></i>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Work Orders */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-clipboard-check me-2 text-info"></i>
                  Work Orders ({unit.work_orders?.length ?? 0})
                </h6>
                {!unit.work_orders || unit.work_orders.length === 0 ? (
                  <p className="text-muted small mb-0">No work orders for this unit.</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {unit.work_orders.map((wo: any) => {
                      const jobStatus = wo.job_status ?? wo.jobStatus;
                      const statusName = typeof jobStatus === 'object' ? jobStatus?.name : (typeof jobStatus === 'string' ? jobStatus : null);
                      return (
                        <Link
                          key={wo.id}
                          to={`/work-orders/${wo.id}`}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <span className="badge bg-secondary me-2">{wo.ref_no || `WO #${wo.id}`}</span>
                            <span>{wo.issue || `Work Order #${wo.id}`}</span>
                            {statusName && (
                              <span className={`badge ms-2 ${
                                statusName === 'Completed' ? 'bg-success' :
                                statusName === 'In Progress' ? 'bg-primary' : 'bg-secondary'
                              }`}>
                                {statusName}
                              </span>
                            )}
                          </div>
                          <i className="bi bi-chevron-right"></i>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pb-3"></div>
          </div>
        </div>
      </div>
      <FooterTwo />
    </>
  );
};

export default UnitDetail;
