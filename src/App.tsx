import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import RouteError from "./components/common/RouteError";
import MainHome from "./components/main-home";
import Aboutus from "./components/about-us";
import Home from "./components/home";
import Login from "./components/login";

// Proman Components
import LoginProman from "./components/proman/LoginProman";
import Dashboard from "./components/proman/Dashboard";
import WorkOrdersList from "./components/proman/WorkOrdersList";
import WorkOrderDetail from "./components/proman/WorkOrderDetail";
import WorkOrderPhotos from "./components/proman/WorkOrderPhotos";
import InspectionsList from "./components/proman/InspectionsList";
import ProfileProman from "./components/proman/ProfileProman";
import CallToAction from "./components/call-to-action";
import HeroBlocks from "./components/hero-blocks";
import Pages from "./components/pages";
import Elements from "./components/elements";
import ChatUsers from "./components/chat-users";
import Settings from "./components/settings"; 
import SocialLogin from "./components/social-login";
import Register from "./components/register";
import Otp from "./components/otp";
import OtpConfirm from "./components/otp-confirm";
import ForgetPassword from "./components/forget-password";
import ForgetPasswordSuccess from "./components/forget-password-success";
import ChangePassword from "./components/change-password";
import ForgetPasswordFailed from "./components/forget-password-failed";
import Chat from "./components/chat";
import VideoCall from "./components/video-call";
import ShopGrid from "./components/shop-grid";
import ShopList from "./components/shop-list";
import ShopDetails from "./components/shop-details";
import Cart from "./components/cart";
import Checkout from "./components/checkout";
import PaymentConfirm from "./components/payment-confirm";
import Team from "./components/team";
import OurService from "./components/our-service";
import PrivacyPolicy from "./components/privacy-policy";
import Invoice from "./components/invoice";
import Contact from "./components/contact";
import Faq from "./components/faq";
import Language from "./components/language";
import Notifications from "./components/notifications";
import NotificationDetails from "./components/notification-details";
import SearchResult from "./components/search-result";
import Fallback from "./components/fallback";
import ComingSoon from "./components/coming-soon";
import UserProfile from "./components/user-profile";
import Error from "./components/error";
import BlogGrid from "./components/blog-grid";
import BlogList from "./components/blog-list";
import BlogDetails from "./components/blog-details";
import HeaderMenu from "./components/header-menu";
import FooterMenu from "./components/footer-menu";
import SidebarLeftMenu from "./components/sidebar-left-menu";
import SidebarRightMenu from "./components/sidebar-right-menu";
import Alerts from "./components/alerts";
import Toasts from "./components/toasts";
import OnlineOfflineDetection from "./components/online-offline-detection";
import FormInput from "./components/form-input";
import FormTextarea from "./components/form-textarea";
import FormSelect from "./components/form-select";
import FormInputGroup from "./components/form-input-group";
import FormCheck from "./components/form-check";
import FormRadio from "./components/form-radio";
import FormFileUpload from "./components/form-file-upload";
import FormRange from "./components/form-range";
import FormAutoComplete from "./components/form-auto-complete";
import FormSwitches from "./components/form-switches";
import FormValidation from "./components/form-validation";
import Accordion from "./components/accordion";
import Badge from "./components/badge";
import Button from "./components/button";
import Breadcrumb from "./components/breadcrumb";
import Timeline from "./components/timeline";
import Card from "./components/card";
import ImageGallery from "./components/image-gallery";
import Tab from "./components/tab";
import Offcanvas from "./components/offcanvas";
import UserRatings from "./components/user-ratings";
import Testimonial from "./components/testimonial";
import PartnerLogo from "./components/partner-logo";
import Borders from "./components/borders";
import Colors from "./components/colors";
import Dividers from "./components/dividers";
import EmbedVideo from "./components/embed-video";
import Images from "./components/images";
import ListGroup from "./components/list-group";
import Modal from "./components/modal";
import Pagination from "./components/pagination";
import ProgressBar from "./components/progress-bar";
import Scrollspy from "./components/scrollspy";
import Spinners from "./components/spinners";
import StretchedLink from "./components/stretched-link";
import Shadows from "./components/shadows";
import Sizing from "./components/sizing";
import Tooltips from "./components/tooltips";
import TextTruncation from "./components/text-truncation";
import Typography from "./components/typography";
import Text from "./components/text";
import BootstrapCarousel from "./components/bootstrap-carousel";
import BasicTable from "./components/basic-table";
import DataTable from "./components/data-table";
import PriceTable from "./components/price-table";
import ComparisonTable from "./components/comparison-table";
import Countdown from "./components/countdown";
import Counterup from "./components/counterup"; 

