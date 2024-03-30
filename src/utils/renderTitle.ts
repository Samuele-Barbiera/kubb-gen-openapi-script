import chalk from "chalk";
import { getUserPkgManager } from "~/src/utils/getUserPkgManager.js";

export const renderTitle = () => {
	// resolves weird behavior where the ascii is offset
	const pkgManager = getUserPkgManager();
	if (pkgManager === "yarn" || pkgManager === "pnpm") {
		console.log("");
	}

	console.log(chalk.bgRedBright("React Typescript code base project is needed to use this cli!"));
};
