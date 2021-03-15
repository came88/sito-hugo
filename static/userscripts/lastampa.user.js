// ==UserScript==
// @name         La Stampa JS Paywall Remover
// @namespace    https://lorenzo.cameroni.eu
// @version      1.0.1
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
    var url = location.pathname;
    url = url.endsWith("/") ? url.slice(0, -1) : url;
    var isAmp = url.endsWith('/amp');
    var articleBody = isAmp ? $(".article-body"): $("#article-body")
    if (articleBody.length == 0) {
        return;
    }
    url = isAmp ? url.slice(0, -4) + '/amp' : url + '/amp';
    fetch({
        method: 'GET',
        url: url,
    }).then(function(responseDetails) {
        var r = responseDetails.responseText;
        var data = $(r);
        var content = $(".paywall", r).html();
        content = content
            .replace(/<script/, '<div').replace(/script>/, 'div>')
            .replace(/<amp-img/gi, '<img').replace(/<.amp-img>/, '')
            .replace(/amp-iframe/gi, 'iframe');
        articleBody.html(content);
        $('#article-body .video-container').addClass('entry__media').find('h1').wrap('<figcaption></figcaption>');
        $('.article-body .video-container').addClass('entry__media').find('h1').wrap('<figcaption></figcaption>');
        $('.paywall-adagio').remove();
    });
});