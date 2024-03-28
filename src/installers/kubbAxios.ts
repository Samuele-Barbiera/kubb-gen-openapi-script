import path from "node:path";

import fs from "fs-extra";
import type { Installer } from "~/src/installers/index.js";
import type { AvailableDependencies } from "~/src/installers/dependencyVersionMap";
import { addPackageDependency } from "~/src/utils/addPackageDependency";

const getKubbAxiosConfig = () => {
	const kubbAxiosConfig = fs.readFileSync("~/../templates/config/axios/kubb.config");

	return kubbAxiosConfig;
};

export const dynamicKubbAxiosInstaller: Installer = ({ projectDir, packages }) => {
	const deps: AvailableDependencies[] = ["@kubb/core", "@kubb/swagger-ts", "@kubb/swagger"];
	console.log("🚀 ~ deps:", deps);

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});
	const kubbAxiosConfig = getKubbAxiosConfig();
	console.log("🚀 ~ kubbAxiosConfig:");

	const kubbAxiosrcFileContents = [`${JSON.stringify(kubbAxiosConfig, null, 2)}`].join("\n");

	const kubbAxiosConfigDest = path.join(projectDir, "kubb.config.ts");
	console.log("🚀 ~ kubbAxiosConfigDest:", kubbAxiosConfigDest)
	fs.writeFileSync(kubbAxiosConfigDest, kubbAxiosrcFileContents, "utf-8");
};
