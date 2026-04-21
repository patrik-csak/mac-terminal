import e18e from '@e18e/eslint-plugin';
import packageJson from 'eslint-plugin-package-json';
import perfectionist from 'eslint-plugin-perfectionist';
import {defineConfig} from 'eslint/config';
import xo from 'xo';

export default defineConfig([
	{
		extends: [
			e18e.configs.recommended,
			perfectionist.configs['recommended-natural'],
			xo.xoToEslintConfig([
				{
					prettier: 'compat',
					rules: {
						'import-x/order': 'off',
					},
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
