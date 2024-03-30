#!/usr/bin/env node
import path from "node:path";
import { execa } from "execa";
import type { PackageJson } from "type-fest";

import fs from "fs-extra";
import { runCli } from "~/src/start/index.js";
import { createSdkApi } from "~/src/helpers/createSdkApi.js";
import { buildPkgInstallerMap } from "~/src/installers/index.js";
import { getUserPkgManager } from "~/src/utils/getUserPkgManager.js";
import { logger } from "~/src/utils/logger.js";
import { renderTitle } from "~/src/utils/renderTitle.js";
import { installDependencies } from "~/src/helpers/installDependencies.js";
import { getVersion } from "~/src/utils/getKubbSwaggerCliVersion.js";
import { getNpmVersion, renderVersionWarning } from "~/src/utils/renderVersionWarning.js";
import { processOpenApiDocument } from "~/src/scripts";
import ora from "ora";
import chalk from "chalk";
import { kubbGenCommand } from "~/src/helpers/runKubbGen";

type KubbSwaggerCliPackageJSON = PackageJson & {
	cKubbSwaggerCliaMetadata?: {
		initVersion: string;
	};
};

const main = async () => {
	const pkgManager = getUserPkgManager();
	const npmVersion = await getNpmVersion();
	renderTitle();
	npmVersion && renderVersionWarning(npmVersion);

	const {
		packages,
		flags: { noInstall, importSwaggerFilePath },
	} = await runCli();

	const usePackages = buildPkgInstallerMap(packages, importSwaggerFilePath);

	const projectDir = await createSdkApi({
		packages: usePackages,
		noInstall,
	});

	// Write name to package.json
	const pkgJson = fs.readJSONSync(path.join(projectDir, "package.json")) as KubbSwaggerCliPackageJSON;
	pkgJson.cKubbSwaggerCliaMetadata = { initVersion: getVersion() };

	// ? Bun doesn't support this field (yet)
	if (pkgManager !== "bun") {
		const { stdout } = await execa(pkgManager, ["-v"], {
			cwd: projectDir,
		});
		pkgJson.packageManager = `${pkgManager}@${stdout.trim()}`;
	}

	fs.writeJSONSync(path.join(projectDir, "package.json"), pkgJson, {
		spaces: 2,
	});

	if (!noInstall) {
		await installDependencies({ projectDir });
	}

	const spinner = ora({
		text: `Running the schema validation for this file ${importSwaggerFilePath}...`,
		discardStdin: false,
	}).start();
	await processOpenApiDocument(importSwaggerFilePath);

	spinner.succeed(chalk.green("Conversion and check of the swagger schema done"));

	await kubbGenCommand({ projectDir });

	process.exit(0);
};

main().catch(err => {
	logger.error("Aborting installation...", err);
	if (err instanceof Error) {
		logger.error(err);
	} else {
		logger.error("An unknown error has occurred. Please open an issue on github with the below:");
		logger.error(err);
	}
	process.exit(1);
});
