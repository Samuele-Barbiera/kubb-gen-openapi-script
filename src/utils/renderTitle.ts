import { getUserPkgManager } from "~/utils/getUserPkgManager.js";

export const renderTitle = () => {
	// resolves weird behavior where the ascii is offset
	const pkgManager = getUserPkgManager();
	if (pkgManager === "yarn" || pkgManager === "pnpm") {
		console.log("");
	}
};
