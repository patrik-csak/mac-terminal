import alphaSort from 'alpha-sort';
import ow from 'ow';
import psList from 'ps-list';
import {runAppleScript} from 'run-applescript';

/**
 * @returns {Promise<string[]>} - List of installed Terminal.app profiles
 */
export async function getTerminalProfiles() {
	const result = await runAppleScript(`set text item delimiters to linefeed
tell application "Terminal"
    return (name of every settings set) as string
end tell`);

	return result
		.split('\n')
		.sort(alphaSort({caseInsensitive: true, natural: true}));
}

/**
 * @returns {Promise<boolean>} - Whether Terminal.app is currently running
 */
export async function isTerminalRunning() {
	const processes = await psList();

	return processes.some((process) => process.name === 'Terminal');
}

/**
 * Update all open Terminal.app tabs to use the given profile
 *
 * @param {object} parameters
 * @param {string} parameters.profile - Terminal.app profile name, e.g. 'Clear
 *                                      Dark'
 * @param {boolean} [parameters.setDefault] - Whether to also make the
 *                                            profile the default
 * @return {Promise<void>}
 */
export async function setTerminalProfile({profile, setDefault}) {
	const terminalProfiles = await getTerminalProfiles();

	ow(profile, ow.string.oneOf(terminalProfiles));
	ow(setDefault, ow.optional.boolean);

	let appleScript = getSetTerminalWindowsProfileAppleScript(profile);

	if (setDefault) {
		appleScript += '\n' + getSetTerminalDefaultProfileAppleScript(profile);
	}

	await runAppleScript(appleScript);
}

/**
 * Set the default Terminal.app profile for new windows/tabs
 *
 * @param {string} profile - Terminal.app profile name, e.g. 'Clear Dark'
 * @return {Promise<void>}
 */
export async function setTerminalDefaultProfile(profile) {
	const terminalProfiles = await getTerminalProfiles();

	ow(profile, ow.string.oneOf(terminalProfiles));

	const appleScript = getSetTerminalDefaultProfileAppleScript(profile);

	await runAppleScript(appleScript);
}

/**
 * Get the AppleScript to set the profile for all open Terminal.app windows
 *
 * @param {string} profile
 * @returns {string}
 */
function getSetTerminalWindowsProfileAppleScript(profile) {
	return `tell application "Terminal"
	set current settings of tabs of windows to settings set "${profile}"
end tell`;
}

/**
 * Get the AppleScript to set the default profile for new Terminal.app windows
 *
 * @param {string} profile
 * @returns {string}
 */
function getSetTerminalDefaultProfileAppleScript(profile) {
	return `tell application "Terminal"
	set default settings to settings set "${profile}"
end tell`;
}
