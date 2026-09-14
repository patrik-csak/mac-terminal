import {Buffer} from 'node:buffer';
import {suite, test} from 'node:test';

/**
@param {import('node:test').TestContext} t
*/
async function setup(t) {
	const os = {homedir: t.mock.fn(() => '/home')};
	t.mock.module('node:os', {exports: {default: os, ...os}});

	const fileSystem = {readFile: t.mock.fn()};
	t.mock.module('node:fs/promises', {exports: fileSystem});

	const plist = {parse: t.mock.fn()};
	t.mock.module('plist', {exports: plist});

	// https://github.com/nodejs/node/issues/59163
	const {default: getTerminalProfiles} = await import(`../source/get-terminal-profiles.js?test=${t.name}`);

	return {
		getTerminalProfiles, os, fileSystem, plist,
	};
}

suite('getTerminalProfiles', () => {
	test('returns sorted profile names', async t => {
		const {getTerminalProfiles, plist} = await setup(t);

		plist.parse.mock.mockImplementation(() => (
			{'Window Settings': {'Dark Profile': {}, 'Light Profile': {}}}
		));

		const profiles = await getTerminalProfiles();

		t.assert.deepStrictEqual(profiles, ['Dark Profile', 'Light Profile']);
	});

	test('sorts numerically', async t => {
		const {getTerminalProfiles, plist} = await setup(t);

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

		t.assert.deepStrictEqual(profiles, ['Profile 1', 'Profile 2', 'Profile 10']);
	});

	test('reads the correct plist path', async t => {
		const {getTerminalProfiles, fileSystem, plist} = await setup(t);

		plist.parse.mock.mockImplementation(() => ({'Window Settings': {}}));

		await getTerminalProfiles();

		t.assert.strictEqual(
			fileSystem.readFile.mock.calls[0].arguments[0],
			'/home/Library/Preferences/com.apple.Terminal.plist',
		);
	});

	test('parses the plist contents', async t => {
		const {getTerminalProfiles, fileSystem, plist} = await setup(t);

		const plistContents = Buffer.from('plist contents');
		fileSystem.readFile.mock.mockImplementation(async () => plistContents);
		plist.parse.mock.mockImplementation(() => ({'Window Settings': {}}));

		await getTerminalProfiles();

		t.assert.strictEqual(plist.parse.mock.calls[0].arguments[0], plistContents);
	});
});
