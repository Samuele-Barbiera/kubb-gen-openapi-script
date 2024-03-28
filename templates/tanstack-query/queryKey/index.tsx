import { type URLObject, URLPath } from "@kubb/core/utils";
import { Function as FunctionKubb, Type } from "@kubb/react";
import { QueryKey } from "@kubb/swagger-tanstack-query/components";
import { useOperation, useOperationSchemas } from "@kubb/swagger/hooks";
// biome-ignore lint/style/useImportType: <explanation>
import React from "react";

export const templates = {
	...QueryKey.templates,
	react: ({
		name,
		typeName,
		params,
		generics,
		returnType,
		JSDoc,
	}: React.ComponentProps<typeof QueryKey.templates.react>) => {
		const schemas = useOperationSchemas();
		const operation = useOperation();
		const path = new URLPath(operation.path);
		const withQueryParams = !!schemas.queryParams?.name;

		const pathObject = path.toObject({
			type: "path",
		}) as URLObject;

		const keys = [JSON.stringify(pathObject.url), withQueryParams ? "...(params ? [params] : [])" : undefined].filter(
			Boolean
		);

		return (
			<>
				<FunctionKubb.Arrow
					name={name}
					export
					generics={generics}
					params={params}
					returnType={returnType}
					singleLine
					JSDoc={JSDoc}
				>
					{`[${keys}] as const`}
				</FunctionKubb.Arrow>

				<Type
					name={typeName}
					export
				>
					{`ReturnType<typeof ${name}>`}
				</Type>
			</>
		);
	},
} as const;
