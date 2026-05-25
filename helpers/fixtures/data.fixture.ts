import { test as base } from '@playwright/test';

export type DataFixtures = Record<string, never>;

export const dataTest = base.extend<DataFixtures>({});
