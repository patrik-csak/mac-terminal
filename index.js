import os from 'node:os';
import alphaSort from 'alpha-sort';
import bplist from 'bplist-parser';
import {$} from 'execa';
import ow from 'ow';
import psList from 'ps-list';
import {runAppleScript} from 'run-applescript';

/**
 * @returns {Promise<string>} - The name of the default profile
 */
export async function getTerminalDefaultProfile() {
	if (await isTerminalRunning()) {
		return runAppleScript(
			'tell application "Terminal" to get name of default settings',
		);
	}

	const {stdout} =
		await $`defaults read com.apple.Terminal Default\ Window\ Settings`;
	return stdout.trim();
}

/**
 * @returns {Promise<string[]>} - List of installed profiles
 */
export async function getTerminalProfiles() {
	const terminalPlistPath = `${os.homedir()}/Library/Preferences/com.apple.Terminal.plist`;
	const terminalPreferences = await bplist.parseFile(terminalPlistPath);

	return Object.keys(terminalPreferences[0]['Window Settings']).sort(
		alphaSort({caseInsensitive: true, natural: true}),
	);
}

/**
 * @returns {Promise<boolean>} - Whether Terminal is currently running
 */
export async function isTerminalRunning() {
	const processes = await psList();

	return processes.some((process) => process.name === 'Terminal');
}

/**
 * Set the default Terminal profile for new windows/tabs
 *
 * @param {string} profile - Profile name, e.g. 'Clear Dark'
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
