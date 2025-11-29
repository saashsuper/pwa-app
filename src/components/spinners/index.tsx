import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import SpinnersArea from "./SpinnersArea";

const Spinners = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="elements" title="Spinner" />
			<SpinnersArea />
			<FooterTwo />
		</>
	);
};

export default Spinners;
