import os from 'node:os';
import alphaSort from 'alpha-sort';
import bplist from 'bplist-parser';
import {$} from 'execa';
import ow from 'ow';
import psList from 'ps-list';
import {runAppleScript} from 'run-applescript';

/**
 * @returns {Promise<string[]>} - List of installed Terminal.app profiles
 */
export async function getTerminalProfiles() {
	const terminalPlistPath = `${os.homedir()}/Library/Preferences/com.apple.Terminal.plist`;
	const terminalPreferences = await bplist.parseFile(terminalPlistPath);

	return Object.keys(terminalPreferences[0]['Window Settings']).sort(
		alphaSort({caseInsensitive: true, natural: true}),
	);
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
	ow(profile, ow.string.oneOf(await getTerminalProfiles()));

	if (await isTerminalRunning()) {
		await runAppleScript(`tell application "Terminal"
	set current settings of tabs of windows to settings set "${profile}"
end tell`);
	}

	if (setDefault) {
		await setTerminalDefaultProfile(profile);
	}
}

/**
 * Set the default Terminal.app profile for new windows/tabs
 *
 * @param {string} profile - Terminal.app profile name, e.g. 'Clear Dark'
 * @return {Promise<void>}
 */
export async function setTerminalDefaultProfile(profile) {
	ow(profile, ow.string.oneOf(await getTerminalProfiles()));

	if (await isTerminalRunning()) {
		await runAppleScript(`tell application "Terminal"
	set default settings to settings set "${profile}"
end tell`);
	} else {
		await $`defaults write com.apple.Terminal Default\ Window\ Settings -string ${profile}`;
		await $`defaults write com.apple.Terminal Startup\ Window\ Settings -string ${profile}`;
	}
}
