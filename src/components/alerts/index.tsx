import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import AlertsArea from "./AlertsArea";

 
const Alerts = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="pages" title="Alerts" />
			<AlertsArea />
			<FooterTwo />
		</>
	);
};

export default Alerts;
