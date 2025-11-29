import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import TextArea from "./TextArea";

const Text = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="elements" title="Text" />
			<TextArea />
			<FooterTwo />
		</>
	);
};

export default Text;
