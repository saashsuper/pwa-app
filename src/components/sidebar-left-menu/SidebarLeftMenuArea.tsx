import { Link } from "react-router-dom";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useEffect } from "react";

 
const SidebarLeftMenuArea = ({ home, elements, title, button_text }: any) => {
	useEffect(() => {
		if(typeof window !== 'undefined'){
			import("bootstrap/js/dist/offcanvas");
		} 
	}, [])

	

	const { theme, handleDarkModeToggle } = useDarkMode();

	
	return (
		<>
			<div className="page-content-wrapper">
				<div className="breadcrumb-wrapper breadcrumb-two mb-4">
					<div className="container">
						<nav aria-label="breadcrumb">
							<ol className="breadcrumb mb-0 px-1 py-4">
								<li className="breadcrumb-item">
									<Link to="/home">{home}</Link>
								</li>
								<li className="breadcrumb-item">
									<Link to="/elements">{elements}</Link>
								</li>
								<li className="breadcrumb-item active" aria-current="page">
									{title}
								</li>
							</ol>
						</nav>
					</div>
				</div>

				<div className="container">
					<a
						className="btn btn-primary btn-lg w-100"
						id="affanNavbarToggler"
						href="#"
						data-bs-toggle="offcanvas"
						data-bs-target="#affanOffcanvas"
						aria-controls="affanOffcanvas"
					>
						{button_text}
					</a>
					<div className="text-center">
						<img
							className="w-50 mt-4 mb-3"
							src="/assets/img/bg-img/left-sidebar.png"
							alt=""
						/>
					</div>
				</div>
			</div>


			<div
				className={`offcanvas ${title === "Left Sidebar" ? "offcanvas-start" : "offcanvas-end"}`}
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
								<img src="/assets/img/bg-img/2.jpg" alt="" />
							</div>

							<div className="user-info">
								<h6 className="user-name mb-0">Affan Islam</h6>
								<span>CEO, Designing World</span>
							</div>
						</div>

						<ul className="sidenav-nav ps-0">
							<li>
								<Link to="/home">
									<i className="bi bi-house-door"></i> Home
								</Link>
							</li>
							<li>
								<Link to="/elements">
									<i className="bi bi-folder2-open"></i> Elements
									<span className="badge bg-danger rounded-pill ms-2">
										220+
									</span>
								</Link>
							</li>
							<li>
								<Link to="/pages">
									<i className="bi bi-collection"></i> Pages
									<span className="badge bg-success rounded-pill ms-2">
										100+
									</span>
								</Link>
							</li>
							<li>
								<a href="#">
									<i className="bi bi-cart-check"></i> Shop
								</a>
								<ul>
									<li>
										<Link to="/shop-grid"> Shop Grid</Link>
									</li>
									<li>
										<Link to="/shop-list"> Shop List</Link>
									</li>
									<li>
										<Link to="/shop-details"> Shop Details</Link>
									</li>
									<li>
										<Link to="/cart"> Cart</Link>
									</li>
									<li>
										<Link to="/checkout"> Checkout</Link>
									</li>
								</ul>
							</li>
							<li>
								<Link to="/settings">
									<i className="bi bi-gear"></i> Settings
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
								<Link to="/login">
									<i className="bi bi-box-arrow-right"></i> Logout
								</Link>
							</li>
						</ul>

						<div className="social-info-wrap">
							<a href="#">
								<i className="bi bi-facebook"></i>
							</a>
							<a href="#">
								<i className="bi bi-twitter"></i>
							</a>
							<a href="#">
								<i className="bi bi-linkedin"></i>
							</a>
						</div>

						<div className="copyright-info">
							<p>
								<span id="copyrightYear"></span>
							 {new Date().getFullYear()}	© Made by <a target="_blank" href="https://themeforest.net/user/rk_theme/portfolio">rk theme</a>
							</p>
						</div>
					</div>
				</div>
			</div>


		</>
	);
};

export default SidebarLeftMenuArea;
