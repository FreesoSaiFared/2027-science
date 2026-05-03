import { writable } from 'svelte/store';
import { createDefaultMask, type MaskProfile } from './mask.schema';
import { importMaskToml } from './mask.toml';

const key = '2027.science.mask.v1';

function read(): MaskProfile {
	if (typeof localStorage === 'undefined') return createDefaultMask();
	const raw = localStorage.getItem(key);
	if (!raw) return createDefaultMask();
	try {
		return JSON.parse(raw) as MaskProfile;
	} catch {
		return createDefaultMask();
	}
}

function persist(mask: MaskProfile) {
	if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(mask));
}

export const maskStore = writable<MaskProfile>(read());

export function updateMask(mutator: (mask: MaskProfile) => MaskProfile): void {
	maskStore.update((current) => {
		const next = { ...mutator(structuredClone(current)), updatedAt: new Date().toISOString() };
		persist(next);
		return next;
	});
}

export function resetMask(): void {
	const next = createDefaultMask();
	persist(next);
	maskStore.set(next);
}

export function deleteMask(): void {
	if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
	maskStore.set(createDefaultMask());
}

export function pauseMask(): void {
	updateMask((mask) => ({ ...mask, mode: 'paused' }));
}

export function importMask(text: string): void {
	const next = importMaskToml(text);
	persist(next);
	maskStore.set(next);
}
