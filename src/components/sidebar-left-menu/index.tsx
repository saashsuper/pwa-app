 
import { useEffect } from "react";
import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderEight from "../../layouts/headers/HeaderEight";
import SidebarLeftMenuArea from "./SidebarLeftMenuArea";
import ScrollTop from "../common/ScrollTop";


const SidebarLeftMenu = () => {
	

	useEffect(() => {
		if(typeof window !== 'undefined'){
			import("bootstrap/js/dist/offcanvas");
		} 
	}, [])
	
	
	return (
		<>
		<ScrollTop />
			<HeaderEight links="elements" title="Left Sidebar" />
			<SidebarLeftMenuArea
				home="Home"
				elements="Elements"
				title="Left Sidebar"
				button_text="Click the button for left sidebar"
			/>
			<FooterTwo />
		</>
	);
};

export default SidebarLeftMenu;
