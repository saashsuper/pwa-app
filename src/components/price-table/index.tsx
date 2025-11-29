import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import PriceTableArea from "./PriceTableArea";

 

const PriceTable = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="pages" title="Price Table" />
			<PriceTableArea />
			<FooterTwo />
		</>
	);
};

export default PriceTable;
