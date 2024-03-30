import path from "node:path";

import fs from "fs-extra";
import type { Installer } from "~/src/installers/index.js";
import type { AvailableDependencies } from "~/src/installers/dependencyVersionMap";
import { addPackageDependency } from "~/src/utils/addPackageDependency";
import { PKG_ROOT } from "~/consts";

export const dynamicKubbAxiosInstaller: Installer = ({ projectDir, importSwaggerFilePath }) => {
	console.log("🚀 ~ projectDir, importSwaggerFilePath:", projectDir, importSwaggerFilePath);
	const deps: AvailableDependencies[] = ["@kubb/core", "@kubb/swagger-ts", "@kubb/swagger"];

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});

	fs.copyFileSync(
		path.join(PKG_ROOT, "templates/config/axios/kubb.config.ts"),
		path.join(projectDir, "kubb.config.ts")
	);
};
