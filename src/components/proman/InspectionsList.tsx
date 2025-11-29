import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import inspectionService, { Inspection } from "../../services/inspectionService";

const InspectionsList = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await inspectionService.getMyInspections();
      setInspections(data);
    } catch (err: any) {
      setError(err.message || "Failed to load inspections");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress === 100) return 'success';
    if (progress >= 50) return 'warning';
    return 'info';
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
                <h4 className="mb-1">My Inspections</h4>
                <p className="mb-0 text-muted small">
                  {inspections.length} inspection{inspections.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={loadInspections}
              >
                <i className="bi bi-arrow-clockwise"></i>
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
                <p className="mt-2 text-muted">Loading inspections...</p>
              </div>
            ) : inspections.length === 0 ? (
              /* Empty State */
              <div className="text-center py-5">
                <i className="bi bi-clipboard-x" style={{ fontSize: '64px', color: '#ccc' }}></i>
                <h5 className="mt-3">No Inspections Found</h5>
                <p className="text-muted">You don't have any inspections assigned yet.</p>
              </div>
            ) : (
              /* Inspections List */
              <div className="row g-3">
                {inspections.map((inspection) => (
                  <div key={inspection.id} className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0 fw-bold">Inspection #{inspection.id}</h6>
                          <span className={`badge bg-${getProgressColor(inspection.progress)}`}>
                            {inspection.progress}%
                          </span>
                        </div>

                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-building me-2 text-muted"></i>
                          <small className="text-muted">
                            {inspection.block?.block_name || 'N/A'}
                          </small>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="progress" style={{ height: '8px' }}>
                            <div
                              className={`progress-bar bg-${getProgressColor(inspection.progress)}`}
                              role="progressbar"
                              style={{ width: `${inspection.progress}%` }}
                              aria-valuenow={inspection.progress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            Created: {formatDate(inspection.created_at)}
                          </small>
                          {inspection.progress === 100 && (
                            <small className="text-success fw-bold">
                              <i className="bi bi-check-circle-fill me-1"></i>
                              Completed
                            </small>
                          )}
                        </div>

                        <Link
                          to={`/inspection/${inspection.id}`}
                          className="btn btn-sm btn-outline-primary w-100"
                        >
                          {inspection.progress === 100 ? 'View Details' : 'Continue Inspection'}{' '}
                          <i className="bi bi-arrow-right ms-1"></i>
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
      <FooterTwo />
    </>
  );
};

export default InspectionsList;




