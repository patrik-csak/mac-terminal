import assert from 'node:assert/strict';
import {beforeEach, describe, it, mock} from 'node:test';
import {ArgumentError} from 'ow';

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

const setTerminalDefaultProfile = mock.fn();
mock.module('../source/set-terminal-default-profile.js', {
	defaultExport: setTerminalDefaultProfile,
});

const {default: setTerminalProfile} =
	await import('../source/set-terminal-profile.js');

describe('setTerminalProfile', () => {
	beforeEach(() => {
		runAppleScript.mock.resetCalls();
		assertTerminalProfile.mock.resetCalls();
		isTerminalRunning.mock.resetCalls();
		setTerminalDefaultProfile.mock.resetCalls();
	});

	it('updates tabs via AppleScript when Terminal is running', async () => {
		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => true);
		runAppleScript.mock.mockImplementation(async () => undefined);

		await setTerminalProfile({profile: 'Profile', setDefault: false});

		assert.equal(
			runAppleScript.mock.calls[0].arguments[0],
			[
				'tell application "Terminal"',
				'\tset current settings of tabs of windows to settings set "Profile"',
				'end tell',
			].join('\n'),
		);
	});

	it('does not call AppleScript when Terminal is not running', async () => {
		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => false);

		await setTerminalProfile({profile: 'Profile', setDefault: false});

		assert.equal(runAppleScript.mock.callCount(), 0);
	});

	it('sets default profile when setDefault is true', async () => {
		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => false);
		setTerminalDefaultProfile.mock.mockImplementation(async () => undefined);

		await setTerminalProfile({profile: 'Profile', setDefault: true});

		assert.ok(setTerminalDefaultProfile.mock.callCount() === 1);
		assert.equal(
			setTerminalDefaultProfile.mock.calls[0].arguments[0],
			'Profile',
		);
	});

	it('does not set default profile when setDefault is falsy', async () => {
		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => false);

		await setTerminalProfile({profile: 'Profile', setDefault: false});

		assert.equal(setTerminalDefaultProfile.mock.callCount(), 0);
	});

	it('rejects an invalid profile before updating Terminal', async () => {
		const error = new ArgumentError(
			'Expected string to be one of `["Profile"]`, got `Missing Profile`',
		);
		assertTerminalProfile.mock.mockImplementation(async () => {
			throw error;
		});

		await assert.rejects(
			setTerminalProfile({profile: 'Missing Profile', setDefault: true}),
			error,
		);
		assert.equal(isTerminalRunning.mock.callCount(), 0);
		assert.equal(runAppleScript.mock.callCount(), 0);
		assert.equal(setTerminalDefaultProfile.mock.callCount(), 0);
	});
});
