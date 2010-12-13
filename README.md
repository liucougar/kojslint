KoJSLint
========

Komodo (IDE/Edit) extension for integrating with [JSLint] and automatically fixing some common jslint warnings.

Once installed, the extension can be accessed via `Tools` -> `JS Lint`. The jslint run command can be assigned a shortcut key.

I'd like to thank Ben Smawfield for allowing me to fork [kjslint] to become this komodo extension.

  [JSLint]: http://www.jslint.com/
  [kjslint]: http://github.com/theSmaw/kJSLint

FEATURES
--------
- profiles of jslint options can be saved (called mode) which are available for all files/projects
- add/delete profiles (modes)
- auto-fix some common jslint warnings
- all jslint warnings on the same line are grouped in the "JSLint errors" output tab
- profiles can be locked (it can't be changed/deleted until being unlocked)

AutoFix
-------
To access the AutoFix feature, right click on a row in the "JSLint errors" output tab to auto fix that particular warning. If you are auto-fixing multiple warnings on the same line, try to begin with the last warning for that particular line, and move backward.

Download/Install
----------------
This extension can be installed through `Tools` -> `Add-ons`, `Get Add-ons` tab.

SOURCE/BUGS/LICENSE
------------------
Source code is available from [github]. If you have any issues to report, please use github [issue tracker].

KoJSLint is licensed with Mozilla Public License 1.1 ([MPL]), except the jslint.js file which is covered by the license block at the top of that file.

  [github]: http://github.com/liucougar/kojslint
  [issue tracker]: http://github.com/liucougar/kojslint/issues
  [MPL]: http://www.opensource.org/licenses/mozilla1.1.php