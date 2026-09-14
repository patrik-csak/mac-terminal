import {suite, test} from 'node:test';

/**
@param {import('node:test').TestContext} t
*/
async function setup(t) {
	const runAppleScript = t.mock.fn();
	t.mock.module('run-applescript', {exports: {runAppleScript}});

	const assertTerminalProfile = t.mock.fn();
	t.mock.module('../source/assert-terminal-profile.js', {
		exports: {default: assertTerminalProfile},
	});

	const isTerminalRunning = t.mock.fn();
	t.mock.module('../source/is-terminal-running.js', {
		exports: {default: isTerminalRunning},
	});

	const setTerminalDefaultProfile = t.mock.fn();
	t.mock.module('../source/set-terminal-default-profile.js', {
		exports: {default: setTerminalDefaultProfile},
	});

	// https://github.com/nodejs/node/issues/59163
	const {default: setTerminalProfile} = await import(`../source/set-terminal-profile.js?test=${t.name}`);

	return {
		setTerminalProfile, runAppleScript, assertTerminalProfile, isTerminalRunning, setTerminalDefaultProfile,
	};
}

suite('setTerminalProfile', () => {
	test('updates tabs via AppleScript when Terminal is running', async t => {
		const {setTerminalProfile, runAppleScript, assertTerminalProfile, isTerminalRunning} = await setup(t);

		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => true);
		runAppleScript.mock.mockImplementation(async () => undefined);

		await setTerminalProfile({profile: 'Profile', setDefault: false});

		t.assert.strictEqual(
			runAppleScript.mock.calls[0].arguments[0],
			[
				'tell application "Terminal"',
				'\tset current settings of tabs of windows to settings set "Profile"',
				'end tell',
			].join('\n'),
		);
	});

	test('does not call AppleScript when Terminal isn\'t running', async t => {
		const {setTerminalProfile, runAppleScript, assertTerminalProfile, isTerminalRunning} = await setup(t);

		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => false);

		await setTerminalProfile({profile: 'Profile', setDefault: false});

		t.assert.strictEqual(runAppleScript.mock.callCount(), 0);
	});

	test('sets default profile when setDefault is true', async t => {
		const {setTerminalProfile, assertTerminalProfile, isTerminalRunning, setTerminalDefaultProfile} = await setup(t);

		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => false);
		setTerminalDefaultProfile.mock.mockImplementation(async () => undefined);

		await setTerminalProfile({profile: 'Profile', setDefault: true});

		t.assert.strictEqual(setTerminalDefaultProfile.mock.callCount(), 1);
		t.assert.strictEqual(
			setTerminalDefaultProfile.mock.calls[0].arguments[0],
			'Profile',
		);
	});

	test('does not set default profile when setDefault is falsy', async t => {
		const {setTerminalProfile, assertTerminalProfile, isTerminalRunning, setTerminalDefaultProfile} = await setup(t);

		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => false);

		await setTerminalProfile({profile: 'Profile', setDefault: false});

		t.assert.strictEqual(setTerminalDefaultProfile.mock.callCount(), 0);
	});

	test('rejects an invalid profile before updating Terminal', async t => {
		const {setTerminalProfile, runAppleScript, assertTerminalProfile, isTerminalRunning, setTerminalDefaultProfile} = await setup(t);

		const error = new Error('Expected string to be one of `["Profile"]`, got `Missing Profile`');
		assertTerminalProfile.mock.mockImplementation(async () => {
			throw error;
		});

		await t.assert.rejects(
			setTerminalProfile({profile: 'Missing Profile', setDefault: true}),
			error,
		);
		t.assert.strictEqual(isTerminalRunning.mock.callCount(), 0);
		t.assert.strictEqual(runAppleScript.mock.callCount(), 0);
		t.assert.strictEqual(setTerminalDefaultProfile.mock.callCount(), 0);
	});
});
