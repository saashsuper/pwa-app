import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import TimelineArea from "./TimelineArea";

 

const Timeline = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Timeline" />
			<TimelineArea />
			<FooterTwo />
		</>
	);
};

export default Timeline;
