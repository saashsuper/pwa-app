 
import WelcomeToast from "../common/WelcomeToast"; 
import HeroSlider from "./HeroSlider";
import Brands from "./Brands";
import Elements from "./Elements";
import BrandTwo from "./BrandTwo";
import Banner from "./Banner";
import Features from "./Features";
import BrandThree from "./BrandThree";
import Review from "./Review";
import HeaderTwo from "../../layouts/headers/HeaderTwo";
import FooterTwo from "../../layouts/footers/FooterTwo";
import ScrollTop from "../common/ScrollTop";

const Home = () => {
	return (
		<>
		<ScrollTop />
			<HeaderTwo />
			<div className="page-content-wrapper">
				<WelcomeToast />
				<HeroSlider />
				<Brands />
				<Elements />
				<BrandTwo />
				<Banner />
				<Features />
				<Review />
				<BrandThree />
			</div>
			<FooterTwo />
		</>
	);
};

export default Home;
