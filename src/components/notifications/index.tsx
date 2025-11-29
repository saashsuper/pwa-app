import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import ScrollTop from "../common/ScrollTop";
import NotificationsArea from "./NotificationsArea";

 

const Notifications = () => {
	return (
		<>
		<ScrollTop />
			<HeaderSix links="pages" title="Notifications" />
			<NotificationsArea />
			<FooterTwo />
		</>
	);
};

export default Notifications;
