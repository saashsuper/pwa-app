 
import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderFour from "../../layouts/headers/HeaderFour";
import ScrollTop from "../common/ScrollTop";
import ShopListArea from "./ShopListArea";

const ShopList = () => {
	return (
		<>
		<ScrollTop />
			<HeaderFour links="pages" title="Shop List" />
			<ShopListArea />
			<FooterTwo />
		</>
	);
};

export default ShopList;
