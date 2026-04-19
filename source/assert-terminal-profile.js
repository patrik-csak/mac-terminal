import ow from 'ow';
import getTerminalProfiles from './get-terminal-profiles.js';

/**
 * @param {string} profile
 * @return {Promise<void>}
 */
export default async function assertTerminalProfile(profile) {
	ow(profile, ow.string.oneOf(await getTerminalProfiles()));
}
