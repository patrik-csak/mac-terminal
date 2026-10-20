import {runAppleScript} from 'run-applescript';

/**
Check if Terminal is currently running

@returns {Promise<boolean>} - Whether Terminal is currently running
*/
export default async function isTerminalRunning() {
	return (await runAppleScript('application "Terminal" is running')) === 'true';
}
