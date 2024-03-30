export const validateImportSwaggerFilePath = (input: string) => {
	if (!input.startsWith("./")) {
		return "Import of the swagger file must start with './'";
	}
	return;
};
