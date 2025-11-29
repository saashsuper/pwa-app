import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import BlogGridArea from "./BlogGridArea";

 

const BlogGrid = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="pages" title="Blog Grid" />
			<BlogGridArea />
			<FooterTwo />
		</>
	);
};

export default BlogGrid;
