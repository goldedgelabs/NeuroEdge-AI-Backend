import fs from "fs";
import path from "path";

export function analyzeFolderStructure(folderPath: string) {
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    return entries.map(entry => {
      const res = path.resolve(dir, entry.name);

      if (entry.isDirectory()) {
        return { name: entry.name, type: "folder", children: walk(res) };
      }

      return { name: entry.name, type: "file" };
    });
  }

  return walk(folderPath);
}

export function folderSummary(folderPath: string) {
  const structure = analyzeFolderStructure(folderPath);

  return {
    folder: folderPath,
    summary: `Folder contains ${structure.length} top-level elements.`,
    structure
  };
}

export function folderRiskAssessment(folderPath: string) {
  const files = JSON.stringify(analyzeFolderStructure(folderPath));

  const dangerous =
    /secret|config|credential|token|password|internal|private/i.test(files);

  return {
    folder: folderPath,
    risk: dangerous ? "high" : "low"
  };
}
