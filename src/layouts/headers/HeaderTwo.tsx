import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import { useEffect, useRef, useState } from "react";
import AppConstants from "../../config/constants";

 

const HeaderTwo = () => { 	
  useEffect(() => {  

		if (typeof window !== 'undefined') { 
			// @ts-ignore
			import("bootstrap/dist/js/bootstrap"); 
		}

  }, []);

	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();
	const { theme, handleDarkModeToggle } = useDarkMode();
	const { notifications, removeNotification, clearAll, unreadCount } = useNotifications();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Check if user is a contractor
	const isContractor = user?.user_type?.name?.includes('Contractor') || false;
	const isPropertyManager = user?.user_type?.name === 'Property manager';

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Helper function to check if a path is active
	const isActive = (path: string) => {
		if (path === '/work-orders') {
			// Match /work-orders and /work-order/:id routes
			return location.pathname === path || location.pathname.startsWith('/work-order/');
		}
		if (path === '/inspections') {
			// Match /inspections and /inspection/:id routes if they exist
			return location.pathname === path || location.pathname.startsWith('/inspection/');
		}
		if (path === '/blocks') {
			return location.pathname === path || location.pathname.startsWith('/blocks/');
		}
		return location.pathname === path || location.pathname.startsWith(path + '/');
	};

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

						<div className="d-flex align-items-center gap-2">
							{/* Notification bell with counter and dropdown */}
							<div className="position-relative" ref={dropdownRef}>
								<button
									type="button"
									className="btn btn-link text-dark p-2 position-relative border-0 d-flex align-items-center justify-content-center"
									onClick={() => setDropdownOpen((o) => !o)}
									aria-label="Notifications"
									style={{ width: '2.5rem', height: '2.5rem' }}
								>
									<i className="bi bi-bell-fill" style={{ fontSize: '1.4rem' }}></i>
									{unreadCount > 0 && (
										<span
											className="position-absolute badge rounded-pill bg-danger d-flex align-items-center justify-content-center"
											style={{
												fontSize: '0.6rem',
												minWidth: '1rem',
												height: '1rem',
												padding: 0,
												top: '2px',
												right: '2px',
												lineHeight: 1,
											}}
										>
											{unreadCount > 99 ? '99+' : unreadCount}
										</span>
									)}
								</button>
								{dropdownOpen && (
									<div
										className="position-absolute end-0 mt-1 shadow rounded border bg-white"
										style={{ width: '320px', maxWidth: '95vw', maxHeight: '70vh', zIndex: 1050 }}
									>
										<div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
											<strong>Notifications</strong>
											{notifications.length > 0 && (
												<button
													type="button"
													className="btn btn-sm btn-outline-secondary"
													onClick={() => { clearAll(); setDropdownOpen(false); }}
												>
													Clear all
												</button>
											)}
										</div>
										<div style={{ overflowY: 'auto', maxHeight: '50vh' }}>
											{notifications.length === 0 ? (
												<div className="p-3 text-muted text-center small">No notifications</div>
											) : (
												notifications.map((n) => (
													<div
														key={n.id}
														className="d-flex align-items-start gap-2 px-3 py-2 border-bottom border-1"
														style={{ borderColor: 'rgba(0,0,0,0.06)' }}
													>
														<div className="flex-grow-1 min-width-0">
															{n.url ? (
																<div
																	role="button"
																	tabIndex={0}
																	className="text-dark text-decoration-none d-block cursor-pointer"
																	style={{ cursor: 'pointer' }}
																	onClick={(e) => {
																		e.preventDefault();
																		setDropdownOpen(false);
																		navigate(n.url!);
																	}}
																	onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLElement).click()}
																>
																	<div className="fw-semibold small text-truncate">{n.title}</div>
																	<div className="small text-muted text-truncate">{n.body}</div>
																	<div className="small text-muted mt-1">
																		{new Date(n.createdAt).toLocaleString()}
																	</div>
																</div>
															) : (
																<>
																	<div className="fw-semibold small text-truncate">{n.title}</div>
																	<div className="small text-muted text-truncate">{n.body}</div>
																	<div className="small text-muted mt-1">
																		{new Date(n.createdAt).toLocaleString()}
																	</div>
																</>
															)}
														</div>
														<button
															type="button"
															className="btn btn-sm btn-link text-muted p-0 align-self-start"
															onClick={() => removeNotification(n.id)}
															aria-label="Dismiss"
														>
															<i className="bi bi-x-lg"></i>
														</button>
													</div>
												))
											)}
										</div>
									</div>
								)}
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
							<Link 
								to="/dashboard" 
								className={isActive('/dashboard') ? 'active' : ''}
								style={isActive('/dashboard') ? { 
									backgroundColor: `${AppConstants.primaryColor}15`,
									color: AppConstants.primaryColor,
									borderLeft: `3px solid ${AppConstants.primaryColor}`
								} : {}}
							>
								<i className="bi bi-house-door"></i> Dashboard
							</Link>
						</li>
						<li>
							<Link 
								to="/work-orders" 
								className={isActive('/work-orders') ? 'active' : ''}
								style={isActive('/work-orders') ? { 
									backgroundColor: `${AppConstants.primaryColor}15`,
									color: AppConstants.primaryColor,
									borderLeft: `3px solid ${AppConstants.primaryColor}`
								} : {}}
							>
								<i className="bi bi-clipboard-check"></i> Work Orders
							</Link>
						</li>
						{isPropertyManager && (
							<li>
								<Link 
									to="/blocks" 
									className={isActive('/blocks') ? 'active' : ''}
									style={isActive('/blocks') ? { 
										backgroundColor: `${AppConstants.primaryColor}15`,
										color: AppConstants.primaryColor,
										borderLeft: `3px solid ${AppConstants.primaryColor}`
									} : {}}
								>
									<i className="bi bi-building"></i> Blocks
								</Link>
							</li>
						)}
						{!isContractor && (
							<li>
								<Link 
									to="/inspections" 
									className={isActive('/inspections') ? 'active' : ''}
									style={isActive('/inspections') ? { 
										backgroundColor: `${AppConstants.primaryColor}15`,
										color: AppConstants.primaryColor,
										borderLeft: `3px solid ${AppConstants.primaryColor}`
									} : {}}
								>
									<i className="bi bi-search"></i> Inspections
								</Link>
							</li>
						)}
						<li>
							<Link 
								to="/profile" 
								className={isActive('/profile') ? 'active' : ''}
								style={isActive('/profile') ? { 
									backgroundColor: `${AppConstants.primaryColor}15`,
									color: AppConstants.primaryColor,
									borderLeft: `3px solid ${AppConstants.primaryColor}`
								} : {}}
							>
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
