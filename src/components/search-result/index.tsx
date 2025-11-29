import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderFour from "../../layouts/headers/HeaderFour";
import ScrollTop from "../common/ScrollTop";
import SearchResultArea from "./SearchResultArea";

 

const SearchResult = () => {
	return (
		<>
		<ScrollTop />
			<HeaderFour links="pages" title="Search Result" />
			<SearchResultArea />
			<FooterTwo />
		</>
	);
};

export default SearchResult;
