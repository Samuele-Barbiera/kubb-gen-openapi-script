/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 */
export const dependencyVersionMap = {
	// Kubb
	"@kubb/core": "^2.12.5",
	"@kubb/swagger": "^2.12.5",
	"@kubb/swagger-tanstack-query": "^2.12.5",
	"@kubb/swagger-ts": "^2.12.5",
	"@kubb/swagger-client": "^2.12.5",
	"@kubb/react": "^2.12.5",
} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;
