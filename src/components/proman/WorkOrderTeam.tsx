import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import workOrderService, { WorkOrder } from "../../services/workOrderService";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../common/ConfirmModal";
import AppConstants from "../../config/constants";
import api from "../../services/api";

interface TeamMember {
  id: number | string; // Can be numeric ID from table or string like 'contractor-123', 'admin-456'
  user: {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    user_type?: {
      id: number;
      name: string;
    };
  };
  role?: string;
  is_lead?: boolean;
  added_by?: number;
  addedBy?: {
    id: number;
    name?: string;
    email?: string;
  };
}

interface AvailableUser {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  user_type?: {
    id: number;
    name: string;
  };
}

const WorkOrderTeam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<number | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [addingMemberId, setAddingMemberId] = useState<number | null>(null);
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkOrder();
      loadTeamMembers();
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

  const loadTeamMembers = async () => {
    if (!id) return;
    setError("");
    try {
      const response = await api.get<{ success: boolean; data: TeamMember[] }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/team`
      );
      
      if (response.data.success) {
        setTeamMembers(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load team members");
    }
  };

  const loadAvailableUsers = async () => {
    if (!id || !user) return;
    setLoadingAvailableUsers(true);
    try {
      const response = await api.get<{ success: boolean; data: AvailableUser[] }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/team/available-users`
      );
      
      if (response.data.success) {
        // Backend already filters out existing team members
        setAvailableUsers(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load available users");
    } finally {
      setLoadingAvailableUsers(false);
    }
  };

  const handleAddMemberClick = async () => {
    await loadAvailableUsers();
    setShowAddMemberModal(true);
  };

  const handleAddMember = async (userId: number) => {
    if (!id || addingMemberId) return;
    
    setAddingMemberId(userId);
    setError("");
    
    try {
      const response = await api.post<{ success: boolean; message: string; data: TeamMember[] }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/team`,
        { user_id: userId }
      );
      
      if (response.data.success) {
        setTeamMembers(response.data.data);
        setShowAddMemberModal(false);
        // Reload available users to exclude the newly added one
        await loadAvailableUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add team member");
    } finally {
      setAddingMemberId(null);
    }
  };

  const handleRemoveMemberClick = (memberId: number | string) => {
    // Only allow removing numeric IDs (from team table), not string IDs like 'contractor-123' or 'admin-456'
    if (typeof memberId === 'string') {
      return; // Cannot remove contractor or admin (they are leads)
    }
    setMemberToRemove(memberId);
    setShowRemoveConfirm(true);
  };

  const handleRemoveMember = async () => {
    if (!id || !memberToRemove || removingMemberId) return;
    
    setRemovingMemberId(memberToRemove);
    setError("");
    setShowRemoveConfirm(false);
    
    try {
      const response = await api.delete<{ success: boolean; message: string; data: TeamMember[] }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/team/${memberToRemove}`
      );
      
      if (response.data.success) {
        setTeamMembers(response.data.data);
        setMemberToRemove(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove team member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const isContractorAdmin = (): boolean => {
    if (!user?.user_type) return false;
    return user.user_type.name === 'Contractor Admin';
  };

  const canManageTeam = (): boolean => {
    return isContractorAdmin();
  };

  const canRemoveMember = (member: TeamMember): boolean => {
    if (!canManageTeam()) return false;
    // Cannot remove the primary contractor or admin (is_lead or string IDs)
    if (member.is_lead) return false;
    if (typeof member.id === 'string') return false; // Contractor and admin have string IDs
    // Can only remove members from same contract company
    // (This will be checked on backend)
    return true;
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
            <p className="mt-2 text-muted">Loading team members...</p>
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
                <h4 className="mb-1">My Team</h4>
                {workOrder && (
                  <p className="mb-0 text-muted small">
                    Work Order {workOrder.ref_no || `#${workOrder.id}`}
                  </p>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                {teamMembers.length > 0 && (
                  <span className="badge bg-info" style={{ fontSize: '14px' }}>
                    {teamMembers.length} {teamMembers.length === 1 ? 'Member' : 'Members'}
                  </span>
                )}
                {canManageTeam() && (
                  <button
                    className="btn btn-primary"
                    onClick={handleAddMemberClick}
                    style={{
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: '500'
                    }}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Add Member
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

            {/* Team Members List */}
            {teamMembers.length > 0 ? (
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-people me-2" style={{ color: '#20c997' }}></i>
                    Team Members
                  </h6>
                  <div className="list-group list-group-flush">
                    {teamMembers.map((member) => {
                      const canRemove = canRemoveMember(member);
                      const isRemoving = removingMemberId === member.id;
                      
                      return (
                        <div
                          key={member.id}
                          className="list-group-item px-0 py-3 border-bottom position-relative"
                          style={{
                            borderLeft: member.is_lead ? '4px solid #0d6efd' : '4px solid #20c997',
                            opacity: isRemoving ? 0.5 : 1
                          }}
                        >
                          <div className="d-flex align-items-center">
                            {member.user.avatar ? (
                              <img
                                src={member.user.avatar}
                                alt={member.user.name || 'Team member'}
                                className="rounded-circle me-3"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                className="rounded-circle me-3 d-flex align-items-center justify-content-center text-white"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  backgroundColor: '#0d6efd',
                                  fontSize: '18px',
                                  fontWeight: 'bold'
                                }}
                              >
                                {(member.user.name || member.user.email || '?')[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <div className="fw-bold">{member.user.name || member.user.email || 'Unknown'}</div>
                                {member.is_lead && (
                                  <span className="badge bg-primary">Primary</span>
                                )}
                                {member.role && (
                                  <span className="badge bg-secondary">{member.role}</span>
                                )}
                              </div>
                              {member.user.email && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-envelope me-1"></i>
                                  {member.user.email}
                                </small>
                              )}
                              {member.user.phone && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-telephone me-1"></i>
                                  {member.user.phone}
                                </small>
                              )}
                              {member.user.user_type && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-person-badge me-1"></i>
                                  {member.user.user_type.name}
                                </small>
                              )}
                            </div>
                            {canRemove && (
                              <button
                                className="btn btn-sm btn-outline-danger ms-2"
                                style={{ minWidth: '32px', height: '32px', padding: 0 }}
                                onClick={() => handleRemoveMemberClick(member.id)}
                                disabled={isRemoving}
                                title="Remove team member"
                              >
                                {isRemoving ? (
                                  <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }}></span>
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
                              </button>
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
                  <i className="bi bi-people" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                  <p className="text-muted mt-3 mb-0">No team members assigned to this work order</p>
                  {canManageTeam() && (
                    <button
                      className="btn btn-primary mt-3"
                      onClick={handleAddMemberClick}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Add First Team Member
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2" style={{ color: '#0d6efd' }}></i>
                  Add Team Member
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setAvailableUsers([]);
                    setError("");
                  }}
                  aria-label="Close"
                  disabled={addingMemberId !== null || loadingAvailableUsers}
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
                
                {loadingAvailableUsers ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading available users...</p>
                  </div>
                ) : availableUsers.length > 0 ? (
                  <>
                    <p className="mb-3">Select a user to add to the team:</p>
                    <div className="list-group">
                      {availableUsers.map((availableUser) => {
                        const isAdding = addingMemberId === availableUser.id;
                        return (
                          <button
                            key={availableUser.id}
                            type="button"
                            className="list-group-item list-group-item-action d-flex align-items-center"
                            onClick={() => handleAddMember(availableUser.id)}
                            disabled={isAdding || addingMemberId !== null}
                            style={{ opacity: isAdding ? 0.6 : 1 }}
                          >
                            {availableUser.avatar ? (
                              <img
                                src={availableUser.avatar}
                                alt={availableUser.name || availableUser.email}
                                className="rounded-circle me-3"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                className="rounded-circle me-3 d-flex align-items-center justify-content-center text-white"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  backgroundColor: '#0d6efd',
                                  fontSize: '16px',
                                  fontWeight: 'bold'
                                }}
                              >
                                {(availableUser.name || availableUser.email || '?')[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-grow-1 text-start">
                              <div className="fw-bold">{availableUser.name || availableUser.email || 'Unknown'}</div>
                              {availableUser.email && availableUser.name && (
                                <small className="text-muted">{availableUser.email}</small>
                              )}
                              {availableUser.user_type && (
                                <small className="text-muted d-block">{availableUser.user_type.name}</small>
                              )}
                            </div>
                            {isAdding ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                              <i className="bi bi-plus-circle text-primary"></i>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-person-x" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                    <p className="text-muted mt-3 mb-0">No available users to add</p>
                    <small className="text-muted">All users from your contract company are already in the team</small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setAvailableUsers([]);
                    setError("");
                  }}
                  disabled={addingMemberId !== null || loadingAvailableUsers}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      <ConfirmModal
        show={showRemoveConfirm}
        title="Remove Team Member"
        message="Are you sure you want to remove this team member from the work order?"
        confirmText="Remove"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleRemoveMember}
        onCancel={() => {
          setShowRemoveConfirm(false);
          setMemberToRemove(null);
        }}
        isProcessing={removingMemberId !== null}
      />
      
      <FooterTwo />
    </>
  );
};

export default WorkOrderTeam;

