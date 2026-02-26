import matter from 'gray-matter';
import { promises as fs } from 'fs';
import path from 'path';

export interface MarkdownFile<T = Record<string, unknown>> {
  frontmatter: T;
  content: string;
  slug: string;
}

/**
 * Parse a markdown file with YAML frontmatter
 */
export async function parseMarkdownFile<T = Record<string, unknown>>(
  filePath: string
): Promise<MarkdownFile<T>> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const slug = path.basename(filePath, '.md');

  return {
    frontmatter: data as T,
    content,
    slug,
  };
}

/**
 * Get all markdown files from a directory
 */
export async function getMarkdownFiles<T = Record<string, unknown>>(
  directory: string
): Promise<MarkdownFile<T>[]> {
  try {
    const files = await fs.readdir(directory);
    const mdFiles = files.filter((file) => file.endsWith('.md'));

    const parsed = await Promise.all(
      mdFiles.map((file) => parseMarkdownFile<T>(path.join(directory, file)))
    );

    return parsed;
  } catch {
    // Directory doesn't exist or is empty
    return [];
  }
}

/**
 * Write a markdown file with YAML frontmatter
 */
export async function writeMarkdownFile<T = Record<string, unknown>>(
  filePath: string,
  frontmatter: T,
  content: string
): Promise<void> {
  const fileContent = matter.stringify(content, frontmatter as object);
  await fs.writeFile(filePath, fileContent, 'utf-8');
}

/**
 * Get the PARA base directory
 */
export function getParaDirectory(): string {
  return process.env.PARA_DIRECTORY || path.join(process.cwd(), '..', 'memory', 'para');
}

/**
 * Get projects from PARA
 */
export async function getParaProjects() {
  const projectsDir = path.join(getParaDirectory(), 'projects');
  return getMarkdownFiles(projectsDir);
}

/**
 * Get areas from PARA
 */
export async function getParaAreas() {
  const areasDir = path.join(getParaDirectory(), 'areas');
  return getMarkdownFiles(areasDir);
}

/**
 * Get resources from PARA
 */
export async function getParaResources() {
  const resourcesDir = path.join(getParaDirectory(), 'resources');
  return getMarkdownFiles(resourcesDir);
}

/**
 * Get archives from PARA
 */
export async function getParaArchives() {
  const archivesDir = path.join(getParaDirectory(), 'archives');
  return getMarkdownFiles(archivesDir);
}
