import chalk from "chalk";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";

export const renderTitle = () => {
	// resolves weird behavior where the ascii is offset
	const pkgManager = getUserPkgManager();
	if (pkgManager === "yarn" || pkgManager === "pnpm") {
		console.log("");
	}

	console.log(chalk.redBright("a Typescript project is required to run this cli!"));
};
