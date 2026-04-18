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
	} catch {
		return false;
	}
}
