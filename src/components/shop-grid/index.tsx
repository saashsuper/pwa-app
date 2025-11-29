import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderFour from "../../layouts/headers/HeaderFour";
import ScrollTop from "../common/ScrollTop";
import ShopGridArea from "./ShopGridArea";

 
const ShopGrid = () => {
	return (
		<>
		<ScrollTop />
			<HeaderFour links="pages" title="Shop Grid" />
			<ShopGridArea />
			<FooterTwo />
		</>
	);
};

export default ShopGrid;
