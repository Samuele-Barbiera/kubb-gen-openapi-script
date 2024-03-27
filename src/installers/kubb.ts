import path from "node:path";

import fs from "fs-extra";
import type { Installer } from "~/installers/index.js";

const getKubbConfig = () => {
	const kubbConfig = fs.readFileSync("~/../templates/tanstack-query/kubb.config");

	return kubbConfig;
};

export const dynamicKubbInstaller: Installer =  ({ projectDir, packages }) => {
	const kubbConfig =  getKubbConfig();

	// Convert config from _kubb.config.json to .kubbrc.cjs
	const kubbrcFileContents = [`${JSON.stringify(kubbConfig, null, 2)}`].join("\n");

	const kubbConfigDest = path.join(projectDir, "kubb.config.ts");
	fs.writeFileSync(kubbConfigDest, kubbrcFileContents, "utf-8");
};
