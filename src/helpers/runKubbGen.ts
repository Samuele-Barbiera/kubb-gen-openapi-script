import chalk from "chalk";
import { execa, type StdioOption } from "execa";
import ora, { type Ora } from "ora";

import { getUserPkgManager, type PackageManager } from "~/src/utils/getUserPkgManager.js";
import { logger } from "~/src/utils/logger.js";

const execWithSpinner = async (
	projectDir: string,
	pkgManager: PackageManager,
	options: {
		args?: string[];
		stdout?: StdioOption;
		onDataHandle?: (spinner: Ora) => (data: Buffer) => void;
	}
) => {
	const { onDataHandle, args = ["kubb"], stdout = "pipe" } = options;

	const spinner = ora({ text: `Running ${pkgManager} kubb to generate the APIs...`, discardStdin: false }).start();
	const subprocess = execa(pkgManager, args, { cwd: projectDir, stdout });

	await new Promise<void>((res, rej) => {
		if (onDataHandle) {
			subprocess.stdout?.on("data", onDataHandle(spinner));
		}

		void subprocess.on("error", e => rej(e));
		void subprocess.on("close", () => res());
	});

	return spinner;
};

const runKubbGenCommand = async (pkgManager: PackageManager, projectDir: string): Promise<Ora | null> => {
	switch (pkgManager) {
		// When using npm, inherit the stderr stream so that the progress bar is shown
		case "npm":
			await execa(pkgManager, ["kubb"], {
				cwd: projectDir,
				stderr: "inherit",
			});

			return null;
		// When using yarn or pnpm, use the stdout stream and ora spinner to show the progress
		case "pnpm":
			return execWithSpinner(projectDir, pkgManager, {
				onDataHandle: spinner => data => {
					const text = data.toString();

					if (text.includes("Progress")) {
						spinner.text = text.includes("|") ? text.split(" | ")[1] ?? "" : text;
					}
				},
			});
		case "yarn":
			return execWithSpinner(projectDir, pkgManager, {
				onDataHandle: spinner => data => {
					spinner.text = data.toString();
				},
			});
		// When using bun, the stdout stream is ignored and the spinner is shown
		case "bun":
			return execWithSpinner(projectDir, pkgManager, { stdout: "ignore" });
	}
};

export const kubbGenCommand = async ({
	projectDir,
}: {
	projectDir: string;
}) => {
	logger.info("Creating the APIs hooks...");
	const pkgManager = getUserPkgManager();

	const installSpinner = await runKubbGenCommand(pkgManager, projectDir);

	// If the spinner was used to show the progress, use succeed method on it
	// If not, use the succeed on a new spinner
	(installSpinner ?? ora({ discardStdin: false })).succeed(chalk.green("Successfully created the apis!\n"));
};
