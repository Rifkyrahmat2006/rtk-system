import fs from "fs";
import path from "path";
import projects from "../config/projects.json" with { type: "json" };

export async function runAgent(project, prompt) {
  const projectPath = projects.projects[project];

  if (!projectPath) {
    return `Project ${project} tidak ditemukan`;
  }

  // simple logic dulu (nanti bisa diganti LLM + RAG)
  try {
    const files = fs.readdirSync(projectPath);
    return `
Project: ${project}
Path: ${projectPath}

Files: 
${files.join("\n")}

Prompt:
${prompt}
`;
  } catch (err) {
    return `Error reading project path: ${err.message}`;
  }
}
