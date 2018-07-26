// ==UserScript==
// @name         bitbucket-pr-enhancer
// @namespace    willie.owens
// @version      0.2
// @description  Various enhancements for reviewing PRs in BitBucket
// @author       Willie Owens
// @match        https://bitbucket.org/*
// NOTE - (at)match changed to be more inclusive to handle ajax page updates where original URL was different
// match.old     https://bitbucket.org/*/pull-requests/*/diff*
// @grant        GM_addStyle
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==


// User-specific configuration
var conf = {

    tabsToSpaces: {
        enabled: true,
        tabWidth: 4,
        indicatorColor: '#BE90D4'
    },

    showHideBtn: {
        enabled: true
    }
};


var toggleVisibilityBtnHtml = `
    <div class="aui-buttons">
        <button class="hide-diff aui-button aui-button-light" data-module="components/tooltip" original-title="Show/Hide file diff"">Show/Hide</button>
    </div>`;

function addVisibilityButtons(diffHeaderEl) {
    var btn = $(toggleVisibilityBtnHtml);
    btn.click(toggleDiffVisibility);
    $(diffHeaderEl).prepend(btn);
}

function toggleDiffVisibility(evt) {
    var btn = $(evt.target);
    var diffDiv = btn.parents('div.diff-container').find('div.diff-content-container');
    diffDiv.toggle();
}

function changeTabsToSpaces(diffLineEl) {
    var value = $(diffLineEl).html();
    if (value != null) {
        var replacement = value.replace(/\t/g, ' '.repeat(conf.tabsToSpaces.tabWidth));
        if (value != replacement) {
            $(diffLineEl).attr('oldVal', value);
            setTimeout(function() {
                // Timeout added as (hacky) fix for large PRs and partial-line diffs, whose value is otherwise reset after I change it
                // It does, however, allow you to see the change in-action, which could be considered a "feature"
                $(diffLineEl).html(replacement);
                $(diffLineEl).siblings('.gutter').children('a.add-diff-comment').addClass('tabsToSpaces');
            }, 1000);
        }
    }
}

(function() {
    'use strict';

    if (conf.showHideBtn.enabled) {
        // Add button to file diff headers to show/hide the diff
        waitForKeyElements('div.diff-actions', addVisibilityButtons);
    }

    if (conf.tabsToSpaces.enabled) {
        // Style to mark lines where a tabs to spaces replacement occurred
        GM_addStyle('.tabsToSpaces { background-color:' + conf.tabsToSpaces.indicatorColor + '!important; }');

        // Change tabs to 4 spaces in file diff lines
        waitForKeyElements('div.udiff-line pre.source', changeTabsToSpaces);
    }

})();
