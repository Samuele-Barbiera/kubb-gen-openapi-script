/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 */
export const dependencyVersionMap = {
	// Kubb
	"@kubb/core": "^2.11.0",
	"@kubb/swagger": "^2.11.0",
	"@kubb/swagger-tanstack-query": "^2.11.0",
	"@kubb/swagger-ts": "^2.11.0",
} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;
