# kubb-gen-scribe-cli

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.33. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# OpenAPI Document Processor

This script loads an OpenAPI document from a YAML file, processes it by removing unmatched path parameters, and saves the updated document as a new YAML file.

### Modules

The script uses the following modules:

bun.file: Node.js built-in module for file system operations.
yaml: A module for parsing and stringifying YAML data.

### Functions

The script defines and uses the following functions:

- loadOpenApiDocument(filePath: string): Loads an OpenAPI document from a YAML file. It reads the file content using fs.readFileSync(), then parses the YAML content into a JavaScript object using yaml.load().

- saveOpenApiDocument(filePath: string, document: OpenApiDocument): Saves an OpenAPI document to a YAML file. It stringifies the OpenAPI document into a YAML string using yaml.dump(), then writes the string to a file using fs.writeFileSync().

- processDocument(document: OpenApiDocument): Processes an OpenAPI document by removing unmatched path parameters. It iterates over the paths and their operations in the document, and filters out any path parameters that are not included in the path string.

### Execution

The script executes the following steps:

1. Load the blacklist data from a JSON file.
2. Load an OpenAPI document from a YAML file using loadOpenApiDocument().
3. Process the OpenAPI document using processDocument().
4. Save the processed OpenAPI document to a new YAML file using saveOpenApiDocument().

### Usage

To use this script, update the path to your OpenAPI YAML file in the filePath variable, then run the script. The processed OpenAPI document will be saved as a new YAML file with \_updated appended to the original file name.

### Output

The script logs a message to the console when the OpenAPI document has been processed and saved.

Please note that this is a basic outline and you may need to add more details depending on the complexity of your project and the level of detail you want to provide in your documentation.
