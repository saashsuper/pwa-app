import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import OffcanvasArea from "./OffcanvasArea";

const Offcanvas = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="elements" title="Offcanvas" />
			<OffcanvasArea />
			<FooterTwo />
		</>
	);
};

export default Offcanvas;
