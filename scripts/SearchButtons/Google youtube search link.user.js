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
