import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import PaginationArea from "./PaginationArea";

 

const Pagination = () => {
	return (
		<>
			<HeaderSix links="elements" title="Pagination" />
			<PaginationArea />
			<FooterTwo />
		</>
	);
};

export default Pagination;
