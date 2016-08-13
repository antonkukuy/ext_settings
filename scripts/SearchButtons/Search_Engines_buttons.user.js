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

var state_youtube = 0;
var state_amazon = 0;
var state_ebay = 0;
setMutationHandler(document, '#hdtb .hdtb-mitem a', function(nodes) {
  var youtube = document.getElementById('__YOUTUBE_SEARCH__');
  if (state_youtube > 10)
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
  state_youtube++;
  /*
  console.log([state_youtube,
               images, images && images.previousElementSibling == menu.firstElementChild,
               videos, videos && videos.previousElementSibling == images,
               youtube, youtube && youtube.previousElementSibling == videos || images]);
  */
});




setMutationHandler(document, '#hdtb .hdtb-mitem a', function(nodes) {
  var amazon = document.getElementById('__AMAZON_SEARCH__');
  if (state_amazon > 10)
    return;

  var menu = document.getElementById('hdtb-msb');
  var place = 'beforeend', node = menu, activeMenuItem, images, videos;
  
  if (!rearrangeImagesVideosYoutube) {
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

    if (amazon) {
	  node = videos || images || menu.lastElementChild;
	  if (amazon.previousElementSibling != node)
		amazon.parentNode.insertBefore(amazon, node.nextElementSibling);
    }
  }
  if (!amazon) {
    var q = document.querySelector('#searchform input[dir]');
    if (q) q = encodeURIComponent(q.value);
    else if (q = location.href.match(/^.+?(?:[#\/&?](?:q|query))=(.+?)(?:|&.+|\|.+)$/))
      q = q[1];
    else q = '';
    node.insertAdjacentHTML(place,
      '<div class="hdtb-mitem hdtb-imb" id="__AMAZON_SEARCH__">\
         <a class="q qs" href="https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=' + q + '">Amazon</a>\
      </div>');
  }
  state_amazon++;
});

setMutationHandler(document, '#hdtb .hdtb-mitem a', function(nodes) {
  var ebay = document.getElementById('__EBAY_SEARCH__');
  if (state_ebay > 10)
    return;

  var menu = document.getElementById('hdtb-msb');
  var place = 'beforeend', node = menu, activeMenuItem, images, videos;
  
  if (!rearrangeImagesVideosYoutube) {
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

    if (ebay) {
	  node = videos || images || menu.lastElementChild;
	  if (ebay.previousElementSibling != node)
		ebay.parentNode.insertBefore(ebay, node.nextElementSibling);
    }
  }
  if (!ebay) {
    var q = document.querySelector('#searchform input[dir]');
    if (q) q = encodeURIComponent(q.value);
    else if (q = location.href.match(/^.+?(?:[#\/&?](?:q|query))=(.+?)(?:|&.+|\|.+)$/))
      q = q[1];
    else q = '';
    node.insertAdjacentHTML(place,
      '<div class="hdtb-mitem hdtb-imb" id="__EBAY_SEARCH__">\
         <a class="q qs" href="http://www.ebay.com/sch/i.html?_nkw=' + q + '">Ebay</a>\
      </div>');
  }
  state_ebay++;
});

