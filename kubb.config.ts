import { defineConfig } from "@kubb/core";
import createSwagger from "@kubb/swagger";
import createSwaggerTanstackQuery from "@kubb/swagger-tanstack-query";
import createSwaggerTS from "@kubb/swagger-ts";

import * as queryKey from "./templates/queryKey/index";
import * as operations from "./templates/operations/index";
import * as mutation from "./templates/mutate/index";

export default defineConfig(async () => {
	return {
		root: ".",
		input: {
			path: "./path_to_your_openapi_updated.yaml",
		},
		output: {
			path: "./src",
		},
		hooks: {
			// done: ['prettier --write "**/*.{ts,tsx}"', 'eslint --fix ./src/gen'],
		},
		plugins: [
			createSwagger({ output: false }),
			createSwaggerTS({
				output: {
					path: "models",
				},
			}),
			createSwaggerTanstackQuery({
				transformers: {
					name: (
						name: string,
						type?: "function" | "type" | "file" | undefined,
					) => {
						if (type === "file" || type === "function") {
							return `${name}Hook`;
						}
						return name;
					},
				},
				output: {
					path: "./hooks",
				},
				framework: "react",
				query: {
					queryKey: (keys) => ['"v5"', ...keys],
				},
				suspense: {},
				override: [
					{
						type: "operationId",
						pattern: "findPetsByTags",
						options: {
							dataReturnType: "full",
							infinite: {
								queryParam: "pageSize",
								initialPageParam: 0,
								cursorParam: undefined,
							},
							templates: {
								queryKey: queryKey.templates,
							},
						},
					},
					{
						type: "operationId",
						pattern: "updatePetWithForm",
						options: {
							query: {
								queryKey: (key: unknown[]) => key,
								methods: ["post"],
							},
						},
					},
				],
				templates: {
					operations: operations.templates,
					mutation: mutation.templates,
				},
			}),
		],
	};
});
