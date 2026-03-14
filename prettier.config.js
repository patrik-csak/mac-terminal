/**
 * @see {@link https://github.com/xojs/xo#prettier}
 * @type {import('prettier').Options}
 */
const config = {
	bracketSpacing: false,
	singleQuote: true,
	useTabs: true,

	// https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/tree/v0.91.0#usage-alongside-prettier
	plugins: ['prettier-plugin-packagejson'],
};

export default config;
