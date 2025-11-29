import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import InvoiceArea from "./InvoiceArea";

 

const Invoice = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="pages" title="Invoice" />
			<InvoiceArea />
			<FooterTwo />
		</>
	);
};

export default Invoice;
