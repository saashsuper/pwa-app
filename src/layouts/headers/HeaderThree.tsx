import { Link } from "react-router-dom";

 

const HeaderThree = ({ links }: any) => {
	return (
		<>
			<div className="login-back-button">
				<Link to={`/${links}`}>
					<i className="bi bi-arrow-left-short"></i>
				</Link>
			</div>
		</>
	);
};

export default HeaderThree;
