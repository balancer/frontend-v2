import { POOLS } from '@/constants/pools';

/**
 * Checks if pool ID is included in the list of pools that joins should be
 * disabled for, e.g. you can't access the invest page.
 *
 * @param {string} id - The pool ID to check
 * @returns {boolean} True if included in list.
 */
export function isJoinsDisabled(id: string): boolean {
  return POOLS.DisabledJoins.includes(id.toLowerCase());
}
