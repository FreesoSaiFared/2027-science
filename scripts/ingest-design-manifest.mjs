#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { buildGeneratedRoute, parseDesignManifest } from '../src/lib/design/manifest.ts';

const manifestPath = process.argv[2];
if (!manifestPath) {
	console.error('Usage: npm run design:ingest -- design-inbox/example.manifest.json');
	process.exit(1);
}

const raw = await readFile(manifestPath, 'utf8');
const manifest = parseDesignManifest(JSON.parse(raw));
const routeDir = join('src', 'routes', 'generated', manifest.slug);
await mkdir(routeDir, { recursive: true });
await writeFile(join(routeDir, '+page.svelte'), buildGeneratedRoute(manifest));
console.log(`Generated ${join(routeDir, '+page.svelte')} from ${basename(manifestPath)}`);
