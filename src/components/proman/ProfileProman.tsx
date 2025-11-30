import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import AppConstants from "../../config/constants";
import ConfirmModal from "../common/ConfirmModal";

const ProfileProman = () => {
  const { user, logout, refreshUser, loading: authLoading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setShowLogoutConfirm(false);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="page-content-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeaderTwo />
      <div className="page-content-wrapper">
        {/* Profile Header */}
        <div className="card user-info-card mb-3">
          <div className="card-body p-4 d-flex align-items-center">
            <div className="user-profile me-3 position-relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="rounded-circle"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    border: '3px solid #e9ecef'
                  }}
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                className={`d-flex align-items-center justify-content-center rounded-circle ${user.avatar ? 'd-none' : ''}`}
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: AppConstants.primaryColor,
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  border: '3px solid #e9ecef'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div 
                className="position-absolute rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: user.is_active ? '#28a745' : '#6c757d',
                  bottom: '0',
                  right: '0',
                  border: '3px solid white'
                }}
              >
                <i className="bi bi-check" style={{ fontSize: '12px', color: 'white' }}></i>
              </div>
            </div>
            <div className="user-info flex-grow-1">
              <h5 className="mb-1">{user.name}</h5>
              <p className="mb-0 text-muted">{user.email}</p>
              {user.user_type && (
                <span className="badge bg-primary mt-2">
                  {user.user_type.name}
                </span>
              )}
              {user.contract_company && (
                <div className="mt-2">
                  <small className="text-muted d-block mb-1">Company</small>
                  <span className="badge bg-info">
                    {user.contract_company.name}
                  </span>
                </div>
              )}
              {user.roles && user.roles.length > 0 && (
                <div className="mt-2">
                  {user.roles.map((role) => (
                    <span key={role.id} className="badge bg-secondary me-1">
                      {role.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <i className="bi bi-arrow-clockwise"></i>
              )}
            </button>
          </div>
        </div>

        <div className="container">
          <div className="pt-3">
            {/* Personal Information */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-person me-2" style={{ color: AppConstants.primaryColor }}></i>
                  Personal Information
                </h6>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Full Name</small>
                  <div className="fw-bold">{user.name}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Email Address</small>
                  <div className="fw-bold">{user.email}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Phone Number</small>
                  <div className="fw-bold">{user.phone || 'Not set'}</div>
                </div>
                <div className="mb-0">
                  <small className="text-muted d-block mb-1">Address</small>
                  <div className="fw-bold">{user.address || 'Not set'}</div>
                </div>
              </div>
            </div>

            {/* Role & Organization Information */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-briefcase me-2" style={{ color: '#6f42c1' }}></i>
                  Role & Organization
                </h6>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">User Type</small>
                  <div>
                    <span className="badge bg-primary me-2">
                      {user.user_type?.name || 'Not assigned'}
                    </span>
                    {user.user_type?.description && (
                      <small className="text-muted d-block mt-1">
                        {user.user_type.description}
                      </small>
                    )}
                  </div>
                </div>
                {user.roles && user.roles.length > 0 && (
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Roles</small>
                    <div>
                      {user.roles.map((role) => (
                        <span key={role.id} className="badge bg-secondary me-1 mb-1">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.contract_company && (
                  <div className="mb-0">
                    <small className="text-muted d-block mb-1">Contract Company</small>
                    <div className="fw-bold">{user.contract_company.name}</div>
                    {user.contract_company.description && (
                      <small className="text-muted d-block mt-1">
                        {user.contract_company.description}
                      </small>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-shield-check me-2" style={{ color: '#28a745' }}></i>
                  Account Information
                </h6>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">User ID</small>
                  <div className="fw-bold">#{user.id}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Account Status</small>
                  <div>
                    <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Email Verification</small>
                  <div>
                    <span className={`badge bg-${user.email_verified_at ? 'success' : 'warning'}`}>
                      {user.email_verified_at ? 'Verified ✓' : 'Not verified'}
                    </span>
                    {user.email_verified_at && (
                      <small className="text-muted d-block mt-1">
                        Verified on {formatDate(user.email_verified_at)}
                      </small>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Member Since</small>
                  <div className="fw-bold">{formatDate(user.created_at)}</div>
                </div>
                <div className="mb-0">
                  <small className="text-muted d-block mb-1">Last Updated</small>
                  <div className="fw-bold">{formatDate(user.updated_at)}</div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-gear me-2" style={{ color: '#6f42c1' }}></i>
                  Settings
                </h6>
                <div className="list-group list-group-flush">
                  <button className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-lock me-3 text-warning"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">Change Password</div>
                      <small className="text-muted">Update your account password</small>
                    </div>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                  
                  <button className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-bell me-3 text-info"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">Notifications</div>
                      <small className="text-muted">Manage notification preferences</small>
                    </div>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                  
                  <button className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-question-circle me-3 text-success"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">Help & Support</div>
                      <small className="text-muted">Get help or contact support</small>
                    </div>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="card mb-3">
              <div className="card-body">
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={handleLogoutClick}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pb-3"></div>
          </div>
        </div>
      </div>
      
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        show={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmButtonVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        isProcessing={loggingOut}
      />
      
      <FooterTwo />
    </>
  );
};

export default ProfileProman;




