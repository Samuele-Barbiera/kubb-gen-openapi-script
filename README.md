# gen-sdk-api

To scaffold the SDKs in your react / tsx  app using `gen-sdk-api`, run any of the following four commands and answer the command prompt questions:

### npm

```bash
npm gen-sdk-api@latest
```

### yarn

```bash
yarn gen-sdk-api
```

### pnpm

```bash
pnpm gen-sdk-api@latest
```

### bun

```bash
bun gen-sdk-api@latest
``` 

### Output

The script logs a message to the console when the OpenAPI document has been processed and saved.

Please note that this is a basic outline and you may need to add more details depending on the complexity of your project and the level of detail you want to provide in your documentation.

Determining workspace structure

Deciding which workspace information to collect

Gathering workspace info

Sure, here's a continuation of the [`README.md`](command:_github.copilot.openRelativePath?%5B%22README.md%22%5D "README.md") based on the information from [`index.ts`](command:_github.copilot.openRelativePath?%5B%22index.ts%22%5D "index.ts"):

## Usage

The `gen-sdk-api` CLI tool is used to generate SDKs for your React/TypeScript application based on a Swagger/OpenAPI document. Here's a step-by-step guide on how it works:

1. **Selecting the Configuration**: The CLI prompts you to select the configuration you'd like to use. You can choose between `Axios` and `Tanstack-query`. This selection determines the packages that will be installed and the files and folders that will be imported.

```bash
? What kubb config would you like to use? (Use arrow keys)
❯ Axios
  Tanstack-query
```

2. **Installing Dependencies**: If you haven't set the `noInstall` flag, the CLI will prompt you to confirm whether it should run the installation command for you. This step installs the necessary dependencies for the selected configuration.

```bash
? Should we run 'npm install' for you? (Y/n)
```

3. **Providing the Swagger File Path**: You're then asked to provide the path to your Swagger file. This file will be used to generate the SDKs.

```bash
? Indicate the path to the swagger file (./api.yaml)
```

4. **Processing the Swagger File**: The CLI runs a schema validation for the provided Swagger file. It logs a message to the console when the OpenAPI document has been processed and saved.

5. **Generating the SDKs**: Finally, the CLI runs the `kubbGenCommand` to generate the code based on the provided Swagger file and the selected configuration.

If everything is successful, the process exits with code 0. If an error occurs during any of these steps, it's logged to the console and the process exits with code 1.



## Contributing
Please see the CONTRIBUTING.md for details on how to contribute to this project.

## License
This project is licensed under the terms of the license provided in LICENSE.md.

