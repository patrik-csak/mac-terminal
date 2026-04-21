import assert from 'node:assert/strict';
import {beforeEach, describe, it, mock} from 'node:test';

const os = {homedir: mock.fn(() => '/home')};
mock.module('node:os', {defaultExport: os, namedExports: os});

const bplistParser = {parseFile: mock.fn()};
mock.module('bplist-parser', {namedExports: bplistParser});

const {default: getTerminalProfiles} =
	await import('../source/get-terminal-profiles.js');

describe('getTerminalProfiles', () => {
	beforeEach(() => {
		bplistParser.parseFile.mock.resetCalls();
	});

	it('returns sorted profile names', async () => {
		bplistParser.parseFile.mock.mockImplementation(async () => [
			{'Window Settings': {'Dark Profile': {}, 'Light Profile': {}}},
		]);

		const profiles = await getTerminalProfiles();

		assert.deepEqual(profiles, ['Dark Profile', 'Light Profile']);
	});

	it('sorts numerically', async () => {
		bplistParser.parseFile.mock.mockImplementation(async () => [
			{
				'Window Settings': {
					/* eslint-disable perfectionist/sort-objects */
					'Profile 10': {},
					'Profile 2': {},
					'Profile 1': {},
					/* eslint-enable */
				},
			},
		]);

		const profiles = await getTerminalProfiles();

		assert.deepEqual(profiles, ['Profile 1', 'Profile 2', 'Profile 10']);
	});

	it('reads the correct plist path', async () => {
		bplistParser.parseFile.mock.mockImplementation(async () => [
			{'Window Settings': {}},
		]);

		await getTerminalProfiles();

		assert.equal(
			bplistParser.parseFile.mock.calls[0].arguments[0],
			'/home/Library/Preferences/com.apple.Terminal.plist',
		);
	});
});
