import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import SizingArea from "./SizingArea";

const Sizing = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="elements" title="Sizing" />
			<SizingArea />
			<FooterTwo />
		</>
	);
};

export default Sizing;
