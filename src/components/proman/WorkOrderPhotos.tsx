import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";
import AppConstants from "../../config/constants";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../common/ConfirmModal";

const MAX_PHOTOS = 6;

const WorkOrderPhotos = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      setError(err.message || "Failed to load work order");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhotosClick = () => {
    setShowPhotoSourceModal(true);
  };

  const handleGalleryClick = () => {
    setShowPhotoSourceModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCameraClick = () => {
    setShowPhotoSourceModal(false);
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !id || uploading) return;

    const fileArray = Array.from(files);
    const currentPhotoCount = workOrder?.images?.length || 0;
    const totalPhotos = currentPhotoCount + fileArray.length;

    // Check if adding these photos would exceed the limit
    if (totalPhotos > MAX_PHOTOS) {
      const allowed = MAX_PHOTOS - currentPhotoCount;
      setError(`Maximum ${MAX_PHOTOS} photos allowed. You can add ${allowed} more photo(s).`);
      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    setError("");

    try {
      const updatedWorkOrder = await workOrderService.uploadPhotos(Number(id), fileArray);
      setWorkOrder(updatedWorkOrder);
      
      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload photos");
      // Reset file inputs on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const getCurrentPhotoCount = (): number => {
    return workOrder?.images?.length || 0;
  };

  const canAddMorePhotos = (): boolean => {
    return getCurrentPhotoCount() < MAX_PHOTOS;
  };

  const getRemainingPhotoCount = (): number => {
    return MAX_PHOTOS - getCurrentPhotoCount();
  };

  const isJobCompleted = (): boolean => {
    if (!workOrder?.job_status) return false;
    const jobStatus = workOrder.job_status;
    if (typeof jobStatus === 'string') {
      return jobStatus.toLowerCase() === 'completed';
    }
    if (typeof jobStatus === 'object' && jobStatus.name) {
      return jobStatus.name.toLowerCase() === 'completed';
    }
    return false;
  };

  const canDeletePhoto = (image: any): boolean => {
    if (!user || !image) return false;
    
    // Cannot delete if job is completed
    if (isJobCompleted()) return false;
    
    // User can delete if they created it
    if (image.created_by === user.id) return true;
    
    // Contractor Admin can delete any photo from their team
    // (Backend will verify they're in the same contract company)
    const userType = user.user_type;
    if (userType && typeof userType === 'object' && userType.name === 'Contractor Admin') {
      return true;
    }
    
    return false;
  };

  const handleDeletePhotoClick = (photoId: number) => {
    if (!id || deletingPhotoId) return;
    setPhotoToDelete(photoId);
    setShowDeleteConfirm(true);
  };

  const handleDeletePhoto = async () => {
    if (!id || !photoToDelete || deletingPhotoId) return;

    setDeletingPhotoId(photoToDelete);
    setError("");
    setShowDeleteConfirm(false);

    try {
      const updatedWorkOrder = await workOrderService.deletePhoto(Number(id), photoToDelete);
      setWorkOrder(updatedWorkOrder);
      setPhotoToDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete photo");
    } finally {
      setDeletingPhotoId(null);
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
          </div>
        </div>
        <FooterTwo />
      </>
    );
  }

  if (error && !workOrder) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper">
          <div className="container">
            <div className="alert alert-danger">{error}</div>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
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
          <div className="mb-4">
            <button
              className="btn btn-link p-0 mb-2"
              onClick={() => navigate(-1)}
              style={{ textDecoration: 'none' }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Work Order
            </button>
            <h4 className="mb-0">Work Order Photos</h4>
            {workOrder && (
              <small className="text-muted">Work Order #{workOrder.ref_no || id}</small>
            )}
          </div>

          {error && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Add Photos Button */}
          {canAddMorePhotos() && (
            <div className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">
                      <i className="bi bi-camera me-2" style={{ color: AppConstants.primaryColor }}></i>
                      Add Photos
                    </h6>
                    <small className="text-muted">
                      {getCurrentPhotoCount()}/{MAX_PHOTOS} photos uploaded. You can add {getRemainingPhotoCount()} more.
                    </small>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddPhotosClick}
                    disabled={uploading}
                    style={{
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontWeight: '500'
                    }}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Photos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Photo Limit Reached Message */}
          {!canAddMorePhotos() && (
            <div className="alert alert-info mb-3">
              <i className="bi bi-info-circle me-2"></i>
              Maximum {MAX_PHOTOS} photos reached for this work order.
            </div>
          )}

          {/* Hidden File Input for Gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading || !canAddMorePhotos()}
          />

          {/* Hidden File Input for Camera - Opens phone camera directly */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading || !canAddMorePhotos()}
          />

          {/* Existing Photos as Thumbnails */}
          {workOrder?.images && workOrder.images.length > 0 ? (
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <i className="bi bi-images me-2" style={{ color: '#20c997' }}></i>
                    Photos ({workOrder.images.length}/{MAX_PHOTOS})
                  </h6>
                  <span className="badge bg-primary">
                    {workOrder.images.length} {workOrder.images.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                </div>
                <div className="row g-3">
                  {workOrder.images.map((image: any, index: number) => {
                    const getImageUrl = () => {
                      if (typeof image === 'string') {
                        return image.startsWith('http') ? image : `${AppConstants.baseUrl}/${image.replace(/^\//, '')}`;
                      }
                      
                      // Check if image_url is already available (from model accessor)
                      if (image.image_url) {
                        // If it's already a full URL, return it
                        if (image.image_url.startsWith('http')) {
                          return image.image_url;
                        }
                        // Otherwise prepend baseUrl
                        return `${AppConstants.baseUrl}/${image.image_url.replace(/^\//, '')}`;
                      }
                      
                      // Construct URL from image_path and image_name as fallback
                      const imagePath = image.image_path || image.path;
                      const imageName = image.image_name || image.name;
                      
                      if (imagePath && imageName) {
                        return `${AppConstants.baseUrl}/storage/${imagePath}/${imageName}`;
                      }
                      
                      // Final fallback to url or path
                      const imgPath = image.url || image.path;
                      if (!imgPath) return '';
                      if (imgPath.startsWith('http')) return imgPath;
                      
                      return `${AppConstants.baseUrl}/${imgPath.replace(/^\//, '')}`;
                    };
                    const imageUrl = getImageUrl();
                    if (!imageUrl) return null;
                    const canDelete = canDeletePhoto(image);
                    const isDeleting = deletingPhotoId === image.id;
                    return (
                      <div key={image.id || index} className="col-6 col-md-4 col-lg-3">
                        <div className="position-relative">
                          <img
                            src={imageUrl}
                            alt={`Work order photo ${index + 1}`}
                            className="img-fluid rounded shadow-sm"
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              opacity: isDeleting ? 0.5 : 1
                            }}
                            onClick={() => !isDeleting && window.open(imageUrl, '_blank')}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/assets/img/demo-img/default-image.jpg';
                            }}
                            onMouseEnter={(e) => {
                              if (!isDeleting) {
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          />
                          <div 
                            className="position-absolute top-0 end-0 m-2"
                            style={{
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              borderRadius: '50%',
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            {index + 1}
                          </div>
                          {canDelete && (
                            <button
                              className="btn btn-danger btn-sm position-absolute top-0 start-0 m-2"
                              style={{
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (image.id && !isDeleting) {
                                  handleDeletePhotoClick(image.id);
                                }
                              }}
                              disabled={isDeleting}
                              title="Delete photo"
                            >
                              {isDeleting ? (
                                <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }}></span>
                              ) : (
                                <i className="bi bi-trash" style={{ fontSize: '14px' }}></i>
                              )}
                            </button>
                          )}
                          {image.creator && (
                            <div 
                              className="position-absolute bottom-0 start-0 m-2"
                              style={{
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '10px',
                                color: 'white',
                                maxWidth: 'calc(100% - 80px)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={`Added by ${image.creator.name || image.creator.email || 'Unknown'}`}
                            >
                              {image.creator.name || image.creator.email || 'Unknown'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-images" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                <p className="text-muted mt-3 mb-0">No photos added yet</p>
                {canAddMorePhotos() && (
                  <p className="text-muted small mb-0">Click "Add Photos" button above to add photos</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Photo Source Selection Modal */}
      {showPhotoSourceModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-camera me-2" style={{ color: AppConstants.primaryColor }}></i>
                  Add Photos
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPhotoSourceModal(false)}
                  aria-label="Close"
                  disabled={uploading}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-4 text-center">
                  Choose how you want to add photos:
                </p>
                <div className="row g-3">
                  {/* Gallery Option */}
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center p-4"
                      onClick={handleGalleryClick}
                      disabled={uploading || !canAddMorePhotos()}
                      style={{
                        borderRadius: '12px',
                        borderWidth: '2px',
                        fontSize: '16px',
                        fontWeight: '500',
                        minHeight: '80px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!uploading && canAddMorePhotos()) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="text-center">
                        <i className="bi bi-images" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                        <div className="fw-bold">Gallery</div>
                        <small className="text-muted d-block mt-1">Select from your photos</small>
                      </div>
                    </button>
                  </div>

                  {/* Camera Option */}
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center p-4"
                      onClick={handleCameraClick}
                      disabled={uploading || !canAddMorePhotos()}
                      style={{
                        borderRadius: '12px',
                        borderWidth: '2px',
                        fontSize: '16px',
                        fontWeight: '500',
                        minHeight: '80px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!uploading && canAddMorePhotos()) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="text-center">
                        <i className="bi bi-camera-fill" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                        <div className="fw-bold">Camera</div>
                        <small className="text-muted d-block mt-1">Take a new photo</small>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Photo Limit Info */}
                <div className="alert alert-info mt-3 mb-0" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  <small>
                    You can add {getRemainingPhotoCount()} more photo{getRemainingPhotoCount() !== 1 ? 's' : ''} 
                    ({getCurrentPhotoCount()}/{MAX_PHOTOS} used)
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPhotoSourceModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Photo Confirmation Modal */}
      <ConfirmModal
        show={showDeleteConfirm}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleDeletePhoto}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setPhotoToDelete(null);
        }}
        isProcessing={deletingPhotoId !== null}
      />
      
      <FooterTwo />
    </>
  );
};

export default WorkOrderPhotos;


