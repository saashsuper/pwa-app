import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";

const WorkOrderPhotos = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const handleTakePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleUploadFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // TODO: Implement photo upload API call
      console.log('Uploading photos:', Array.from(files).map(f => f.name));
      // After successful upload, reload work order to show new photos
      await loadWorkOrder();
    } catch (err: any) {
      setError(err.message || "Failed to upload photos");
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

          {/* Action Buttons */}
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="mb-3">Add Photos</h6>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleTakePhoto}
                  style={{ borderRadius: '8px', padding: '15px' }}
                >
                  <i className="bi bi-camera-fill me-2"></i>
                  Take Photo
                </button>
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={handleUploadFromGallery}
                  style={{ borderRadius: '8px', padding: '15px' }}
                >
                  <i className="bi bi-images me-2"></i>
                  Upload from Gallery
                </button>
              </div>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {/* Existing Photos */}
          {workOrder?.images && workOrder.images.length > 0 ? (
            <div className="card">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-images me-2" style={{ color: '#20c997' }}></i>
                  Existing Photos ({workOrder.images.length})
                </h6>
                <div className="row g-3">
                  {workOrder.images.map((image: any, index: number) => (
                    <div key={index} className="col-6 col-md-4">
                      <div className="position-relative">
                        <img
                          src={image.image_url || image.path || image.url || '#'}
                          alt={`Photo ${index + 1}`}
                          className="img-fluid rounded"
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            // TODO: Open image in fullscreen/modal view
                            window.open(image.image_url || image.path || image.url, '_blank');
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-image" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                <p className="text-muted mt-3 mb-0">No photos added yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <FooterTwo />
    </>
  );
};

export default WorkOrderPhotos;


