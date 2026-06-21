import {defineConfig} from 'eslint/config';
import packageJson from 'eslint-plugin-package-json';
import xo from 'xo';

export default defineConfig([
	{
		extends: [
			xo.xoToEslintConfig([
				{
					prettier: 'compat',
				},
			]),
		],
		files: ['**/*.js'],
	},
	{
		extends: [packageJson.configs.recommended, packageJson.configs.stylistic],
		files: ['package.json'],
		rules: {
			'package-json/require-sideEffects': 'off',
			'package-json/scripts-name-casing': 'off',
		},
	},
]);
