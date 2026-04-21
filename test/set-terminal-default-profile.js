import assert from 'node:assert/strict';
import {beforeEach, describe, it, mock} from 'node:test';
import {ArgumentError} from 'ow';

const childProcess = {execFile: mock.fn()};
mock.module('node:child_process', {namedExports: childProcess});

const runAppleScript = mock.fn();
mock.module('run-applescript', {namedExports: {runAppleScript}});

const assertTerminalProfile = mock.fn();
mock.module('../source/assert-terminal-profile.js', {
	defaultExport: assertTerminalProfile,
});

const isTerminalRunning = mock.fn();
mock.module('../source/is-terminal-running.js', {
	defaultExport: isTerminalRunning,
});

const {default: setTerminalDefaultProfile} =
	await import('../source/set-terminal-default-profile.js');

describe('setTerminalDefaultProfile', () => {
	beforeEach(() => {
		childProcess.execFile.mock.resetCalls();
		runAppleScript.mock.resetCalls();
		assertTerminalProfile.mock.resetCalls();
		isTerminalRunning.mock.resetCalls();
	});

	it('uses AppleScript when Terminal is running', async () => {
		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => true);
		runAppleScript.mock.mockImplementation(async () => undefined);

		await setTerminalDefaultProfile('Profile');

		assert.equal(
			runAppleScript.mock.calls[0].arguments[0],
			[
				'tell application "Terminal"',
				'\tset default settings to settings set "Profile"',
				'end tell',
			].join('\n'),
		);
	});

	it('uses defaults command when Terminal is not running', async () => {
		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => false);
		childProcess.execFile.mock.mockImplementation(
			(_command, _args, callback) => {
				callback(null, {stderr: '', stdout: ''});
			},
		);

		await setTerminalDefaultProfile('Profile');

		assert.equal(childProcess.execFile.mock.callCount(), 2);

		const [command1, args1] = childProcess.execFile.mock.calls[0].arguments;
		assert.equal(command1, 'defaults');
		assert.deepEqual(args1, [
			'write',
			'com.apple.Terminal',
			'Default Window Settings',
			'-string',
			'Profile',
		]);

		const [command2, args2] = childProcess.execFile.mock.calls[1].arguments;
		assert.equal(command2, 'defaults');
		assert.deepEqual(args2, [
			'write',
			'com.apple.Terminal',
			'Startup Window Settings',
			'-string',
			'Profile',
		]);
	});

	it('rejects an invalid profile before changing Terminal settings', async () => {
		const error = new ArgumentError(
			'Expected string to be one of `["Profile"]`, got `Missing Profile`',
		);
		assertTerminalProfile.mock.mockImplementation(async () => {
			throw error;
		});

		await assert.rejects(setTerminalDefaultProfile('Missing Profile'), error);
		assert.equal(isTerminalRunning.mock.callCount(), 0);
		assert.equal(runAppleScript.mock.callCount(), 0);
		assert.equal(childProcess.execFile.mock.callCount(), 0);
	});
});
