import path from "node:path";

import fs from "fs-extra";
import type { Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency";
import type { AvailableDependencies } from "~/installers/dependencyVersionMap";
import { PKG_ROOT } from "~/consts";

const getKubbConfig = () => {
	const kubbTanstackConfig = fs.readFileSync("~/../templates/config/tanstack-query/kubb.config");

	return kubbTanstackConfig;
};

export const dynamicKubbTanstackInstaller: Installer = ({ projectDir, packages }) => {
	const deps: AvailableDependencies[] = [
		"@kubb/swagger-tanstack-query",
		"@kubb/core",
		"@kubb/swagger-ts",
		"@kubb/swagger",
	];

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});

	const tanstackKubbDir = path.join(PKG_ROOT, "~/../templates/tanstack-query/");

	path.join(tanstackKubbDir, "./");
	const sourceDirectory = path.join(tanstackKubbDir, "./");
	const destinationDirectory = path.join(__dirname, "./");

	fs.copy(sourceDirectory, destinationDirectory);

	const kubbTanstackConfig = getKubbConfig();

	const kubbTanstackrcFileContents = [`${JSON.stringify(kubbTanstackConfig, null, 2)}`].join("\n");

	const kubbTanstackConfigDest = path.join(projectDir, "kubb.config.ts");
	fs.writeFileSync(kubbTanstackConfigDest, kubbTanstackrcFileContents, "utf-8");
};
