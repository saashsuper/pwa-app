 
import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import HeaderMenuArea from "./HeaderMenuArea";

const HeaderMenu = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Header Menu" />
			<HeaderMenuArea />
			<FooterTwo />
		</>
	);
};

export default HeaderMenu;
