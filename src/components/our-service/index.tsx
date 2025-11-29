import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderFour from "../../layouts/headers/HeaderFour";
import ScrollTop from "../common/ScrollTop";
import ServiceArea from "./ServiceArea";

 

const OurService = () => {
	return (
		<>
		<ScrollTop />
			<HeaderFour links="pages" title="Service" />
			<ServiceArea />
			<FooterTwo />
		</>
	);
};

export default OurService;
