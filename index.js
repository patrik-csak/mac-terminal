import {execFile} from 'node:child_process';
import os from 'node:os';
import {promisify} from 'node:util';
import bplist from 'bplist-parser';
import {runAppleScript} from 'run-applescript';

const execute = promisify(execFile);

/**
 * @returns {Promise<string>} - The name of the default profile
 */
export async function getTerminalDefaultProfile() {
	if (await isTerminalRunning()) {
		return runAppleScript(
			'tell application "Terminal" to get name of default settings',
		);
	}

	const {stdout} = await execute('defaults', [
		'read',
		'com.apple.Terminal',
		'Default Window Settings',
	]);

	return stdout.trim();
}

/**
 * @returns {Promise<string[]>} - List of installed profiles
 */
export async function getTerminalProfiles() {
	const terminalPlistPath = `${os.homedir()}/Library/Preferences/com.apple.Terminal.plist`;
	const terminalPreferences = await bplist.parseFile(terminalPlistPath);

	return Object.keys(terminalPreferences[0]['Window Settings']).toSorted(
		new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare,
	);
}

/**
 * @returns {Promise<boolean>} - Whether Terminal is currently running
 */
export async function isTerminalRunning() {
	try {
		await execute('pgrep', ['-x', 'Terminal']);
		return true;
	} catch {
		return false;
	}
}

/**
 * Set the default Terminal profile for new windows/tabs
 *
 * @param {string} profile - Profile name, e.g. 'Clear Dark'
 * @return {Promise<void>}
 */
export async function setTerminalDefaultProfile(profile) {
	if (await isTerminalRunning()) {
		await runAppleScript(`tell application "Terminal"
	set default settings to settings set "${profile}"
end tell`);
	} else {
		await execute('defaults', [
			'write',
			'com.apple.Terminal',
			'Default Window Settings',
			'-string',
			profile,
		]);
		await execute('defaults', [
			'write',
			'com.apple.Terminal',
			'Startup Window Settings',
			'-string',
			profile,
		]);
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
	if (await isTerminalRunning()) {
		await runAppleScript(`tell application "Terminal"
	set current settings of tabs of windows to settings set "${profile}"
end tell`);
	}

	if (setDefault) {
		await setTerminalDefaultProfile(profile);
	}
}
