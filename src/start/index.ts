import * as p from "@clack/prompts";
import { Command } from "commander";
import { execa } from "execa";
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
		importSwaggerFilePath: "./openapi.yaml",
	},
};

export const runCli = async (): Promise<CliResults> => {
	const cliResults = defaultOptions;

	const program = new Command()
		.name(CREATE_SDK_CLI)
		.description("A CLI for generating kubb hooks from a swagger file")
		.option("--noInstall", "Explicitly tell the CLI to not run the package manager's install command", false)
		.option(
			"-y, --default",
			"Bypass the CLI and use all default options to bootstrap the Generated SDKs for all your APIs ",
			false
		)
		/** @experimental - Used for CI E2E tests. Used in conjunction with `--CI` to skip prompting. */
		.option(
			"-i, --import-swagger",
			"Explicitly tell the CLI to use a custom path to the swagger file. Default is './openapi.yaml",
			defaultOptions.flags.importSwaggerFilePath
		)
		/** END CI-FLAGS */
		.version(getVersion(), "-v, --version", "Display the version number")
		.parse(process.argv);

	// FIXME: TEMPORARY WARNING WHEN USING YARN 3. SEE ISSUE #57
	if (process.env.npm_config_user_agent?.startsWith("yarn/3")) {
		logger.warn(`  WARNING: It looks like you are using Yarn 3. This is currently not supported,
  and likely to result in a crash. Please run kubb-gen-scribe-cli with another
  package manager such as pnpm, npm, or Yarn Classic.`);
	}

	cliResults.flags = program.opts();

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
						defaultValue: defaultOptions.flags.importSwaggerFilePath,
						placeholder: defaultOptions.flags.importSwaggerFilePath,
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
		console.log("🚀 ~ runCli ~ packages:", project.runKubb);
		if (project.runKubb === "tanstack-query") {
			packages.push("kubbTanstack");
		} else {
			packages.push("kubbAxios");
		}
		console.log("🚀 ~ runCli ~ packages:", packages);

		return {
			packages,
			flags: {
				...cliResults.flags,
				noInstall: !project.install || cliResults.flags.noInstall,
				importSwaggerFilePath: project.importSwaggerFilePath ?? cliResults.flags.importSwaggerFilePath,
			},
		};
	} catch (err) {
		// If the user is not calling kubb-gen-scribe-cli from an interactive terminal, inquirer will throw an IsTTYError
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
