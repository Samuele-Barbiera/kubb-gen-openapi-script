import * as p from "@clack/prompts";
import { Command } from "commander";
import figlet from "figlet";
import { CREATE_SDK_CLI } from "~/consts.js";
import type { AvailablePackages } from "~/src/installers/index.js";
import { getVersion } from "~/src/utils/getKubbSwaggerCliVersion.js";
import { getUserPkgManager } from "~/src/utils/getUserPkgManager.js";
import { IsTTYError } from "~/src/utils/isTTYError.js";
import { logger } from "~/src/utils/logger.js";

interface CliFlags {
	noInstall: boolean;
	default: boolean;
	importSwaggerFilePath: string;
}

interface CliResults {
	packages: AvailablePackages[];
	flags: CliFlags;
}

const defaultOptions: CliResults = {
	packages: ["kubbAxios", "kubbTanstack"],
	flags: {
		noInstall: false,
		default: false,
		importSwaggerFilePath: "./api.yaml",
	},
};

export const runCli = async (): Promise<CliResults> => {
	console.log(figlet.textSync("kubb gen scribe"));
	const cliResults = defaultOptions;

	// FIXME: TEMPORARY WARNING WHEN USING YARN 3. SEE ISSUE #57
	if (process.env.npm_config_user_agent?.startsWith("yarn/3")) {
		logger.warn(`  WARNING: It looks like you are using Yarn 3. This is currently not supported,
  and likely to result in a crash. Please run gen-sdk-api with another
  package manager such as pnpm, npm, or Yarn Classic.`);
	}

	// cliResults.flags = program.opts();

	if (cliResults.flags.default) {
		return cliResults;
	}

	// Explained below why this is in a try/catch block
	try {
		if (process.env.TERM_PROGRAM?.toLowerCase().includes("mintty")) {
			logger.warn(`  WARNING: It looks like you are using MinTTY, which is non-interactive. This is most likely because you are 
  using Git Bash. If that's that case, please use Git Bash from another terminal, such as Windows Terminal. Alternatively, you 
  can provide the arguments from the CLI directly to skip the prompts.`);

			throw new IsTTYError("Non-interactive environment");
		}

		// if --CI flag is set, we are running in CI mode and should not prompt the user

		const pkgManager = getUserPkgManager();

		//scegli il config (installa i pachetti e importa file e cartelle)
		//runna lo script per validare il file swagger yaml
		//runna kubb

		const project = await p.group(
			{
				runKubb: () => {
					return p.select({
						message: "What kubb config would you like to use?",
						options: [
							{ value: "axios", label: "Axios" },
							{ value: "tanstack-query", label: "Tanstack-query" },
						],
						initialValue: "tanstack-query",
					});
				},
				...(!cliResults.flags.noInstall && {
					install: () => {
						return p.confirm({
							message: `Should we run '${pkgManager}${pkgManager === "yarn" ? `'?` : ` install' for you?`}`,
							initialValue: !defaultOptions.flags.noInstall,
						});
					},
				}),
				importSwaggerFilePath: () => {
					return p.text({
						message: "Indicate the path to the swagger file",
						defaultValue: cliResults.flags.importSwaggerFilePath,
						placeholder: cliResults.flags.importSwaggerFilePath,
						initialValue: defaultOptions.flags.importSwaggerFilePath,
					});
				},
			},
			{
				onCancel() {
					process.exit(1);
				},
			}
		);

		const packages: AvailablePackages[] = [];

		if (project.runKubb === "tanstack-query") {
			packages.push("kubbTanstack");
		} else {
			packages.push("kubbAxios");
		}

		return {
			packages,
			flags: {
				...cliResults.flags,
				noInstall: !project.install || cliResults.flags.noInstall,
				importSwaggerFilePath: project.importSwaggerFilePath ?? cliResults.flags.importSwaggerFilePath,
			},
		};
	} catch (err) {
		// If the user is not calling gen-sdk-api from an interactive terminal, inquirer will throw an IsTTYError
		// If this happens, we catch the error, tell the user what has happened, and then continue to run the program
		if (err instanceof IsTTYError) {
			logger.warn(`
  ${CREATE_SDK_CLI} needs an interactive terminal to provide options`);

			const shouldContinue = await p.confirm({
				message: "Continue scaffolding the SDKs in the app?",
				initialValue: true,
			});

			if (!shouldContinue) {
				logger.info("Exiting...");
				process.exit(0);
			}

			logger.info("Bootstrapping the SDKs...");
		} else {
			throw err;
		}
	}

	return cliResults;
};
