import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import ComparisonTableArea from "./ComparisonTableArea";

const ComparisonTable = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="pages" title="Comparison Table" />
			<ComparisonTableArea />
			<FooterTwo />
		</>
	);
};

export default ComparisonTable;
