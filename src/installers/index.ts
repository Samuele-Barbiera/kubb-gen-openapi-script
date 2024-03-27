import type { PackageManager } from "~/utils/getUserPkgManager.js";
import { dynamicKubbInstaller } from "./kubb.js";

// Turning this into a const allows the list to be iterated over for programatically creating prompt options
// Should increase extensability in the future
export const availablePackages = ["kubb"] as const;
export type AvailablePackages = (typeof availablePackages)[number];

export interface InstallerOptions {
	projectDir: string;
	pkgManager: PackageManager;
	noInstall: boolean;
	packages?: PkgInstallerMap;
}

export type Installer = (opts: InstallerOptions) => void;

export type PkgInstallerMap = {
	[pkg in AvailablePackages]: {
		inUse: boolean;
		installer: Installer;
	};
};

export const buildPkgInstallerMap = (): PkgInstallerMap => ({
	kubb: {
		inUse: true,
		installer: dynamicKubbInstaller,
	},
});
