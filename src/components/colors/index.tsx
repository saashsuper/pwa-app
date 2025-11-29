import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import ColorsArea from "./ColorsArea";

 

const Colors = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Colors" />
			<ColorsArea />
			<FooterTwo />
		</>
	);
};

export default Colors;
