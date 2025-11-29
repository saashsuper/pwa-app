import { Link, useNavigate } from "react-router-dom";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

 

const HeaderTwo = () => { 	
  useEffect(() => {  

		if (typeof window !== 'undefined') { 
			// @ts-ignore
			import("bootstrap/dist/js/bootstrap"); 
		}

  }, []);

	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const { theme, handleDarkModeToggle } = useDarkMode();

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<>
		
			<div className="header-area" id="headerArea">
				<div className="container">
					<div className="header-content header-style-five position-relative d-flex align-items-center justify-content-between">
						<div className="logo-wrapper">
							<Link to="/dashboard">
								<img 
									src="/assets/img/logos/absolute-icon-only.svg" 
									alt="Absolute Property Group" 
									style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
								/>
							</Link>
						</div>

						<div
							className="navbar--toggler"
							id="affanNavbarToggler"
							data-bs-toggle="offcanvas"
							data-bs-target="#affanOffcanvas"
							aria-controls="affanOffcanvas"
						>
							<span className="d-block"></span>
							<span className="d-block"></span>
							<span className="d-block"></span>
						</div>
					</div>
				</div>
			</div>

			<div
				className="offcanvas offcanvas-start"
				id="affanOffcanvas"
				data-bs-scroll="true"
				tabIndex={-1}
				aria-labelledby="affanOffcanvsLabel"
			>
				<button
					className="btn-close btn-close-white text-reset"
					type="button"
					data-bs-dismiss="offcanvas"
					aria-label="Close"
				></button>

				<div className="offcanvas-body p-0">
					<div className="sidenav-wrapper">
						<div className="sidenav-profile bg-gradient">
							<div className="sidenav-style1"></div>

							<div className="user-profile">
								{user?.avatar ? (
									<img src={user.avatar} alt={user.name} />
								) : (
									<div 
										className="d-flex align-items-center justify-content-center rounded-circle"
										style={{
											width: '80px',
											height: '80px',
											backgroundColor: 'rgba(255,255,255,0.3)',
											color: 'white',
											fontSize: '32px',
											fontWeight: 'bold'
										}}
									>
										{user?.name?.charAt(0).toUpperCase() || 'U'}
									</div>
								)}
							</div>

							<div className="user-info">
								<h6 className="user-name mb-0">{user?.name || 'Guest'}</h6>
								<span>{user?.user_type?.name || user?.email || 'Not logged in'}</span>
							</div>
						</div>

					<ul className="sidenav-nav ps-0">
						<li>
							<Link to="/dashboard">
								<i className="bi bi-house-door"></i> Dashboard
							</Link>
						</li>
						<li>
							<Link to="/work-orders">
								<i className="bi bi-clipboard-check"></i> Work Orders
							</Link>
						</li>
						<li>
							<Link to="/inspections">
								<i className="bi bi-search"></i> Inspections
							</Link>
						</li>
						<li>
							<Link to="/profile">
								<i className="bi bi-person-circle"></i> Profile
							</Link>
						</li>
							<li>
								<div className="night-mode-nav">
									<i className="bi bi-moon"></i> 
									{theme === "dark" ? "Light" : "Dark"} Mode
									<div className="form-check form-switch">
										<input
											className="form-check-input form-check-success"
											id="darkSwitch"
											type="checkbox"
											checked={theme === "dark"}
											onChange={handleDarkModeToggle}
										/>
									</div>
								</div>
							</li>
						<li>
							<a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
								<i className="bi bi-box-arrow-right"></i> Logout
							</a>
						</li>
						</ul>

						<div className="copyright-info">
							<p>
								<span id="copyrightYear"></span>
							 {new Date().getFullYear()}	© Made by <a target="_blank" href="https://saashmagna.com">Proman</a>
							</p>
						</div>
					</div>
				</div>
			</div>

		</>
	);
};

export default HeaderTwo;
