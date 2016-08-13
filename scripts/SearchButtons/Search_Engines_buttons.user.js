// ==UserScript==
// @name          Google youtube search link
// @include       /https?:\/\/(www\.)?google\.(com|(?:com?\.)?\w\w)\/.*/
// @description   Adds a Youtube search link: Web, Images, Videos, Youtube, News, Maps, Shopping, ...
// @version       1.1.1
// @author        wOxxOm
// @namespace     wOxxOm.scripts
// @license       MIT License
// @grant         none
// @run-at        document-start
// @require       https://greasyfork.org/scripts/12228/code/setMutationHandler.js
// ==/UserScript==

var rearrangeImagesVideosYoutube = true; // always put (if present!) "Images" to 2nd place, "Videos" to 3rd place, "Youtube" to 4th place

var state = 0;
setMutationHandler(document, '#hdtb .hdtb-mitem a', function(nodes) {
  var youtube = document.getElementById('__YOUTUBE_SEARCH__');
  var amazon = document.getElementById('__AMAZON_SEARCH__');
  var ebay = document.getElementById('__EBAY_SEARCH__');
  var yandex = document.getElementById('__YANDEX_SEARCH__');
  if (state > 10)
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

    if (amazon) {
	  node = youtube || menu.lastElementChild;
	  if (amazon.previousElementSibling != node)
		amazon.parentNode.insertBefore(amazon, node.nextElementSibling);
    }

    if (ebay) {
	  node = amazon || menu.lastElementChild;
	  if (ebay.previousElementSibling != node)
		ebay.parentNode.insertBefore(ebay, node.nextElementSibling);
    }

    if (yandex) {
	  node = ebay || menu.lastElementChild;
	  if (yandex.previousElementSibling != node)
		yandex.parentNode.insertBefore(yandex, node.nextElementSibling);
    }
  }

  if (!youtube) {
    var q = document.querySelector('#searchform input[dir]');
    if (q) q = encodeURIComponent(q.value);
    else if (q = location.href.match(/^.+?(?:[#\/&?](?:q|query))=(.+?)(?:|&.+|\|.+)$/))
      q = q[1];
    else q = '';
    node.insertAdjacentHTML(place,
      '<div class="hdtb-mitem hdtb-imb" id="__YOUTUBE_SEARCH__">\
         <a class="q qs" href="https://www.youtube.com/results?search_query=' + q + '">Youtube</a>\
      </div>');
  }
  if (!amazon) {
    var qu = document.querySelector('#searchform input[dir]');
    if (qu) qu = encodeURIComponent(qu.value);
    else if (qu = location.href.match(/^.+?(?:[#\/&?](?:q|query))=(.+?)(?:|&.+|\|.+)$/))
      qu = qu[1];
    else qu = '';
    node.insertAdjacentHTML(place,
      '<div class="hdtb-mitem hdtb-imb" id="__AMAZON_SEARCH__">\
         <a class="q qs" href="https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=' + qu + '">Amazon</a>\
      </div>');
  }
  if (!ebay) {
    var que = document.querySelector('#searchform input[dir]');
    if (que) que = encodeURIComponent(que.value);
    else if (que = location.href.match(/^.+?(?:[#\/&?](?:q|query))=(.+?)(?:|&.+|\|.+)$/))
      que = que[1];
    else que = '';
    node.insertAdjacentHTML(place,
      '<div class="hdtb-mitem hdtb-imb" id="__EBAY_SEARCH__">\
         <a class="q qs" href="http://www.ebay.com/sch/i.html?_nkw=' + que + '">Ebay</a>\
      </div>');
  }
  if (!yandex) {
    var quer = document.querySelector('#searchform input[dir]');
    if (quer) quer = encodeURIComponent(quer.value);
    else if (quer = location.href.match(/^.+?(?:[#\/&?](?:q|query))=(.+?)(?:|&.+|\|.+)$/))
      quer = quer[1];
    else quer = '';
    node.insertAdjacentHTML(place,
      '<div class="hdtb-mitem hdtb-imb" id="__YANDEX_SEARCH__">\
         <a class="q qs" href="https://yandex.ru/search/?text=' + quer + '">Yandex</a>\
      </div>');
  }
  state++;
/*
  console.log([state,
               images, images && images.previousElementSibling == menu.firstElementChild,
               videos, videos && videos.previousElementSibling == images,
               youtube, youtube && youtube.previousElementSibling == videos || images,
               amazon, amazon && amazon.previousElementSibling == videos || images || youtube]);
*/
});





