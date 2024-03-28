import path from "node:path";

import fs from "fs-extra";
import type { Installer } from "~/src/installers/index.js";
import { addPackageDependency } from "~/src/utils/addPackageDependency";
import type { AvailableDependencies } from "~/src/installers/dependencyVersionMap";
import { PKG_ROOT } from "~/consts";

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
	console.log("🚀 ~ devMode:");

	const sourceTemplatesDir = path.join(projectDir, "templatesSDK");

	const tanstackKubbDir = path.join(projectDir, "templates/tanstack-query");

	fs.copySync(sourceTemplatesDir, tanstackKubbDir);

	fs.copyFileSync(
		path.join(PKG_ROOT, "templates/config/tanstack-query/kubb.config.ts"),
		path.join(projectDir, "kubb.config.ts")
	);
};
