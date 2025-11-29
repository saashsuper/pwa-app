import ButtonArea from "./ButtonArea";
import ScrollTop from "../common/ScrollTop";
import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";

const Button = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="elements" title="Button" />
			<ButtonArea />
			<FooterTwo />
		</>
	);
};

export default Button;
