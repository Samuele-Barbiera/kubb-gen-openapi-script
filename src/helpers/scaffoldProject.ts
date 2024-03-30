import chalk from "chalk";
import ora from "ora";

import type { InstallerOptions } from "~/src/installers/index.js";
import { logger } from "~/src/utils/logger.js";

// This bootstraps the base Next.js application
export const scaffoldProject = async ({ projectDir, pkgManager, noInstall }: InstallerOptions) => {
	if (!noInstall) {
		logger.info(`\nUsing: ${chalk.cyan.bold(pkgManager)}\n`);
	} else {
		logger.info("");
	}

	const spinner = ora({ text: `Scaffolding in: ${projectDir}...\n`, discardStdin: false }).start();

	spinner.start();

	spinner.succeed(`${chalk.green("scaffolded successfully!")}\n`);
};
