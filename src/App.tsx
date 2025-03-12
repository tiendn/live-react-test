import React from "react";
import { WalletTransactionManager } from "./components/WalletTransactionManager";
import "./index.css";

const App: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-dark-900">
			<WalletTransactionManager />
		</div>
	);
};

export default App;
