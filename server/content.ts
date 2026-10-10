import { readFileSync } from 'node:fs';
import { findUp } from './paths.js';
import type { Content } from './types.js';

const file = findUp('shared/content.json');
if (!file) throw new Error('shared/content.json not found');

// Single source of truth shared with the React client (used there as an offline fallback).
export const content = JSON.parse(readFileSync(file, 'utf8')) as Content;
