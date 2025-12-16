import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../common/ConfirmModal";
import AppConstants from "../../config/constants";
import api from "../../services/api";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const isJobCompleted = (): boolean => {
    if (!workOrder?.job_status) return false;
    const jobStatus = workOrder.job_status;
    if (typeof jobStatus === 'string') {
      return jobStatus.toLowerCase() === 'completed';
    }
    if (typeof jobStatus === 'object' && jobStatus !== null && 'name' in jobStatus) {
      return jobStatus.name?.toLowerCase() === 'completed';
    }
    return false;
  };

  const canManagePhotos = (): boolean => {
    return !isJobCompleted();
  };

  const canDeletePhoto = (photo: any): boolean => {
    if (!canManagePhotos()) return false;
    if (!user) return false;
    
    // User can delete if they created it
    if (photo.created_by === user.id) return true;
    
    // Contractor Admin can delete any photo from their team's work orders
    const userType = user.user_type;
    if (userType && typeof userType === 'object' && userType.name === 'Contractor Admin') {
      return true;
    }
    
    return false;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await uploadFiles(Array.from(files));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!id || uploading || !canManagePhotos() || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('photos[]', file);
      });

      const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setWorkOrder(response.data.data);
        setShowPhotoSourceModal(false);
        setShowCameraModal(false);
        stopCamera();
      } else {
        throw new Error(response.data.message || 'Failed to upload photos');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhotoClick = () => {
    setShowPhotoSourceModal(true);
  };

  const handleUploadFromGallery = () => {
    setShowPhotoSourceModal(false);
    fileInputRef.current?.click();
  };

  const handleTakePhoto = async () => {
    setShowPhotoSourceModal(false);
    setShowCameraModal(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setError('Unable to access camera: ' + (err.message || 'Permission denied'));
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        uploadFiles([file]);
      }
    }, 'image/jpeg', 0.9);
  };

  // Cleanup camera when modal closes
  useEffect(() => {
    if (!showCameraModal) {
      stopCamera();
    }
  }, [showCameraModal]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const response = await api.delete<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/photos/${photoToDelete}`
      );

      if (response.data.success) {
        setWorkOrder(response.data.data);
        setPhotoToDelete(null);
      } else {
        throw new Error(response.data.message || 'Failed to delete photo');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete photo");
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const getImageUrl = (image: any): string => {
    if (image.url) return image.url;
    if (image.image_path && image.image_name) {
      return `${AppConstants.baseUrl}/storage/${image.image_path}/${image.image_name}`;
    }
    return '';
  };

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr.toString();
    }
  };

  const currentPhotoCount = workOrder?.images?.length || 0;
  const maxPhotos = 6;
  const canAddMore = canManagePhotos() && currentPhotoCount < maxPhotos;

  if (loading) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading photos...</p>
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
            <div className="pt-3">
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
              <button className="btn btn-primary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2"></i>
                Go Back
              </button>
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
                  onClick={() => navigate(`/work-order/${id}`)}
                  style={{ textDecoration: 'none' }}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Work Order
                </button>
                <h4 className="mb-1">Work Order Photos</h4>
                {workOrder && (
                  <p className="mb-0 text-muted small">
                    Work Order {workOrder.ref_no || `#${workOrder.id}`}
                  </p>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                {workOrder?.images && workOrder.images.length > 0 && (
                  <span className="badge bg-info" style={{ fontSize: '14px' }}>
                    {workOrder.images.length} {workOrder.images.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                )}
                {canAddMore && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleAddPhotoClick}
                      disabled={uploading}
                      style={{
                        borderRadius: '8px',
                        padding: '8px 16px',
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
                          <i className="bi bi-camera me-2"></i>
                          Add Photos ({maxPhotos - currentPhotoCount} remaining)
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
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

            {/* Photos Grid */}
            {workOrder?.images && workOrder.images.length > 0 ? (
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-images me-2" style={{ color: AppConstants.primaryColor }}></i>
                    All Photos
                  </h6>
                  <div className="row g-3">
                    {workOrder.images.map((image) => {
                      const imageUrl = getImageUrl(image);
                      const canDelete = canDeletePhoto(image);
                      const isDeleting = deletingPhotoId === image.id;
                      
                      return (
                        <div key={image.id} className="col-6 col-md-4">
                          <div className="card position-relative" style={{ opacity: isDeleting ? 0.5 : 1 }}>
                            <div
                              style={{
                                width: '100%',
                                paddingTop: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer'
                              }}
                              onClick={() => setSelectedImage(imageUrl)}
                            >
                              <img
                                src={imageUrl}
                                alt={`Photo ${image.id}`}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #999;"><i class="bi bi-image" style="font-size: 2rem;"></i></div>';
                                  }
                                }}
                              />
                            </div>
                            <div className="card-body p-2">
                              {image.creator && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-person me-1"></i>
                                  {image.creator.name || image.creator.email || 'Unknown'}
                                </small>
                              )}
                              {image.created_at && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-clock me-1"></i>
                                  {formatDate(image.created_at)}
                                </small>
                              )}
                              {canDelete && (
                                <button
                                  className="btn btn-sm btn-outline-danger w-100 mt-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhotoClick(image.id);
                                  }}
                                  disabled={isDeleting}
                                  title="Delete photo"
                                >
                                  {isDeleting ? (
                                    <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }}></span>
                                  ) : (
                                    <>
                                      <i className="bi bi-trash me-1"></i>
                                      Delete
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
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
                  <p className="text-muted mt-3 mb-0">No photos available for this work order</p>
                  {canAddMore && (
                    <button
                      className="btn btn-primary mt-3"
                      onClick={handleAddPhotoClick}
                      disabled={uploading}
                    >
                      <i className="bi bi-camera me-2"></i>
                      Add First Photo
                    </button>
                  )}
                </div>
              </div>
            )}

            {!canManagePhotos() && (
              <div className="alert alert-info mt-3">
                <i className="bi bi-info-circle me-2"></i>
                Photos cannot be added or deleted for completed work orders.
              </div>
            )}

            <div className="pb-3"></div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.9)' }} 
          tabIndex={-1}
          onClick={() => setSelectedImage(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedImage(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-0">
                <img
                  src={selectedImage}
                  alt="Full size"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Source Selection Modal */}
      {showPhotoSourceModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          tabIndex={-1}
          onClick={() => setShowPhotoSourceModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-camera me-2"></i>
                  Add Photo
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
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-lg"
                    onClick={handleUploadFromGallery}
                    disabled={uploading}
                    style={{ textAlign: 'left', padding: '1rem' }}
                  >
                    <i className="bi bi-images me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <div className="fw-bold">Upload from Gallery</div>
                      <small className="text-muted">Choose photos from your device</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-lg"
                    onClick={handleTakePhoto}
                    disabled={uploading}
                    style={{ textAlign: 'left', padding: '1rem' }}
                  >
                    <i className="bi bi-camera-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <div className="fw-bold">Take Photo</div>
                      <small className="text-muted">Use your camera to capture a photo</small>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.9)' }} 
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
            <div className="modal-content bg-dark">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">
                  <i className="bi bi-camera me-2"></i>
                  Take Photo
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    stopCamera();
                    setShowCameraModal(false);
                  }}
                  aria-label="Close"
                  disabled={uploading}
                ></button>
              </div>
              <div className="modal-body p-0 position-relative" style={{ minHeight: '400px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {!cameraStream && (
                  <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading camera...</span>
                    </div>
                    <p className="mt-2">Starting camera...</p>
                  </div>
                )}
              </div>
              <div className="modal-footer border-secondary justify-content-center">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    stopCamera();
                    setShowCameraModal(false);
                  }}
                  disabled={uploading}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={capturePhoto}
                  disabled={!cameraStream || uploading}
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {uploading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <i className="bi bi-camera-fill" style={{ fontSize: '1.5rem' }}></i>
                  )}
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
