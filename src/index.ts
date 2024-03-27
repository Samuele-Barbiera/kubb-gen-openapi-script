#!/usr/bin/env node
import path from "node:path";
import { execa } from "execa";
import type { PackageJson } from "type-fest";

import fs from "fs-extra";
import { runCli } from "~/cli/index.js";
import { createProject } from "~/helpers/createProject.js";
import { logNextSteps } from "~/helpers/logNextSteps.js";
import { setImportAlias } from "~/helpers/setImportAlias.js";
import { buildPkgInstallerMap } from "~/installers/index.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { logger } from "~/utils/logger.js";
import { renderTitle } from "~/utils/renderTitle.js";
import { installDependencies } from "~/helpers/installDependencies.js";
import { getVersion } from "~/utils/getKubbSwaggerCliVersion.js";
import { getNpmVersion, renderVersionWarning } from "~/utils/renderVersionWarning.js";

type KubbSwaggerCliPackageJSON = PackageJson & {
	cKubbSwaggerCliaMetadata?: {
		initVersion: string;
	};
};

const main = async () => {
	const pkgManager = getUserPkgManager();
	console.log("🚀 ~ main ~ pkgManager:", pkgManager);
	renderTitle();

	const {
		flags: { noInstall, importAlias },
	} = await runCli();

	const usePackages = buildPkgInstallerMap();

	const projectDir = await createProject({
		packages: usePackages,
		importAlias,
		noInstall,
	});

	// Write name to package.json
	const pkgJson = fs.readJSONSync(path.join(projectDir, "package.json")) as KubbSwaggerCliPackageJSON;
	pkgJson.cKubbSwaggerCliaMetadata = { initVersion: await getVersion() };

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

	// update import alias in any generated files if not using the default
	if (importAlias !== "~/") {
		setImportAlias(projectDir, importAlias);
	}

	if (!noInstall) {
		await installDependencies({ projectDir });
	}

	await logNextSteps({
		packages: usePackages,
		noInstall,
		projectDir,
	});

	process.exit(0);
};

main().catch(err => {
	logger.error("Aborting installation...", err);
	if (err instanceof Error) {
		logger.error(err);
	} else {
		logger.error("An unknown error has occurred. Please open an issue on github with the below:");
		console.log(err);
	}
	process.exit(1);
});
