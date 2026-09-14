import {suite, test} from 'node:test';

/**
@param {import('node:test').TestContext} t
*/
async function setup(t) {
	const childProcess = {execFile: t.mock.fn()};
	t.mock.module('node:child_process', {exports: childProcess});

	// https://github.com/nodejs/node/issues/59163
	const {default: isTerminalRunning} = await import(`../source/is-terminal-running.js?test=${t.name}`);

	return {isTerminalRunning, childProcess};
}

suite('isTerminalRunning', () => {
	test('returns true when Terminal is running', async t => {
		const {isTerminalRunning, childProcess} = await setup(t);

		childProcess.execFile.mock.mockImplementation((_command, _args, callback) => {
			callback(null, {stderr: '', stdout: '1234\n'});
		});

		t.assert.strictEqual(await isTerminalRunning(), true);
	});

	test('returns false when Terminal isn\'t running', async t => {
		const {isTerminalRunning, childProcess} = await setup(t);

		childProcess.execFile.mock.mockImplementation((_command, _args, callback) => {
			const error = new Error('no process found');
			error.code = 1;
			callback(error);
		});

		t.assert.strictEqual(await isTerminalRunning(), false);
	});

	test('rethrows unexpected pgrep failures', async t => {
		const {isTerminalRunning, childProcess} = await setup(t);

		const error = new Error('spawn pgrep ENOENT');
		error.code = 'ENOENT';
		childProcess.execFile.mock.mockImplementation((_command, _args, callback) => {
			callback(error);
		});

		await t.assert.rejects(isTerminalRunning(), error);
	});

	test('calls pgrep with correct arguments', async t => {
		const {isTerminalRunning, childProcess} = await setup(t);

		childProcess.execFile.mock.mockImplementation((_command, _args, callback) => {
			callback(null, {stderr: '', stdout: ''});
		});

		await isTerminalRunning();

		const [command, args] = childProcess.execFile.mock.calls[0].arguments;
		t.assert.strictEqual(command, 'pgrep');
		t.assert.deepStrictEqual(args, ['-x', 'Terminal']);
	});
});
