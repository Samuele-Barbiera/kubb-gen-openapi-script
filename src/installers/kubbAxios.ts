import path from "node:path";

import fs from "fs-extra";
import type { AvailableDependencies } from "~/src/installers/dependencyVersionMap";
import type { Installer } from "~/src/installers/index.js";
import { addPackageDependency } from "~/src/utils/addPackageDependency";
import { PKG_ROOT } from "~/consts";

export const dynamicKubbAxiosInstaller: Installer = ({ projectDir, packages }) => {
	const deps: AvailableDependencies[] = [
		"@kubb/core",
		"@kubb/swagger-ts",
		"@kubb/swagger",
		"@kubb/react",
		"@kubb/swagger-client",
	];

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});

	const sourceTemplatesDir = path.join(PKG_ROOT, "templates/axios");
	fs.copySync(sourceTemplatesDir, path.join(projectDir, "api/templatesSDK/client"));

	const axiosFileContent = [
		"import { defineConfig } from '@kubb/core';",
		"import { definePlugin as createSwagger } from '@kubb/swagger';",
		"import { definePlugin as createSwaggerTanstackQuery } from '@kubb/swagger-tanstack-query';",
		"import { definePlugin as createSwaggerTS } from '@kubb/swagger-ts';",
		"import * as client from './api/templatesSDK/client'",

		"export default defineConfig(async () => {",
		"await setTimeout(() => {",
		"return Promise.resolve(true)",
		"}, 1000)",
		"	return {",
		"root: '.',",
		"input: {",
		`path:  '${packages?.kubbAxios.importSwaggerFilePath.replace(".yaml", "_updated.yaml")}'`,
		"},",
		"output: {",
		"path: './api/gen',",
		"},",
		"logLevel: 'info',",
		"plugins: [",
		"['@kubb/swagger', { output: false, validate: true }],",
		"[",
		" '@kubb/swagger-ts',",
		"{",
		"output: { path: 'models/ts' },",
		" group: {",
		"type: 'tag',",
		"},",
		"enumType: 'asPascalConst',",
		"dateType: 'date',",
		" },",
		" ],",
		"[",
		"'@kubb/swagger-client',",
		" {",
		" output: {",
		"path: './clients/axios',",
		" },",
		" exclude: [",
		"{",
		" type: 'tag',",
		" pattern: 'store',",
		" },",
		"],",
		"group: { type: 'tag', output: './clients/axios/{{tag}}Service' },",
		"override: [",
		"{",
		"type: 'tag',",
		"pattern: 'user',",
		"options: {",
		"templates: {",
		"client: client.templates,",
		"},",
		"},",
		"},",
		" ],",
		"},",
		"],",
		"],",
		"};",
		"});",
	].join("\n");

	const kubbAxioConfigDest = path.join(projectDir, "kubb.config.ts");
	fs.writeFileSync(kubbAxioConfigDest, axiosFileContent, "utf-8");
};
