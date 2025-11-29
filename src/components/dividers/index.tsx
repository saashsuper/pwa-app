import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import DividersArea from "./DividersArea";

const Dividers = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="elements" title="Dividers" />
			<DividersArea />
			<FooterTwo />
		</>
	);
};

export default Dividers;
