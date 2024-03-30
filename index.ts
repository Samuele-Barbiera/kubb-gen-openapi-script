#!/usr/bin/env node
import path from "node:path";
import { execa } from "execa";
import type { PackageJson } from "type-fest";

import chalk from "chalk";
import fs from "fs-extra";
import ora from "ora";
import { createSdkApi } from "~/src/helpers/createSdkApi.js";
import { installDependencies } from "~/src/helpers/installDependencies.js";
import { kubbGenCommand } from "~/src/helpers/runKubbGen";
import { buildPkgInstallerMap } from "~/src/installers/index.js";
import { processOpenApiDocument } from "~/src/scripts";
import { runCli } from "~/src/start/index.js";
import { getVersion } from "~/src/utils/getKubbSwaggerCliVersion.js";
import { getUserPkgManager } from "~/src/utils/getUserPkgManager.js";
import { logger } from "~/src/utils/logger.js";
import { renderTitle } from "~/src/utils/renderTitle.js";
import { getNpmVersion, renderVersionWarning } from "~/src/utils/renderVersionWarning.js";

type KubbSwaggerCliPackageJSON = PackageJson & {
	cKubbSwaggerCliaMetadata?: {
		initVersion: string;
	};
};

/**
 * This script is the entry point of the Kubb Gen OpenAPI script.
 * It performs the following tasks:
 * 1. Retrieves the user's package manager and npm version.
 * 2. Renders the title of the script.
 * 3. Renders a version warning if the npm version is outdated.
 * 4. Runs the CLI to get the list of packages and flags.
 * 5. Builds a package installer map based on the packages and importSwaggerFilePath.
 * 6. Creates the SDK API by calling the createSdkApi function.
 * 7. Writes the initVersion to the package.json file.
 * 8. Checks if the package manager is "bun" and if not, retrieves the package manager version.
 * 9. Writes the package.json file with the updated metadata.
 * 10. Installs dependencies if noInstall flag is not set.
 * 11. Runs the schema validation for the importSwaggerFilePath.
 * 12. Runs the kubbGenCommand to generate the code based on the projectDir.
 * 13. Exits the process with code 0 if everything is successful.
 * 14. Handles errors and logs them before exiting the process with code 1.
 */

const main = async () => {
	// Step 1: Retrieve the user's package manager and npm version
	const pkgManager = getUserPkgManager();
	const npmVersion = await getNpmVersion();

	// Step 2: Render the title of the script
	renderTitle();

	// Step 3: Render a version warning if the npm version is outdated
	npmVersion && renderVersionWarning(npmVersion);

	// Step 4: Run the CLI to get the list of packages and flags
	const {
		packages,
		flags: { noInstall, importSwaggerFilePath },
	} = await runCli();

	// Step 5: Build a package installer map based on the packages and importSwaggerFilePath
	const usePackages = buildPkgInstallerMap(packages, importSwaggerFilePath);

	// Step 6: Create the SDK API by calling the createSdkApi function
	const projectDir = await createSdkApi({
		packages: usePackages,
		noInstall,
	});

	// Step 7: Write the initVersion to the package.json file
	const pkgJson = fs.readJSONSync(path.join(projectDir, "package.json")) as KubbSwaggerCliPackageJSON;
	pkgJson.cKubbSwaggerCliaMetadata = { initVersion: getVersion() };

	// Step 8: Check if the package manager is "bun" and if not, retrieve the package manager version
	if (pkgManager !== "bun") {
		const { stdout } = await execa(pkgManager, ["-v"], {
			cwd: projectDir,
		});
		pkgJson.packageManager = `${pkgManager}@${stdout.trim()}`;
	}

	// Step 9: Write the package.json file with the updated metadata
	fs.writeJSONSync(path.join(projectDir, "package.json"), pkgJson, {
		spaces: 2,
	});

	// Step 10: Install dependencies if noInstall flag is not set
	if (!noInstall) {
		await installDependencies({ projectDir });
	}

	// Step 11: Run the schema validation for the importSwaggerFilePath
	const spinner = ora({
		text: `Running the schema validation for this file ${importSwaggerFilePath}...\n`,
		discardStdin: false,
	}).start();
	await processOpenApiDocument(importSwaggerFilePath);

	spinner.succeed(chalk.green("Conversion and check of the swagger schema done"));

	// Step 12: Run the kubbGenCommand to generate the code based on the projectDir
	await kubbGenCommand({ projectDir });

	// Step 13: Exit the process with code 0 if everything is successful
	process.exit(0);
};

// Step 14: Handle errors and log them before exiting the process with code 1
main().catch((err) => {
	logger.error("Aborting installation...", err);
	if (err instanceof Error) {
		logger.error(err);
	} else {
		logger.error("An unknown error has occurred. Please open an issue on github with the below:");
		logger.error(err);
	}
	process.exit(1);
});
