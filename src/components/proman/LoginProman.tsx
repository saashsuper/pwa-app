import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AppConstants from "../../config/constants";

const LoginProman = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };
  
  const handleBlur = () => {
    setFocusedInput(null);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <>
      {/* Login Wrapper Area */}
      <div 
        className="login-wrapper d-flex align-items-center justify-content-center"
        style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}
      >
        <div className="custom-container">
          <div className="text-center px-4">
            {/* Logo with Icon */}
            <div className="mb-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div 
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: `${AppConstants.primaryColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `3px solid ${AppConstants.primaryColor}30`
                }}
              >
                <img 
                  src="/assets/img/logos/absolute-icon-only.svg" 
                  alt="Absolute Property Group" 
                  style={{ 
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
            
            {/* App Name & Subtitle */}
            <h2 className="mb-2" style={{ color: AppConstants.primaryColor, fontWeight: 'bold' }}>
              {AppConstants.appName}
            </h2>
            <p className="text-muted mb-4">{AppConstants.appSubtitle}</p>
          </div>

          {/* Login Form */}
          <div className="register-form mt-4">
            <h6 className="mb-4 text-center" style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
              Log in to continue
            </h6>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert" style={{ borderRadius: '8px' }}>
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError("")}
                  aria-label="Close"
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <input
                  className={`form-control ${
                    focusedInput === "email" ? "form-control-clicked" : ""
                  }`}
                  type="email"
                  id="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => handleFocus("email")}
                  onBlur={handleBlur}
                  disabled={loading}
                  required
                  style={{ borderRadius: '8px', padding: '12px 15px' }}
                />
              </div>

              <div className="form-group position-relative mb-4">
                <input
                  className={`form-control ${
                    focusedInput === "password" ? "form-control-clicked" : ""
                  }`}
                  id="password"
                  placeholder="Enter Password"
                  onFocus={() => handleFocus("password")}
                  onBlur={handleBlur}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  style={{ borderRadius: '8px', padding: '12px 45px 12px 15px' }}
                />
                <div
                  className={`position-absolute ${showPassword ? "active" : ""}`}
                  id="password-visibility"
                  onClick={toggleShowPassword}
                  style={{
                    cursor: "pointer",
                    top: "50%",
                    right: "15px",
                    transform: "translateY(-50%)",
                    color: '#6c757d',
                    fontSize: '18px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = AppConstants.primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
                >
                  {showPassword ? (
                    <i className="bi bi-eye-slash"></i>
                  ) : (
                    <i className="bi bi-eye"></i>
                  )}
                </div>
              </div>

              <button 
                className="btn btn-primary w-100" 
                type="submit"
                disabled={loading}
                style={{
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: AppConstants.primaryColor,
                  border: 'none',
                  transition: 'all 0.3s',
                  boxShadow: `0 4px 12px ${AppConstants.primaryColor}40`
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 16px ${AppConstants.primaryColor}60`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${AppConstants.primaryColor}40`;
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Login Meta */}
          <div className="login-meta-data text-center mt-4">
            <Link
              className="stretched-link forgot-password d-block mb-3"
              to="/forget-password"
              style={{ 
                color: AppConstants.primaryColor,
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              <i className="bi bi-key me-1"></i>
              Forgot Password?
            </Link>
            {/* <p className="mb-0" style={{ fontSize: '13px', color: '#6c757d' }}>
              Need help?{' '}
              <Link 
                to="/contact" 
                style={{ 
                  color: AppConstants.primaryColor,
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Contact Support
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginProman;

