KoJSLint
========

Komodo (IDE/Edit) extension to integrating with [JSLint] providing lint warnings/errors/function report and automatically fixing some common jslint warnings.

Once installed, the extension can be accessed via `Tools` -> `JS Lint`. The jslint run command can be assigned a shortcut key.

I'd like to thank Ben Smawfield for allowing me to fork [kjslint] to become this komodo extension.

  [JSLint]: http://www.jslint.com/
  [kjslint]: http://github.com/theSmaw/kJSLint

FEATURES
--------
- provide UI to modify all available JSLint options
- save jslint options as profiles (called modes) which are shared for all files/projects
- add/delete profiles (modes)
- profiles can be locked (it can't be changed/deleted until unlocked)
- auto-fix some common jslint warnings
- all jslint warnings on the same line are grouped in the "JSLint errors" output tab
- bundled with JSLint 2011-10-07

AutoFix
-------
To access the AutoFix feature, right click on a row in the "JSLint errors" output tab to auto fix that particular warning. If you are auto-fixing multiple warnings on the same line, try to begin with the last warning for that particular line, and move backward.

Download/Install
----------------
This extension can be installed through `Tools` -> `Add-ons`, `Get Add-ons` tab.

For Developers
--------------

The JSLint.js file can be auto-updated by running ./get_jslint.sh
You can build an XPI by running ./build.sh
The parser.php file automates the process of changing the comments from the jslint.js file such as
  //     adsafe     true, if ADsafe rules should be enforced
into a checkbox that can be used in komodo.xul, such as
  <checkbox id="adsafe" class="kojslint_checkbox" label="true, if ADsafe rules should be enforced" />
To use it, pipe the relevent comments into it, and capture the output.
  
SOURCE/BUGS/LICENSE
------------------
Source code is available from [github].

KoJSLint is licensed under Mozilla Public License 1.1 ([MPL]), except the jslint.js file which is covered by the license block at the top of that file.

If something is not working properly, please try to post all relevant error messages in the Error Console (see [Debug komodo extensions] on how to enable that) with your [bug report].

  [github]: http://github.com/liucougar/kojslint
  [Debug komodo extensions]: http://www.liucougar.net/blog/archives/262
  [bug report]: http://github.com/liucougar/kojslint/issues
  [MPL]: http://www.opensource.org/licenses/mozilla1.1.php