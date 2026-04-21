import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {runAppleScript} from 'run-applescript';

import isTerminalRunning from './is-terminal-running.js';

const execute = promisify(execFile);

/**
 * @returns {Promise<string>} - The name of the default profile
 */
export default async function getTerminalDefaultProfile() {
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
