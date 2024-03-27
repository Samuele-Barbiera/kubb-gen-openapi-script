import * as yaml from "js-yaml";
import type { BlackListData, OpenApiDocument, Parameter, ParameterBlockIndices } from "../../types";

/**
 * This script loads an OpenAPI document from a YAML file, processes it by removing unmatched path parameters,
 * and saves the updated document as a new YAML file.
 */

/**
 * Loads an OpenAPI document from a YAML file.
 * @param filePath - The path to the YAML file.
 * @returns The loaded OpenAPI document.
 */
export async function loadOpenApiDocument(filePath: string): Promise<OpenApiDocument> {
	const fileContent = await Bun.file(filePath).text();
	return yaml.load(fileContent) as OpenApiDocument;
}

/**
 * Saves an OpenAPI document to a YAML file.
 * @param filePath - The path to save the YAML file.
 * @param document - The OpenAPI document to save.
 */
async function saveOpenApiDocument(filePath: string, document: OpenApiDocument): Promise<void> {
	const yamlStr = yaml.dump(document, { noRefs: true, lineWidth: -1 });
	await Bun.write(filePath, yamlStr);
}

/**
 * Processes an OpenAPI document by removing unmatched path parameters.
 * @param document - The OpenAPI document to process.
 * @returns The processed OpenAPI document.
 */
function processDocument(document: OpenApiDocument): OpenApiDocument {
	for (const [path, pathItem] of Object.entries(document.paths)) {
		for (const [_, operation] of Object.entries(pathItem)) {
			if (operation?.parameters) {
				operation.parameters = operation.parameters.filter((parameter: { in: string; name: string }) => {
					if (parameter.in === "path") {
						// Check if the path string contains the parameter
						return path.includes(`{${parameter.name}}`);
					}
					return true; // Keep query, header, and other types of parameters
				});
			}
		}
	}

	return document;
}

/**
 * Loads the blacklist data from a JSON file.
 * @param filePath - The path to the JSON file.
 * @returns The loaded blacklist data.
 */
async function loadBlackListData(filePath: string): Promise<BlackListData> {
	const file = Bun.file(filePath);
	const data = await file.json();
	return data as BlackListData;
}

/**
 * Removes blacklisted parameters from a YAML file based on a blacklist file.
 * @param blacklistFileConfigPath - The path to the blacklist file.
 * @param yamlFilePath - The path to the YAML file.
 * @returns A Promise that resolves when the blacklisted parameters are removed successfully.
 */
async function removeBlacklistedParameters(blacklistFileConfigPath: string, yamlFilePath: string): Promise<void> {
	// Load the blacklist data from a JSON file
	const loadBlackListJson = await loadBlackListData(blacklistFileConfigPath);
	const yamlContent = await Bun.file(yamlFilePath).text();
	const document = yaml.load(yamlContent) as unknown as {
		paths: Record<
			string,
			{
				parameters?: Parameter[];
			}
		>;
	};

	for (const entry of loadBlackListJson.blacklisted) {
		const { url, parameterName } = entry;

		// Navigate to the specific path in the document
		if (document.paths[url]) {
			let parameters = document.paths[url]?.parameters;
			if (parameters) {
				parameters = parameters.filter(
					(param: { in: string; name: string }) => !(param.in === "path" && param.name === parameterName)
				);
			}
		}
	}

	// Convert the document back to a YAML string and save it
	const updatedYamlContent = yaml.dump(document);
	await Bun.write(yamlFilePath, updatedYamlContent);

	console.log("Parameters removed successfully.");
}

/**
 * Main function to process the OpenAPI document.
 * @param openApiFilePath - The path to the OpenAPI YAML file.
 * @param blacklistFileConfigPath - The path to the blacklist JSON file.
 */
export async function processOpenApiDocument(openApiFilePath: string, blacklistFileConfigPath: string): Promise<void> {
	try {
		// Load the OpenAPI document from a YAML file
		const openApiDocument = await loadOpenApiDocument(openApiFilePath);

		// Process the OpenAPI document by removing unmatched path parameters
		const updatedDocument = processDocument(openApiDocument);

		// Save the updated OpenAPI document as a new YAML file
		await saveOpenApiDocument(openApiFilePath.replace(".yaml", "_updated.yaml"), updatedDocument);

		console.log("OpenAPI document processed. Unmatched path parameters removed.");

		// Remove blacklisted parameters from the OpenAPI document
		await removeBlacklistedParameters(blacklistFileConfigPath, "path_to_your_openapi_updated.yaml");
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

// // Update the paths to your OpenAPI YAML file and blacklist JSON file
// const openApiFilePath = "path_to_your_openapi.yaml";
// const blacklistFileConfigPath = "./script.config.json";

// // Process the OpenAPI document
// processOpenApiDocument(openApiFilePath, blacklistFileConfigPath);
