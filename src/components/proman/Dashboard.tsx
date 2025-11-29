import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import AppConstants from "../../config/constants";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <HeaderTwo />
      <div className="page-content-wrapper">
        {/* Welcome Section */}
        <div className="container">
          <div className="pt-3">
            {/* Success Icon */}
            <div className="text-center mb-4">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '100px', color: '#28a745' }}></i>
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-4">
              <h2 className="mb-3" style={{ fontWeight: 'bold' }}>
                Welcome to {AppConstants.appName}!
              </h2>
              <p className="text-muted mb-2">Login Successful</p>
              {user && (
                <h5 className="mb-0" style={{ color: AppConstants.primaryColor }}>
                  {user.name}
                </h5>
              )}
            </div>

            {/* Quick Stats Cards */}
            <div className="row g-3 mt-4">
              <div className="col-6">
                <Link to="/work-orders" className="text-decoration-none">
                  <div 
                    className="card shadow-sm" 
                    style={{ 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="card-body text-center">
                      <i className="bi bi-clipboard-check mb-2" style={{ fontSize: '32px', color: AppConstants.primaryColor }}></i>
                      <h6 className="mb-1">Work Orders</h6>
                      <p className="mb-0 text-muted small">View & Manage</p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="col-6">
                <Link to="/inspections" className="text-decoration-none">
                  <div 
                    className="card shadow-sm" 
                    style={{ 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="card-body text-center">
                      <i className="bi bi-search mb-2" style={{ fontSize: '32px', color: '#28a745' }}></i>
                      <h6 className="mb-1">Inspections</h6>
                      <p className="mb-0 text-muted small">Track Progress</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card mt-4 shadow-sm">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-lightning-fill me-2" style={{ color: '#ffc107' }}></i>
                  Quick Actions
                </h6>
                <div className="list-group list-group-flush">
                  <a href="/work-orders" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-clipboard-data me-3" style={{ fontSize: '20px', color: AppConstants.primaryColor }}></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">My Work Orders</div>
                      <small className="text-muted">View assigned work orders</small>
                    </div>
                    <i className="bi bi-chevron-right"></i>
                  </a>
                  
                  <a href="/inspections" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-clipboard-check me-3" style={{ fontSize: '20px', color: '#28a745' }}></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">My Inspections</div>
                      <small className="text-muted">View inspection tasks</small>
                    </div>
                    <i className="bi bi-chevron-right"></i>
                  </a>
                  
                  <a href="/user-profile" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-person-circle me-3" style={{ fontSize: '20px', color: '#6f42c1' }}></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">My Profile</div>
                      <small className="text-muted">View and edit profile</small>
                    </div>
                    <i className="bi bi-chevron-right"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            {user && (
              <div className="card mt-4 shadow-sm">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-info-circle me-2" style={{ color: '#17a2b8' }}></i>
                    Account Information
                  </h6>
                  <div className="row g-2">
                    <div className="col-6">
                      <small className="text-muted d-block">Email</small>
                      <div className="text-truncate">{user.email}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Status</small>
                      <div>
                        <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {user.user_type && (
                      <div className="col-12 mt-2">
                        <small className="text-muted d-block">User Type</small>
                        <div>{user.user_type.name}</div>
                      </div>
                    )}
                  </div>
                </div>
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

export default Dashboard;




