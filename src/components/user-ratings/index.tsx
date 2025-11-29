import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import UserRatingsArea from "./UserRatingsArea";

 

const UserRatings = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="elements" title="User Ratings" />
			<UserRatingsArea />
			<FooterTwo />
		</>
	);
};

export default UserRatings;
