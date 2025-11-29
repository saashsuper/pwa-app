import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderFour from "../../layouts/headers/HeaderFour";
import ScrollTop from "../common/ScrollTop";
import ShopDetailsArea from "./ShopDetailsArea";

 
const ShopDetails = () => {
	return (
		<>
		<ScrollTop />
			<HeaderFour links="pages" title="Product Details" />
			<ShopDetailsArea />
			<FooterTwo />
		</>
	);
};

export default ShopDetails;
