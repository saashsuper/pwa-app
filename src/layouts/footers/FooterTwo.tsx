import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AppConstants from "../../config/constants";

const nav_data = [
	{ id: 1, icon: "house", title: "Dashboard", link: "dashboard" },
	{ id: 2, icon: "clipboard-check", title: "Work Orders", link: "work-orders" },
	{ id: 4, icon: "person-circle", title: "Profile", link: "profile" },
];

const FooterTwo = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

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
		return location.pathname === path || location.pathname.startsWith(path + '/');
	};

	return (
		<>
			<div className="footer-nav-area" id="footerNav">
				<div className="container px-0">
					<div className="footer-nav position-relative">
						<ul className="h-100 d-flex align-items-center justify-content-between ps-0">
							{nav_data.map((item, i) => {
								const path = `/${item.link}`;
								const active = isActive(path);
								return (
									<li key={i}>
										<Link 
											to={path}
											className={active ? 'active' : ''}
											style={active ? {
												color: AppConstants.primaryColor,
												fontWeight: '600'
											} : {}}
										>
											<i 
												className={`bi bi-${item.icon}`}
												style={active ? { color: AppConstants.primaryColor } : {}}
											></i>
											<span>{item.title}</span>
										</Link>
									</li>
								);
							})}
							<li>
								<a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
									<i className="bi bi-box-arrow-right"></i>
									<span>Logout</span>
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</>
	);
};

export default FooterTwo;
