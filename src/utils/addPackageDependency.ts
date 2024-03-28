import path from "node:path";
import fs from "fs-extra";
import type { PackageJson } from "type-fest";
import sortPackageJson from "sort-package-json";
import { dependencyVersionMap, type AvailableDependencies } from "~/src/installers/dependencyVersionMap.js";

export const addPackageDependency = (opts: {
	dependencies: AvailableDependencies[];
	devMode: boolean;
	projectDir: string;
}) => {
	const { dependencies, devMode, projectDir } = opts;
	console.log("🚀 ~ opts:", opts);

	const pkgJson = fs.readJSONSync(path.join(projectDir, "package.json")) as PackageJson;

	for (const pkgName of dependencies) {
		const version = dependencyVersionMap[pkgName];

		if (devMode && pkgJson.devDependencies) {
			pkgJson.devDependencies[pkgName] = version;
		} else if (pkgJson.dependencies) {
			pkgJson.dependencies[pkgName] = version;
		}
	}
	const sortedPkgJson = sortPackageJson(pkgJson);
	console.log("🚀 ~ sortedPkgJson:", path.join(projectDir, "package.json"));

	fs.writeJSONSync(path.join(projectDir, "package.json"), sortedPkgJson, {
		spaces: 2,
	});
};
