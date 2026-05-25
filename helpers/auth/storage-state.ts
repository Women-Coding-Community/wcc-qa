import { Role } from './roles';

export type Surface = 'admin';

export function storageStatePath(surface: Surface, role: Role): string {
  return `playwright/.auth/${surface}/${role}.json`;
}
