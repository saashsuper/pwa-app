import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import FormFileUploadArea from "./FormFileUploadArea";

 

const FormFileUpload = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="File Upload" />
			<FormFileUploadArea />
			<FooterTwo />
		</>
	);
};

export default FormFileUpload;
