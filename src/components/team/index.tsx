import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderFour from "../../layouts/headers/HeaderFour";
import ScrollTop from "../common/ScrollTop";
import TeamArea from "./TeamArea";

 

const Team = () => {
	return (
		<>
		<ScrollTop />
			<HeaderFour links="pages" title="Team" />
			<TeamArea />
			<FooterTwo />
		</>
	);
};

export default Team;
