import path from "node:path";

import fs from "fs-extra";
import type { Installer } from "~/installers/index.js";
import type { AvailableDependencies } from "~/installers/dependencyVersionMap";
import { addPackageDependency } from "~/utils/addPackageDependency";

const getKubbAxiosConfig = () => {
	const kubbAxiosConfig = fs.readFileSync("~/../templates/config/axios/kubb.config");

	return kubbAxiosConfig;
};

export const dynamicKubbAxiosInstaller: Installer = ({ projectDir, packages }) => {
	const deps: AvailableDependencies[] = ["@kubb/core", "@kubb/swagger-ts", "@kubb/swagger"];

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});
	const kubbAxiosConfig = getKubbAxiosConfig();

	const kubbAxiosrcFileContents = [`${JSON.stringify(kubbAxiosConfig, null, 2)}`].join("\n");

	const kubbAxiosConfigDest = path.join(projectDir, "kubb.config.ts");
	fs.writeFileSync(kubbAxiosConfigDest, kubbAxiosrcFileContents, "utf-8");
};
