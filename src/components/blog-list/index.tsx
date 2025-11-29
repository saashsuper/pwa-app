import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import BlogListArea from "./BlogListArea";

 
const BlogList = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="pages" title="Blog Grid" />
			<BlogListArea />
			<FooterTwo />
		</>
	);
};

export default BlogList;
