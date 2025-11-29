import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import ProgressBarArea from "./ProgressBarArea";

 

const ProgressBar = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Progress Bar" />
			<ProgressBarArea />
			<FooterTwo />
		</>
	);
};

export default ProgressBar;
