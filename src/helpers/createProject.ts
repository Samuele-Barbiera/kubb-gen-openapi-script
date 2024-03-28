import path from "node:path";

import { installPackages } from "~/helpers/installPackages.js";
import { scaffoldProject } from "~/helpers/scaffoldProject";
import { selectAppFile, selectIndexFile } from "~/helpers/selectBoilerplate.js";
import type { PkgInstallerMap } from "~/installers/index.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";

interface CreateProjectOptions {
	packages: PkgInstallerMap;
	noInstall: boolean;
}

export const createProject = async ({ packages, noInstall }: CreateProjectOptions) => {
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

	selectAppFile({ projectDir, packages });
	selectIndexFile({ projectDir, packages });

	return projectDir;
};
