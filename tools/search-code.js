import fs from "fs";
import path from "path";

export function searchCode(dir, keyword) {
  const results = [];

  function scan(folder) {
    const files = fs.readdirSync(folder);

    for (const file of files) {
      const fullPath = path.join(folder, file);

      if (fs.statSync(fullPath).isDirectory()) {
        scan(fullPath);
      } else {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (content.includes(keyword)) {
          results.push(fullPath);
        }
      }
    }
  }

  scan(dir);
  return results;
}
