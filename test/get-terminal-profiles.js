import assert from 'node:assert/strict';
import {Buffer} from 'node:buffer';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';

const os = {homedir: mock.fn(() => '/home')};
mock.module('node:os', {defaultExport: os, namedExports: os});

const fileSystem = {readFile: mock.fn()};
mock.module('node:fs/promises', {namedExports: fileSystem});

const plist = {parse: mock.fn()};
mock.module('plist', {namedExports: plist});

const {default: getTerminalProfiles} = await import('../source/get-terminal-profiles.js');

describe('getTerminalProfiles', () => {
	beforeEach(() => {
		fileSystem.readFile.mock.resetCalls();
		plist.parse.mock.resetCalls();
	});

	it('returns sorted profile names', async () => {
		plist.parse.mock.mockImplementation(() => (
			{'Window Settings': {'Dark Profile': {}, 'Light Profile': {}}}
		));

		const profiles = await getTerminalProfiles();

		assert.deepEqual(profiles, ['Dark Profile', 'Light Profile']);
	});

	it('sorts numerically', async () => {
		plist.parse.mock.mockImplementation(() => (
			{
				'Window Settings': {
					'Profile 10': {},
					'Profile 2': {},
					'Profile 1': {},
				},
			}
		));

		const profiles = await getTerminalProfiles();

		assert.deepEqual(profiles, ['Profile 1', 'Profile 2', 'Profile 10']);
	});

	it('reads the correct plist path', async () => {
		plist.parse.mock.mockImplementation(() => ({'Window Settings': {}}));

		await getTerminalProfiles();

		assert.equal(
			fileSystem.readFile.mock.calls[0].arguments[0],
			'/home/Library/Preferences/com.apple.Terminal.plist',
		);
	});

	it('parses the plist contents', async () => {
		const plistContents = Buffer.from('plist contents');
		fileSystem.readFile.mock.mockImplementation(async () => plistContents);
		plist.parse.mock.mockImplementation(() => ({'Window Settings': {}}));

		await getTerminalProfiles();

		assert.equal(plist.parse.mock.calls[0].arguments[0], plistContents);
	});
});
