import {suite, test} from 'node:test';

/**
@param {import('node:test').TestContext} t
*/
async function setup(t) {
	const runAppleScript = t.mock.fn();
	t.mock.module('run-applescript', {namedExports: {runAppleScript}});

	// https://github.com/nodejs/node/issues/59163
	const {default: isTerminalRunning} = await import(`../source/is-terminal-running.js?test=${t.name}`);

	return {isTerminalRunning, runAppleScript};
}

suite('isTerminalRunning', () => {
	test('returns true when Terminal is running', async t => {
		const {isTerminalRunning, runAppleScript} = await setup(t);

		runAppleScript.mock.mockImplementation(async () => 'true');

		t.assert.strictEqual(await isTerminalRunning(), true);
	});

	test('returns false when Terminal isn\'t running', async t => {
		const {isTerminalRunning, runAppleScript} = await setup(t);

		runAppleScript.mock.mockImplementation(async () => 'false');

		t.assert.strictEqual(await isTerminalRunning(), false);
	});
});
