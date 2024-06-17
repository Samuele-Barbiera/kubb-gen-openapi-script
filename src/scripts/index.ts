import fs from "fs-extra";
import * as yaml from "js-yaml";
import { logger } from "~/src/utils/logger";
import type { BlackListData, OpenApiDocument, Parameter } from "../../types";

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
	const fileContent = await fs.readFile(filePath, "utf8");
	return yaml.load(fileContent) as OpenApiDocument;
}

/**
 * Saves an OpenAPI document to a YAML file.
 * @param filePath - The path to save the YAML file.
 * @param document - The OpenAPI document to save.
 */
async function saveOpenApiDocument(filePath: string, document: OpenApiDocument): Promise<void> {
	const yamlStr = yaml.dump(document, { noRefs: true, lineWidth: -1 });
	await fs.writeFile(filePath, yamlStr);
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
function loadBlackListData(filePath: string): BlackListData {
	const file = fs.readFileSync(filePath, "utf8");
	const data = JSON.parse(file);
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
	const loadBlackListJson = loadBlackListData(blacklistFileConfigPath);
	const yamlContent = await fs.readFile(yamlFilePath, "utf8");
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
	await fs.writeFile(yamlFilePath, updatedYamlContent);

	logger.info("Parameters removed successfully.");
}

interface PathData {
	[path: string]: {
		[method: string]: {
			responses: {
				[status: string]: {
					content: {
						"application/json": {
							schema: any;
						};
					};
				};
			};
		};
	};
}

interface ComponentData {
	[schemaName: string]: {
		type: string;
		properties?: any;
		$ref?: string;
	};
}

const addSchemas = (pathData: PathData, componentData: ComponentData) => {
	for (const [path, methods] of Object.entries(pathData)) {
		for (const [method, data] of Object.entries(methods)) {
			if (data.responses && componentData.schemas) {
				componentData.schemas = componentData.schemas || {};
				for (const [status, response] of Object.entries(data.responses)) {
					if (response.content?.["application/json"]) {
						// Sanitize schema name
						const schemaName = `${path.replace(/\//g, "_").slice(1)}_${method.toLowerCase()}_response`.replace(
							/[^a-zA-Z0-9.-_]/g,
							""
						);

						// Check if schema name matches the regular expression
						if (/^[a-zA-Z0-9.-_]+$/.test(schemaName)) {
							// Schema name is valid, proceed with adding it to components
							const schema = response.content["application/json"].schema;
							componentData.schemas[schemaName] = {
								type: "object",
								properties: schema.properties,
							};
							response.content["application/json"].schema = {
								$ref: `#/components/schemas/${schemaName}`,
							};
						} else {
							// Schema name is not valid, handle the error or take appropriate action
							console.error("Invalid schema name:", schemaName);
						}
					}
				}
			}
		}
	}
};

const readFile = async (filePath: string): Promise<any> => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(yaml.load(data));
			}
		});
	});
};

const writeFile = async (filePath: string, data: any): Promise<void> => {
	return new Promise((resolve, reject) => {
		fs.writeFile(filePath, yaml.dump(data), "utf8", err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

/**
 * Main function to process the OpenAPI document.
 * @param openApiFilePath - The path to the OpenAPI YAML file.
 * @param blacklistFileConfigPath - The path to the blacklist JSON file.
 */
export async function processOpenApiDocument(openApiFilePath: string, blacklistFileConfigPath?: string): Promise<void> {
	try {
		const openapiData = await readFile(openApiFilePath);
		const pathData: PathData = openapiData.paths;
		const componentData: ComponentData = {};
		addSchemas(pathData, componentData);
		openapiData.components = openapiData.components || {};
		openapiData.components = { ...openapiData.components, ...componentData };
		await writeFile(openApiFilePath.replace(".yaml", "_updated.yaml"), openapiData);
		console.log("Modified OpenAPI file has been saved successfully.");
	} catch (error) {
		console.error("Error modifying OpenAPI file:", error);
	}
}
