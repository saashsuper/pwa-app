import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import TabArea from "./TabArea";

 

const Tab = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Tabs" />
			<TabArea />
			<FooterTwo />
		</>
	);
};

export default Tab;
