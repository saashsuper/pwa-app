import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import ScrollTop from "../common/ScrollTop";
import UserProfileArea from "./UserProfileArea";

 

const UserProfile = () => {
	return (
		<>
		<ScrollTop />
			<HeaderTwo />
			<UserProfileArea />
			<FooterTwo />
		</>
	);
};

export default UserProfile;
