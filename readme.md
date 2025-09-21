# mac-terminal

Control the [macOS Terminal app](<https://en.wikipedia.org/wiki/Terminal_(macOS)>) with Node.js

## Install

```sh
npm install mac-terminal
```

## API

### `getTerminalDefaultProfile()`

```typescript
function getTerminalDefaultProfile(): Promise<string>;
```

#### Example

```javascript
import {getTerminalDefaultProfile} from 'mac-terminal';

await getTerminalDefaultProfile(); // 'Clear Dark'
```

### `getTerminalProfiles()`

```typescript
function getTerminalProfiles(): Promise<string[]>;
```

Get a list of installed Terminal profiles

#### Example

```javascript
import {getTerminalProfiles} from 'mac-terminal';

await getTerminalProfiles(); // ['Basic', 'Clear Dark', 'Clear Light', ...]
```

### `isTerminalRunning()`

```typescript
function isTerminalRunning(): Promise<boolean>;
```

Determine whether Terminal is currently running

#### Example

```js
import {isTerminalRunning} from 'mac-terminal';

await isTerminalRunning(); // true
```

### `setTerminalDefaultProfile()`

```typescript
function setTerminalDefaultProfile(profile: string): Promise<void>;
```

Set the default Terminal profile for new windows / tabs

#### Example

```javascript
import {setTerminalDefaultProfile} from 'mac-terminal';

await setTerminalDefaultProfile('Clear Dark');
```

### `setTerminalProfile()`

```typescript
function setTerminalProfile({
	profile: string,
	setDefault?: boolean = false
}): Promise<void>;
```

Update all open Terminal tabs to the given profile

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
