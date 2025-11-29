import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import CounterupArea from "./CounterupArea";

const Counterup = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="pages" title="Count Up" />
			<CounterupArea />
			<FooterTwo />
		</>
	);
};

export default Counterup;
