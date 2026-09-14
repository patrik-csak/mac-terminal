import {suite, test} from 'node:test';

/**
@param {import('node:test').TestContext} t
*/
async function setup(t) {
	const childProcess = {execFile: t.mock.fn()};
	t.mock.module('node:child_process', {exports: childProcess});

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

	// https://github.com/nodejs/node/issues/59163
	const {default: setTerminalDefaultProfile} = await import(`../source/set-terminal-default-profile.js?test=${t.name}`);

	return {
		setTerminalDefaultProfile, childProcess, runAppleScript, assertTerminalProfile, isTerminalRunning,
	};
}

suite('setTerminalDefaultProfile', () => {
	test('uses AppleScript when Terminal is running', async t => {
		const {setTerminalDefaultProfile, runAppleScript, assertTerminalProfile, isTerminalRunning} = await setup(t);

		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => true);
		runAppleScript.mock.mockImplementation(async () => undefined);

		await setTerminalDefaultProfile('Profile');

		t.assert.strictEqual(
			runAppleScript.mock.calls[0].arguments[0],
			[
				'tell application "Terminal"',
				'\tset default settings to settings set "Profile"',
				'end tell',
			].join('\n'),
		);
	});

	test('uses defaults command when Terminal isn\'t running', async t => {
		const {setTerminalDefaultProfile, childProcess, assertTerminalProfile, isTerminalRunning} = await setup(t);

		assertTerminalProfile.mock.mockImplementation(async () => undefined);
		isTerminalRunning.mock.mockImplementation(async () => false);
		childProcess.execFile.mock.mockImplementation((_command, _args, callback) => {
			callback(null, {stderr: '', stdout: ''});
		});

		await setTerminalDefaultProfile('Profile');

		t.assert.strictEqual(childProcess.execFile.mock.callCount(), 2);

		const [command1, args1] = childProcess.execFile.mock.calls[0].arguments;
		t.assert.strictEqual(command1, 'defaults');
		t.assert.deepStrictEqual(args1, [
			'write',
			'com.apple.Terminal',
			'Default Window Settings',
			'-string',
			'Profile',
		]);

		const [command2, args2] = childProcess.execFile.mock.calls[1].arguments;
		t.assert.strictEqual(command2, 'defaults');
		t.assert.deepStrictEqual(args2, [
			'write',
			'com.apple.Terminal',
			'Startup Window Settings',
			'-string',
			'Profile',
		]);
	});

	test('rejects an invalid profile before changing Terminal settings', async t => {
		const {setTerminalDefaultProfile, childProcess, runAppleScript, assertTerminalProfile, isTerminalRunning} = await setup(t);

		const error = new Error('Expected string to be one of `["Profile"]`, got `Missing Profile`');
		assertTerminalProfile.mock.mockImplementation(async () => {
			throw error;
		});

		await t.assert.rejects(setTerminalDefaultProfile('Missing Profile'), error);
		t.assert.strictEqual(isTerminalRunning.mock.callCount(), 0);
		t.assert.strictEqual(runAppleScript.mock.callCount(), 0);
		t.assert.strictEqual(childProcess.execFile.mock.callCount(), 0);
	});
});
