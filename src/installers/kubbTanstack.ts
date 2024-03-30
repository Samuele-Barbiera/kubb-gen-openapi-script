import path from "node:path";

import fs from "fs-extra";
import { PKG_ROOT } from "~/consts";
import type { AvailableDependencies } from "~/src/installers/dependencyVersionMap";
import type { Installer } from "~/src/installers/index.js";
import { addPackageDependency } from "~/src/utils/addPackageDependency";

export const dynamicKubbTanstackInstaller: Installer = ({ projectDir, packages }) => {
	const deps: AvailableDependencies[] = [
		"@kubb/swagger-tanstack-query",
		"@kubb/core",
		"@kubb/swagger-ts",
		"@kubb/swagger",
		"@kubb/react",
	];

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});

	const appFileDir = path.join(PKG_ROOT, "templates/tanstack-query");

	const appSrc = path.join(appFileDir, "templatesSDK");
	const appDest = path.join(projectDir, "templatesSDK");
	fs.copySync(appSrc, appDest);

	const tanstackFileContent = [
		"import { defineConfig } from '@kubb/core';",
		"import createSwaggerTS from '@kubb/swagger-ts';",
		"import createSwagger from '@kubb/swagger';",
		"import createSwaggerTanstackQuery from '@kubb/swagger-tanstack-query';",

		"import * as mutation from './templatesSDK/mutate/index';",
		"import * as operations from './templatesSDK/operations/index';",
		"import * as queryKey from './templatesSDK/queryKey/index';",

		"export default defineConfig(async () => {",
		"	return {",
		"root: '.',",
		"input: {",
		`path:  '${packages?.kubbTanstack.importSwaggerFilePath.replace(".yaml", "_updated.yaml")}'`,
		"},",
		"output: {",
		"path: './api/gen',",
		"},",
		"plugins: [",
		"createSwagger({ output: false }),",
		"createSwaggerTS({",
		"output: {",
		"path: 'models',",
		"},",
		"}),",
		"createSwaggerTanstackQuery({",
		"transformers: {",
		"name: (name: string, type?: 'function' | 'type' | 'file' | undefined) => {",
		"if (type === 'file' || type === 'function') {",
		"return `${name}Hook`;",
		"}",
		"return name;",
		"},",
		"},",
		"output: {",
		"path: './hooks',",
		"},",
		"framework: 'react',",
		"query: {",
		"queryKey: keys => ['v5', ...keys],",
		"},",
		"suspense: {},",
		"override: [",
		"{",
		"type: 'operationId',",
		"pattern: 'findPetsByTags',",
		"options: {",
		"dataReturnType: 'full',",
		"infinite: {",
		"queryParam: 'pageSize',",
		"initialPageParam: 0,",
		"cursorParam: undefined,",
		"},",
		"templates: {",
		"queryKey: queryKey.templates,",
		"},",
		"},",
		"},",
		"{",
		"type: 'operationId',",
		"pattern: 'updatePetWithForm',",
		"options: {",
		"query: {",
		"queryKey: (key: unknown[]) => key,",
		"methods: ['post'],",
		"},",
		"},",
		"},",
		"],",
		"templates: {",
		"operations: operations.templates,",
		"mutation: mutation.templates,",
		"},",
		"}),",
		"],",
		"};",
		"});",
	].join("\n");

	const kubbTanstackConfigDest = path.join(projectDir, "kubb.config.ts");
	fs.writeFileSync(kubbTanstackConfigDest, tanstackFileContent, "utf-8");
};
