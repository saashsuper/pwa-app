import { Link } from "react-router-dom";
import ScrollTop from "../common/ScrollTop";

 

const VideoCall = () => {
	return (
		<>
		<ScrollTop />
			<div
				className="video-call-screen"
				style={{ backgroundImage: `url(/assets/img/bg-img/36.jpg)` }}
			>
				{/* <!-- Video Streaming Code Goes Here --> */}

				{/* <!-- Back Button--> */}
				<div className="call-back-button">
					<Link to="/chat">
						<i className="bi bi-arrow-left-short"></i>
					</Link>
				</div>

				{/* <!-- Button Group--> */}
				<div className="call-btn-group">
					<Link className="btn btn-dark btn-circle" to="/chat">
						<i className="bi bi-chat-text"></i>
					</Link>

					<a className="btn btn-lg btn-danger p-4 btn-call-cancel" href="#">
						<i className="bi bi-telephone"></i>
					</a>

					<a className="btn btn-dark btn-circle" href="#">
						<i className="bi bi-mic-mute"></i>
					</a>
				</div>
			</div>
		</>
	);
};

export default VideoCall;
