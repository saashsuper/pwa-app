import { useRouteError, isRouteErrorResponse, Link, useNavigate } from 'react-router-dom';
import HeaderTwo from '../../layouts/headers/HeaderTwo';
import AppConstants from '../../config/constants';

const RouteError = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorTitle = 'Oops! Something went wrong';
  let errorMessage = 'An unexpected error occurred. Please try again.';
  let statusCode: number | null = null;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    
    switch (error.status) {
      case 404:
        errorTitle = 'Page Not Found';
        errorMessage = "Sorry, we couldn't find the page you're looking for.";
        break;
      case 403:
        errorTitle = 'Access Forbidden';
        errorMessage = "You don't have permission to access this page.";
        break;
      case 500:
        errorTitle = 'Server Error';
        errorMessage = 'Our server encountered an error. Please try again later.';
        break;
      default:
        errorTitle = `Error ${error.status}`;
        errorMessage = error.statusText || errorMessage;
    }
  } else if (error instanceof Error) {
    errorTitle = 'Application Error';
    errorMessage = error.message || errorMessage;
  }

  return (
    <>
      <HeaderTwo />
      <div className="page-content-wrapper py-3">
        <div className="custom-container">
          <div className="card">
            <div className="card-body px-4 text-center">
              <div className="mb-4">
                {statusCode === 404 ? (
                  <i 
                    className="bi bi-file-earmark-x" 
                    style={{ 
                      fontSize: '80px', 
                      color: AppConstants.primaryColor 
                    }}
                  ></i>
                ) : (
                  <i 
                    className="bi bi-exclamation-triangle-fill" 
                    style={{ 
                      fontSize: '80px', 
                      color: '#dc3545' 
                    }}
                  ></i>
                )}
              </div>

              {statusCode && (
                <h1 
                  className="mb-3" 
                  style={{ 
                    fontSize: '72px', 
                    fontWeight: 'bold',
                    color: AppConstants.primaryColor,
                    lineHeight: 1 
                  }}
                >
                  {statusCode}
                </h1>
              )}

              <h4 className="mb-3">{errorTitle}</h4>
              
              <p className="text-muted mb-4">{errorMessage}</p>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && error instanceof Error && (
                <div className="alert alert-danger text-start mb-4" style={{ fontSize: '12px' }}>
                  <strong>Error Details:</strong>
                  <pre style={{ fontSize: '11px', whiteSpace: 'pre-wrap', marginTop: '8px' }}>
                    {error.stack || error.message}
                  </pre>
                </div>
              )}

              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Go Back
                </button>
                
                <Link 
                  to="/dashboard" 
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-house-door me-2"></i>
                  Dashboard
                </Link>
                
                {statusCode === 404 && (
                  <Link 
                    to="/login" 
                    className="btn btn-outline-secondary"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RouteError;















