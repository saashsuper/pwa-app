import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const nav_data = [
	{ id: 1, icon: "house", title: "Dashboard", link: "dashboard" },
	{ id: 2, icon: "clipboard-check", title: "Work Orders", link: "work-orders" },
	{ id: 4, icon: "person-circle", title: "Profile", link: "profile" },
];

const FooterTwo = () => {
	const navigate = useNavigate();
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<>
			<div className="footer-nav-area" id="footerNav">
				<div className="container px-0">
					<div className="footer-nav position-relative">
						<ul className="h-100 d-flex align-items-center justify-content-between ps-0">
							{nav_data.map((item, i) => (
								<li key={i}>
									<Link to={`/${item.link}`}>
										<i className={`bi bi-${item.icon}`}></i>
										<span>{item.title}</span>
									</Link>
								</li>
							))}
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
