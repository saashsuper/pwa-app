import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import BadgeArea from "./BadgeArea";

 

const Badge = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Badge" />
			<BadgeArea />
			<FooterTwo />
		</>
	);
};

export default Badge;
