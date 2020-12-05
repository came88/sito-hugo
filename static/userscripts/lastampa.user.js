// ==UserScript==
// @name         La Stampa JS Paywall Remover
// @namespace    https://lorenzo.cameroni.eu
// @version      1.0.0
// @description  Uncovers the "paywalled" articles on La Stampa
// @author       Lorenzo Cameroni
// @match        https://www.lastampa.it/*
// @require      https://code.jquery.com/jquery-latest.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// ==/UserScript==

// basato su https://greasyfork.org/it/scripts/371681-la-stampa-topnews-full-text-articles
// di Andrea Lazzarotto

/* Greasemonkey 4 wrapper */
if (typeof GM !== "undefined" && !!GM.xmlHttpRequest) {
    GM_xmlhttpRequest = GM.xmlHttpRequest;
}

function fetch(params) {
    return new Promise(function(resolve, reject) {
        params.onload = resolve;
        params.onerror = reject;
        GM_xmlhttpRequest(params);
    });
}

$(() => {
    'use strict';
    if ($("#article-body").length == 0) {
        return;
    }
    fetch({
        method: 'GET',
        url: location.pathname,
    }).then(function(responseDetails) {
        var r = responseDetails.responseText;
        var data = $(r);
        var content = $("#article-body", r).html();
        content = content.replace("<!-- T paywall -->", "<!-- omissis -->").replace("<!-- ZEPHR_FEATURE_END paywall -->", "<!-- omissis -->");
        $("#article-body").html(content);
        $('#article-body .video-container').addClass('entry__media').find('h1').wrap('<figcaption></figcaption>');
        $('.paywall-adagio').remove();
    });
});