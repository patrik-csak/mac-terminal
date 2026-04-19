import {runAppleScript} from 'run-applescript';
import assertTerminalProfile from './assert-terminal-profile.js';
import isTerminalRunning from './is-terminal-running.js';
import setTerminalDefaultProfile from './set-terminal-default-profile.js';

/**
 * Update all open Terminal tabs to use the given profile
 *
 * @param {object} parameters
 * @param {string} parameters.profile - Profile name, e.g. 'Clear
 *                                      Dark'
 * @param {boolean} [parameters.setDefault] - Whether to also make the
 *                                            profile the default
 * @return {Promise<void>}
 */
export default async function setTerminalProfile({profile, setDefault}) {
	await assertTerminalProfile(profile);

	if (await isTerminalRunning()) {
		await runAppleScript(`tell application "Terminal"
	set current settings of tabs of windows to settings set "${profile}"
end tell`);
	}

	if (setDefault) {
		await setTerminalDefaultProfile(profile);
	}
}
