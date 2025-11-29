 
 

// import dynamic from 'next/dynamic';
// const AboutArea = dynamic(() => import('./AboutArea'), { ssr: false });
import HeaderFour from '../../layouts/headers/HeaderFour';
import FooterTwo from '../../layouts/footers/FooterTwo';
import AboutArea from './AboutArea';



const Aboutus = () => {
	return (
		<>
			<HeaderFour links="pages" title="About Us" />
			<AboutArea />
			<FooterTwo />
		</>
	);
};

export default Aboutus;
