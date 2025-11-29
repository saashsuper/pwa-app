import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import LanguageArea from "./LanguageArea";

 

const Language = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="pages" title="Language" />
			<LanguageArea />
			<FooterTwo />
		</>
	);
};

export default Language;
