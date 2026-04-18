import {defineConfig} from 'eslint/config';
import packageJson from 'eslint-plugin-package-json';
import xo from 'xo';

export default defineConfig([
	{
		files: ['**/*.js'],
		extends: [
			xo.xoToEslintConfig([
				{
					prettier: 'compat',
				},
			]),
		],
	},
	{
		files: ['package.json'],
		extends: [packageJson.configs.recommended, packageJson.configs.stylistic],
		rules: {
			'package-json/require-sideEffects': 'off',
		},
	},
]);
