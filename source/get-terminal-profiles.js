import os from 'node:os';
import bplist from 'bplist-parser';

/**
 * @returns {Promise<string[]>} - List of installed profiles
 */
export default async function getTerminalProfiles() {
	const terminalPlistPath = `${os.homedir()}/Library/Preferences/com.apple.Terminal.plist`;
	const terminalPreferences = await bplist.parseFile(terminalPlistPath);

	return Object.keys(terminalPreferences[0]['Window Settings']).toSorted(
		new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare,
	);
}
