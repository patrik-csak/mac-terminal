import {readFile} from 'node:fs/promises';
import os from 'node:os';
import {parse as parsePlist} from 'plist';

/**
Get the list of installed Terminal profiles

 @returns {Promise<string[]>} - List of installed Terminal profiles
 */
export default async function getTerminalProfiles() {
	const terminalPlistPath = `${os.homedir()}/Library/Preferences/com.apple.Terminal.plist`;
	const terminalPreferences = parsePlist(await readFile(terminalPlistPath));
	const profiles = Object.keys(terminalPreferences['Window Settings']);

	return profiles
		.toSorted(new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare);
}
