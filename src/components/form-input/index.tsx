import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import FormInputArea from "./FormInputArea";

 

const FormInput = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="Form Input" />
			<FormInputArea />
			<FooterTwo />
		</>
	);
};

export default FormInput;
