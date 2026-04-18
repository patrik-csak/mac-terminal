import {beforeEach, describe, it, mock} from 'node:test';
import assert from 'node:assert/strict';

const runAppleScript = mock.fn();
mock.module('run-applescript', {namedExports: {runAppleScript}});

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
		isTerminalRunning.mock.resetCalls();
		setTerminalDefaultProfile.mock.resetCalls();
	});

	it('updates tabs via AppleScript when Terminal is running', async () => {
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
		isTerminalRunning.mock.mockImplementation(async () => false);

		await setTerminalProfile({profile: 'Profile', setDefault: false});

		assert.equal(runAppleScript.mock.callCount(), 0);
	});

	it('sets default profile when setDefault is true', async () => {
		isTerminalRunning.mock.mockImplementation(async () => false);
		setTerminalDefaultProfile.mock.mockImplementation(async () => undefined);

		await setTerminalProfile({profile: 'Profile', setDefault: true});

		assert.equal(setTerminalDefaultProfile.mock.callCount(), 1);
		assert.equal(
			setTerminalDefaultProfile.mock.calls[0].arguments[0],
			'Profile',
		);
	});

	it('does not set default profile when setDefault is falsy', async () => {
		isTerminalRunning.mock.mockImplementation(async () => false);

		await setTerminalProfile({profile: 'Profile', setDefault: false});

		assert.equal(setTerminalDefaultProfile.mock.callCount(), 0);
	});
});
