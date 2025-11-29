import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import CardArea from "./CardArea";

 

const Card = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Card" />
			<CardArea />
			<FooterTwo />
		</>
	);
};

export default Card;
