import ow from 'ow';
import getTerminalProfiles from './get-terminal-profiles.js';

/**
 Assert that `profile` is a valid terminal profile

 @internal
 @param {string} profile - Terminal profile to validate
 @returns {Promise<void>}
 */
export default async function assertTerminalProfile(profile) {
	ow(profile, ow.string.oneOf(await getTerminalProfiles()));
}
