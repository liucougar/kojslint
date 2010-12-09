'use strict';

// add koJSLint to the recommended Komodo extensions namespace
// @see http://www.openkomodo.com/blogs/jeffg/namespaces-please
if (typeof(window.extensions) === 'undefined') {
    window.extensions = {};
}

if(!window.extensions.KOJSLINT){
    window.extensions.KOJSLINT = {mixin: function(o, p){
        for(var i in p){
            if(p.hasOwnProperty(i)){
                o[i] = p[i];
            }
        }
    }};
}

(function () {
    var constCrockisms = ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'Your code is gorgeous', 'Crockford loves you', 'No-one\'s feelings hurt', 'No haz lint'], // evidence messages when there are no errors found
        constCrockismsBad = ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'Slop'], // evidence messages when linting has to stop
        constCustomOptionsContainerId = 'kojslint2_groupbox_custom_options', // ID of the custom options container
        constModeHeadingCustom = 'Custom options', // Heading to display above options in custom mode
        constModeHeadingDefault = 'Default mode', // Heading to display above options in default mode
        constIndentationInputId = 'kojslint2_textbox_indent',
        constOptionsTabId = 'kojslint2_options_tab', // ID of the options tab
        constOptionsTabPanelId = 'kojslint2_options_panel', // ID of the options panel
        constErrorsTabId = 'kojslint2_errors_tab', // ID of the tab for the errors panel in the output panel
        constErrorsTabText = 'JSLint errors', // title text for the tab for the errors panel in the output panel
        constErrorsTreechildrenId = 'kojslint2_errors_treechildren', // ID of the errors treechildren
        constErrorsTreeId = 'kojslint2_errors_tree', // ID of the errors tree
        constFunctionsTabId = 'kojslint2_functions_tab', // ID of the functions tab
        constFunctionsTabText = 'JSLint report', // title text for the tab for the errors panel in the output panel
        constFunctionsTreechildrenId = 'kojslint2_functions_treechildren', // ID of the functions treechildren
        constFunctionsTreeId = 'kojslint2_functions_tree', // ID of the functions tree
        constMaxErrInputId = 'kojslint2_textbox_maxerr', // ID of the max errors input
        constMaxLenInputId = 'kojslint2_textbox_maxlen', // ID of the max line length input
        constOptionsHeadingId = 'kojslint2_h4_custom', // ID of the options heading element
        constOptionsRadiosId = 'kojslint2_radiogroup_presets', // ID of the modes options radiogroup
        constPredefInputId = 'kojslint2_textbox_predef', // ID of the predef input
        currentConfName='custom', // path to the current file
        elCustomOptionsContainer, // reference to the container of the Custom options
        elErrorsTab, // reference to the tab element for the errors panel
        elErrorsTree, // reference to the tree containing the errors
        elErrorsTreechildren, // reference to the treechildren containing the errors
        elFunctionsTab, // reference to the tab element for the report panel
        elFunctionsTree, // reference to the tree containing the functions treechildren
        elFunctionsTreechildren, // reference to the functions treechildren
        elIndentationInput, // reference to the indentation input
        elMaxLenInput, // reference to the max line length input
        elMaxErrInput, // reference to the max err input
        elPredefInput, // reference to the predef input
        elOptionsHeading, // reference to the options heading
        elOptionsPanel, // reference to the options panel
        elOptionsRadios, // reference to the mode radiogroup
        elsOptionsCheckboxes, // array of references to options checkboxes
        fileSavedobserver, // observer used to listen to file saved event
        globalPrefsSet, // where to find the preferences within komodo
        options = {
            bitwise : true, // if bitwise operators should not be allowed
            eqeqeq : true, // if === should be required
            immed : true, // if immediate invocations must be wrapped in parens
            indent : 4,
            maxerr : 50,
            maxlen : 250,
            newcap : true, // if constructor names must be capitalized
            nomen : true, // if names should be checked
            onevar : true, // if only one var statement per function should be allowed
            plusplus : true, // if increment/decrement should not be allowed
            predef : '', 
            regexp : true, // if the . should not be allowed in regexp literals
            undef : true, // if variables should be declared before used
            strict : true, // require the "use strict"; pragma
            white : true // if strict whitespace rules apply
        },
        prefsName = 'koJSLintPrefs', // name of stringPrefence in Komodo's prefs.xml
        prefsObject, // preferences
        JSON = Components.classes['@mozilla.org/dom/json;1']
                 .createInstance(Components.interfaces.nsIJSON),
        JSLINT = window.extensions.JSLINT,
        KOJSLINT = window.extensions.KOJSLINT; 

    // allow old preference objects to work with the latest version of JS Lint    
    function convertObjectToLatestVersion(o) {
        if (o.es5 === undefined) {
            o.es5 = options.es5;
        }
        if (o.sidebar !== undefined) {
            o.windows = o.sidebar;
            delete o.sidebar;
        }
        
        return o;
    }
    
    // 'subclass' an object
    function copyObject(o) {
        
        function F() {}
        F.prototype = o;
        
        return new F();
    }
    
    // set the options panel to reflect default mode
    function enterCustomMode() {
        var i, // counter
            length = elsOptionsCheckboxes.length, // number of default checkboxes
            theCheckbox, // current checkbox
            thePref; // current preference
        
//         currentConfName = 'custom';

        elOptionsHeading.setAttribute('label', constModeHeadingCustom);      
        for (i = 0; i < length; i += 1) {
            theCheckbox = elsOptionsCheckboxes[i];
            thePref = theCheckbox.id;
            theCheckbox.disabled = false;
            theCheckbox.checked = prefsObject[currentConfName][thePref];
            if (theCheckbox.className !== 'kojslint_checkbox defaultOption') {
                theCheckbox.parentNode.className = '';
            }
        } 
        elOptionsRadios.selectedIndex = 1;
    }
    
    // set the options panel to reflect default mode
    function enterDefaultMode() {
        var i, // counter
            length = elsOptionsCheckboxes.length, // number of default checkboxes
            theCheckbox, // current checkbox
            thePref; // current preference
        
        elOptionsHeading.setAttribute('label', constModeHeadingDefault);
        for (i = 0; i < length; i += 1) {
            theCheckbox = elsOptionsCheckboxes[i];
            thePref = theCheckbox.id;
            theCheckbox.checked = options[thePref];
            
            prefsObject[currentConfName][thePref] = options[thePref];
            if (theCheckbox.className !== 'kojslint_checkbox defaultOption') {
                theCheckbox.parentNode.className = 'hidden';
                theCheckbox.checked = false;
            }
            else {
                theCheckbox.checked = true;
            }
            theCheckbox.disabled = true;
        }
        elOptionsRadios.selectedIndex = 0;
    }
    
    // when the custom option is selected
    function eventCustomModeClicked() {
        currentConfName = 'custom';
        prefsGetFilePrefs();
        enterCustomMode();
    }
    
    // when the default option is selected
    function eventDefaultModeClicked() {
        currentConfName = 'default';
        prefsGetFilePrefs();
        enterDefaultMode();
    }
    
    // update a preference
    function prefsSet(pref, val) {
        prefsObject[currentConfName][pref] = val;
    }
    
    // when the indentation input has been changed
    function eventIndentationChanged() {
        prefsSet('indent', parseInt(elIndentationInput.value, 10));
    }
    
    // get references to DOM elements
    function getElements() {
        elCustomOptionsContainer = document.getElementById(constCustomOptionsContainerId);
        elErrorsTab = document.getElementById(constErrorsTabId);
        elErrorsTree = document.getElementById(constErrorsTreeId);
        elErrorsTreechildren = document.getElementById(constErrorsTreechildrenId);
        elFunctionsTab = document.getElementById(constFunctionsTabId);
        elFunctionsTree = document.getElementById(constFunctionsTreeId);
        elFunctionsTreechildren = document.getElementById(constFunctionsTreechildrenId);
        elIndentationInput = document.getElementById(constIndentationInputId);
        elMaxErrInput = document.getElementById(constMaxErrInputId);
        elMaxLenInput = document.getElementById(constMaxLenInputId);
        elOptionsHeading = document.getElementById(constOptionsHeadingId);
        elOptionsPanel = document.getElementById(constOptionsTabPanelId);
        elOptionsRadios = document.getElementById(constOptionsRadiosId);
        elPredefInput = document.getElementById(constPredefInputId);
        elsOptionsCheckboxes = elCustomOptionsContainer.getElementsByTagName('checkbox');
    }
    
    // user has intereacted with a check box on the options panel
    function eventOptionClicked(e) {
        var previous, // traverse until we find previous sibling
            theCheckbox; // checkbox element for the selected option
        
        if (e.target.value) {
            previous = e.target.previousSibling;
            while (previous.nodeType !== 1) {
                previous = previous.previousSibling;
            }
            theCheckbox = previous;
            
            // clicking the label doesn't change the checkbox state, so I need to do it manually
            if (!theCheckbox.disabled) {
                if (theCheckbox.checked) {
                    theCheckbox.checked = false;
                }
                else {
                    theCheckbox.checked = true;
                }
            }
        }
        else {
            theCheckbox = e.target;
        }            
        if (!theCheckbox.disabled) {
            prefsObject[currentConfName][theCheckbox.id] = theCheckbox.checked;
        }
    }
    
    // when the max err input is changed
    function eventMaxErrChanged() {
        prefsSet('maxerr', parseInt(elMaxErrInput.value, 10));
    }
    
    // when the max line length input is changed
    function eventMaxLenChanged() {
        prefsSet('maxlen', parseInt(elMaxLenInput.value, 10));
    }
        
    function eventModeSelected(e) {
        if (elOptionsRadios.selectedIndex === 0) {
            eventDefaultModeClicked();    
        }
        else {
            eventCustomModeClicked();
        }
    }
    
    // when the predefined variables input is changed
    function eventPredefChanged() {
        prefsSet('predef', elPredefInput.value.split(' ').join('').split(','));
    }
    
    // observe changes to the options
    function observeOptionsEvents() {
        elCustomOptionsContainer.addEventListener('click', eventOptionClicked, false);
        elOptionsRadios.addEventListener('click', eventModeSelected, false);
        elIndentationInput.addEventListener('change', eventIndentationChanged, false);
        elIndentationInput.addEventListener('keyup', eventIndentationChanged, false);
        elMaxErrInput.addEventListener('change', eventMaxErrChanged, false);
        elMaxErrInput.addEventListener('keyup', eventMaxErrChanged, false);
        elMaxLenInput.addEventListener('change', eventMaxLenChanged, false);
        elMaxLenInput.addEventListener('keyup', eventMaxLenChanged, false);
        elPredefInput.addEventListener('keyup', eventPredefChanged, true);
    }
    
    // set the options panel to reflect the stored options
    function updateOptionsPanel() {
        var currBox,
            currId,
            defaultMode = true, // set to true if the preferences for the file are default
            i, // counter
            length = elsOptionsCheckboxes.length; // number of checkbox options
                   
        // check to see if we should go into default or custom mode
        for (i = 0; i < length; i += 1) {
            currBox = elsOptionsCheckboxes[i];
            currId = currBox.id;
            if (prefsObject[currentConfName][currId] !== options[currId]) {
                defaultMode = false;
                
                break;
            }
        }
        if (defaultMode) {
            enterDefaultMode();
        }
        else {
            enterCustomMode();
        }
        
        elIndentationInput.value = prefsObject[currentConfName].indent;
        elMaxErrInput.value = prefsObject[currentConfName].maxerr;
        elMaxLenInput.value = prefsObject[currentConfName].maxlen;
        elPredefInput.value = prefsObject[currentConfName].predef;
    }
    
    // get the preferences for the file at the current view
    function prefsGetFilePrefs() {
        var property,
            tempObj;
            
        if (!prefsObject[currentConfName]) {
            prefsObject[currentConfName] = {};
            
            // make a deep copy of the options object and assign it
            tempObj = copyObject(options);
            for (property in tempObj) {
                if (options.hasOwnProperty(property)) {
                    prefsObject[currentConfName][property] = tempObj[property];
                }
            }
        }
    }
    
    // when a tab is changed
    function eventTabChanged(e) {
//         setCurrentPath(e.originalTarget);
        prefsGetFilePrefs();
        updateOptionsPanel();
    }
    
    function viewJumpToErrorLine(keycode) {
        var colNumber, // the position of the result
            lineNumber, // column in tree containing line number
            pos, // komodo's pointer to the position of the result
            view = ko.views.manager.currentView; // the document being tested
            
        if (!(keycode && (keycode !== 13))) {
            
            // the event is fired from the treechildren element so I need to take the location value from the currently focussed element
            if (!elErrorsTree) {
                elErrorsTree = document.getElementById(constErrorsTreeId);
            }
            
            // I need to subtract 1
            lineNumber = elErrorsTree.view.getCellText(elErrorsTree.currentIndex, elErrorsTree.columns.getNamedColumn('kojslint2_errors_tree_line')) - 1;
            colNumber = elErrorsTree.view.getCellText(elErrorsTree.currentIndex, elErrorsTree.columns.getNamedColumn('kojslint2_errors_tree_char')) - 1;
            
            if (lineNumber) {
                view.setFocus();        
                pos = view.scimoz.positionAtColumn(lineNumber, colNumber);
                view.scimoz.ensureVisibleEnforcePolicy(lineNumber);
                view.scimoz.gotoPos(pos);
                view.scimoz.selectionStart = pos;
                view.scimoz.selectionEnd = pos;
            }
        }
    }
    
    // jump to the location of the error that has been selected
    function eventErrorDblClick() {
        viewJumpToErrorLine();
    }
    
    function eventErrorClick(e){
        if(e && e.button == 2){ //right button
            var view = elErrorsTree.view;
            var selectedIndex = elErrorsTree.currentIndex, row = view.getItemAtIndex(selectedIndex);
            var theError = row && row.getUserData('lintError');
            if(theError){
                autoFixError(ko.views.manager.currentView, theError);
            }
        }
    }
    function autoFixError(view, result){
        if(!result.raw){
            return;
        }
        var sm = view.scimoz;
        var line = result.line - 1;
        var txt=getLineText(view,line);
        //ignore checking for "Bad line breaking before '{a}'.", it will be handled below
        if(result.raw !== "Bad line breaking before '{a}'." && 
            result.evidence !== txt.substr(0, result.evidence.length) && 
            /\s/.test(txt.substr(result.evidence.length))){
            alert('Stoped: Line is changed! ');
            return;
        }
        var startpos = sm.positionAtColumn(line,0);
        var errorpos = sm.positionAtColumn(line,result.character-1);
        var endpos = sm.getLineEndPosition(line);
//         alert(txt+' '+startpos+' '+errorpos+' '+endpos);
        switch(result.raw){
            case 'Missing semicolon.':
                //ko.dialogs.alert(txt.slice(-2,-1)); 
//                 if(txt && ! /;[\s\n\r]*$/.test(txt)){ //prevent double insert
                    sm.insertText(errorpos,';');
                    //this.moveCursorToMessage(view, result);
//                 }
                break;
            case "Use '{a}' to compare with '{b}'.":
                if(result.a){
                    var op=result.a.substr(0,2),i=0;
                    var compwith=result.b;
                    if(!compwith){
                        compwith="(?:\"\"|'')";
                    }
                    var reg=new RegExp(op+'\\s*'+compwith+'|'+compwith+'\\s*'+op,'g');
                    var inspos;
                    txt.replace(reg,function(s,offset,str){
                        if(!inspos){
                            if(s.substr(0,2)===op){
                                if(str.charAt(offset-1)!=='=' && str.charAt(offset-1)!=='!'){
                                    inspos=offset+1;
                                }
                            }else{
                                if(str.charAt(offset+s.length)!=='='){
                                    inspos=offset+s.length;
                                }
                            }
                        }
                        return s;
                    });
                    if(inspos){
                        sm.insertText(startpos+inspos,'=');
                        //this.moveCursorToMessage(view, result);
                    }
                }
                break;
            case "Bad line breaking before '{a}'.":
                var c = String.fromCharCode(sm.getCharAt(endpos-1));
                if(c === result.a){
                    alert('already fixed');
                    return;
                }
                sm.insertText(endpos, result.a);
                
                //remove the starting character in the next line
                var indentpos = sm.getLineIndentPosition(line+1);
                if(String.fromCharCode(sm.getCharAt(indentpos)) == result.a){
                    deleteRange(sm, indentpos,1);
                }
                break;
            case "Expected '{a}' and instead saw '{b}'.":
                sm.gotoPos(errorpos);
                sm.selectionStart = errorpos;
                sm.selectionEnd = errorpos + result.b.length;
                sm.replaceSel(result.a);
                break;
//             case "Mixed spaces and tabs.":
//                 var w=globalPrefsSet.getLongPref('indentWidth');//, useTab=globalPrefsSet.getBooleanPref('useTab');
//                 if(sm.useTab){
//                     var reg = new RegExp('\\s{'+w+'}', 'g');
//                     txt = txt.replace(reg, '\t');
//                 }else{
//                     var empty='';
//                     while(w--){
//                         empty += ' ';
//                     }
//                     txt = txt.replace(/\t/g, empty);
//                 }
//                 sm.gotoPos(startpos);
//                 sm.selectionStart = startpos;
//                 sm.selectionEnd = endpos;
//                 sm.replaceSel(txt.replace(/\s+$/,''));
//                 break;
            case "Missing 'new' prefix when invoking a constructor.":
                sm.insertText(errorpos,'new ');
                break;
//             case "Expected a conditional expression and instead saw an assignment.":
//                 break;
            case "Unnecessary semicolon.":
                var ind=txt.search(/((?:;\s*)+)[\s\n\r]*$/);
                var expected=result.a===';'?1:0;
                if(ind>=0){
                    var startreplace=startpos+ind+expected;
                    if(startreplace!==endpos){
                        deleteRange(sm, startreplace,endpos-startreplace);
                    }
                }
                break;
            case "Missing '()' invoking a constructor.":
                if(sm.getCharAt(errorpos)!=='('.charCodeAt(0)){
                    sm.insertText(errorpos,"()");
                }
                break;
            case "['{a}'] is better written in dot notation.":
                if(txt.charAt(errorpos-startpos-1)==='['){
                    var startreplace=errorpos-1;
                    sm.gotoPos(startreplace);
                    sm.selectionStart = startreplace;
                    sm.selectionEnd = startreplace+4+result.a.length;
                    //ko.dialogs.alert(startreplace+" "+sm.selectionEnd);
                    sm.deleteBack();
                    sm.insertText(startreplace,"."+result.a);
                }
                break;
            default:
                alert("Don't know how to auto fix error "+JSON.encode(result));
        }
    }
    function getLineText(view,line){
        var resultObj={};
        view.scimoz.getLine(line,resultObj);
        return resultObj.value;
    }
    function deleteRange(sm, startreplace, len){
        sm.gotoPos(startreplace);
        sm.selectionStart = startreplace;
        sm.selectionEnd = startreplace+len;
        sm.deleteBack();
    }
    // jump to the location of the error that has been selected
    function eventErrorKeyup(e) {
        viewJumpToErrorLine(e.keyCode);
    }
    
    // jump to the location of the function that has been selected
    function viewJumpToFunctionLine(keycode) {
        var lineNumber, // column in tree containing line number
            pos, // komodo's pointer to the position of the result
            view = ko.views.manager.currentView; // the document being tested
            
        if (!(keycode && (keycode !== 13))) {
            
            // the event is fired from the treechildren element so I need to take the location value from the currently focussed element
            if (!elFunctionsTree) {
                elFunctionsTree = document.getElementById(constFunctionsTreeId);
            }
            
            // I need to subtract 1
            lineNumber = elFunctionsTree.view.getCellText(elFunctionsTree.currentIndex, elFunctionsTree.columns.getNamedColumn('kojslint2_functions_tree_line')) - 1;
            
            if (lineNumber) {
                view.setFocus();        
                pos = view.scimoz.positionAtColumn(lineNumber, 0);
                view.scimoz.ensureVisibleEnforcePolicy(lineNumber);
                view.scimoz.gotoPos(pos);
                view.scimoz.selectionStart = pos;
                view.scimoz.selectionEnd = pos;
            }
        }
    }
    
    // jump to the location of the function that has been selected
    function eventFunctionDblClick() {
        viewJumpToFunctionLine();
    }
    
    // jump to the location of the error that has been selected
    function eventFunctionKeyup(e) {
        viewJumpToFunctionLine(e.keyCode);
    }
    
    // get stored preferences
    function prefsGetPrefsObject() {
        var theObject, // preferences object from the preferences file
            theString;

        globalPrefsSet = Components.classes['@activestate.com/koPrefService;1'].getService(Components.interfaces.koIPrefService).prefs;
        try {
            theString = globalPrefsSet.getStringPref(prefsName);
            if (theString) {
                theObject = JSON.decode(theString);
                
                // we are using a new version of JS Lint that has new options that we have to allow for
                theObject = convertObjectToLatestVersion(theObject);
            }
            else {
                theObject = {};
            }
        }
        catch (err) {
            theObject = {};
        }
        
        return theObject;
    }
    
    // save the preferences to file
    function savePrefs() {
        globalPrefsSet.setStringPref(prefsName, JSON.encode(prefsObject));
    }
    
    // when a tab is closed, if its options are all default, we don't want to save its preferences to file
    function removeUnchangedPrefs() {
        var keep = false, // set to false if we want to remove the preference
            property;

        for (property in prefsObject[currentConfName]) {
            if (prefsObject[currentConfName][property] !== options[property]) {
                if (property === 'predef') {
                    
                    // I'm sure there is a better way to do this
                    if (!prefsObject[currentConfName][property] || (JSON.encode(prefsObject[currentConfName][property]) === '[""]')) {
                        
                        continue;
                    }
                }
                keep = true;
                
                break;
            }
        }
        if (!keep) {
            delete prefsObject[currentConfName];
        }
    }
    
    // if I create a new file and save it without changing tabs, a prefs object isn't created for it
    function createObjIfRequired() {
        var i, // counter
            length,
            theCheckbox;

//         setCurrentPath(ko.views.manager.currentView);
        if (!prefsObject[currentConfName]) {
            prefsObject[currentConfName] = {};
            length = elsOptionsCheckboxes.length;
            for (i = 0; i < length; i += 1) {
                theCheckbox = elsOptionsCheckboxes[i];
                prefsObject[currentConfName][theCheckbox.id] = theCheckbox.checked;
            }
            prefsObject[currentConfName].indent = elIndentationInput.value;
            prefsObject[currentConfName].maxlen = elMaxLenInput.value;
            prefsObject[currentConfName].maxerr = elMaxErrInput.value;
            prefsObject[currentConfName].predef = elPredefInput.value.split(' ').join('').split(',');
        }
    }
    
    // when a tab is saved
    function eventTabSaved() {
        createObjIfRequired();
    }
    
    // tab is being closed
    function eventTabClosing() {
        removeUnchangedPrefs();
    }
    
    // 'class' used to create observer of file saved event - it appears addEventListener will not work for this
    function FileSavedObserver() {
        this.register();
    }
    
    FileSavedObserver.prototype = {
    
        observe : function (subject, topic, data) {
            eventTabSaved();
        },
  
        register : function () {
            var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
        
            observerService.addObserver(this, 'file_changed', false);
        },
  
        unregister : function () {
            var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    
            observerService.removeObserver(this, 'file_changed');
        }
    };
    
    function eventUnload() {
        savePrefs();
        fileSavedobserver.unregister();
    }
    
    function getCurrentFilePath(view){
        // if a new file is created, it doesn't have a path
        try{
            return view.document.file.URI.replace(/\"/g, '');
        }catch(e){
            return 'temp';
        }
    }

    // observe events
    function observeWindowEvents() {
        getElements();
        
//         currentConfName = 'temp';//getCurrentPath(ko.views.manager.currentView)

        prefsGetFilePrefs();
        window.addEventListener('current_view_changed', eventTabChanged, false);
        updateOptionsPanel();
        observeOptionsEvents();
        fileSavedobserver = new FileSavedObserver();
        window.addEventListener('view_closing', eventTabClosing, false);
        window.addEventListener('unload', eventUnload, false);
        
        //setup error output grid event handler
        // allow results to be clicked to jump to text
        elErrorsTreechildren.addEventListener('dblclick', eventErrorDblClick, false);
        elErrorsTreechildren.addEventListener('click', eventErrorClick, false);
        
        // keyboard events need to be on the tree rather than the treechildren element
        elErrorsTree.addEventListener('keyup', eventErrorKeyup, false);
        
        //setup report output grid event handler
        // allow results to be clicked to jump to text
        elFunctionsTreechildren.addEventListener('dblclick', eventFunctionDblClick, false);
        
        // keyboard events need to be on the tree rather than the treechildren element
        elFunctionsTree.addEventListener('keyup', eventFunctionKeyup, false);
    }
    
    function init() {
        prefsObject = prefsGetPrefsObject();
        observeWindowEvents();
    }
    
    // remove items from output panel
    function viewRemove(theChildren, theId) {
        var i,
            length,
            theItems;
        
        if (!theChildren) {
            theChildren = document.getElementById(theId);
        }
        while(theChildren.firstChild){
            theChildren.removeChild(theChildren.firstChild);
        }
    }
    
    // put the current error in the output panel
    function viewAppendErrors(theErrors) {
        var theTreeitem,
            theCharTreecell, // treecell to contain the error character number
            theEvidenceTreecell, // treecell to contain the error evidence
            theLineTreecell, // treecell to contain the error line number
            theReasonTreecell, // treecell to contain the error reason
            theTreerow, // treerow to contain treecells
            theError, i=0, treechildren = elErrorsTreechildren;
        
//         if (!elErrorsTreechildren) {
//             elErrorsTreechildren = document.getElementById(constErrorsTreechildrenId);
//         }

        if(theErrors.length>1){
            //add a header
            theErrors.unshift({line:theErrors[0].line, reason:theErrors.length + "Errors are found on this line"});
        }
        while((theError = theErrors[i++])){
            theTreeitem =  document.createElement('treeitem');
            theTreerow = document.createElement('treerow');
            theCharTreecell = document.createElement('treecell');
            theEvidenceTreecell = document.createElement('treecell');
            theLineTreecell = document.createElement('treecell');
            theReasonTreecell = document.createElement('treecell');
            // line
            if (theError.line) {
                theLineTreecell.setAttribute('label', theError.line);
                theLineTreecell.setAttribute('tooltip', 'true');
                theLineTreecell.setAttribute('tooltiptext', theError.line);
            }
            else {
                theLineTreecell.setAttribute('label', '-');
            }
            
            // character
            if (theError.character) {
                theCharTreecell.setAttribute('label', theError.character);
                theCharTreecell.setAttribute('tooltip', 'true');
                theCharTreecell.setAttribute('tooltiptext', theError.character);
            }
            else {
                theCharTreecell.setAttribute('label', '-');
            }
            
            // reason
            if (theError.reason) {
                theReasonTreecell.setAttribute('label', theError.reason);
                theReasonTreecell.setAttribute('tooltip', 'true');
                theReasonTreecell.setAttribute('tooltiptext', theError.reason);
            }
            else {
                theReasonTreecell.setAttribute('label', '-');
            }
            
            // evidence
            if (theError.evidence) {
                theEvidenceTreecell.setAttribute('label', theError.evidence.replace(/^\s*/, "").replace(/\s*$/, ""));
                theEvidenceTreecell.setAttribute('tooltip', 'true');
                theEvidenceTreecell.setAttribute('tooltiptext', theError.evidence);
            }
            else {
                theEvidenceTreecell.setAttribute('label', constCrockismsBad[Math.floor(Math.random() * 14)]);
            }
            
            theTreerow.appendChild(theLineTreecell);
            theTreerow.appendChild(theCharTreecell);
            theTreerow.appendChild(theReasonTreecell);
            theTreerow.appendChild(theEvidenceTreecell);

            theTreeitem.appendChild(theTreerow);
            theTreeitem.setUserData('lintError', theError, null);
            treechildren.appendChild(theTreeitem);
            
            if(i===1 && theErrors.length>1){
                theTreeitem.setAttribute('container', true);
                theTreeitem.setAttribute('open', true);
                treechildren = theTreeitem.appendChild(document.createElement('treechildren'));
            }
        }
    }

    // display errors in the output errors panel
    function viewShowErrors(theErrors, numberOfErrors) {
        var i, // loop counter
            theError, // the current error
            lastError, group=[];
        
        // put number of errors in tab title, adding a + if there are more errors than can be returned
        if (theErrors[numberOfErrors - 1]) {
            elErrorsTab.setAttribute('label', [constErrorsTabText, ' ', numberOfErrors].join(''));
        }
        
        // theErrors[numberOfErrors - 1] doesn't exist when JS Lint stops and cannot continue
        // reduce number of errors number by 2 because Stopping cannot continue text is counted as an error item by JS Lint
        else {
            elErrorsTab.setAttribute('label', [constErrorsTabText, ' ', numberOfErrors - 2, '+'].join(''));
        }
        
        
        for (i = 0 ; i < numberOfErrors; i += 1) {
            theError = theErrors[i];
            
            // the check for existence prevents a bug
            if (theError) {
                if (lastError && lastError.line !== theError.line){
                    viewAppendErrors(group);
                    group = [];
                    lastError = null;
                }
                group.push(theError);
                lastError = theError;           
            }
        }
        
        if(group.length){
            viewAppendErrors(group);
        }
    }
    
    // put the current error in the output panel
    // theError is the current JSLint result
    function viewAppendFunction(theFunction) {
        var theClosureTreecell = document.createElement('treecell'), // treecell to contain the function closures
            theExceptionsTreecell = document.createElement('treecell'), // treecell to contain the function exceptions
            theGlobalTreecell = document.createElement('treecell'), // treecell to contain the function global
            theLabelTreecell = document.createElement('treecell'), // treecell to contain the function label
            theLineTreecell = document.createElement('treecell'), // treecell to contain the function line number
            theNameTreecell = document.createElement('treecell'), // treecell to contain the function name
            theOuterTreecell = document.createElement('treecell'), // treecell to contain the function outer
            theParamsTreecell = document.createElement('treecell'), // treecell to contain the function parameters
            theString,  // used to store manipulated items
            theTreeitem = document.createElement('treeitem'), // treeitem to contain treerow
            theTreerow = document.createElement('treerow'), // treerow to contain treecells
            theUnusedTreecell = document.createElement('treecell'), // treecell to contain the function unused
            theVarsTreecell = document.createElement('treecell'); // treecell to contain the function variables
        
        // line                            
        theLineTreecell.setAttribute('label', theFunction.line);
        theLineTreecell.setAttribute('tooltip', 'true');
        theLineTreecell.setAttribute('tooltiptext', theFunction.line);
        
        // name
        theString = theFunction.name.replace(/"/g, '');
        theNameTreecell.setAttribute('label', theString);
        theNameTreecell.setAttribute('tooltip', 'true');
        theNameTreecell.setAttribute('tooltiptext', theString);
        
        // parameters
        if (!theFunction.param) {
            theParamsTreecell.setAttribute('label', '-');
        }
        else {
            theString = theFunction.param.join(', ');
            theParamsTreecell.setAttribute('label', theString);
            theParamsTreecell.setAttribute('tooltip', 'true');
            theParamsTreecell.setAttribute('tooltiptext', theString);
        }
        
        // closure
        if (!theFunction.closure) {
            theClosureTreecell.setAttribute('label', '-');
        }
        else {
            theString = theFunction.closure.join(', ');
            theClosureTreecell.setAttribute('label', theString);
            theClosureTreecell.setAttribute('tooltip', 'true');
            theClosureTreecell.setAttribute('tooltiptext', theString);
        }
        
        // variables
        if (!theFunction.var) {
            theVarsTreecell.setAttribute('label', '-');
        }
        else {
            theString = theFunction.var.join(', ');
            theVarsTreecell.setAttribute('label', theString);
            theVarsTreecell.setAttribute('tooltip', 'true');
            theVarsTreecell.setAttribute('tooltiptext', theString);
        }
        
        // exceptions
        if (!theFunction.exception) {
            theExceptionsTreecell.setAttribute('label', '-');
        }
        else {
            theString = theFunction.exception.join(', ');
            theExceptionsTreecell.setAttribute('label', theString);
            theExceptionsTreecell.setAttribute('tooltip', 'true');
            theExceptionsTreecell.setAttribute('tooltiptext', theString);
        }
        
        // outer
        if (!theFunction.outer) {
            theOuterTreecell.setAttribute('label', '-');
        }
        else {
            theString = theFunction.outer.join(', ');
            theOuterTreecell.setAttribute('label', theString);
            theOuterTreecell.setAttribute('tooltip', 'true');
            theOuterTreecell.setAttribute('tooltiptext', theString);
        }
        
        // unused
        if (!theFunction.unused) {
            theUnusedTreecell.setAttribute('label', '-');
        }
        else {
            theString = theFunction.unused.join(', ');
            theUnusedTreecell.setAttribute('label', theString);
            theUnusedTreecell.setAttribute('tooltip', 'true');
            theUnusedTreecell.setAttribute('tooltiptext', theString);
        }
        
        // global
        if (!theFunction.global) {
            theGlobalTreecell.setAttribute('label', '-');
        }
        else {
            theString = theFunction.global.join(', ');
            theGlobalTreecell.setAttribute('label', theString);
            theGlobalTreecell.setAttribute('tooltip', 'true');
            theGlobalTreecell.setAttribute('tooltiptext', theString);
        }
        
        // label
        if (!theFunction.label) {
            theLabelTreecell.setAttribute('label', '-');
        }
        else {
            theString = theFunction.label.join(', ');
            theLabelTreecell.setAttribute('label', theString);
            theLabelTreecell.setAttribute('tooltip', 'true');
            theLabelTreecell.setAttribute('tooltiptext', theString);
        }
        
        theTreerow.appendChild(theLineTreecell);
        theTreerow.appendChild(theNameTreecell);
        theTreerow.appendChild(theParamsTreecell);
        theTreerow.appendChild(theClosureTreecell);
        theTreerow.appendChild(theVarsTreecell);
        theTreerow.appendChild(theExceptionsTreecell);
        theTreerow.appendChild(theUnusedTreecell);
        theTreerow.appendChild(theOuterTreecell);
        theTreerow.appendChild(theGlobalTreecell);
        theTreerow.appendChild(theLabelTreecell);
        theTreeitem.appendChild(theTreerow);
        if (!elFunctionsTreechildren) {
            elFunctionsTreechildren = document.getElementById(constFunctionsTreechildrenId);
        }
        elFunctionsTreechildren.appendChild(theTreeitem);
    }
    
    // display functions report in the output panel
    function viewShowFunctions(theFunctions, numberOfFunctions) {
        var i, // loop counter
            theFunction; // the current error
            
        // put number of functions in tab title
        if (theFunctions[numberOfFunctions - 1]) {
            elFunctionsTab.setAttribute('label', [constFunctionsTabText, ' ', numberOfFunctions].join(''));
        }
        else {
            elFunctionsTab.setAttribute('label', constFunctionsTabText);
        }
        
        for (i = 0 ; i < numberOfFunctions; i += 1) {
            theFunction = theFunctions[i];
            
            // the check for existence prevents a bug
            if (theFunction) {
                viewAppendFunction(theFunction);            
            }
        }
    }
    
    // display JSLint reports
    function viewShow(myData) {
        viewRemove(elErrorsTreechildren, constErrorsTreechildrenId);
        viewRemove(elFunctionsTreechildren, constFunctionsTreechildrenId);
        
        // make sure the command output window is visible
        ko.run.output.show(window, false);
        
        // if there are no errors, focus on the function report panel
        if (!myData.errors) {
            viewAppendErrors([{
                line : '-',
                character : '-',
                reason : 'No errors found',
                evidence : constCrockisms[Math.floor(Math.random() * 14)]
            }]);
            
            // focus on the errors tab within the output panel
            ko.uilayout.ensureTabShown(constErrorsTabId, true);
            
            // no errors number to show in tab title
            elErrorsTab.setAttribute('label', constErrorsTabText);
            
            alert('No errors found');
            
            // focus on function report panel
            ko.uilayout.ensureTabShown(constFunctionsTabId, true);
        }
        else {
            // display errors
            viewShowErrors(myData.errors, myData.errors.length);
            
            // focus on the errors tab within the output panel
            ko.uilayout.ensureTabShown(constErrorsTabId, true);  
        }
        
        if (myData.functions.length === 0) {
            viewAppendFunction({
                name : '-',
                line : '-',
                last : '-',
                param : ['-'],
                closure : ['-'],
                var : ['-'],
                exception : ['-'],
                outer : ['-'],
                unused : ['-'],
                global : ['-'],
                label : ['-']
            });
            
            // no functions number to show in tab title
            elFunctionsTab.setAttribute('label', constFunctionsTabText);
            
            if (!myData.errors) {            
                alert('Nothing to see here');
            }
        }
        else {
            
            // create function report
            viewShowFunctions(myData.functions, myData.functions.length);
        }
    }
    
    // run JSLint
    function run() {
        var myResult;
        
        window.setCursor('wait');
        myResult = JSLINT(ko.views.manager.currentView.document.buffer, prefsObject[currentConfName]);
        viewShow(JSLINT.data());
        window.setCursor('default');  
    }
    
    // provide keyboard access to the errors results
    function viewErrorsFocus() {
        if (!elErrorsTree) {
            elErrorsTree = document.getElementById(constErrorsTreeId);
        }
        elErrorsTree.focus();
    }
    
    // provide keyboard access to the functions report
    function viewFunctionsFocus() {
        if (!elFunctionsTree) {
            elFunctionsTree = document.getElementById(constFunctionsTreeId);
        }
        elFunctionsTree.focus();
    }
    
    // reveal the options panel when it it chosen from the Menu
    function viewShowOptions() {
        ko.uilayout.ensureTabShown(constOptionsTabId, true);
        if (!elOptionsPanel) {
            elOptionsPanel = document.getElementById(constOptionsTabPanelId);
        }
        elOptionsPanel.focus();
    }
    
    function handleEvent() {
        init();
    }
    
    function expose() {
        var myResult = JSLINT(ko.views.manager.currentView.document.buffer, prefsObject[currentConfName]);
            
        return JSLINT.data();
    }
    
    KOJSLINT.mixin(KOJSLINT, {
        
        expose : expose,
        
        // this automatically gets called as a result of passing the KOJSLINT object to the eventlistener
        handleEvent : init,
        
        run : run,
        
        viewErrorsFocus : viewErrorsFocus,
        
        viewFunctionsFocus : viewFunctionsFocus,
        
        viewShowOptions : viewShowOptions
    });
}());

window.addEventListener('load', window.extensions.KOJSLINT, false);
