# mac-terminal

Control the [macOS Terminal app](<https://en.wikipedia.org/wiki/Terminal_(macOS)>) with Node.js

## Install

```sh
npm install mac-terminal
```

## API

- [`getTerminalDefaultProfile`](#getterminaldefaultprofile)
- [`getTerminalProfiles`](#getterminalprofiles)
- [`isTerminalRunning`](#isterminalrunning)
- [`setTerminalDefaultProfile`](#setterminaldefaultprofile)
- [`setTerminalProfile`](#setterminalprofile)

### `getTerminalDefaultProfile()`

Get the default Terminal profile

#### Signature

```typescript
function getTerminalDefaultProfile(): Promise<string>;
```

#### Example

```javascript
import {getTerminalDefaultProfile} from 'mac-terminal';

await getTerminalDefaultProfile(); // 'Clear Dark'
```

### `getTerminalProfiles()`

Get the list of installed Terminal profiles

#### Signature

```typescript
function getTerminalProfiles(): Promise<string[]>;
```

#### Example

```javascript
import {getTerminalProfiles} from 'mac-terminal';

await getTerminalProfiles(); // ['Basic', 'Clear Dark', 'Clear Light', ...]
```

### `isTerminalRunning()`

Determine whether Terminal is currently running

#### Signature

```typescript
function isTerminalRunning(): Promise<boolean>;
```

#### Example

```js
import {isTerminalRunning} from 'mac-terminal';

await isTerminalRunning(); // true
```

### `setTerminalDefaultProfile()`

Update the default Terminal profile

#### Signature

```typescript
function setTerminalDefaultProfile(profile: string): Promise<void>;
```

#### Example

```javascript
import {setTerminalDefaultProfile} from 'mac-terminal';

await setTerminalDefaultProfile('Clear Dark');
```

### `setTerminalProfile()`

Update the Terminal profile for all open tabs and windows, and optionally update the default profile at the same time

#### Signature

```typescript
function setTerminalProfile({
	profile: string,
	setDefault?: boolean = false
}): Promise<void>;
```

#### Examples

```javascript
import {setTerminalProfile} from 'mac-terminal';

await setTerminalProfile({profile: 'Clear Dark'});

await setTerminalProfile({
	profile: 'Clear Dark',
	setDefault: true, // Also set as the default profile
});
```

## Related

- [auto-terminal-profile](https://github.com/patrik-csak/auto-terminal-profile) – Automatically switch Terminal profiles when macOS dark/light mode changes
