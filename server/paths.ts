import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Finds a project file or folder (e.g. "shared/content.json") by walking up from
 * this file. Works the same from source (tsx) and from the compiled dist/ folder.
 */
export function findUp(relative: string): string | null {
  let dir = here;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, relative);
    if (existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
