import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import BreadcrumbArea from "./BreadcrumbArea";

 

const Breadcrumb = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Breadcrumb" />
			<BreadcrumbArea />
			<FooterTwo />
		</>
	);
};

export default Breadcrumb;
