import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const layers = [
  {
    name: "foundation",
    rank: 1,
    directory: "packages/foundations",
  },
  {
    name: "service",
    rank: 2,
    directory: "packages/services",
  },
  {
    name: "feature",
    rank: 3,
    directory: "packages/features",
  },
  {
    name: "composition",
    rank: 4,
    directory: "packages/compositions",
  },
  {
    name: "app",
    rank: 5,
    directory: "apps",
  },
  {
    name: "tooling",
    rank: 6,
    directory: "tooling",
  },
];

async function readWorkspacePackages(layer) {
  const directory = path.join(root, layer.directory);

  try {
    const entries = await readdir(directory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        layer,
        packageJsonPath: path.join(directory, entry.name, "package.json"),
      }));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function readPackage(workspacePackage) {
  const packageJson = JSON.parse(
    await readFile(workspacePackage.packageJsonPath, "utf8"),
  );
  const directory = path.dirname(workspacePackage.packageJsonPath);

  return {
    ...workspacePackage,
    directory,
    dependencies: {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
    },
    name: packageJson.name,
  };
}

async function readSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".turbo"
    ) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await readSourceFiles(entryPath)));
      continue;
    }

    if (/\.(c|m)?(t|j)sx?$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

async function readWorkspaceImports(workspacePackage) {
  const files = await readSourceFiles(workspacePackage.directory);
  const imports = [];
  const importPattern =
    /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["'](@disco\/[^"']+)["']|import\(\s*["'](@disco\/[^"']+)["']\s*\)/g;

  for (const file of files) {
    const source = await readFile(file, "utf8");

    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2];

      imports.push({
        dependencyName: specifier.split("/").slice(0, 2).join("/"),
        file,
      });
    }
  }

  return imports;
}

function validateDependency({
  dependency,
  dependencyName,
  file,
  workspacePackage,
}) {
  if (!dependency) {
    return;
  }

  const importsTooling = dependency.layer.name === "tooling";
  const isTooling = workspacePackage.layer.name === "tooling";
  const importsUpward = dependency.layer.rank > workspacePackage.layer.rank;

  if (isTooling && dependency.layer.name !== "tooling") {
    violations.push(
      `${workspacePackage.name} is tooling and must not depend on ${dependency.name} (${dependency.layer.name})`,
    );
    return;
  }

  if (!importsTooling && importsUpward) {
    const location = file ? ` in ${path.relative(root, file)}` : "";

    violations.push(
      `${workspacePackage.name} (${workspacePackage.layer.name}) must not depend on ${dependency.name} (${dependency.layer.name})${location}`,
    );
  }

  if (file && !workspacePackage.dependencies[dependencyName]) {
    violations.push(
      `${workspacePackage.name} imports ${dependencyName} in ${path.relative(
        root,
        file,
      )} but does not declare it in package.json`,
    );
  }
}

const packages = (
  await Promise.all(layers.map((layer) => readWorkspacePackages(layer)))
).flat();
const packageByName = new Map(
  await Promise.all(
    packages.map((workspacePackage) => readPackage(workspacePackage)),
  ).then((workspacePackages) =>
    workspacePackages.map((workspacePackage) => [
      workspacePackage.name,
      workspacePackage,
    ]),
  ),
);

const violations = [];

for (const workspacePackage of packageByName.values()) {
  for (const dependencyName of Object.keys(workspacePackage.dependencies)) {
    const dependency = packageByName.get(dependencyName);

    validateDependency({ dependency, dependencyName, workspacePackage });
  }

  for (const sourceImport of await readWorkspaceImports(workspacePackage)) {
    const dependency = packageByName.get(sourceImport.dependencyName);

    validateDependency({
      dependency,
      dependencyName: sourceImport.dependencyName,
      file: sourceImport.file,
      workspacePackage,
    });
  }
}

if (violations.length > 0) {
  console.error("Layer boundary violations:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Layer boundaries OK");
