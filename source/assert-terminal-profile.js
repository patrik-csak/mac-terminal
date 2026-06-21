import getTerminalProfiles from './get-terminal-profiles.js';

/**
 Assert that `profile` is a valid terminal profile

 @param {string} profile - Terminal profile to validate
 @returns {Promise<void>}
 */
export default async function assertTerminalProfile(profile) {
	const profiles = await getTerminalProfiles();

	if (!profiles.includes(profile)) {
		throw new Error(`Expected string to be one of ${JSON.stringify(profiles)}, got \`${profile}\``);
	}
}
