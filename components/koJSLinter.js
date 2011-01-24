/*global Components: false, XPCOMUtils: false, JSLINT: false */
/*jslint browser: true*/
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://kojslint/jslint.js");
//var loggingSvc = Components.classes["@activestate.com/koLoggingService;1"].
//                    getService(Components.interfaces.koILoggingService);
//var log = loggingSvc.getLogger('kojslinter');

function koJSLintLinter() { }

koJSLintLinter.prototype = {
	// XPCOM fields
	classDescription: "Javascript linter using JSLint",
	classID:          Components.ID("{a5d13370-b278-45a6-ba37-1f2c8fd9f7d9}"),
	// overload Komodo/lib/mozilla/components/koXPCShellLinter.py
	contractID:       "@activestate.com/koLinter?language=JavaScript;1",
	QueryInterface: XPCOMUtils.generateQI([Components.interfaces.koILinter]),
	// [optional] an array of categories to register this component in.
	_xpcom_categories: [{ category: "category-komodo-linter" }/*, { category: 'JavaScript' }*/],

	// koJSLintLinter fields
	name: "jslint_linter",
	prettyName: "JSLint linter",
	// koLinter Interface
	lint: function(request, /*?*/text){
		if(text === undefined){
			text = request.content;
		}

		var results = Components.classes['@activestate.com/koLintResults;1']
						.createInstance(Components.interfaces.koILintResults);
		var aResultClass = Components.classes['@activestate.com/koLintResult;1'];
		
		var lintResult = JSLINT(text), data = JSLINT.data();
		
		data.errors.forEach(function(e){
			if(!e){
				return;
			}
			var aResult = aResultClass.createInstance(Components.interfaces.koILintResult);
			aResult.lineStart = e.line;
			aResult.lineEnd = e.line;
			aResult.columnStart = 1;
			aResult.columnEnd = e.character;
			aResult.description = e.reason;
			aResult.severity = aResult.SEV_ERROR;
			results.addResult(aResult);
		});
		return results;
	}
};

var components = [koJSLintLinter];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}