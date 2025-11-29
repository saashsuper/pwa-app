import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import ImagesArea from "./ImagesArea";

const Images = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="elements" title="Images" />
			<ImagesArea />
			<FooterTwo />
		</>
	);
};

export default Images;
