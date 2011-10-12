#!/bin/bash
if [ -d kojslint ]; then
	echo "automatically download jslint and modify it so it can be used in this extension; Please run this script under the root dir of kojslint."
	exit 1
fi

cd chrome; cd content

JSLINT_URL='https://raw.github.com/douglascrockford/JSLint/master/jslint.js'
curl $JSLINT_URL -o jslint.js
echo "window.extensions = window.extensions || {}; window.extensions.JSLINT=JSLINT;" >> jslint.js

echo "successfully updated jslint"