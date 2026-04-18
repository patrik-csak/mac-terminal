import {beforeEach, describe, it, mock} from 'node:test';
import assert from 'node:assert/strict';

const childProcess = {execFile: mock.fn()};
mock.module('node:child_process', {namedExports: childProcess});

const {default: isTerminalRunning} =
	await import('../source/is-terminal-running.js');

describe('isTerminalRunning', () => {
	beforeEach(() => {
		childProcess.execFile.mock.resetCalls();
	});

	it('returns true when Terminal is running', async () => {
		childProcess.execFile.mock.mockImplementation(
			(_command, _args, callback) => {
				callback(null, {stdout: '1234\n', stderr: ''});
			},
		);

		assert.equal(await isTerminalRunning(), true);
	});

	it('returns false when Terminal is not running', async () => {
		childProcess.execFile.mock.mockImplementation(
			(_command, _args, callback) => {
				callback(new Error('no process found'));
			},
		);

		assert.equal(await isTerminalRunning(), false);
	});

	it('calls pgrep with correct arguments', async () => {
		childProcess.execFile.mock.mockImplementation(
			(_command, _args, callback) => {
				callback(null, {stdout: '', stderr: ''});
			},
		);

		await isTerminalRunning();

		const [command, args] = childProcess.execFile.mock.calls[0].arguments;
		assert.equal(command, 'pgrep');
		assert.deepEqual(args, ['-x', 'Terminal']);
	});
});
