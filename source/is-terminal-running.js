import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execute = promisify(execFile);

/**
 * @returns {Promise<boolean>} - Whether Terminal is currently running
 */
export default async function isTerminalRunning() {
	try {
		await execute('pgrep', ['-x', 'Terminal']);
		return true;
	} catch (error) {
		// Error code 1: 'No processes were matched.'
		// See `man grep`
		if (error.code === 1) return false;

		throw error;
	}
}
