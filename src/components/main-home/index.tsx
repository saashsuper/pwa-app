 
import Preview from "./Preview";
import Features from "./Features"; 
import Templates from "../common/Templates";
import HeaderOne from "../../layouts/headers/HeaderOne";
import FooterOne from "../../layouts/footers/FooterOne";

const MainHome = () => {
	return (
		<>
		<Templates />		
			<div className="preview-iframe-wrapper">
				<HeaderOne />
				<Preview />
				<Features />
				<FooterOne />
			</div>
		</>
	);
};

export default MainHome;
