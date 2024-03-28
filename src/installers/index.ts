import type { PackageManager } from "~/utils/getUserPkgManager.js";
import { dynamicKubbAxiosInstaller } from "./kubbAxios";
import { dynamicKubbTanstackInstaller } from "./kubbTanstack";

// Turning this into a const allows the list to be iterated over for programatically creating prompt options
// Should increase extensability in the future
export const availablePackages = ["kubbAxios", "kubbTanstack"] as const;
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

export const buildPkgInstallerMap = (packages: AvailablePackages[]): PkgInstallerMap => ({
	kubbAxios: {
		inUse: packages.includes("kubbAxios"),
		installer: dynamicKubbAxiosInstaller,
	},

	kubbTanstack: {
		inUse: packages.includes("kubbTanstack"),
		installer: dynamicKubbTanstackInstaller,
	},
});
