import {beforeEach, describe, it, mock} from 'node:test';
import assert from 'node:assert/strict';

const childProcess = {execFile: mock.fn()};
mock.module('node:child_process', {namedExports: childProcess});

const runAppleScript = mock.fn();
mock.module('run-applescript', {namedExports: {runAppleScript}});

const isTerminalRunning = mock.fn();
mock.module('../source/is-terminal-running.js', {
	defaultExport: isTerminalRunning,
});

const {default: getTerminalDefaultProfile} =
	await import('../source/get-terminal-default-profile.js');

describe('getTerminalDefaultProfile', () => {
	beforeEach(() => {
		childProcess.execFile.mock.resetCalls();
		runAppleScript.mock.resetCalls();
		isTerminalRunning.mock.resetCalls();
	});

	it('uses AppleScript when Terminal is running', async () => {
		isTerminalRunning.mock.mockImplementation(async () => true);
		runAppleScript.mock.mockImplementation(async () => 'Profile');

		const result = await getTerminalDefaultProfile();

		assert.equal(result, 'Profile');
	});

	it('uses defaults command when Terminal is not running', async () => {
		isTerminalRunning.mock.mockImplementation(async () => false);
		childProcess.execFile.mock.mockImplementation(
			(_command, _args, callback) => {
				callback(null, {stdout: 'Profile\n', stderr: ''});
			},
		);

		const result = await getTerminalDefaultProfile();

		assert.equal(result, 'Profile');
		assert.equal(childProcess.execFile.mock.callCount(), 1);

		const [command, args] = childProcess.execFile.mock.calls[0].arguments;
		assert.equal(command, 'defaults');
		assert.deepEqual(args, [
			'read',
			'com.apple.Terminal',
			'Default Window Settings',
		]);
	});
});
