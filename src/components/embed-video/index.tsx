import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import EmbedVideoArea from "./EmbedVideoArea";

 

const EmbedVideo = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Embed Video" />
			<EmbedVideoArea />
			<FooterTwo />
		</>
	);
};

export default EmbedVideo;
