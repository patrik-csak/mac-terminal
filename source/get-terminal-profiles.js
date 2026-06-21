import os from 'node:os';
import {parseFile as parsePlistFile} from 'bplist-parser';

/**
Get the list of installed Terminal profiles

 @returns {Promise<string[]>} - List of installed Terminal profiles
 */
export default async function getTerminalProfiles() {
	const terminalPlistPath = `${os.homedir()}/Library/Preferences/com.apple.Terminal.plist`;
	const terminalPreferences = await parsePlistFile(terminalPlistPath);
	const profiles = Object.keys(terminalPreferences[0]['Window Settings']);

	return profiles
		.toSorted(new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare);
}
