import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import AccordionArea from "./AccordionArea";

 

const Accordion = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Accordion" />
			<AccordionArea />
			<FooterTwo />
		</>
	);
};

export default Accordion;
