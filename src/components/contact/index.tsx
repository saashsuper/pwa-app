import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import ContactArea from "./ContactArea";

 

const Contact = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="pages" title="Contact" />
			<ContactArea />
			<FooterTwo />
		</>
	);
};

export default Contact;
