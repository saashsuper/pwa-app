
import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import ImageGalleryArea from "./ImageGalleryArea";



const ImageGallery = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Image Gallery" />
			<ImageGalleryArea />
			<FooterTwo />
		</>
	);
};

export default ImageGallery;
