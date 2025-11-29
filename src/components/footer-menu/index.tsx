import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import FooterMenuArea from "./FooterMenuArea";

 

const FooterMenu = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Footer Menu" />
			<FooterMenuArea />
			<FooterTwo />
		</>
	);
};

export default FooterMenu;
