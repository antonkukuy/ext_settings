// ==UserScript==
// @name          Google youtube search link
// @include       /https?:\/\/(www\.)?google\.(com|(?:com?\.)?\w\w)\/.*/
// @description   Adds a Youtube search link: Web, Images, Videos, Youtube, News, Maps, Shopping, ...
// @version       1.1.1
// @author        wOxxOm
// @namespace     wOxxOm.scripts
// @license       MIT License
// @run-at        document-start
//// @require      file://j:\GOOGLE\ext_settings\scripts\SearchButtons\setMutationHandler.js
//// @require      file://j:\GOOGLE\ext_settings\scripts\Shared\waitForKeyElements.js
//// @require      file://j:\GOOGLE\ext_settings\scripts\Shared\jquery.min_1_7_2.js
//// @require       https://greasyfork.org/scripts/12228/code/setMutationHandler.js
//// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
//// @require       https://gist.github.com/raw/2625891/waitForKeyElements.js
//// @grant         GM_addStyle
// ==/UserScript==

function addCustomSearchResult (jNode) {

var rearrangeImagesVideosYoutube = true; // always put (if present!) "Images" to 2nd place, "Videos" to 3rd place, "Youtube" to 4th place
var state = 0;
setMutationHandler(document, '#hdtb .hdtb-mitem a', newEngines);
    function newEngines (nodes){
  var youtube = document.getElementById('__YOUTUBE_SEARCH__');
  var amazon = document.getElementById('__AMAZON_SEARCH__');
  var ebay = document.getElementById('__EBAY_SEARCH__');
  var yandex = document.getElementById('__YANDEX_SEARCH__');
  var gitbook = document.getElementById('__GITBOOK_SEARCH__');
  var javascript = document.getElementById('__JAVASCRIPT_SEARCH__');
  var stackoverflow = document.getElementById('__STACKOVERFLOW_SEARCH__');
  var habrahabr = document.getElementById('__HABRAHABR_SEARCH__');
  var mozila = document.getElementById('__MOZILA_SEARCH__');
  if (state > 2)
  //if (state > 10)
    return;

  var menu = document.getElementById('hdtb-msb');
  var place = 'beforeend', node = menu, activeMenuItem, images, videos;
  
  if (rearrangeImagesVideosYoutube) {
    var rxImage = /[&?#;](tbm=isch|tbs=sbi|tbs=simg)/;
    var rxVideo = /[&?#;](tbm=vid)/;
    [].forEach.call(document.querySelectorAll('#hdtb .hdtb-mitem'), function(n) {
      if (n.classList.contains('hdtb-msel')) { activeMenuItem = n; return; }
      if (n.innerHTML.match(rxImage)) { images = n; return; }
      if (n.innerHTML.match(rxVideo)) { videos = n; return; }
    });
    images = !images && location.href.match(rxImage) ? activeMenuItem : images;
    videos = !videos && location.href.match(rxVideo) ? activeMenuItem : videos;

    if (images && images.previousElementSibling != menu.firstElementChild)
      menu.insertBefore(images, menu.firstElementChild.nextElementSibling);

    if (videos) {
      if (videos.previousElementSibling != (images || menu.firstElementChild))
        menu.insertBefore(videos, (images || menu.firstElementChild).nextElementSibling);
      node = videos;
      place = 'afterend';
    }

    if (youtube) {
	  node = videos || images || menu.lastElementChild;
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
    else if (q = location.href.match(/^.+?(?:[#\/&?](?:q|query))=(.+?)(?:|&.+|\|.+)$/))
      q = q[1];
    else q = '';
    node.insertAdjacentHTML(place,
      '<div class="hdtb-mitem hdtb-imb" id="' + nameId + '">\
         <a class="q qs" href="' + queryPage + q + '">' + nameLink + '</a>\
      </div>');
  }
}

  state++;

  /*
  console.log([state,
               images, images && images.previousElementSibling == menu.firstElementChild,
               videos, videos && videos.previousElementSibling == images,
               youtube, youtube && youtube.previousElementSibling == videos || images,
               amazon, amazon && amazon.previousElementSibling == youtube]);
*/
//});

   // alert('it works');
}
}

waitForKeyElements ("#hdtb-msb", addCustomSearchResult);




