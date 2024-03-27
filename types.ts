export type Parameter = {
	in: string;
	name: string;
	description?: string;
	required?: boolean;
	schema: { type: string };
	example?: string;
	examples?: unknown;
};

export type Operation = {
	summary?: string;
	description?: string;
	parameters?: Parameter[];
	responses?: Record<string, unknown>;
	tags?: string[];
};

export type PathItem = {
	get?: Operation;
	put?: Operation;
	post?: Operation;
	delete?: Operation;
	options?: Operation;
	head?: Operation;
	patch?: Operation;
	trace?: Operation;
};

export type OpenApiDocument = {
	paths: Record<string, PathItem>;
};

export type BlacklistedObj = {
	url: string;
	parameterName: string;
};

export type BlackListData = {
	blacklisted: BlacklistedObj[];
};

export type ParameterBlockIndices = {
	parameterBlockStart: number;
	parameterBlockEnd: number;
};
