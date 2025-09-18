# `mac-terminal`

Node.js library for managing [Apple’s macOS Terminal.app](https://en.wikipedia.org/wiki/Terminal_(macOS))

## Install

```sh
npm install mac-terminal
```

## API

### `setTerminalProfile()`

```typescript
function setTerminalProfile(profile: string): Promise<void>;
```

Update all of Terminal’s windows and tabs to the `profile` profile

```javascript
import {setTerminalProfile} from 'mac-terminal';

await setTerminalProfile('One Dark');
```

### `setTerminalDefaultProfile()`

```typescript
function setTerminalDefaultProfile(profile: string): Promise<void>;
```

Update Terminal’s default profile to `profile`

```javascript
import {setTerminalDefaultProfile} from 'mac-terminal';

await setTerminalDefaultProfile('One Light');
```

## Related

- [auto-terminal-profile](https://github.com/patrik-csak/auto-terminal-profile) – Automatically switch macOS Terminal’s profile (theme) based on the system-wide dark / light appearance mode

## Acknowledgements

Thanks to [Jimmy Bosse](https://github.com/jbosse) for his [Stack Overflow answer](https://stackoverflow.com/a/66080297/4411309)
