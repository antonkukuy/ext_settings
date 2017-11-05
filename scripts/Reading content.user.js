// ==UserScript==
// @name         Reading content
// @namespace    contentRead
// @version      0.1
// @description  Clear head and left sidebar up e.i it improves readability of content.
// @author       You
// @include       http://wikipedia.tld/*
// @include       http://*.wikipedia.tld/*
//// Since TLD doesn't work in Chrome:
// @include       http://wikipedia.org/*
// @include       http://*.wikipedia.org/*
// @include       https://developer.chrome.com/*
// @include       http://developer.chrome.com/*
// @include       http://www.w3schools.com/*
// @include       https://www.w3schools.com/*
// @include       http://www.safaribooksonline.com/*
// @include       https://www.safaribooksonline.com/*
// @include       http://www.duolingo.com/*
// @include       https://www.duolingo.com/*
//// https:
// @include       https://wikipedia.org/*
// @include       https://*.wikipedia.org/*
// @grant        none
// ==/UserScript==


// safaribookonline.com
var verify_safaribook = document.querySelector('div.sbo-reading-menu.sbo-menu-top');
if(verify_safaribook){
var previewBox = document.querySelector('a.next.nav-link').style.display;
    //document.body.style.zoom = 120+"%";
    if (previewBox != "none") {
        // navbar upper side
        document.querySelector('a.prev.nav-link').style.display = "none";
        document.querySelector('a.next.nav-link').style.display = "none";
        document.querySelector('a.sbo-toc-thumb').style.display = "none";
        document.querySelector('div.sbo-reading-menu.sbo-menu-top').style.display = "none";
        // navbar right side
        document.querySelector('#font-controls').style.display = "none";
        document.querySelector('.interface-controls .sharing-controls .trigger').style.display = "none";
        document.querySelector('button.rec-fav.ss-queue.js-queue.js-current-chapter-queue').style.display = "none";
        document.querySelector('a.js-search-controls.search-controls').style.display = "none";
        // navbar left side
        document.querySelector('header.topbar.t-topbar').style.display = "none";
    } else {
        // navbar upper side
        document.querySelector('a.prev.nav-link').style.display = "";
        document.querySelector('a.next.nav-link').style.display = "";
        document.querySelector('a.sbo-toc-thumb').style.display = "";
        document.querySelector('div.sbo-reading-menu.sbo-menu-top').style.display = "";
        // navbar right side
        document.querySelector('#font-controls').style.display = "";
        document.querySelector('.interface-controls .sharing-controls .trigger').style.display = "";
        document.querySelector('button.rec-fav.ss-queue.js-queue.js-current-chapter-queue').style.display = "";
        document.querySelector('a.js-search-controls.search-controls').style.display = "";
        // navbar left side
        document.querySelector('header.topbar.t-topbar').style.display = "";
    }
}


// www.duolingo.com
var verify_duolingo = document.querySelector('div._6t5Uh._3llTd');
if(verify_duolingo){
var previewBox = document.querySelector('div._6t5Uh._3llTd').style.display;
    if (previewBox != "block") {
        document.querySelector('div._6t5Uh._3llTd').style.display = "none";
    } else {
        document.querySelector('div._6t5Uh._3llTd').style.display = "";
    }
}
var verify_duolingo_dic = document.querySelector('header.topbar.topbar-blue');
if(verify_duolingo_dic){
var previewBox = document.querySelector('header.topbar.topbar-blue').style.display;
    if (previewBox != "none") {
        document.querySelector('header.topbar.topbar-blue').style.display = "none";
    } else {
        document.querySelector('header.topbar.topbar-blue').style.display = "";
    }
}




// wikipedia
var verify = document.getElementById('content');
if (verify){
var contentMargin = document.getElementById('content').style.marginLeft;
    if (contentMargin != "0px") {
        document.getElementById('mw-navigation').style.display = 'none';
        document.getElementById('mw-page-base').style.display = 'none';
        document.getElementById('content').style.marginLeft = "0px";
    } else {
        document.getElementById('mw-navigation').style.display = '';
        document.getElementById('mw-page-base').style.display = '';
        document.getElementById('content').style.marginLeft = "";
    }
}

//console.log('that work');
//   https://developer.chrome.com/*
var verify = document.querySelector('div[itemprop="articleBody"]');
if(verify){
var contentMarginChromeDeveloper = document.querySelector('div[itemprop="articleBody"]').style.marginLeft;
    if (contentMarginChromeDeveloper != "0px") {
        document.querySelector('div[itemprop="articleBody"]').style.marginLeft = "0px";
        document.querySelector('nav.inline-toc.no-permalink').style.display = "none";
        document.querySelector('nav.inline-site-toc.no-permalink').style.display = "none";
    } else {
        document.querySelector('div[itemprop="articleBody"]').style.marginLeft = "";
        document.querySelector('nav.inline-toc.no-permalink').style.display = "";
        document.querySelector('nav.inline-site-toc.no-permalink').style.display = "";
    }
}
//console.log('that work');
//   http://www.w3schools.com/
var verify = document.querySelector('#belowtopnav');
if(verify){
var contentMargin = document.querySelector('#belowtopnav').style.marginLeft;
    if (contentMargin != "0px") {
        document.querySelector('#belowtopnav').style.marginLeft = "0px";
        document.querySelector('#main').style.width = "100%";
        document.querySelector('#topnav').style.display = "none";
        document.querySelector('#leftmenuinner').style.display = "none";
        //document.querySelector('#sidenav').style.display = "none !important";
        document.querySelector('div.w3-sidenav.w3-collapse.w3-slim').style.display = "none";
    } else {
        document.querySelector('#belowtopnav').style.marginLeft = "";
        document.querySelector('#topnav').style.display = "";
        document.querySelector('#leftmenuinner').style.display = "";
        //document.querySelector('#sidenav').style.display = "";
        document.querySelector('div.w3-sidenav.w3-collapse.w3-slim').style.display = "";
    }
}

