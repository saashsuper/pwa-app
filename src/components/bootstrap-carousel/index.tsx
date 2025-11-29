 
import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import BootstrapCarouselArea from "./BootstrapCarouselArea";

const BootstrapCarousel = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Bootstrap Carousel" />
			<BootstrapCarouselArea />
			<FooterTwo />
		</>
	);
};

export default BootstrapCarousel;
