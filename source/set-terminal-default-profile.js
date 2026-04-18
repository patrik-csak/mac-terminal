import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {runAppleScript} from 'run-applescript';
import isTerminalRunning from './is-terminal-running.js';

const execute = promisify(execFile);

/**
 * Set the default Terminal profile for new windows/tabs
 *
 * @param {string} profile - Profile name, e.g. 'Clear Dark'
 * @return {Promise<void>}
 */
export default async function setTerminalDefaultProfile(profile) {
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
