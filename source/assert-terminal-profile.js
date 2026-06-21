import ow from 'ow';
import getTerminalProfiles from './get-terminal-profiles.js';

/**
 @internal
 @param {string} profile
 @returns {Promise<void>}
 */
export default async function assertTerminalProfile(profile) {
	ow(profile, ow.string.oneOf(await getTerminalProfiles()));
}
