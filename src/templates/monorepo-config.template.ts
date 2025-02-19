// templates/monorepo-config.ts
import type {
  PackageManager,
  MonorepoConfig,
  PackageJson,
  DeepPartial,
} from "../types/config";
import { GenerateFileFormat } from "./package-config.template";

export interface GenerateMonorepoConfigOptions {
  packageJson: PackageJson;
  packageManager: PackageManager;
  conventionalCommits?: boolean;
  changelogFormat?: "conventional" | "keep-a-changelog";
  versionStrategy?: MonorepoConfig["versionStrategy"];
  bumpStrategy?: MonorepoConfig["bumpStrategy"];
  packagesGlob?: string;
}

export interface GenerateMonorepoConfigParams {
  options: GenerateMonorepoConfigOptions;
  format?: GenerateFileFormat["format"];
}

export function generateMonorepoConfig({
  options,
  format = "json",
}: GenerateMonorepoConfigParams): string {
  if (!options.packageJson.name) {
    throw new Error("Package name is required");
  }

  const defaultConfig: DeepPartial<MonorepoConfig> = {
    packageManager: options.packageManager,
    conventionalCommits: options.conventionalCommits ?? true,
    changelogFormat: options.changelogFormat ?? "conventional",
    versionStrategy: options.versionStrategy ?? "independent",
    bumpStrategy: options.bumpStrategy ?? "prompt",
    packValidation: {
      enabled: true,
      validateFiles: true,
      validateBuildArtifacts: true,
    },
    git: {
      tagPrefix: ``,
      requireCleanWorkingDirectory: true,
      requireUpToDate: true,
      commit: true,
      push: true,
      commitMessage: `chore(release): release ${options.packageJson.name}@\${version}`,
      tag: true,
      allowedBranches: ["main", "master"],
      remote: "origin",
    },
    npm: {
      publish: true,
      registry: "https://registry.npmjs.org",
      tag: "latest",
      access: "public",
    },
    packages: options.packagesGlob
      ? {
          [options.packagesGlob]: {
            changelogFile: "CHANGELOG.md",
          },
        }
      : {},
    ignorePackages: [],
    maxConcurrency: 4,
    changelogFile: "CHANGELOG.md",
    hooks: {},
  };

  if (format === "json") {
    return JSON.stringify(defaultConfig, null, 2);
  }

  return `import type { MonorepoConfig } from '@siteed/publisher';

// Use DeepPartial for flexible configuration
type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

const config: DeepPartial<MonorepoConfig> = ${JSON.stringify(defaultConfig, null, 2)};

export default config;`;
}
