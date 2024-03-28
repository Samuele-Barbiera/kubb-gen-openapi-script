import path from "node:path";
import * as p from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import ora from "ora";

import { PKG_ROOT } from "~/consts.js";
import type { InstallerOptions } from "~/installers/index.js";
import { logger } from "~/utils/logger.js";

// This bootstraps the base Next.js application
export const scaffoldProject = async ({ projectDir, pkgManager, noInstall }: InstallerOptions) => {
	const srcDir = path.join(PKG_ROOT, "templates/tanstack-query");

	if (!noInstall) {
		logger.info(`\nUsing: ${chalk.cyan.bold(pkgManager)}\n`);
	} else {
		logger.info("");
	}

	const spinner = ora(`Scaffolding in: ${projectDir}...\n`).start();

	spinner.start();

	fs.copySync(srcDir, projectDir);
	fs.renameSync(path.join(projectDir, "_gitignore"), path.join(projectDir, ".gitignore"));

	spinner.succeed(`${chalk.green("scaffolded successfully!")}\n`);
};
