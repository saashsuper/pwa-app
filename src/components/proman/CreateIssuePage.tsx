import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import HeaderTwo from '../../layouts/headers/HeaderTwo';
import FooterTwo from '../../layouts/footers/FooterTwo';
import blockService, { Block, BlockUnit } from '../../services/blockService';
import issueService from '../../services/issueService';
import { useAuth } from '../../contexts/AuthContext';

const PRIORITIES = [
  { id: 1, name: 'Low' },
  { id: 2, name: 'Normal' },
  { id: 3, name: 'High' },
  { id: 4, name: 'Urgent' },
  { id: 5, name: 'Critical' },
];

const CreateIssuePage = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [block, setBlock] = useState<Block | null>(null);
  const [createData, setCreateData] = useState<{
    contact_methods: { id: number; name: string }[];
    issue_types: { id: number; name: string }[];
    property_managers: { id: number; name: string; email: string }[];
    users: { id: number; name: string; email: string }[];
  } | null>(null);
  const [createUnits, setCreateUnits] = useState<BlockUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    block_unit_id: '' as number | '',
    assigned_to: '',
    reported_by: '' as number | '',
    contact_method_id: '',
    priority_id: '2',
    issue_type: '',
    issue: '',
    issue_details: '',
    contact_details: '',
    images: [] as File[],
  });
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (blockId) {
      loadData();
    }
  }, [blockId]);

  const loadData = async () => {
    if (!blockId) return;
    setLoading(true);
    setError(null);
    try {
      const [blockData, createDataRes, unitsRes] = await Promise.all([
        blockService.getBlockById(parseInt(blockId)),
        issueService.getCreateData(),
        blockService.getUnitsByBlock(parseInt(blockId), { page: 1, per_page: 200 }),
      ]);
      setBlock(blockData);
      setCreateData(createDataRes);
      setCreateUnits(unitsRes.units ?? []);
      setForm((f) => ({
        ...f,
        reported_by: user?.id && (createDataRes.users ?? []).some((u: { id: number }) => u.id === user.id)
          ? user.id
          : f.reported_by,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhotoClick = () => {
    setShowPhotoSourceModal(true);
  };

  const handleUploadFromGallery = () => {
    setShowPhotoSourceModal(false);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setForm((f) => ({ ...f, images: [...f.images, ...Array.from(files)] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTakePhoto = async () => {
    setShowPhotoSourceModal(false);
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err: any) {
      setError('Unable to access camera: ' + (err.message || 'Permission denied'));
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
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
        setForm((f) => ({ ...f, images: [...f.images, file] }));
        stopCamera();
        setShowCameraModal(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  useEffect(() => {
    if (!showCameraModal) stopCamera();
  }, [showCameraModal]);

  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!block || !blockId) return;
    setSubmitting(true);
    setError(null);
    try {
      await issueService.createIssue({
        block_id: block.id,
        assigned_to: parseInt(form.assigned_to),
        reported_by: form.reported_by ? parseInt(String(form.reported_by)) : null,
        issue: form.issue.trim(),
        issue_type: form.issue_type,
        priority_id: parseInt(form.priority_id),
        contact_details: form.contact_details.trim(),
        contact_method_id: parseInt(form.contact_method_id),
        issue_details: form.issue_details.trim() || undefined,
        block_unit_id: form.block_unit_id ? parseInt(String(form.block_unit_id)) : null,
        images: form.images.length ? form.images : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/blocks/${blockId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderTwo />
        <div className="page-content-wrapper">
          <div className="container">
            <div className="pt-3 text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading form...</p>
            </div>
          </div>
        </div>
        <FooterTwo />
      </>
    );
  }

  if (error && !createData) {
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

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Issue
                  {block && (
                    <span className="text-muted fw-normal small ms-2">– {block.name}</span>
                  )}
                </h5>

                {error && (
                  <div className="alert alert-danger py-2 mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success py-2 mb-3">
                    <i className="bi bi-check-circle me-2"></i>
                    Issue created successfully! Redirecting...
                  </div>
                )}

                {createData && (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Unit <span className="text-muted">(optional – for common areas like hall, verandah, terrace)</span></label>
                        <select
                          className="form-select"
                          value={form.block_unit_id === '' ? '' : String(form.block_unit_id)}
                          onChange={(e) => setForm((f) => ({ ...f, block_unit_id: e.target.value ? Number(e.target.value) : '' }))}
                        >
                          <option value="">Common area (hall, verandah, terrace, etc.)</option>
                          {createUnits.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.unit_code || u.unit_name || `Unit #${u.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Assigned To <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          required
                          value={form.assigned_to}
                          onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
                        >
                          <option value="">Select Property Manager</option>
                          {createData.property_managers.map((pm) => (
                            <option key={pm.id} value={pm.id}>{pm.name} ({pm.email})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Reported By</label>
                        <select
                          className="form-select"
                          value={form.reported_by === '' ? '' : String(form.reported_by)}
                          onChange={(e) => setForm((f) => ({ ...f, reported_by: e.target.value ? Number(e.target.value) : '' }))}
                        >
                          <option value="">Select User</option>
                          {(createData.users ?? []).map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Contact Method <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          required
                          value={form.contact_method_id}
                          onChange={(e) => setForm((f) => ({ ...f, contact_method_id: e.target.value }))}
                        >
                          <option value="">Select</option>
                          {createData.contact_methods.map((cm) => (
                            <option key={cm.id} value={cm.id}>{cm.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Priority <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          required
                          value={form.priority_id}
                          onChange={(e) => setForm((f) => ({ ...f, priority_id: e.target.value }))}
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Issue Type <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          required
                          value={form.issue_type}
                          onChange={(e) => setForm((f) => ({ ...f, issue_type: e.target.value }))}
                        >
                          <option value="">Select Category</option>
                          {createData.issue_types.map((it) => (
                            <option key={it.id} value={it.name}>
                              {it.name.charAt(0).toUpperCase() + it.name.slice(1).replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Problem Overview <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          maxLength={255}
                          placeholder="Brief description of the issue"
                          value={form.issue}
                          onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Issue Details</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          placeholder="Describe the issue in detail..."
                          value={form.issue_details}
                          onChange={(e) => setForm((f) => ({ ...f, issue_details: e.target.value }))}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Contact Details <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          maxLength={500}
                          placeholder="Email, phone, or other contact info"
                          value={form.contact_details}
                          onChange={(e) => setForm((f) => ({ ...f, contact_details: e.target.value }))}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Images</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/gif"
                          multiple
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary w-100 py-3"
                          onClick={handleAddPhotoClick}
                          disabled={submitting}
                        >
                          <i className="bi bi-camera me-2"></i>
                          Add Photos
                        </button>
                        <small className="text-muted d-block mt-1">Upload from gallery or take a photo. JPEG, PNG, GIF. Max 2MB each.</small>
                        {form.images.length > 0 && (
                          <div className="row g-2 mt-2">
                            {form.images.map((file, index) => (
                              <div key={index} className="col-4 col-md-3">
                                <div className="position-relative">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    className="img-fluid rounded border"
                                    style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                    onClick={() => removeImage(index)}
                                    style={{ padding: '2px 6px' }}
                                    aria-label="Remove"
                                  >
                                    <i className="bi bi-x"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-12 pt-2">
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={submitting || success}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-plus-lg me-1"></i>
                              Create Issue
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="pb-3"></div>
          </div>
        </div>
      </div>

      {/* Photo Source Selection Modal */}
      {showPhotoSourceModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          onClick={() => setShowPhotoSourceModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
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
                  disabled={submitting}
                />
              </div>
              <div className="modal-body">
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-lg"
                    onClick={handleUploadFromGallery}
                    disabled={submitting}
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
                    disabled={submitting}
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
                  disabled={submitting}
                />
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
                  disabled={submitting}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={capturePhoto}
                  disabled={!cameraStream || submitting}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm" role="status" />
                  ) : (
                    <i className="bi bi-camera-fill" style={{ fontSize: '1.5rem' }}></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FooterTwo />
    </>
  );
};

export default CreateIssuePage;
