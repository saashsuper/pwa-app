import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../common/ConfirmModal";

interface NoteEntry {
  id: number | string;
  note?: string;
  content?: string;
  note_type?: string;
  created_at?: string;
  timestamp?: string;
  created_by?: number;
  creator?: {
    id: number;
    name?: string;
    email?: string;
  };
}

const WorkOrderNotes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

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
      parseNotes(data);
    } catch (err: any) {
      setError(err.message || "Failed to load work order");
    } finally {
      setLoading(false);
    }
  };

  const parseNotes = (workOrder: WorkOrder) => {
    const noteEntries: NoteEntry[] = [];
    
    // First, add notes from the new notes table (individual notes)
    if (workOrder.notes && Array.isArray(workOrder.notes)) {
      workOrder.notes.forEach((note) => {
        noteEntries.push({
          id: note.id,
          note: note.note,
          content: note.note,
          note_type: note.note_type || 'note',
          created_at: note.created_at,
          timestamp: note.created_at,
          created_by: note.created_by,
          creator: note.creator,
        });
      });
    }
    
    // Keep backward compatibility: parse notes from comment field (legacy notes)
    if (workOrder.comment) {
      const lines = workOrder.comment.split('\n');
      let currentNote = '';
      let currentTimestamp = '';

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        const timestampMatch = trimmedLine.match(/^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\]\s*(.*)$/);
        
        if (timestampMatch) {
          if (currentNote) {
            noteEntries.push({
              id: `legacy-note-${noteEntries.length}`,
              timestamp: currentTimestamp,
              content: currentNote.trim()
            });
          }
          currentTimestamp = timestampMatch[1];
          currentNote = timestampMatch[2];
        } else if (trimmedLine) {
          if (currentNote) {
            currentNote += '\n' + trimmedLine;
          } else {
            currentNote = trimmedLine;
          }
        }
      });

      if (currentNote) {
        noteEntries.push({
          id: `legacy-note-${noteEntries.length}`,
          timestamp: currentTimestamp,
          content: currentNote.trim()
        });
      }
    }

    // Also check note field (backward compatibility)
    if (workOrder.note) {
      noteEntries.push({
        id: `legacy-single-note-${noteEntries.length}`,
        content: workOrder.note.trim()
      });
    }

    // Also check note_for_access (backward compatibility)
    if (workOrder.note_for_access) {
      noteEntries.push({
        id: `legacy-access-note-${noteEntries.length}`,
        content: `Note for Access: ${workOrder.note_for_access.trim()}`
      });
    }

    // Sort by created_at or timestamp (most recent first)
    noteEntries.sort((a, b) => {
      const dateA = a.created_at || a.timestamp || '';
      const dateB = b.created_at || b.timestamp || '';
      return dateB.localeCompare(dateA);
    });
    
    setNotes(noteEntries);
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

  const canDeleteNote = (note: NoteEntry): boolean => {
    if (!user || !note) return false;
    
    // Cannot delete if job is completed
    if (isJobCompleted()) return false;
    
    // Legacy notes (from comment/note fields) cannot be deleted
    if (typeof note.id === 'string' && note.id.startsWith('legacy-')) {
      return false;
    }
    
    // Pause reasons cannot be deleted (they are tied to job status changes)
    if (note.note_type === 'pause_reason') {
      return false;
    }
    
    // User can delete if they created it
    if (note.created_by === user.id) return true;
    
    // Contractor Admin can delete any note from their team
    const userType = user.user_type;
    if (userType && typeof userType === 'object' && userType.name === 'Contractor Admin') {
      return true;
    }
    
    return false;
  };

  const handleDeleteNoteClick = (noteId: number) => {
    if (!id || deletingNoteId) return;
    setNoteToDelete(noteId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteNote = async () => {
    if (!id || !noteToDelete || deletingNoteId) return;

    setDeletingNoteId(noteToDelete);
    setError("");
    setShowDeleteConfirm(false);

    try {
      const updatedWorkOrder = await workOrderService.deleteNote(Number(id), noteToDelete);
      setWorkOrder(updatedWorkOrder);
      parseNotes(updatedWorkOrder);
      setNoteToDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete note");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleAddNoteClick = () => {
    if (!id || isJobCompleted()) return;
    setNewNote("");
    setError("");
    setShowAddNoteModal(true);
  };

  const handleAddNote = async () => {
    if (!id || addingNote || !newNote.trim()) {
      setError("Please enter a note");
      return;
    }

    setAddingNote(true);
    setError("");

    try {
      const updatedWorkOrder = await workOrderService.addNote(Number(id), newNote.trim());
      setWorkOrder(updatedWorkOrder);
      parseNotes(updatedWorkOrder);
      setShowAddNoteModal(false);
      setNewNote("");
    } catch (err: any) {
      setError(err.message || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
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
      return dateStr;
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
            <p className="mt-2 text-muted">Loading notes...</p>
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
                <h4 className="mb-1">Work Order Notes</h4>
                {workOrder && (
                  <p className="mb-0 text-muted small">
                    Work Order {workOrder.ref_no || `#${workOrder.id}`}
                  </p>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                {notes.length > 0 && (
                  <span className="badge bg-info" style={{ fontSize: '14px' }}>
                    {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
                  </span>
                )}
                {!isJobCompleted() && (
                  <button
                    className="btn btn-primary"
                    onClick={handleAddNoteClick}
                    style={{
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: '500'
                    }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Note
                  </button>
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

            {/* Notes List */}
            {notes.length > 0 ? (
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-journal-text me-2" style={{ color: '#17a2b8' }}></i>
                    All Notes
                  </h6>
                  <div className="list-group list-group-flush">
                    {notes.map((note, index) => {
                      const canDelete = canDeleteNote(note);
                      const isDeleting = deletingNoteId === note.id && typeof note.id === 'number';
                      const timestamp = note.created_at || note.timestamp;
                      const noteContent = note.note || note.content || '';
                      const isLegacy = typeof note.id === 'string' && note.id.startsWith('legacy-');
                      const isPauseReason = note.note_type === 'pause_reason';
                      // Extract the actual reason text (remove "Pause Reason: " prefix if present)
                      const displayContent = isPauseReason && noteContent.startsWith('Pause Reason: ')
                        ? noteContent.replace(/^Pause Reason:\s*/, '')
                        : noteContent;
                      
                      return (
                        <div
                          key={note.id || index}
                          className="list-group-item px-0 py-3 border-bottom position-relative"
                          style={{ 
                            borderLeft: `4px solid ${isPauseReason ? '#ffc107' : '#17a2b8'}`,
                            backgroundColor: isPauseReason ? 'rgba(255, 193, 7, 0.05)' : 'transparent',
                            opacity: isDeleting ? 0.5 : 1
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                {isPauseReason && (
                                  <span className="badge bg-warning text-dark">
                                    <i className="bi bi-pause-circle me-1"></i>
                                    Pause Reason
                                  </span>
                                )}
                                {timestamp && (
                                  <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {formatDate(timestamp)}
                                  </small>
                                )}
                              </div>
                              {note.creator && (
                                <small className="text-muted d-block mb-1">
                                  <i className="bi bi-person me-1"></i>
                                  Added by {note.creator.name || note.creator.email || 'Unknown'}
                                </small>
                              )}
                              {isLegacy && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-info-circle me-1"></i>
                                  Legacy note
                                </small>
                              )}
                            </div>
                            {canDelete && (
                              <button
                                className="btn btn-sm btn-outline-danger ms-2"
                                style={{ minWidth: '32px', height: '32px', padding: 0 }}
                                onClick={() => {
                                  if (typeof note.id === 'number' && !isDeleting) {
                                    handleDeleteNoteClick(note.id);
                                  }
                                }}
                                disabled={isDeleting}
                                title="Delete note"
                              >
                                {isDeleting ? (
                                  <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }}></span>
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
                              </button>
                            )}
                          </div>
                          <div 
                            className="text-break"
                            style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                          >
                            {displayContent}
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
                  <i className="bi bi-journal-x" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                  <p className="text-muted mt-3 mb-0">No notes available for this work order</p>
                  <div className="d-flex gap-2 justify-content-center mt-3">
                    {!isJobCompleted() && (
                      <button
                        className="btn btn-primary"
                        onClick={handleAddNoteClick}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add First Note
                      </button>
                    )}
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/work-order/${id}`)}
                    >
                      Go Back to Work Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-journal-plus me-2" style={{ color: '#0d6efd' }}></i>
                  Add Note
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddNoteModal(false);
                    setNewNote("");
                    setError("");
                  }}
                  aria-label="Close"
                  disabled={addingNote}
                ></button>
              </div>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError("")}
                      aria-label="Close"
                    ></button>
                  </div>
                )}
                <p className="mb-3">Add a note to this work order:</p>
                <div className="mb-3">
                  <label htmlFor="newNote" className="form-label">Note *</label>
                  <textarea
                    id="newNote"
                    className="form-control"
                    rows={6}
                    placeholder="Enter your note here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    maxLength={5000}
                    style={{ resize: 'vertical' }}
                    disabled={addingNote}
                  />
                  <small className="text-muted">
                    {newNote.length}/5000 characters
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddNoteModal(false);
                    setNewNote("");
                    setError("");
                  }}
                  disabled={addingNote}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                >
                  {addingNote ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Add Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Note Confirmation Modal */}
      <ConfirmModal
        show={showDeleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleDeleteNote}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setNoteToDelete(null);
        }}
        isProcessing={deletingNoteId !== null}
      />
      
      <FooterTwo />
    </>
  );
};

export default WorkOrderNotes;

