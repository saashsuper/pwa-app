import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import ListGroupArea from "./ListGroupArea";

const ListGroup = () => {
	return (
		<>
			<ScrollTop />
			<HeaderSix links="elements" title="List Group" />
			<ListGroupArea />
			<FooterTwo />
		</>
	);
};

export default ListGroup;
