import {suite, test} from 'node:test';

/**
@param {import('node:test').TestContext} t
*/
async function setup(t) {
	const childProcess = {execFile: t.mock.fn()};
	t.mock.module('node:child_process', {exports: childProcess});

	const runAppleScript = t.mock.fn();
	t.mock.module('run-applescript', {exports: {runAppleScript}});

	const isTerminalRunning = t.mock.fn();
	t.mock.module('../source/is-terminal-running.js', {
		exports: {default: isTerminalRunning},
	});

	// https://github.com/nodejs/node/issues/59163
	const {default: getTerminalDefaultProfile} = await import(`../source/get-terminal-default-profile.js?test=${t.name}`);

	return {
		getTerminalDefaultProfile, childProcess, runAppleScript, isTerminalRunning,
	};
}

suite('getTerminalDefaultProfile', () => {
	test('uses AppleScript when Terminal is running', async t => {
		const {getTerminalDefaultProfile, runAppleScript, isTerminalRunning} = await setup(t);

		isTerminalRunning.mock.mockImplementation(async () => true);
		runAppleScript.mock.mockImplementation(async () => 'Profile');

		const result = await getTerminalDefaultProfile();

		t.assert.strictEqual(result, 'Profile');
	});

	test('uses defaults command when Terminal isn\'t running', async t => {
		const {getTerminalDefaultProfile, childProcess, isTerminalRunning} = await setup(t);

		isTerminalRunning.mock.mockImplementation(async () => false);
		childProcess.execFile.mock.mockImplementation((_command, _args, callback) => {
			callback(null, {stderr: '', stdout: 'Profile\n'});
		});

		const result = await getTerminalDefaultProfile();

		t.assert.strictEqual(result, 'Profile');
		t.assert.strictEqual(childProcess.execFile.mock.callCount(), 1);

		const [command, args] = childProcess.execFile.mock.calls[0].arguments;
		t.assert.strictEqual(command, 'defaults');
		t.assert.deepStrictEqual(args, [
			'read',
			'com.apple.Terminal',
			'Default Window Settings',
		]);
	});
});
