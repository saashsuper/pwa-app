import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import CountdownArea from "./CountdownArea";

const Countdown = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="pages" title="Count down" />
			<CountdownArea />
			<FooterTwo />
		</>
	);
};

export default Countdown;
