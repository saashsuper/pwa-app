import { Link } from "react-router-dom";
import HeaderThree from "../../layouts/headers/HeaderThree";

 

const ForgetPasswordFailed = () => {
	return (
		<>
			<HeaderThree links="login" />

			<div className="login-wrapper d-flex align-items-center justify-content-center text-center">
				<div className="custom-container">
					<div className="text-center px-2">
						<img
							className="login-intro-img mb-4"
							src="/assets/img/bg-img/38.png"
							alt=""
						/>
						<p className="mb-4">
							Ooops! Your entered email is wrong. Please enter your correct
							email address again.
						</p>
						<Link className="btn btn-danger" to="/forget-password">
							Try Again
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};

export default ForgetPasswordFailed;
