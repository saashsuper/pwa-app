 
import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import ToastsArea from "./ToastsArea";

const Toasts = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="pages" title="Toasts" />
			<ToastsArea />
			<FooterTwo />
		</>
	);
};

export default Toasts;
