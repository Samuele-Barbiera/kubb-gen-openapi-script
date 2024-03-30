import path from "node:path";

import { installPackages } from "~/src/helpers/installPackages.js";
import { scaffoldProject } from "~/src/helpers/scaffoldProject";
import type { PkgInstallerMap } from "~/src/installers/index.js";
import { getUserPkgManager } from "~/src/utils/getUserPkgManager.js";

interface CreateSdkApiOptions {
	packages: PkgInstallerMap;
	noInstall: boolean;
}

export const createSdkApi = async ({ packages, noInstall }: CreateSdkApiOptions) => {
	const pkgManager = getUserPkgManager();
	const projectDir = path.resolve(process.cwd());

	// Bootstraps the base Next.js application
	await scaffoldProject({
		projectDir,
		pkgManager,
		noInstall,
	});

	// Install the selected packages
	installPackages({
		projectDir,
		pkgManager,
		packages,
		noInstall,
	});

	return projectDir;
};
