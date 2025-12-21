import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import issueService, { BlockIssue } from "../../services/issueService";
import AppConstants from "../../config/constants";

// Helper function to get image URL (defined outside component to prevent recreation)
const getImageUrl = (image: any, baseUrl: string): string => {
  // If it's already a full URL, return it
  if (typeof image === 'string') {
    return image.startsWith('http') ? image : `${baseUrl}/${image.replace(/^\//, '')}`;
  }
  
  // Handle BlockIssueImage structure: has image_path and image_name
  // Format: storage/{image_path}/{image_name}
  if (image.image_path && image.image_name) {
    // Clean up the path (remove leading/trailing slashes and 'storage/' prefix if present)
    let path = image.image_path.replace(/^\/storage\//, '').replace(/^storage\//, '').replace(/\/$/, '');
    // Construct URL: baseUrl/storage/image_path/image_name
    const url = `${baseUrl}/storage/${path}/${image.image_name}`;
    return url;
  }
  
  // Try image_url attribute (if model provides it)
  if (image.image_url) {
    if (image.image_url.startsWith('http')) return image.image_url;
    return `${baseUrl}/${image.image_url.replace(/^\//, '')}`;
  }
  
  // Fallback: try other common fields
  const imgPath = image.url || image.path || image.image_path;
  if (!imgPath) return '';
  
  // If it's already a full URL, return it
  if (imgPath.startsWith('http')) return imgPath;
  
  // Otherwise construct relative URL
  return `${baseUrl}/${imgPath.replace(/^\//, '')}`;
};

const IssueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<BlockIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      // Reset failed images when issue changes
      setFailedImages(new Set());
      loadIssue();
    }
  }, [id]);

  const loadIssue = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await issueService.getIssueById(Number(id));
      setIssue(data);
    } catch (err: any) {
      setError(err.message || "Failed to load issue details");
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
      priorityStr = priority.btn_class || priority.label || priority.priority || '';
    } else {
      priorityStr = String(priority);
    }

    if (!priorityStr) return 'secondary';

    const lowerPriority = priorityStr.toLowerCase();
    
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

  const getPriorityLabel = (priority: any): string => {
    if (!priority) return '';
    if (typeof priority === 'string') return priority;
    if (typeof priority === 'object' && priority !== null) {
      return priority.label || priority.priority || '';
    }
    return String(priority);
  };

  const getStatusLabel = (status: any): string => {
    if (!status) return '';
    if (typeof status === 'string') return status;
    if (typeof status === 'object' && status !== null) {
      return status.name || status.label || '';
    }
    return String(status);
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
      case 'closed':
      case 'resolved':
      case 'completed':
        return 'success';
      case 'in progress':
      case 'in_progress':
        return 'warning';
      case 'open':
      case 'pending':
        return 'info';
      default:
        return 'secondary';
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
            <p className="mt-2 text-muted">Loading issue details...</p>
          </div>
        </div>
        <FooterTwo />
      </>
    );
  }

  if (error || !issue) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper">
          <div className="container">
            <div className="pt-3">
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error || "Issue not found"}
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
                <h4 className="mb-1">Issue Details</h4>
                <p className="mb-0 text-muted small">{issue.ref_no || `Issue #${issue.id}`}</p>
              </div>
              {issue.issue_status && (
                <span className={`badge bg-${getStatusColor(issue.issue_status)}`} style={{ fontSize: '14px' }}>
                  {getStatusLabel(issue.issue_status)}
                </span>
              )}
            </div>

            {/* Issue Information */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2" style={{ color: '#dc3545' }}></i>
                  Issue Information
                </h6>
                <div className="row g-3">
                  <div className="col-12">
                    <small className="text-muted d-block mb-1">Issue Description</small>
                    <div className="fw-bold">{issue.issue || issue.description || issue.title || 'No description provided'}</div>
                  </div>
                  {issue.ref_no && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Reference Number</small>
                      <div className="fw-bold">{issue.ref_no}</div>
                    </div>
                  )}
                  {issue.issue_status && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Status</small>
                      <div>
                        <span className={`badge bg-${getStatusColor(issue.issue_status)}`}>
                          {getStatusLabel(issue.issue_status) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                  {issue.priority && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Priority</small>
                      <div>
                        <span className={`badge bg-${getPriorityColor(issue.priority)}`}>
                          {getPriorityLabel(issue.priority) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                  {issue.issue_type && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Issue Type</small>
                      <div className="fw-bold">
                        {typeof issue.issue_type === 'object' ? issue.issue_type.name : issue.issue_type}
                      </div>
                    </div>
                  )}
                  {issue.issued_date_time && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Issued Date & Time</small>
                      <div className="fw-bold">{formatDate(issue.issued_date_time)}</div>
                    </div>
                  )}
                  {issue.created_at && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Created At</small>
                      <div className="fw-bold">{formatDate(issue.created_at)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            {(issue.block || issue.block_unit || issue.block_building) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-geo-alt me-2" style={{ color: '#28a745' }}></i>
                    Location Information
                  </h6>
                  <div className="row g-3">
                    {issue.block && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Block</small>
                        <div className="fw-bold">{issue.block.name || issue.block.block_name || `Block #${issue.block.id}`}</div>
                        {issue.block.address1 && (
                          <small className="text-muted">{issue.block.address1}</small>
                        )}
                      </div>
                    )}
                    {issue.block_building && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Building</small>
                        <div className="fw-bold">{issue.block_building.name || `Building #${issue.block_building.id}`}</div>
                      </div>
                    )}
                    {issue.block_unit && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Unit</small>
                        <div className="fw-bold">
                          {issue.block_unit.unit_no || issue.block_unit.unit_name || issue.block_unit.unit_code || `Unit #${issue.block_unit.id}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(issue.contact_name || issue.contact_mobile || issue.contact_email || issue.phone_number) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-person-lines-fill me-2" style={{ color: '#17a2b8' }}></i>
                    Contact Information
                  </h6>
                  <div className="row g-3">
                    {issue.contact_name && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">Contact Name</small>
                        <div className="fw-bold">{issue.contact_name}</div>
                      </div>
                    )}
                    {(issue.contact_mobile || issue.phone_number) && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Mobile</small>
                        <div className="fw-bold">
                          <a href={`tel:${issue.contact_mobile || issue.phone_number}`} className="text-decoration-none">
                            {issue.contact_mobile || issue.phone_number}
                          </a>
                        </div>
                      </div>
                    )}
                    {issue.contact_email && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Email</small>
                        <div className="fw-bold">
                          <a href={`mailto:${issue.contact_email}`} className="text-decoration-none">
                            {issue.contact_email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Preferred Time */}
            {(issue.preferred_start_date_time || issue.preferred_end_date_time) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-clock me-2" style={{ color: '#ffc107' }}></i>
                    Preferred Time
                  </h6>
                  <div className="row g-3">
                    {issue.preferred_start_date_time && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Preferred Start</small>
                        <div className="fw-bold">{formatDate(issue.preferred_start_date_time)}</div>
                      </div>
                    )}
                    {issue.preferred_end_date_time && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Preferred End</small>
                        <div className="fw-bold">{formatDate(issue.preferred_end_date_time)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {(issue.note_for_access || issue.comment) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-file-text me-2" style={{ color: '#6f42c1' }}></i>
                    Additional Notes
                  </h6>
                  {issue.note_for_access && (
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Note for Access</small>
                      <div>{issue.note_for_access}</div>
                    </div>
                  )}
                  {issue.comment && (
                    <div>
                      <small className="text-muted d-block mb-1">Comments</small>
                      <div>{issue.comment}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-images me-2" style={{ color: '#20c997' }}></i>
                    Photos ({issue.images.length})
                  </h6>
                  <div className="row g-2">
                    {issue.images.map((image: any, index: number) => {
                      const imageKey = image.id || `img-${index}`;
                      const hasFailed = failedImages.has(imageKey);
                      
                      if (hasFailed) {
                        console.log('Skipping failed image:', imageKey, image);
                        return null;
                      }
                      
                      const imageUrl = getImageUrl(image, AppConstants.baseUrl);
                      
                      if (!imageUrl) {
                        console.warn('No image URL found for image:', image);
                        return null;
                      }
                      
                      console.log('Rendering image:', imageKey, imageUrl, image);
                      
                      return (
                        <div key={imageKey} className="col-6 col-md-4">
                          <img
                            src={imageUrl}
                            alt={`Issue photo ${index + 1}`}
                            className="img-fluid rounded"
                            style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => window.open(imageUrl, '_blank')}
                            onError={(e) => {
                              // Prevent infinite loop by tracking failed images
                              const target = e.target as HTMLImageElement;
                              if (!failedImages.has(imageKey)) {
                                console.warn('Failed to load image:', imageUrl, 'Image data:', image);
                                setFailedImages(prev => new Set([...prev, imageKey]));
                                target.style.display = 'none';
                              }
                            }}
                            onLoad={() => {
                              console.log('Successfully loaded image:', imageUrl);
                            }}
                            loading="lazy"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Information */}
            {(issue.reportedBy || issue.assignedTo || issue.issuedBy || issue.creator) && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-people me-2" style={{ color: '#fd7e14' }}></i>
                    Assignment Information
                  </h6>
                  <div className="row g-3">
                    {issue.reportedBy && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Reported By</small>
                        <div className="fw-bold">
                          {issue.reportedBy.name || issue.reportedBy.email || `User #${issue.reportedBy.id}`}
                        </div>
                      </div>
                    )}
                    {issue.assignedTo && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Assigned To</small>
                        <div className="fw-bold">
                          {issue.assignedTo.name || issue.assignedTo.email || `User #${issue.assignedTo.id}`}
                        </div>
                      </div>
                    )}
                    {issue.issuedBy && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Issued By</small>
                        <div className="fw-bold">
                          {issue.issuedBy.name || issue.issuedBy.email || `User #${issue.issuedBy.id}`}
                        </div>
                      </div>
                    )}
                    {issue.creator && (
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Created By</small>
                        <div className="fw-bold">
                          {issue.creator.name || issue.creator.email || `User #${issue.creator.id}`}
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
                  {issue.created_at && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Created At</small>
                      <div className="fw-bold">{formatDate(issue.created_at)}</div>
                    </div>
                  )}
                  {issue.updated_at && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Last Updated</small>
                      <div className="fw-bold">{formatDate(issue.updated_at)}</div>
                    </div>
                  )}
                  {issue.is_mobile !== undefined && (
                    <div className="col-6">
                      <small className="text-muted d-block mb-1">Source</small>
                      <div>
                        <span className="badge bg-info">
                          {issue.is_mobile ? 'Mobile App' : 'Web Portal'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
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

export default IssueDetail;











