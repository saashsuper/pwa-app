import FooterTwo from "../../layouts/footers/FooterTwo";
import HeaderSix from "../../layouts/headers/HeaderSix";
import DataTableArea from "./DataTableArea";

 

const DataTable = () => {
	return (
		<>
			<HeaderSix links="pages" title="Data Table" />
			<DataTableArea />
			<FooterTwo />
		</>
	);
};

export default DataTable;
