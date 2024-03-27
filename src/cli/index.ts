import * as p from "@clack/prompts";
import { Command } from "commander";
import { CREATE_SDK_CLI } from "~/consts.js";
import type { AvailablePackages } from "~/installers/index.js";
import { getVersion } from "~/utils/getKubbSwaggerCliVersion.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { IsTTYError } from "~/utils/isTTYError.js";
import { logger } from "~/utils/logger.js";
import { validateImportAlias } from "~/utils/validateImportAlias.js";

interface CliFlags {
	noInstall: boolean;
	default: boolean;
	importAlias: string;
}

interface CliResults {
	packages: AvailablePackages[];
	flags: CliFlags;
}

const defaultOptions: CliResults = {
	packages: ["kubb"],
	flags: {
		noInstall: false,
		default: false,
		importAlias: "~/",
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
			"-i, --import-alias",
			"Explicitly tell the CLI to use a custom import alias",
			defaultOptions.flags.importAlias
		)
		/** END CI-FLAGS */
		.version(await getVersion(), "-v, --version", "Display the version number")
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

		const project = await p.group(
			{
				runKubb: () => {
					return p.text({
						message: "Importing kubb config",
						defaultValue: defaultOptions.flags.importAlias,
						placeholder: defaultOptions.flags.importAlias,
						validate: validateImportAlias,
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
				importAlias: () => {
					return p.text({
						message: "What import alias would you like to use?",
						defaultValue: defaultOptions.flags.importAlias,
						placeholder: defaultOptions.flags.importAlias,
						validate: validateImportAlias,
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
		if (project.runKubb) packages.push("kubb");

		return {
			packages,
			flags: {
				...cliResults.flags,
				noInstall: !project.install || cliResults.flags.noInstall,
				importAlias: project.importAlias ?? cliResults.flags.importAlias,
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