const router = createBrowserRouter([
	// Proman App Routes (Primary)
	{ 
		path: "/", 
		element: <LoginProman />,
		errorElement: <RouteError />
	},
	{ 
		path: "/login", 
		element: <LoginProman />,
		errorElement: <RouteError />
	},
	{ 
		path: "/dashboard", 
		element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
		errorElement: <RouteError />
	},
	{ 
		path: "/work-orders", 
		element: <ProtectedRoute><WorkOrdersList /></ProtectedRoute>,
		errorElement: <RouteError />
	},
	{ 
		path: "/work-order/:id", 
		element: <ProtectedRoute><WorkOrderDetail /></ProtectedRoute>,
		errorElement: <RouteError />
	},
	{ 
		path: "/work-order/:id/photos", 
		element: <ProtectedRoute><WorkOrderPhotos /></ProtectedRoute>,
		errorElement: <RouteError />
	},
	{ 
		path: "/inspections", 
		element: <ProtectedRoute><InspectionsList /></ProtectedRoute>,
		errorElement: <RouteError />
	},
	{ 
		path: "/profile", 
		element: <ProtectedRoute><ProfileProman /></ProtectedRoute>,
		errorElement: <RouteError />
	},
	
	// Demo/Theme Preview Routes (keep for reference)
	{ path: "/theme-demo", element: <MainHome /> },
	{ path: "/hero-blocks", element: <HeroBlocks /> },
	{ path: "/home", element: <Home /> },
	{ path: "/pages", element: <Pages /> },
	{ path: "/elements", element: <Elements /> },
	{ path: "/chat-users", element: <ChatUsers /> },
	{ path: "/settings", element: <Settings /> },
	{ path: "/social-login", element: <SocialLogin /> },
	{ path: "/register", element: <Register /> },
	{ path: "/otp", element: <Otp /> },
	{ path: "/otp-confirm", element: <OtpConfirm /> },
	{ path: "/forget-password", element: <ForgetPassword /> },
	{ path: "/forget-password-success", element: <ForgetPasswordSuccess /> },
	{ path: "/change-password", element: <ChangePassword /> },
	{ path: "/forget-password-failed", element: <ForgetPasswordFailed /> },
	{ path: "/chat", element: <Chat /> },
	{ path: "/video-call", element: <VideoCall /> },
	{ path: "/shop-grid", element: <ShopGrid /> },
	{ path: "/shop-list", element: <ShopList /> },
	{ path: "/shop-details", element: <ShopDetails /> },
	{ path: "/cart", element: <Cart /> },
	{ path: "/checkout", element: <Checkout /> },
	{ path: "/payment-confirm", element: <PaymentConfirm /> },
	{ path: "/team", element: <Team /> },
	{ path: "/our-service", element: <OurService /> },
	{ path: "/privacy-policy", element: <PrivacyPolicy /> },
	{ path: "/invoice", element: <Invoice /> },
	{ path: "/contact", element: <Contact /> },
	{ path: "/faq", element: <Faq /> },
	{ path: "/language", element: <Language /> },
	{ path: "/notifications", element: <Notifications /> },
	{ path: "/notification-details", element: <NotificationDetails /> },
	{ path: "/search-result", element: <SearchResult /> },
	{ path: "/fallback", element: <Fallback /> },
	{ path: "/coming-soon", element: <ComingSoon /> },
	{ path: "/user-profile", element: <UserProfile /> },
	{ path: "/blog-grid", element: <BlogGrid /> },
	{ path: "/blog-list", element: <BlogList /> },
	{ path: "/blog-details", element: <BlogDetails /> },
	{ path: "/header-menu", element: <HeaderMenu /> },
	{ path: "/footer-menu", element: <FooterMenu /> },
	{ path: "/sidebar-left-menu", element: <SidebarLeftMenu /> },
	{ path: "/sidebar-right-menu", element: <SidebarRightMenu /> },
	{ path: "/alerts", element: <Alerts /> },
	{ path: "/toasts", element: <Toasts /> },
	{ path: "/online-offline-detection", element: <OnlineOfflineDetection /> },
	{ path: "/form-input", element: <FormInput /> },
	{ path: "/form-textarea", element: <FormTextarea /> },
	{ path: "/form-select", element: <FormSelect /> },
	{ path: "/form-input-group", element: <FormInputGroup /> },
	{ path: "/form-check", element: <FormCheck /> },
	{ path: "/form-radio", element: <FormRadio /> },
	{ path: "/form-file-upload", element: <FormFileUpload /> },
	{ path: "/form-range", element: <FormRange /> },
	{ path: "/form-auto-complete", element: <FormAutoComplete /> },
	{ path: "/form-switches", element: <FormSwitches /> },
	{ path: "/form-validation", element: <FormValidation /> },
	{ path: "/accordion", element: <Accordion /> },
	{ path: "/badge", element: <Badge /> },
	{ path: "/button", element: <Button /> },
	{ path: "/breadcrumb", element: <Breadcrumb /> },
	{ path: "/timeline", element: <Timeline /> },
	{ path: "/card", element: <Card /> },
	{ path: "/image-gallery", element: <ImageGallery /> },
	{ path: "/tab", element: <Tab /> },
	{ path: "/offcanvas", element: <Offcanvas /> },
	{ path: "/user-ratings", element: <UserRatings /> },
	{ path: "/testimonial", element: <Testimonial /> },
	{ path: "/call-to-action", element: <CallToAction /> },
	{ path: "/partner-logo", element: <PartnerLogo /> },
	{ path: "/borders", element: <Borders /> },
	{ path: "/colors", element: <Colors /> },
	{ path: "/dividers", element: <Dividers /> },
	{ path: "/embed-video", element: <EmbedVideo /> },
	{ path: "/images", element: <Images /> },
	{ path: "/list-group", element: <ListGroup /> },
	{ path: "/modal", element: <Modal /> },
	{ path: "/pagination", element: <Pagination /> },
	{ path: "/progress-bar", element: <ProgressBar /> },
	{ path: "/scrollspy", element: <Scrollspy /> },
	{ path: "/spinners", element: <Spinners /> },
	{ path: "/stretched-link", element: <StretchedLink /> },
	{ path: "/shadows", element: <Shadows /> },
	{ path: "/sizing", element: <Sizing /> },
	{ path: "/tooltips", element: <Tooltips /> },
	{ path: "/text-truncation", element: <TextTruncation /> },
	{ path: "/typography", element: <Typography /> },
	{ path: "/text", element: <Text /> },
	{ path: "/bootstrap-carousel", element: <BootstrapCarousel /> },
	{ path: "/basic-table", element: <BasicTable /> },
	{ path: "/data-table", element: <DataTable /> },
	{ path: "/price-table", element: <PriceTable /> },
	{ path: "/comparison-table", element: <ComparisonTable /> },
	{ path: "/countdown", element: <Countdown /> },
	{ path: "/counterup", element: <Counterup /> }, 

	// Demo login (original)
	{ path: "/demo-login", element: <Login /> },
	{ path: "/about-us", element: <Aboutus /> },

	{ 
		path: "*", 
		element: <Error />,
		errorElement: <RouteError />
	},
]);

function App() {
	return (
		<ErrorBoundary>
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
		</ErrorBoundary>
	);
}

export default App;
