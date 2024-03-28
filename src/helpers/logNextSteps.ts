import type { InstallerOptions } from "~/src/installers/index.js";
import { getUserPkgManager } from "~/src/utils/getUserPkgManager.js";
import { logger } from "~/src/utils/logger.js";

// This logs the next steps that the user should take in order to advance the project
export const logNextSteps = async ({
	packages,
	noInstall,
	projectDir,
}: Pick<InstallerOptions, "packages" | "noInstall" | "projectDir">) => {
	const pkgManager = getUserPkgManager();

	logger.info("Next steps:");
	if (noInstall) {
		// To reflect yarn's default behavior of installing packages when no additional args provided
		if (pkgManager === "yarn") {
			logger.info(`  ${pkgManager}`);
		} else {
			logger.info(`  ${pkgManager} install`);
		}
	}

	if (["npm", "bun"].includes(pkgManager)) {
		logger.info(`  ${pkgManager} run dev`);
	} else {
		logger.info(`  ${pkgManager} dev`);
	}
};
