// ==UserScript==
// @name          Google youtube search link
// @include       https://www.google.com/*
// @include       /https?:\/\/(www\.)?google\.(com|(?:com?\.)?\w\w)\/.*/
// @description   Adds a Youtube search link: Web, Images, Videos, Youtube, News, Maps, Shopping, ...
// @version       1.1.4
// @author        wOxxOm
// @namespace     wOxxOm.scripts
// @license       MIT License
// @run-at        document-start
// ==/UserScript==

// always put (if present!) "Images" to 2nd place, "Videos" to 3rd place, "Youtube" to 4th place
var rearrangeImagesVideosYoutube = true;

process();
new MutationObserver(process).observe(document, {childList:true, subtree:true});

function process(mutations) {
	var youtube = document.getElementById('__YOUTUBE_SEARCH__');

  var youtube = document.getElementById('__YOUTUBE_SEARCH__');
  var amazon = document.getElementById('__AMAZON_SEARCH__');
  var ebay = document.getElementById('__EBAY_SEARCH__');
  var yandex = document.getElementById('__YANDEX_SEARCH__');
  var gitbook = document.getElementById('__GITBOOK_SEARCH__');
  var javascript = document.getElementById('__JAVASCRIPT_SEARCH__');
  var stackoverflow = document.getElementById('__STACKOVERFLOW_SEARCH__');
  var habrahabr = document.getElementById('__HABRAHABR_SEARCH__');
  var mozila = document.getElementById('__MOZILA_SEARCH__');
  var vim = document.getElementById('__VIM_SEARCH__');
  var vimcast = document.getElementById('__VIMCAST_SEARCH__');
  var w3schools = document.getElementById('__W3SCHOOLS_SEARCH__');
  var bash = document.getElementById('__BASH_SEARCH__');
  // if (state > 2)
  // //if (state > 10)
  //   return;

	if (youtube)
		return;
	var menu = document.getElementById('hdtb-msb');
	if (!menu)
		return;
	var menuContainer = menu.querySelector('.hdtb-imb').parentNode;
	var place = 'beforeend', node = menuContainer, activeMenuItem, images, videos;

	if (rearrangeImagesVideosYoutube) {
		var rxType = /[&?#;]tb[ms]=\w+\b/g;
		var rxImage = /=isch|=sbi|=simg/;
		var rxVideo = /=vid/;
		[].forEach.call(document.getElementById('hdtb').querySelectorAll('.hdtb-imb, g-popup a.q'), function(n) {
			if (n.classList.contains('hdtb-msel')) { activeMenuItem = n; return; }
			var a = n.href ? n : n.querySelector('a.q');
			var type = ((a || {href:''}).href.match(rxType) || []).pop();
			if (rxImage.test(type)) { images = n; return; }
			if (rxVideo.test(type)) { videos = n; return; }
		});
		var type = (location.href.match(rxType) || []).pop();
		images = !images && rxImage.test(type) ? activeMenuItem : images;
		videos = !videos && rxVideo.test(type) ? activeMenuItem : videos;

		if (images) {
			node = images;
			place = 'afterend';
			if (images.previousElementSibling != menuContainer.firstElementChild)
			   menuContainer.insertBefore(images, menuContainer.firstElementChild.nextElementSibling);
		}

		if (videos) {
			node = videos;
			place = 'afterend';
			if (!videos.matches('.hdtb-imb'))
				videos.className = 'hdtb-mitem hdtb-imb';
			if (videos.previousElementSibling != (images || menuContainer.firstElementChild))
				menuContainer.insertBefore(videos, (images || menuContainer.firstElementChild).nextElementSibling);
		}

		if (youtube) {
			node = videos || images || menuContainer.lastElementChild;
			if (youtube.previousElementSibling != node)
				youtube.parentNode.insertBefore(youtube, node.nextElementSibling);
		}


      arrangeElements(amazon, youtube);
      arrangeElements(ebay, amazon);
      arrangeElements(yandex, ebay);
      arrangeElements(gitbook, yandex);
      arrangeElements(javascript, gitbook);
      arrangeElements(stackoverflow, javascript);
      arrangeElements(javascript, stackoverflow);
      arrangeElements(mozila, javascript);
      arrangeElements(habrahabr, mozila);
      arrangeElements(vim, habrahabr);
      arrangeElements(vimcast, vim);
      arrangeElements(w3schools, vimcast);
      arrangeElements(bash ,w3schools);
  }

newNodes(youtube, "__YOUTUBE_SEARCH__", "https://www.youtube.com/results?search_query=", "Youtube");
newNodes(amazon, "__AMAZON_SEARCH__", "https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=", "Amazon");
newNodes(ebay, "__EBAY_SEARCH__", "http://www.ebay.com/sch/i.html?_nkw=", "Ebay");
newNodes(yandex, "__YANDEX_SEARCH__", "https://yandex.ru/search/?text=", "Yandex");
newNodes(gitbook, "__GITBOOK_SEARCH__", "https://git-scm.com/search/results?search=", "GitBook");
newNodes(javascript, "__JAVASCRIPT_SEARCH__", "https://learn.javascript.ru/search?query=", "Learn.js");
newNodes(stackoverflow, "__STACKOVERFLOW_SEARCH__", "http://stackoverflow.com/search?q=", "Stackoverflow");
newNodes(habrahabr, "__HABRAHABR_SEARCH__", "https://habrahabr.ru/search/?q=", "Habrahabr");
newNodes(mozila, "__MOZILA_SEARCH__", "https://developer.mozilla.org/en-US/search?q=", "MDN");
newNodes(vim, "__VIM_SEARCH__", "https://www.google.ru/search?q=dogcart&gws_rd=cr&ei=oAi2V-qxM4G6sgHW7KaICw#newwindow=1&q=site:vimhelp.appspot.com+", "VIM");
newNodes(vimcast, "__VIMCAST_SEARCH__", "http://vimcasts.org/results/#stq=", "VimCast");
newNodes(w3schools, "__W3SCHOOLS_SEARCH__", "https://www.google.ru/search?q=dogcart&gws_rd=cr&ei=oAi2V-qxM4G6sgHW7KaICw#newwindow=1&q=site:w3schools.com+", "w3schools");
newNodes(bash, "__BASH_SEARCH__", "https://www.google.ru/search?q=dogcart&gws_rd=cr&ei=oAi2V-qxM4G6sgHW7KaICw#newwindow=1&q=site:tldp.org/LDP/abs/html+", "Bash");

function arrangeElements(element, prevElement){
    if (element) {
      node = prevElement || menu.lastElementChild;
      if (element.previousElementSibling != node)
        element.parentNode.insertBefore(element, node.nextElementSibling);
    }
}
function newNodes(nameNode, nameId, queryPage, nameLink){

  if (!nameNode) {
    var q = document.querySelector('#searchform input[dir]');
    if (q) q = encodeURIComponent(q.value);
    else if ((q = location.href.match(/^.+?(?:[#\/&?](?:q|query))=(.+?)(?:|&.+|\|.+)$/)))
      q = q[1];
    else q = '';
    node.insertAdjacentHTML(place,
      '<div class="hdtb-mitem hdtb-imb" id="' + nameId + '">\
         <a class="q qs" href="' + queryPage + q + '" >' + nameLink + '</a>\
      </div>');
  }
  // state++;
}



	if (!youtube) {
		var q = '', queryElement = document.querySelector('input[name="q"]');
		if (queryElement) {
			if (queryElement.value)
			   q = encodeURIComponent(queryElement.value);
			else {
				new MutationObserver(function(mut) {
					if (queryElement.value) {
					   var youtube = document.getElementById('__YOUTUBE_SEARCH__');
					   if (youtube) {
						   this.disconnect();
						   youtube.querySelector('a').href += encodeURIComponent(queryElement.value);
					   }
					}
				}).observe(queryElement, {attributes:true});
			}
		}
		else if ((q = location.href.match(/^.+?(?:[#\/&?](?:q|query))=(.+?)(?:|&.+|\|.+)$/)))
			q = q[1];
		node.insertAdjacentHTML(place,
			'<div class="hdtb-mitem hdtb-imb" id="__YOUTUBE_SEARCH__">' +
				 '<a class="q qs" href="https://www.youtube.com/results?search_query=' + q + '">Youtube</a>' +
			'</div>');
	}
	new MutationObserver(process).observe(menuContainer, {childList: true});
}
