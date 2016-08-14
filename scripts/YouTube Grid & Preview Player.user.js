// ==UserScript==
// @name         YouTube Grid & Preview Player
// @namespace    YouTubeGridView
// @version      1.1.7
// @description  YouTube grid view layout and preview player. Video ratings and definition info on thumbs. Auto load page content and search results.
// @author       Costas
// @match        http://www.youtube.com/*
// @match        https://www.youtube.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAeUlEQVR42u2UwQ2AMAwDk52YCWaCmdgp7QshKP6QKn7Yv0pudEqcuBXLBXB/7GaBzFv3Z3k+AdYY/z3cr+IZHgywPCZzxrv4T48AyAFAeKaH0ICmr2GFuDpAkQGOLRBAOQAIjw5Rtrg6QJEBji0QQDkACI8OUbYE0ADbonowcNn6sgAAAABJRU5ErkJggg==
// @grant 		 GM_setValue
// @grant 		 GM_getValue
// @grant        GM_xmlhttpRequest
// @noframes
// ==/UserScript==

//==================================================================
//Rating thresholds

var red_threshold = 50;
var orange_threshold = 70;

//==================================================================
//Userscript specific functions

var doc = document;
var win = window;

if (win.frameElement) throw new Error("Stopped JavaScript.");

function set_pref(preference, new_value) {
    GM_setValue(preference, new_value);
}

function get_pref(preference) {
    return GM_getValue(preference);
}

function init_pref(preference, new_value) {
    var value = get_pref(preference);
    if (value == null) {
        set_pref(preference, new_value);
        value = new_value;
    }
    return value;
}

function httpReq(url, callback, param1, param2, param3, param4) {
    //message(url);

    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function (response) {
            //message(response.responseText);
            callback(response.responseText, param1, param2, param3, param4);
        }
    });
}

var myparser = new DOMParser();

//==================================================================
//==================================================================


//==================================================================
// Styles

var style_ads_other = "\
/* remove ads */\
#content[gridtube_grid_search] #google_flash_inline_div,\
#content[gridtube_auto_load_search] #google_flash_inline_div,\
#content[gridtube_grid_search] .branded-page-v2-secondary-col,\
#content[gridtube_auto_load_search] .branded-page-v2-secondary-col,\
#content[gridtube_grid_search] .pyv-afc-ads-container,\
#content[gridtube_auto_load_search] .pyv-afc-ads-container {display:none !important;}\
/* hide pager */\
#content[gridtube_auto_load_search] .search-pager {display:none !important;}\
/* user links */\
a[gridtube_meta_user_mark2] {display:inline !important; text-decoration:none !important;}\
a[gridtube_meta_user_mark2]:hover {text-decoration:underline !important;}\
li.video-list-item.related-list-item:hover a[gridtube_meta_user_mark2] {color:#167ac6 !important;}\
/* watched videos */\
.watched .video-thumb {opacity:1 !important;}\
";

var style_grid_search = "\
/*Grid for search results*/\
#content[gridtube_grid_search] {width: 96% !important;}\
#results .item-section {margin-left:5px !important;}\
#results ol.item-section > li {width: 196px !important; height: 196px !important; float: left !important; margin:5px 10px !important; overflow:hidden !important;}\
#results ol.item-section > li:hover {overflow:visible !important;}\
#results ol.item-section > li:hover > div {z-index:1 !important; background-color:white !important;}\
#results ol.item-section > li > div {padding:0px 0px 3px 0px !important;}\
#results .yt-lockup-channel .video-thumb {float:left !important;}\
#results .yt-lockup-content {float:left !important; width:100% !important;}\
#results .yt-lockup-title {font-size: 13px !important; line-height:1.2em !important; max-height:2.4em !important; margin-bottom:1px !important;}\
#results .yt-lockup-title .yt-uix-tile-link {line-height:1.2em !important;}\
#results .yt-lockup-byline {font-size: 11px !important; line-height:13px !important;}\
#results .yt-lockup-meta {font-size: 11px !important; line-height:13px !important;}\
#results .yt-lockup-description {font-size: 10px !important; line-height:12px !important;}\
#results .yt-lockup-badges {margin:0px !important;}\
#results .yt-lockup-playlist-items {margin:0px !important;}\
#content[gridtube_grid_search] #results .yt-lockup-action-menu {margin-right:-8px !important;}\
#content[gridtube_grid_search]:not([gridtube_auto_load_search]) .search-pager {display:inline-block !important; width:100% !important; margin-top:50px !important;}\
";

var style_grid_history = "\
/*Grid for history*/\
#content[gridtube_grid_hist] {width: 96% !important;}\
#content[gridtube_grid_hist] #browse-items-primary {margin-left:10px !important;}\
#content[gridtube_grid_hist] .item-section-header {margin-left:-5px !important;}\
#content[gridtube_grid_hist] ol.item-section > li:not(.item-section-header) {width: 196px !important; height: 196px !important; float: left !important; margin:5px 10px !important; overflow:hidden !important;}\
#content[gridtube_grid_hist] ol.item-section > li:not(.item-section-header):hover {overflow:visible !important;}\
#content[gridtube_grid_hist] ol.item-section > li:not(.item-section-header):hover > div {z-index:1 !important; background-color:white !important;}\
#content[gridtube_grid_hist] ol.item-section > li:not(.item-section-header) > div {padding:0px 0px 3px 0px !important; border-bottom:0px !important;}\
#content[gridtube_grid_hist] .yt-lockup-channel .video-thumb {float:left !important;}\
#content[gridtube_grid_hist] .yt-lockup-content {float:left !important; width:100% !important;}\
#content[gridtube_grid_hist] .yt-lockup-title {font-size:13px !important; line-height:1.2em !important; max-height:2.4em !important; margin-bottom:1px !important; margin-right:15px !important;}\
#content[gridtube_grid_hist] .yt-lockup-title .yt-uix-tile-link {line-height:1.2em !important; margin-right:0px !important;}\
#content[gridtube_grid_hist] .yt-lockup-byline {font-size: 11px !important; line-height:13px !important;}\
#content[gridtube_grid_hist] .yt-lockup-meta {font-size: 11px !important; line-height:13px !important;}\
#content[gridtube_grid_hist] .yt-lockup-description {font-size: 10px !important; line-height:12px !important;}\
#content[gridtube_grid_hist] .yt-lockup-badges {margin:0px !important;}\
#content[gridtube_grid_hist] .yt-uix-menu-top-level-button-container {margin-right:-4px !important;}\
";

var style_grid_trending = "\
/*Grid for trending*/\
#content[gridtube_grid_trend] {width: 96% !important;}\
#content[gridtube_grid_trend] .expanded-shelf-content-item-wrapper {width: 196px !important; height: 196px !important; float: left !important; margin:5px 10px !important; overflow:hidden !important;}\
#content[gridtube_grid_trend] .yt-lockup-channel .video-thumb {float:left !important;}\
#content[gridtube_grid_trend] .yt-lockup-content {float:left !important; width:100% !important;}\
#content[gridtube_grid_trend] .yt-lockup-title {font-size:13px !important; line-height:1.2em !important; max-height:2.4em !important; margin-bottom:1px !important;}\
#content[gridtube_grid_trend] .yt-lockup-title .yt-uix-tile-link {line-height:1.2em !important; margin-right:0px !important;}\
#content[gridtube_grid_trend] .yt-lockup-byline {font-size: 11px !important; line-height:13px !important;}\
#content[gridtube_grid_trend] .yt-lockup-meta {font-size: 11px !important; line-height:13px !important;}\
#content[gridtube_grid_trend] .yt-lockup-description {font-size: 10px !important; line-height:12px !important;}\
";

var style_grid_related = "\
/*Grid for related*/\
#watch7-sidebar-ads {display:none !important;} /*ads*/\
/*#watch7-sidebar-contents {min-height:1770px !important;}*/\
#watch-related {position:absolute !important;}\
#watch-related li:not(.related-list-item) {display:none !important;} /*ads*/\
#watch-related li {width: 195px !important; height:160px !important; margin-bottom:0px !important; float: left !important; overflow:hidden !important;}\
#watch-related .content-wrapper {width:168px !important; margin-left:5px !important; margin-top:94px !important;}\
#watch-related .yt-pl-thumb-link .title {width:168px !important; margin-top:95px !important;}\
#watch-related .title {font-size:12px !important; line-height:1.2em !important; max-height:2.4em !important; margin:1px 0px !important;}\
";

var style_grid_plist = "\
/*Grid for playlists*/\
.pl-video {position:relative !important; width:250px !important; height:200px !important; margin-top:5px !important; margin-bottom:5px !important; border-bottom:0px !important; float: left !important; overflow:hidden !important;}\
.pl-video .pl-video-thumbnail {width: 196px !important; padding-bottom:2px !important;}\
.pl-video .yt-thumb {width: 196px !important; height: 110px !important;}\
.pl-video .yt-thumb-clip > img {width:196px !important; height:auto !important;}\
.pl-video .pl-video-title  {display:block !important; min-width:0px !important; width:196px !important; padding:0px 0px 0px 35px !important;}\
.pl-video .pl-video-title-link {width:100% !important; max-height:3.9em !important; overflow:hidden !important; text-overflow: ellipsis !important;}\
.pl-video .pl-video-owner {margin-top: 0px !important;}\
.pl-video .pl-video-badges {padding:5px 0px 0px 35px !important;}\
.pl-video .pl-video-added-by {display:none !important;}\
.pl-video .pl-video-time {position:absolute !important; top:-23px !important; left:20px !important; text-align:left !important; color:gray !important;}\
.pl-video-edit-options {position:absolute !important; top:37px !important; right:-126px !important;}\
";

var style_basic = "\
/* messages */\
.gridtube_message {font:12px/15px arial,sans-serif; text-align:left; white-space:pre; float:left; clear:both; color:black; background:beige; margin:10px 0px 0px 300px; z-index:2147483647;}\
/* selection icons */\
#gridtube_icon_area {position:relative; height:23px; width:58px; float:right !important; clear:none;}\
.gridtube_icon_area_search, .gridtube_icon_area_hist {margin:0px 0px -7px 10px;}\
.gridtube_icon_area_plist {margin:-26px 100px 0px 0px; border:1px dotted lightgray; padding:5px;}\
#gridtube_icon_area img {cursor:pointer; height:16px; width:16px; padding:4px 3px 3px 4px; margin:0px 3px; border-radius:2px; position:relative; overflow:visible; opacity:0.8;}\
#gridtube_icon_area img:hover {opacity:1;}\
#gridtube_icon_area img[selected] {box-shadow:0px 0px 0px 1px gray;}\
/* bottom bar */\
#gridtube_bottom_area {position:relative; clear:both; width:100%; padding-bottom:20px;}\
.gridtube_result_bar {position:relative; width:50%; height:84px; clear:both; margin:auto;}\
.gridtube_result_bar_inner {font:bold 18px/34px arial,sans-serif; width:100%; height:34px; position:absolute; top:40px; color:steelblue; cursor:pointer; border-radius:5px; text-align:center; background:linear-gradient(white,lightgray); opacity:0.8; overflow:hidden;}\
.gridtube_result_bar_inner:hover {opacity:1;}\
.gridtube_result_bar img {height:26px; width:26px; margin-right:7px; vertical-align:middle;}\
/* prefs */\
#gridtube_pref_popup {font:11px/11px arial,sans-serif; color:white; background:linear-gradient(#788898,#687888); padding:5px; border-radius:5px; box-shadow:0px 0px 5px 5px slategray; /*z-index:2147483647;*/ z-index:2147483646;}\
#gridtube_pref_popup[top] {position:fixed; right:0px; top:0px;}\
#gridtube_pref_popup[bottom] {position:fixed; right:0px; bottom:0px;}\
#gridtube_pref_popup > div  {padding:2px;}\
.gridtube_pref_group {margin-left:15px; color:yellow;}\
.gridtube_pref_group > span {padding:2px;}\
#gridtube_pref_close {font:14px/14px arial,sans-serif; color:black; position:absolute; top:3px; right:5px; cursor:pointer;}\
#gridtube_pref_close:hover {color:lightgray;}\
#gridtube_pref_title {font:bold 14px/14px arial,sans-serif; padding:5px !important; color:aliceblue;}\
#gridtube_pref_button {cursor:pointer; width:20px; height:20px; background-size:contain; background-repeat:no-repeat; opacity:0.7;}\
#gridtube_pref_button[top] {position:absolute; right:0px; top:0px; visibility:hidden; z-index:10;}\
#gridtube_pref_button[bottom] {position:fixed; right:0px; bottom:0px; visibility:visible;}\
#gridtube_pref_button:hover {opacity:0.9;}\
#gridtube_pref_button {background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAeUlEQVR42u2UwQ2AMAwDk52YCWaCmdgp7QshKP6QKn7Yv0pudEqcuBXLBXB/7GaBzFv3Z3k+AdYY/z3cr+IZHgywPCZzxrv4T48AyAFAeKaH0ICmr2GFuDpAkQGOLRBAOQAIjw5Rtrg6QJEBji0QQDkACI8OUbYE0ADbonowcNn6sgAAAABJRU5ErkJggg==');}\
#yt-masthead-container:hover  #gridtube_pref_button {visibility:visible !important;}\
/* meta data */\
.gridtube_meta_def_container {font:bold 10px/13px arial,sans-serif; position:absolute; bottom:0px; left:0px; background:#F0F0F0; padding:0px 3px; border-radius:2px; opacity:0.9; display:none; cursor:default;}\
.gridtube_meta_def_container[reveal] {display:block;}\
.gridtube_meta_def_container[space] .gridtube_meta_def_hd {margin-right:3px;}\
.gridtube_meta_def_format {position:relative; color:black;}\
.gridtube_meta_def_hd {position:relative; color:magenta;}\
.gridtube_meta_rate {font:bold 10px/13px arial,sans-serif; position:absolute; top:0px; right:0px; background:green; color:white; opacity:0.9; padding:0px 3px; border-radius:2px; cursor:default;}\
.gridtube_meta_rate[bad] {background:red !important;}\
.gridtube_meta_rate[med] {background:darkorange !important;}\
#gridtube_meta_box {position:relative; float:left; height:13px; margin-top:3px;}\
#gridtube_meta_box .gridtube_meta_def_container {font:bold 11px/13px arial,sans-serif; opacity:1; position:relative; clear:none; float:left; background:white;}\
#gridtube_meta_box .gridtube_meta_rate {opacity:1; position:relative; clear:none; float:right; margin-left:5px;}\
#gridtube_title_container {position:absolute; top:5px; right:0px;}\
/* play button*/\
#gridtube_meta_playing {font:bold 12px/12px arial,sans-serif; position:absolute; top:0px; left:0px; background:red; color:white; opacity:0.9; padding:3px 5px; border-radius:2px; cursor:default; z-index:1;}\
*[gridtube_meta_thumb_mark]:hover .gridtube_meta_play {visibility:visible !important;}\
.gridtube_meta_play_container {position:absolute; bottom:0px; left:0px; width:100%; visibility:hidden;}\
.gridtube_meta_play {visibility:hidden !important; display:block !important; position:relative !important; padding-bottom:1px !important; margin:0px auto !important; width:25px !important; height:25px !important; opacity:0.75 !important; cursor:pointer !important; background-size: 25px !important; background-repeat:no-repeat !important; text-decoration:none !important;}\
.gridtube_meta_play:hover {opacity:1 !important;}\
.gridtube_meta_play {background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAG7AAABuwBHnU4NQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOqSURBVFiF5ZdPSBxnGMZ/M98s1V1nV01A17VZUwMRqsGY9FyQlBJQ2gYPIbaB0nMgwYZWeumxIQhlT7aQW0Mhl54CvQQiISQhkixN\
bWKXaNSaYuzu6v4Z98+38/WgY9Vu9l835NAHvsvM983zvs/7vPPOaEopXif018oOGAAfjY4GgEvAu0DnK+b8A5gCvvjp6tVl7cMzZ94EwkArgM/n42BXF7peX3Fs22b+2TPW19edSzGg3wAmgFbTNPlybIyDBw7UlXgv5hcX+WZigmQy2QpMiJ6+vhDQ9Pn587wVDGLb9itdXtOku7ubW7dvA+wzgHa3201XMEg2nyebzyOlpN69oQGG\
YfCGy0VXMIjb7cayrHYDoDMQIJPLkUynKdh2nal3Q+g6psdDZyDA75HIZhcoIJFKIQuFkofz2SxCCHTDqDkA27ZJpFLbCusAuVyOvJQopUquWDzO5OQkfy4vl91bauWlJJfL/ROAlLJiEy0sLfFtKMTP16+TsayazSilBLZeRI405aBsm8JWmW7cvMn0gweMnDrFocOHay7JpgeUqiiAQqGwHQBALB7n+ytXONLXx/DQEKbPVzGxM4Oq\
U0CpXQE4eBgOMzMzwwfDwwwcO1aVSatSwN5Rgr1TVErJj9eucefuXUZGRmjz+8smAzumYUXmKRSQUiKl3C7H3vV0fp5Lly9za2oKrcRzdylQLKOiCkDREuzFe4ODfDo6yloqxUo0WnJvzSUohg6/n/GxMXp6eogsLJDd6vViqM2ELwlACMHHp0/z2dmzLK2s8MvsbNlnOai6DZ0XiIMjvb18PT6Ox+vl4ZMnFZXI4dwOAKpvwyaPhwvn\
zjF08iSzc3Msrq5WRLwX28OoGg+8f+IEX128SMKyuBcO1zS6nTObClRYAndjI9+FQvT29vJbJMJGNlsDtRPBjhLouo6tFFqZM/v278dsamL60aPaidnM3vnmNIQQaEKwYVk0NDSUPJhMp0mm0/+JHCCTyaALgcswMLymqWwptfVEgkwmg9vtRgiBppXTozo4BrYsi2wuh7JtvF6vMjra21+sRqNtqVSKtKYRi8frSvyyYDSgw+9/YRw/\
evTpnfv329aiUQyXC+qceRF2lG3T0tzM8f7+OW3m8eP++NrajXvT061SSqRSZb8Ny6FoCpqGEIIGw8DlcvHOwEC82ecb1JRS/BWLvZ1MJn/I5/N+lGpUOwxQSo+SPtm6968dmrbhEuK51zQ/aWlp+VX73/8d/w3y7NP9Di2fPgAAAABJRU5ErkJggg==') !important;}\
/* preview player */\
#gridtube_player_area {position:fixed; width:100%; height:100%; top:0px; left:0px; background:rgba(0,0,0,0.5); overflow:hidden !important; z-index:2147483646 !important; }\
#gridtube_player_area2 {position:relative; width:100%; height:100%; visibility:hidden;}\
#gridtube_player_box {position:absolute; background:linear-gradient(#606060,#505050,#606060) !important; box-shadow:0px 0px 10px 5px #606060; border-radius:10px; max-width:100%; max-height:100%;}\
#gridtube_player_box[player_pos='00']:not([player_size='fit']) {top:0px; left:0px;}\
#gridtube_player_box[player_pos='01']:not([player_size='fit']) {top:0px; left:0px; right:0px; margin:auto;}\
#gridtube_player_box[player_pos='02']:not([player_size='fit']) {top:0px; right:0px;}\
#gridtube_player_box[player_pos='10']:not([player_size='fit']) {top:0px; bottom:0px; left:0px; margin:auto;}\
#gridtube_player_box[player_pos='11']:not([player_size='fit']) {top:0px; bottom:0px; left:0px; right:0px; margin:auto;}\
#gridtube_player_box[player_pos='12']:not([player_size='fit']) {top:0px; bottom:0px; right:0px; margin:auto;}\
#gridtube_player_box[player_pos='20']:not([player_size='fit']) {bottom:0px; left:0px;}\
#gridtube_player_box[player_pos='21']:not([player_size='fit']) {bottom:0px; left:0px; right:0px; margin:auto;}\
#gridtube_player_box[player_pos='22']:not([player_size='fit']) {bottom:0px; right:0px;}\
#gridtube_player_box[player_pos='right']:not([player_size='fit']) {float:right;}\
#gridtube_player_box[player_size='tiny'] {/*320x180*/ width:360px; height:220px;}\
#gridtube_player_box[player_size='small'] {/*512x288*/ width:552px; height:328px;}\
#gridtube_player_box[player_size='medium'] {/*768x432*/  width:808px; height:472px;}\
#gridtube_player_box[player_size='large'] {/*1024x576*/ width:1064px; height:616px;}\
#gridtube_player_box[player_size='huge'] {/*1280x720*/ width:1320px; height:760px;}\
#gridtube_player_box[player_size='fit'] {width:100%; height:100%;}\
#gridtube_player_holder {position:relative; width:100%; height:100%;}\
#gridtube_player_holder2 {position:absolute; top:20px; left:20px; right:20px; bottom:20px; margin:auto;}\
#gridtube_player_frame {position:relative; width:100%; height:100%; display:block; border:0px;}\
#gridtube_player_button_area_top {font:bold 12px/20px arial,sans-serif; color:#101010; position:absolute; top:0px; left:15px;}\
#gridtube_player_button_area_bottom {font:bold 18px/20px arial,sans-serif; color:#101010; position:absolute; bottom:0px; left:20px;}\
.gridtube_player_button {position:relative; cursor:pointer; padding:0px 5px;}\
.gridtube_player_button[button_kind='left'] {padding:0px 2px 0px 5px;}\
.gridtube_player_button[button_kind='right'] {padding:0px 2px;}\
.gridtube_player_button[button_kind='up'] {padding:0px 2px;}\
.gridtube_player_button[button_kind='down'] {padding:0px 5px 0px 2px;}\
.gridtube_player_button:hover {color:#E0E0E0;}\
#gridtube_player_close_mark {font:14px/20px arial,sans-serif; color:#B0B0B0; position:absolute; top:0px; right:5px; cursor:pointer; visibility:hidden;}\
#gridtube_player_close_mark:hover {color:#E0E0E0;}\
#gridtube_player_box:hover #gridtube_player_close_mark {visibility:inherit;}\
/* player options */\
#gridtube_player_options_popup {position:absolute; left:0px; top:0px; border:black 1px solid; font:11px/11px arial,sans-serif; color:white; background:linear-gradient(#888888,#787878); padding:5px; border-radius:5px; /*z-index:2147483647;*/ z-index:2147483646;}\
#gridtube_player_options_popup > div  {padding:2px;}\
.gridtube_player_options_group > span {padding:2px;}\
.gridtube_player_options_text {font-weight:bold; margin-left:5px; margin-top:7px; color:lemonchiffon;}\
.gridtube_player_options_close {font:14px/14px arial,sans-serif; color:black; position:absolute; top:3px; right:5px; cursor:pointer;}\
.gridtube_player_options_close:hover {color:lightgray;}\
.gridtube_player_options_title {font:bold 13px/13px arial,sans-serif; padding:5px !important; color:lemonchiffon;}\
";

//more icons
var icon_grid = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKElEQVR42mNkYGD4z4AAjKTyYQJk0yTbiM0FFAGquGA0DEbDYBiEAQDsrkARdSFMWAAAAABJRU5ErkJggg==";
var icon_list = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAM0lEQVR42mNkYGD4z4AAjA0NDch8vAColpERagAyTRKAaUTmk2wARQDDBaNhMBoGIzQMAMm+IBGUaVrGAAAAAElFTkSuQmCC";


//==============================================================
//basic

function newNode(kind, id, classname, refnode, position) {

    var node = doc.createElement(kind);

    if (node == null) return null;

    if (id != null) node.id = id;

    if (classname != null) node.className = classname;

    if (refnode != null) {
        switch (position) {
            //insert after refnode
            case 'after':
                if (refnode.nextSibling != null)
                    refnode.parentNode.insertBefore(node, refnode.nextSibling);
                else
                    refnode.parentNode.appendChild(node);
                break;

                //insert before refnode
            case 'before':
                refnode.parentNode.insertBefore(node, refnode);
                break;

                //insert as first child of refnode                  
            case 'first':
                var child = refnode.childNodes[0];
                if (child != null)
                    refnode.insertBefore(node, child);
                else
                    refnode.appendChild(node);
                break;

                //insert as last child of refnode
            case 'last':
            default:
                refnode.appendChild(node);
                break;
        }
    }

    return node;
}


function message(str) {
    var node = newNode("div", null, "gridtube_message", doc.body);
    node.textContent = str + "\n";
}


function insertStyle(str, id) {
    var styleNode = null;

    if (id != null) {
        styleNode = doc.getElementById(id);
    }

    if (styleNode == null) {
        styleNode = newNode("style", id, null, doc.head);
        styleNode.setAttribute("type", "text/css");
    }

    if (styleNode.textContent != str)
        styleNode.textContent = str;
}


function injectScript(str, src) {
    var script = doc.createElement("script");
    if (str) script.textContent = str;
    if (src) script.src = src;
    doc.body.appendChild(script);
    if (!src) doc.body.removeChild(script);
}


function xpath(outer_dom, inner_dom, query) {
    //XPathResult.ORDERED_NODE_SNAPSHOT_TYPE = 7
    return outer_dom.evaluate(query, inner_dom, null, 7, null);
}


function docsearch(query) {
    return xpath(doc, doc, query);
}


function innersearch(inner, query) {
    return xpath(doc, inner, query);
}


function simulClick(el) {
    var clickEvent = doc.createEvent('MouseEvents');
    clickEvent.initEvent('click', true, true);
    el.dispatchEvent(clickEvent);
}


function jmessage(json) {
    message(JSON.stringify(json, null, '                  '));
}

function disable_ajax(e) {
    e.stopPropagation();
}

function filter(str, w, delim) {
    if (str == null) return null;

    var r = null;
    var m = str.match(RegExp("[" + delim + "]" + w + "[^" + delim + "]*"));
    if (m != null) {
        r = m[0];
        r = r.replace(RegExp("[" + delim + "]" + w), "");
    }
    return r;
}


function number_comma(str) {
    if (str == null) return null;

    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}


//returns object with fields: size, format, HD, UHD
function extract_resolution(txt) {
    if (txt == null) return null;

    //message(txt);

    var str = filter("%" + txt, "26size%3D", "%");
    if (str == null || str == "") {
        str = filter("&" + txt, "fmt_list=", "&?");
    }

    if (str == null) return null;

    //message(str);

    var m = str.match(/([0-9])+x([0-9])+/);

    if (m == null) return null;

    if (m.length == 0) return null;

    var pos_max = -1;
    var format_max = "";
    var int0_max = -1;
    var int1_max = -1;

    for (var i = 0; i < m.length; i++) {
        var size = m[i];
        var nums = size.split("x");
        var int1 = parseInt(nums[1]);

        if (int1 > int1_max) {
            pos_max = i;
            format_max = nums[1];
            int0_max = parseInt(nums[0]);
            int1_max = int1;
        }
    }

    var ret = new Object();
    ret.size = m[pos_max];
    ret.format = format_max;
    ret.HD = ((int0_max >= 1280) || (int1_max >= 720));
    ret.UHD = (int0_max >= 7680) ? '8K' : (int0_max >= 5120) ? '5K' : (int0_max >= 3840) ? '4K' : null;
    //jmessage(ret);

    return ret;
}


//==============================================================
//preferences

var pref_playerEnable = init_pref("playerEnable", true);
var pref_gridEnable = init_pref("gridEnable", true);
var pref_gridSearch = init_pref("gridSearch", true);
var pref_gridTrend = init_pref("gridTrend", true);
var pref_gridHist = init_pref("gridHist", true);
var pref_gridPlist = init_pref("gridPlist", true);
var pref_gridRel = init_pref("gridRel", true);
var pref_autoLoadSearch = init_pref("autoLoadSearch", true);
var pref_autoLoadOther = init_pref("autoLoadOther", true);
var pref_defEnable = init_pref("defEnable", true);
var pref_rateEnable = init_pref("rateEnable", true);
var pref_userLink = init_pref("userLink", false);
var pref_newTab = init_pref("newTab", false);
var pref_ytFocus = init_pref("ytFocus", false);


if (!pref_gridEnable) {
    pref_gridSearch = false;
    pref_gridTrend = false;
    pref_gridHist = false;
    pref_gridPlist = false;
    pref_gridRel = false;
}


function new_checkbox(prefname, str, node_kind, parent, value, func) {
    var div = newNode(node_kind, null, "gridtube_generic", parent);
    var input = newNode("input", null, "gridtube_generic", div);
    input.type = "checkbox";
    if (!value) {
        input.checked = get_pref(prefname);
        input.onclick = function (e) {
            var val = get_pref(prefname);
            set_pref(prefname, !val);
            e.target.checked = !val;
            if (func) func();
        };
    }
    else {
        input.value = value;
        input.checked = (get_pref(prefname) == input.value);
        input.onclick = function (e) {
            var val = get_pref(prefname);
            set_pref(prefname, e.target.value);
            e.target.checked = true;
            var other = innersearch(parent.parentNode, ".//input[@value='" + val + "']").snapshotItem(0);
            if (other) other.checked = false;
            if (func) func();
        };
    }
    var span = newNode("span", null, "gridtube_generic", div);
    span.textContent = str;
}


function pref_popup(pos) {
    var popup = doc.getElementById("gridtube_pref_popup");
    if (popup) return;

    popup = newNode("span", "gridtube_pref_popup", null, doc.body);
    if (pos) popup.setAttribute(pos, "true");

    var title_node = newNode("div", "gridtube_pref_title", null, popup);
    title_node.textContent = "Grid & Player Options";

    var changed = false;
    function mark() {
        changed = true;
    }

    var closemark = newNode("span", "gridtube_pref_close", null, popup);
    closemark.textContent = "\u274C";
    closemark.title = "close options";
    closemark.onclick = function () {
        popup.parentNode.removeChild(popup);
        if (changed) win.location.reload();
    };

    new_checkbox("playerEnable", "Preview Player", "div", popup, null, mark);
    new_checkbox("gridEnable", "Grid View", "div", popup, null, mark);
    if (pref_gridEnable) {
        var group1 = newNode("div", null, "gridtube_pref_group", popup);
        var group2 = newNode("div", null, "gridtube_pref_group", popup);
        new_checkbox("gridSearch", "Search", "span", group1, null, mark);
        new_checkbox("gridHist", "History", "span", group1, null, mark);
        new_checkbox("gridPlist", "Playlists", "span", group1, null, mark);
        new_checkbox("gridTrend", "Trending", "span", group2, null, mark);
        new_checkbox("gridRel", "Related", "span", group2, null, mark);
    }
    new_checkbox("autoLoadSearch", "Auto Load for Search Results", "div", popup, null, mark);
    new_checkbox("autoLoadOther", "Auto Load for Other Pages", "div", popup, null, mark);
    new_checkbox("defEnable", "Show Video Definition", "div", popup, null, mark);
    new_checkbox("rateEnable", "Show Video Rating", "div", popup, null, mark);
    new_checkbox("userLink", "Open User Links in User Videos", "div", popup, null, mark);
    new_checkbox("newTab", "Open Links in New Tab", "div", popup, null, mark);
    new_checkbox("ytFocus", "Pause at out of Focus Tab", "div", popup, null, mark);
}


function pref_button() {
    var node = doc.getElementById("gridtube_pref_button");
    var pos = null;
    if (!node) {
        var par = doc.getElementById("yt-masthead-container");
        if (par) {
            node = newNode("span", "gridtube_pref_button", null, par);
            node.setAttribute("top", "true");
            pos = "top";
        }
        else {
            node = newNode("span", "gridtube_pref_button", null, doc.body);
            node.setAttribute("bottom", "true");
            pos = "bottom";
        }
    }
    node.title = "Grid & Player Options";
    node.onclick = function () {
        pref_popup(pos);
    };
}

pref_button();

var pref_button_timeout = null;

function pref_button_show() {
    var node = doc.getElementById("gridtube_pref_button");
    if (!node) return;

    var pos = node.getAttribute("top");
    if (!(pos == "true")) return;

    node.style.visibility = "visible";
    if (pref_button_timeout)
        win.clearTimeout(pref_button_timeout);
}

function pref_button_hide() {
    var node = doc.getElementById("gridtube_pref_button");
    if (!node) return;

    var pos = node.getAttribute("top");
    if (!(pos == "true")) return;

    //node.style.visibility = "hidden";
    pref_button_timeout = win.setTimeout(function () { node.style.visibility = "hidden"; }, 2000);
}


//==================================================================
// Choice Icons

function choice_icons(page_kind) {

    if (doc.getElementById("gridtube_icon_area") != null) return;

    function setfunc(prefvalue, prefname, islist) {
        if (islist ? prefvalue : !prefvalue) {
            set_pref(prefname, !prefvalue);
            win.location.reload();
        }
    }

    function build_icons(pref_grid_value, pref_grid_name, refnode, position) {
        var icon_box = newNode("span", "gridtube_icon_area", "gridtube_icon_area_" + page_kind, refnode, position);
        if (!icon_box) return;

        icon_box.onmouseover = pref_button_show;
        icon_box.onmouseout = pref_button_hide;

        //list icon
        var img_list = newNode("img", null, null, icon_box);
        if (!pref_grid_value)
            img_list.setAttribute("selected", "true");

        img_list.src = icon_list;
        img_list.title = "list view";
        img_list.addEventListener('click', function () { setfunc(pref_grid_value, pref_grid_name, true); });

        //grid icon
        var img_grid = newNode("img", null, null, icon_box);
        if (pref_grid_value)
            img_grid.setAttribute("selected", "true");

        img_grid.src = icon_grid;
        img_grid.title = "grid view";
        img_grid.addEventListener('click', function () { setfunc(pref_grid_value, pref_grid_name, false); });
    }


    // initialization
    var refnode = null;

    switch (page_kind) {
        case "search":
            refnode = docsearch("//*[contains(@class,'num-results')]").snapshotItem(0);
            if (refnode)
                build_icons(pref_gridSearch, "gridSearch", refnode, 'after');
            break;

        case "plist":
            refnode = docsearch("//*[contains(@class,'playlist-actions')]").snapshotItem(0);
            if (refnode)
                build_icons(pref_gridPlist, "gridPlist", refnode, 'after');
            break;

        case "hist":
            refnode = docsearch("//*[@id='channel-navigation-menu']").snapshotItem(0);
            if (refnode)
                build_icons(pref_gridHist, "gridHist", refnode, 'after');
            break;
    }
}


//==================================================================
// Player

var basic_str = "(contains(@class,'video-thumb') or contains(@class,'thumb-wrap'))\
                 and (not(descendant::*[contains(@class,'video-thumb') or contains(@class,'thumb-wrap')]))\
                 and (not(ancestor::*[(@gridtube_ads_mark)\
                                      or (@id='player-playlist')\
                                      or (@id='pl-suggestions')"
                                      + (!pref_gridRel ? "" : " or (@id='pyv-watch-related-dest-url')")
                                      + (pref_gridPlist ? "" : " or (@id='pl-video-list')") + "\
                                      ]))";

function player_script() {
    injectScript("\
                       if (YT) {\
                            var player = new YT.Player('gridtube_player_frame');\
                            var errort = null;\
                            function error_reset() { if (errort) window.clearTimeout(errort); }\
                            function check_error(t,fid) {\
                               errort = window.setTimeout(\
                                    function (fid) {\
                                       var f = document.getElementById('gridtube_player_frame');\
                                       if (!f) return;\
                                       if (f.getAttribute('fid') != fid) return;\
                                       var s = player.getPlayerState();\
                                       var a = player.getPlaylist();\
                                       var i = player.getPlaylistIndex();\
                                       if (a != null ? a.length == 0 : false)\
                                           f.dispatchEvent(new Event('playend'));\
                                       else\
                                           if (s == -1 || s == 5)\
                                              if ((a != null && i != null) ? i < a.length - 1 : false)\
                                                 player.nextVideo();\
                                              else\
                                                 f.dispatchEvent(new Event('playend'));\
                                    }, t, fid);\
                            }\
                            player.addEventListener('onReady',\
                                   function () {\
                                        var f = document.getElementById('gridtube_player_frame');\
                                        if (f) {\
                                             var q = f.getAttribute('quality');\
                                             if (q != 'default' && q != null) player.setPlaybackQuality(q);\
                                         }\
                                   });\
                            player.addEventListener('onStateChange',\
                                 function () {\
                                    var f = document.getElementById('gridtube_player_frame');\
                                    if (!f) return;\
                                    var s = player.getPlayerState();\
                                    var a = player.getPlaylist();\
                                    var i = player.getPlaylistIndex();\
                                    var cond = ((a != null && i != null) ? i == a.length - 1 : true);\
                                    var q = f.getAttribute('quality');\
                                    if (s == -1 && q != 'default' && q != null) player.setPlaybackQuality(q);\
                                    else if (s == 0 && cond) {\
                                        error_reset();\
                                        f.dispatchEvent(new Event('playend'));\
                                    }\
                                 });\
                            var frame = document.getElementById('gridtube_player_frame');\
                            if (frame) {\
                                  check_error(10000,frame.getAttribute('fid'));\
                                  frame.addEventListener('loadnewvideo',\
                                                          function (x) {\
                                                             var fid = x.target.getAttribute('fid');\
                                                             var url = x.target.getAttribute('newvidurl');\
                                                             var plist = x.target.getAttribute('plist');\
                                                             error_reset();\
                                                             player.pauseVideo();\
                                                             if (plist) {\
                                                                player.loadPlaylist({'list':plist});\
                                                                check_error(10000,fid);\
                                                             }\
                                                             else if (url) {\
                                                                player.loadVideoByUrl(url);\
                                                                check_error(10000,fid);\
                                                             }\
                                                          });\
                                  frame.addEventListener('pausevideo',\
                                                          function (x) {\
                                                             player.pauseVideo();\
                                                          });\
                                  }\
                      }");
}

var choices_def = ['default', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'highres'];
var choices_size = ['tiny', 'small', 'medium', 'large', 'huge'];
var choices_pos = ['00', '01', '02', '10', '11', '12', '20', '21', '22'];

//player preferences
if (pref_playerEnable) {
    init_pref("playerFit", false);
    init_pref("playerDef", "default");
    init_pref("playerSize", "medium");
    init_pref("playerPos", "11");
    init_pref("playerNext", true);
    init_pref("playerClose", true);
    init_pref("playerPause", true);
    init_pref("playerFocus", false);
    init_pref("playerDim", true);
    init_pref("playerPosAuto", false);

    //fix char preferences
    if (choices_def.indexOf(get_pref("playerDef")) < 0) set_pref("playerDef", 'default');
    if (choices_size.indexOf(get_pref("playerSize")) < 0) set_pref("playerSize", 'medium');
    if (choices_pos.indexOf(get_pref("playerPos")) < 0) set_pref("playerPos", '11');
}


function player_options(parent) {
    var popup = doc.getElementById("gridtube_player_options_popup");
    if (popup) return;

    popup = newNode("span", "gridtube_player_options_popup", null, parent);

    var title_node = newNode("div", null, "gridtube_player_options_title", popup);
    title_node.textContent = "Preview Player Options";

    var closemark = newNode("span", null, "gridtube_player_options_close", popup);
    closemark.textContent = "\u274C";
    closemark.title = "close options";
    closemark.onclick = close_player_options;


    new_checkbox("playerNext", "Continuous Play", "div", popup);
    new_checkbox("playerDim", "Dim Background", "div", popup);
    new_checkbox("playerPosAuto", "Auto Adjust Position", "div", popup);
    new_checkbox("playerClose", "Close on Clicking Outside Player", "div", popup);
    new_checkbox("playerPause", "Pause YouTube Player at Launch", "div", popup);
    new_checkbox("playerFocus", "Pause at out of Focus Tab", "div", popup);

    var div = newNode("div", null, "gridtube_player_options_text", popup);
    //default, small, medium, large, hd720, hd1080, hd1440, highres;
    div.textContent = "Definition";
    var group1 = newNode("div", null, "gridtube_player_options_group", popup);
    var group2 = newNode("div", null, "gridtube_player_options_group", popup);
    new_checkbox("playerDef", "Default", "span", group1, "default");
    new_checkbox("playerDef", "LQ 240", "span", group1, "small");
    new_checkbox("playerDef", "MQ 360", "span", group1, "medium");
    new_checkbox("playerDef", "HQ 480", "span", group1, "large");
    new_checkbox("playerDef", "HD 720", "span", group2, "hd720");
    new_checkbox("playerDef", "HD 1080", "span", group2, "hd1080");
    new_checkbox("playerDef", "HD 1440", "span", group2, "hd1440");
    new_checkbox("playerDef", "MAX", "span", group2, "highres");
}


function close_player_options() {
    var popup = doc.getElementById("gridtube_player_options_popup");
    if (popup) popup.parentNode.removeChild(popup);
}


function build_player() {
    //constants
    var next_choice = new Object();
    next_choice['plus'] = new Object();
    next_choice['minus'] = new Object();
    next_choice['left'] = new Object();
    next_choice['right'] = new Object();
    next_choice['up'] = new Object();
    next_choice['down'] = new Object();

    next_choice['plus']['tiny'] = 'small';
    next_choice['plus']['small'] = 'medium';
    next_choice['plus']['medium'] = 'large';
    next_choice['plus']['large'] = 'huge';
    next_choice['plus']['huge'] = 'huge';

    next_choice['minus']['tiny'] = 'tiny';
    next_choice['minus']['small'] = 'tiny';
    next_choice['minus']['medium'] = 'small';
    next_choice['minus']['large'] = 'medium';
    next_choice['minus']['huge'] = 'large';

    {
        for (var i = 0; i < 3; i++)
            for (var j = 0; j < 3; j++) {
                next_choice['left'][i.toString() + j.toString()] = i.toString() + (j - 1 >= 0 ? j - 1 : 0).toString();
                next_choice['right'][i.toString() + j.toString()] = i.toString() + (j + 1 <= 2 ? j + 1 : 2).toString();
                next_choice['up'][i.toString() + j.toString()] = (i - 1 >= 0 ? i - 1 : 0).toString() + j.toString();
                next_choice['down'][i.toString() + j.toString()] = (i + 1 <= 2 ? i + 1 : 2).toString() + j.toString();
            }
    }

    var area = null;
    var area2 = null;
    var box = null;
    var holder = null;
    var holder2 = null;

    var new_size = get_pref("playerSize");
    var new_pos = get_pref("playerPos");
    var new_fit = get_pref("playerFit");

    var that = this;
    var frame_count = 0;

    //public
    this.playerShow = function (vid, pid, node) {
        var vis = box.style.visibility;
        if (vis == "hidden") {
            new_size = get_pref("playerSize");
            new_pos = get_pref("playerPos");
            new_fit = get_pref("playerFit");
        }
        playerAdjust((new_fit ? 'fit' : new_size), new_pos, "visible", vid, pid);
        if (!new_fit && get_pref("playerPosAuto")) adjust_auto_pos(node);
        adjust_playing(node);
    }

    this.playerClose = function () {
        playerAdjust(null, null, "hidden", null, null);
        close_player_options();
        adjust_playing();
        move_enable = false;
    }

    this.playerPause = function () {
        var frame = doc.getElementById("gridtube_player_frame");
        if (frame != null) {
            var event = doc.createEvent('Event');
            event.initEvent('pausevideo', true, true);
            frame.dispatchEvent(event);
        }
    }

    //private
    function playerUrl(vid, pid) {

        var url = win.location.protocol + "//www.youtube.com/";

        if (vid) url += "embed/" + vid + "?" + (pid ? "&list=" + pid : "");
        else if (pid) url += "embed?listType=playlist&list=" + pid;

        url += "&autoplay=1&fs=1&iv_load_policy=3&rel=1&version=3&enablejsapi=1";

        return (url);
    }


    function adjust_playing(node) {
        var playing = doc.getElementById("gridtube_meta_playing");
        if (playing)
            playing.parentNode.removeChild(playing);

        if (node) {
            playing = newNode("span", "gridtube_meta_playing", null, node);
            playing.textContent = "now playing";
        }
    }


    function adjust_auto_pos(node) {

        var node_rect = node.getBoundingClientRect();
        var box_rect = box.getBoundingClientRect();

        //if ((node_rect.top > doc.body.clientHeight) ||
        //    (node_rect.left > doc.body.clientWidth)) return;

        if (box_rect.right < node_rect.left ||
            box_rect.left > node_rect.right ||
            box_rect.top > node_rect.bottom ||
            box_rect.bottom < node_rect.top) return;

        var node_X_center = (node_rect.left + node_rect.width / 2);
        var node_Y_center = (node_rect.top + node_rect.height / 2);

        var X_fit = (box_rect.width / 2) + (node_rect.width / 2);
        var Y_fit = (box_rect.height / 2) + (node_rect.height / 2);

        var X = [];
        var Y = [];
        X[0] = Math.abs((box_rect.width / 2) - node_X_center);
        X[1] = Math.abs((doc.body.clientWidth / 2) - node_X_center);
        X[2] = Math.abs(doc.body.clientWidth - (box_rect.width / 2) - node_X_center);

        Y[0] = Math.abs((box_rect.height / 2) - node_Y_center);
        Y[1] = Math.abs((doc.body.clientHeight / 2) - node_Y_center);
        Y[2] = Math.abs(doc.body.clientHeight - (box_rect.height / 2) - node_Y_center);

        var minX = 0;
        if (X[1] < X[minX]) minX = 1;
        if (X[2] < X[minX]) minX = 2;

        var minY = 0;
        if (Y[1] < Y[minY]) minY = 1;
        if (Y[2] < Y[minY]) minY = 2;

        var minX_fit = -1;
        var minY_fit = -1;
        var Xval = -1;
        var Yval = -1;
        for (var i = 0; i < 3; i++) {
            if (X[i] >= X_fit && (X[i] < Xval || Xval == -1)) {
                minX_fit = i;
                Xval = X[i];
            }
            if (Y[i] >= Y_fit && (Y[i] < Yval || Yval == -1)) {
                minY_fit = i;
                Yval = Y[i];
            }
        }

        if (minX_fit == -1 && minY_fit == -1) return;

        if (Xval <= Yval)
            if (minX_fit != -1)
                minY_fit = minY;
            else
                minX_fit = minX;
        else
            if (minY_fit != -1)
                minX_fit = minX;
            else
                minY_fit = minY;

        new_pos = minY_fit.toString() + minX_fit.toString();
        playerAdjust(null, new_pos);
    }


    function play_next(findprevious) {

        var playing = doc.getElementById("gridtube_meta_playing");
        if (!playing) return;

        var pos = -2;
        var l = null;

        var myimg = innersearch(playing.parentNode, ".//img[@src or @data-thumb]").snapshotItem(0);
        if (myimg) {
            //l = docsearch("//*[(" + basic_str + ") and (not(ancestor::*[contains(@class,'vve-check')]))]//img[contains(@src,'vi/') or contains(@src,'vi_webp/')]");
            l = docsearch("//*[(" + basic_str + ")]//img[contains(@src,'vi/') or contains(@src,'vi_webp/') or contains(@src,'/p/')]");

            myimg.setAttribute("matchfind", "true");

            for (var i = 0; i < l.snapshotLength; i++) {
                if (l.snapshotItem(i).getAttribute("matchfind")) {
                    pos = i;
                    break;
                }
            }

            myimg.removeAttribute("matchfind");
        }

        pos = (findprevious ? pos - 1 : pos + 1);

        if (pos >= 0) {
            var img = l.snapshotItem(pos);
            if (img) {
                var str1 = img.getAttribute("src");
                var vid = filter(str1, "vi/", "/&?#");
                if (!vid) vid = filter(str1, "vi_webp/", "/&?#");

                var pid = find_plist(img);
                img.setAttribute("matchfindimg", true);
                var target = docsearch("//*[" + basic_str + " and (.//img[@matchfindimg])]").snapshotItem(0);
                if (target) {
                    that.playerShow(vid, pid, target);
                }
                img.removeAttribute("matchfindimg");
            }
        }
    }


    function playerAdjust(size, pos, vis, vid, pid) {

        if (vis != null) {
            box.style.visibility = vis;
            area.style.visibility = (get_pref("playerDim") ? vis : "hidden");

            var frame = doc.getElementById("gridtube_player_frame");
            if (frame != null && (vis == 'hidden')) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }

            if (vis == "visible") {
                var vidurl = playerUrl(vid, pid);
                var def = get_pref("playerDef");
                frame_count++;

                if (frame) {
                    frame.setAttribute("newvidurl", vidurl);
                    if (pid) frame.setAttribute("plist", pid);
                    else frame.removeAttribute("plist");
                    frame.setAttribute("quality", def);
                    frame.setAttribute("fid", frame_count.toString());

                    var event = doc.createEvent('Event');
                    event.initEvent('loadnewvideo', true, true);
                    frame.dispatchEvent(event);
                }
                else {
                    frame = newNode("iframe", "gridtube_player_frame", null, holder2);
                    frame.setAttribute("type", "text/html");
                    frame.setAttribute("frameborder", "0");
                    frame.setAttribute("allowfullscreen", "true");
                    frame.setAttribute("quality", def);
                    frame.setAttribute("fid", frame_count.toString());
                    frame.src = vidurl;
                    frame.addEventListener('playend', function f() { if (get_pref("playerNext")) play_next(); });

                    player_script();
                }
            }
        }

        if (size != null) {
            box.setAttribute("player_size", size);
            holder.setAttribute("player_size", size);
        }

        if (pos != null)
            box.setAttribute("player_pos", pos);
    }


    function click_pos_size(e) {
        var kind = e.target.getAttribute("button_kind");

        if (new_fit && !(kind == 'options' || kind == 'prev' || kind == 'next')) {
            set_pref("playerFit", false);
            new_fit = false;
            playerAdjust(new_size, new_pos);
            return;
        }

        switch (kind) {
            case 'plus':
            case 'minus':
                new_size = next_choice[kind][new_size];
                set_pref("playerSize", new_size);
                playerAdjust(new_size, new_pos);
                break;

            case 'fit':
                set_pref("playerFit", true);
                new_fit = true;
                playerAdjust('fit');
                break;

            case 'left':
            case 'right':
            case 'up':
            case 'down':
                new_pos = next_choice[kind][new_pos];
                set_pref("playerPos", new_pos);
                playerAdjust(new_size, new_pos);
                break;

            case 'options':
                player_options(box);
                break;

            case 'prev':
                play_next(true);
                break;

            case 'next':
                play_next();
                break;
        }
    }


    function new_button(kind, str, str_popup, parent) {
        var node = newNode("span", null, "gridtube_player_button", parent);
        node.textContent = str;
        node.title = str_popup;
        node.setAttribute("button_kind", kind);
        node.onclick = click_pos_size;
    }

    //initialization;
    if (doc.getElementById("gridtube_player_area")) return;

    area = newNode("div", "gridtube_player_area", null, doc.body);
    area2 = newNode("div", "gridtube_player_area2", null, area);
    box = newNode("div", "gridtube_player_box", null, area2);
    holder = newNode("div", "gridtube_player_holder", null, box);
    holder2 = newNode("div", "gridtube_player_holder2", null, holder);
    box.style.visibility = "hidden";
    area.style.visibility = "hidden";
    holder.title = "close player";

    holder.onclick = function (e) {
        if (e.target.id == "gridtube_player_holder") that.playerClose();
    };

    area.onclick = function (e) {
        if (e.target.id == "gridtube_player_area")
            if (get_pref("playerClose")) that.playerClose();
    };

    var buttonArea = newNode("span", "gridtube_player_button_area_top", null, box);
    new_button("plus", "\u2795", "increase player size", buttonArea);
    new_button("minus", "\u2796", "decrease player size", buttonArea);
    new_button("fit", "\u2610", "fit player to window", buttonArea);
    new_button('left', '\u25C4', 'move player left', buttonArea);
    new_button('right', '\u25BA', 'move player right', buttonArea);
    new_button('up', '\u25B2', 'move player up', buttonArea);
    new_button('down', '\u25BC', 'move player down', buttonArea);
    new_button("options", "Options", "player options", buttonArea);

    var bottomArea = newNode("span", "gridtube_player_button_area_bottom", null, box);
    new_button("prev", "\u140A\u140A", "play previous in page", bottomArea);
    new_button("next", "\u1405\u1405", "play next in page", bottomArea);
    //new_button("loop", "\u21BB", "repeat video", bottomArea);

    var mark = newNode("span", "gridtube_player_close_mark", null, box);
    mark.textContent = "\u274C";
    mark.title = "close player";
    mark.onclick = this.playerClose;
}


var player = null;
if (pref_playerEnable) {
    player = new build_player();
    injectScript(null, 'https://www.youtube.com/iframe_api');
}


function player_close(e) {
    if (!player) return;

    if (e) {
        if (!get_pref("playerClose")) return;

        var pattern = /gridtube|ytpc|button|subscribe/;

        if (e.target.id)
            if (e.target.id.match(pattern))
                return;

        if (e.target.className)
            if (e.target.className.match(pattern))
                return;

        if (e.target.nodeName == "BUTTON" || e.target.nodeName == "INPUT")
            return;
    }

    player.playerClose();
}


function ytpause() {
    injectScript("var a = document.getElementById('c4-player') || document.getElementById('movie_player');\
                   if (a != null)\
                      if (a.pauseVideo != null){\
                          a.pauseVideo();\
                      }\
                  ");
}


//==================================================================
//meta data

var api_key = "AIzaSyAxn6m4k-YdsYhrwUZ2Mxf_Lh5jC-lWeyA";

function data_entry_v3(entry) {

    var ret = new Object();

    ret.feedKind = null;
    ret.feedId = null;

    ret.title = null;
    ret.descr = null;
    ret.length = null;

    ret.views = null;
    ret.length = null;
    ret.likes = null;
    ret.dislikes = null;
    ret.HD = null;

    ret.user = new Object();
    ret.user.id = null;
    ret.user.name = null;
    ret.user.channelId = null;

    if (entry.kind)
        if (entry.kind == "youtube#video")
            ret.feedKind = "video";

    if (entry.id)
        ret.feedId = entry.id;

    //message("feedKind=" + ret.feedKind);
    //message("feedId=" + ret.feedId);

    if (entry.snippet) {
        if (entry.snippet.title)
            ret.title = entry.snippet.title;
        if (entry.snippet.description)
            ret.descr = entry.snippet.description;
        if (entry.snippet.channelId)
            ret.user.channelId = entry.snippet.channelId;
        if (entry.snippet.channelTitle)
            ret.user.name = entry.snippet.channelTitle;

        //message("title=" + ret.title);
        //message("description=" + ret.descr);
        //message("channelId=" + ret.user.channelId);
    }


    if (entry.contentDetails) {
        if (entry.contentDetails.definition)
            if (entry.contentDetails.definition == "hd")
                ret.HD = true;

        if (entry.contentDetails.duration)
            ret.length = entry.contentDetails.duration;

        //message("HD=" + ret.HD);
        //message("length=" + ret.length + "  converted:" + time_column(ret.length));
    }

    if (entry.statistics) {
        if (entry.statistics.viewCount)
            ret.views = entry.statistics.viewCount;
        if (entry.statistics.likeCount)
            ret.likes = entry.statistics.likeCount;
        if (entry.statistics.dislikeCount)
            ret.dislikes = entry.statistics.dislikeCount;

        //message("views=" + ret.views + "     likes=" + ret.likes + "       dislikes=" + ret.dislikes);
    }

    return ret;
}


function data_feed_v3(json_txt) {

    //object to be returned
    var ret = new Object();
    ret.totalResults = 0;
    ret.entry = new Array();

    //main code
    var job = null; //json object
    if (json_txt != null)
        job = JSON.parse(json_txt);

    if (job == null) return ret;

    //jmessage(job);

    if (job.pageInfo != null)
        if (job.pageInfo.totalResults != null) {
            ret.totalResults = job.pageInfo.totalResults;
            //message("totalResults=" + ret.totalResults);
        }

    if (job.items != null)
        if (job.items.length != 0)
            for (var i = 0; i < job.items.length; i++) {
                var data = data_entry_v3(job.items[i]);
                if (data.feedKind != null) {
                    ret.entry.push(data);
                }
            }

    return ret;
}


function callback2(json_txt, def_node, buildHD, buildRate, parent) {
    //message(json_txt);

    var feed = data_feed_v3(json_txt);

    if (feed.entry.length != 1) return;
    var entry = feed.entry[0];

    //message("here");

    if (buildHD) {
        if (entry.HD != null) {
            def_node.setAttribute("reveal", "true");
            def_node.title = "high definition";
            var node_hd = newNode("span", null, "gridtube_meta_def_hd", def_node);
            node_hd.textContent = "HD";
        }
    }

    //message("there");

    if (buildRate) {
        var num_likes = (entry.likes != null ? parseInt(entry.likes) : 0);
        var num_dislikes = (entry.dislikes != null ? parseInt(entry.dislikes) : 0);

        if ((num_likes != 0) || (num_dislikes != 0)) {
            var perc = 100 - Math.round(num_dislikes * 100.0 / (num_likes + num_dislikes));

            var rateBrief = newNode("div", null, "gridtube_meta_rate", parent);
            rateBrief.title = perc + "% likes: +" + number_comma(num_likes.toString()) + "  -" + number_comma(num_dislikes.toString());
            rateBrief.onmouseover = pref_button_show;
            rateBrief.onmouseout = pref_button_hide;

            if (entry.views != null) {
                var view_num = number_comma(entry.views);
                rateBrief.title += "\n" + view_num + " views";
            }

            if (perc >= red_threshold) {
                rateBrief.textContent = "\uD83D\uDC4D " + perc;
                if (perc < orange_threshold) {
                    rateBrief.setAttribute("med", "true");
                }
            }
            else {
                rateBrief.textContent = "\uD83D\uDC4E " + perc;
                rateBrief.setAttribute("bad", "true");
            }
        }
    }
}


function callback1(txt, def_node, url2, parent) {
    //message(txt);
    var res = extract_resolution(txt);

    if (res) {
        def_node.setAttribute("reveal", "true");
        def_node.title = res.size + " definition";
        if (res.HD) {
            var node_hd = newNode("span", null, "gridtube_meta_def_hd", def_node);
            node_hd.textContent = res.UHD ? res.UHD : "HD";
            def_node.setAttribute("space", "true");
        }
        var node_attr = newNode("span", null, "gridtube_meta_def_format", def_node);
        node_attr.textContent = res.format;

        if (pref_rateEnable) {
            //message("callback");
            httpReq(url2, callback2, null, false, true, parent);
        }
    }
    else {
        //message("callback");
        httpReq(url2, callback2, def_node, true, pref_rateEnable, parent);
    }
}


function def_rate(v_id, parent) {
    var url1 = "https://www.youtube.com/get_video_info?video_id=" + v_id;
    var url2 = "https://www.googleapis.com/youtube/v3/videos?id=" + v_id + "&key=" + api_key + "&part=contentDetails,statistics";

    //httpreq
    if (pref_defEnable) {
        var def_node = newNode("span", null, "gridtube_meta_def_container", parent);
        httpReq(url1, callback1, def_node, url2, parent);
        def_node.onmouseover = pref_button_show;
        def_node.onmouseout = pref_button_hide;
    }
    else
        if (pref_rateEnable)
            httpReq(url2, callback2, null, false, true, parent);
}


function play(vid, pid, parent) {
    var playArea = newNode("div", null, "gridtube_meta_play_container", parent);
    var playNode = newNode("a", null, "gridtube_meta_play", playArea);
    playNode.href = "javascript:;";
    playNode.target = "_self";
    playNode.setAttribute('gridtube_meta_link_mark', 'true');
    playNode.title = "click to play";

    function play_handle(e) {
        disable_ajax(e);

        var parpar = e.target.parentNode.parentNode;

        if (innersearch(parpar, ".//*[@id='gridtube_meta_playing']").snapshotLength > 0)
            player_close();
        else {
            player.playerShow(vid, pid, parpar);
            if (get_pref("playerPause")) ytpause();
        }
    }

    playNode.onclick = play_handle;
    playNode.onmouseover = pref_button_show;
    playNode.onmouseout = pref_button_hide;
}


function find_plist(img) {
    var anc = innersearch(img, ".//ancestor::*[contains(@href,'&list=') and contains(@class,'yt-pl-thumb')]").snapshotItem(0);
    var plist = null;
    if (anc)
        plist = filter(anc.href, "list=", "/&?#");
    //message(plist);
    return plist;
}


function meta_data() {

    var vid_str = "//*[" + basic_str + " and (not(.//img[@data-thumb])) and (not(@gridtube_meta_thumb_mark))]";

    var link_str = "//div[(@id='content') or (contains(@class,'playlist-info'))]\
                        //a[(not(@gridtube_meta_link_mark))\
                            and (not(contains(@href,'javascript')))\
                            and (not(ancestor::*[contains(@class,'branded-page-v2-top-row')\
                                                    or contains(@class, 'tabs-area')\
                                                    or contains(@class, 'search-header')\
                                                    or contains(@class, 'search-pager')\
                                                    or contains(@class, 'spell-correction')\
                                                    or contains(@class, 'menu-container')\
                                                    or contains(@id, 'creator-page-sidebar')\
                                                    or contains(@id, 'channel-navigation-menu')\
                                                    or contains(@id, 'watch-discussion')\
                                                ]))\
                            ]";

    var user_str = "//*[contains(@class,'yt-lockup-byline')\
                        or contains(@class, 'pl-video-owner')\
                        or contains(@class,'pl-header-details')\
                        or contains(@class, 'yt-user-info')\
                        or contains(@class, 'author-attribution')\
                        or contains(@class, 'content-uploader')]\
                             //a[(contains(@href,'/user/') or contains(@href,'/channel/')) and (not(@gridtube_meta_user_mark))]";

    var user_str2 = "//li[contains(@class,'related-list-item')]\
                     //span[contains(@class,'g-hovercard') and (@data-ytid) and (@data-name) and (not(@gridtube_meta_user_mark2))]";

    function check_def_rate_play() {
        if (pref_defEnable || pref_rateEnable || pref_playerEnable) {

            if (pref_defEnable || pref_rateEnable) {
                if (win.location.href.indexOf("watch?") >= 0) {
                    var wvid = filter(win.location.href, "v=", "?&#");
                    if (wvid) {
                        var par = doc.getElementById("gridtube_meta_box");
                        if (!par) {
                            var target = doc.getElementById("gridtube_title_container");
                            if (!target) {
                                var pp = doc.getElementById("watch7-user-header");
                                if (pp) target = newNode("span", "gridtube_title_container", null, pp);
                            }
                            if (target) {
                                par = newNode("span", 'gridtube_meta_box', null, target);
                                def_rate(wvid, par);
                            }
                        }
                    }
                }
            }

            //check everything else
            var p = docsearch(vid_str);
            //message(p.snapshotLength);
            for (var i = 0; i < p.snapshotLength; i++) {
                var parent = p.snapshotItem(i);
                parent.setAttribute('gridtube_meta_thumb_mark', 'true');
                var img = innersearch(parent, ".//img[contains(@src,'vi/') or contains(@src,'vi_webp/') or contains(@src,'/p/')]").snapshotItem(0);
                if (!img) continue;

                var vid = filter(img.src, "vi/", "/&?#");
                if (!vid) vid = filter(img.src, "vi_webp/", "/&?#");

                if (vid) {//video or playlist
                    if (pref_defEnable || pref_rateEnable)
                        def_rate(vid, parent);
                }

                if (pref_playerEnable) {
                    //check for playlist
                    var plist = find_plist(img);
                    //message(plist);
                    play(vid, plist, parent);
                }
            }
        }
    }


    function check_tab() {
        //new tab for links
        if (pref_newTab) {
            var anodes = docsearch(link_str);
            //message(anodes.snapshotLength);
            for (var j = 0; j < anodes.snapshotLength; j++) {
                var a = anodes.snapshotItem(j);
                a.target = "_blank";
                a.setAttribute('gridtube_meta_link_mark', 'true');
                a.onclick = disable_ajax;
                //message(a.href);
            }
        }
    }


    function check_user() {
        //open user links in video section
        if (pref_userLink) {
            var anodes = docsearch(user_str);
            //message(anodes.snapshotLength);
            for (var j = 0; j < anodes.snapshotLength; j++) {
                var a = anodes.snapshotItem(j);
                a.setAttribute('gridtube_meta_user_mark', 'true');
                //message(a.href);

                var arr = a.href.split(/user[/]|channel[/]/);
                //message(arr);
                if (arr.length != 2) continue;
                if (arr[1].indexOf('/') != -1) continue;
                a.href += "/videos";
            }
        }


        //related user links
        var unodes = docsearch(user_str2);
        for (var j = 0; j < unodes.snapshotLength; j++) {
            var node = unodes.snapshotItem(j);
            node.setAttribute('gridtube_meta_user_mark2', 'true');
            //message(a.href);

            var a = doc.createElement("a");
            var attr = node.attributes;
            for (var i = 0; i < attr.length; i++) {
                a.setAttribute(attr[i].nodeName, attr[i].nodeValue);
            }
            a.setAttribute("gridtube_meta_user_mark2", "true");
            a.href = win.location.protocol + "//www.youtube.com/channel/" + node.getAttribute("data-ytid") + (pref_userLink ? "/videos" : "");
            a.textContent = node.textContent;
            node.parentNode.replaceChild(a, node);
        }
    }


    check_def_rate_play();
    check_tab();
    check_user();
}


//==================================================================
// Search pages

var aux = new Object();

function bottom_bar(kind) {
    var irend = doc.getElementById("gridtube_result_end");
    var txt_node = null;
    var img_node = null;
    if (irend == null) {
        var results_end_bar = doc.getElementById("gridtube_results_end_bar");
        irend = newNode("div", "gridtube_result_end", "gridtube_result_bar_inner", results_end_bar);
        img_node = newNode("img", "gridtube_result_end_img", null, irend);
        img_node.style.visibility = "hidden";
        img_node.src = "https://www.google.com/images/nycli1.gif";
        txt_node = newNode("span", "gridtube_result_end_text", null, irend);
    }
    else {
        txt_node = doc.getElementById("gridtube_result_end_text");
        img_node = doc.getElementById("gridtube_result_end_img");
    }

    switch (kind) {
        case "loading":
            irend.onclick = function (e) { };
            txt_node.textContent = "Loading Page " + aux.next_button.textContent;
            img_node.style.visibility = "visible";
            img_node.style.width = "auto";
            break;

        case "end":
            irend.onclick = function (e) { win.scroll(0, 0); };
            irend.setAttribute("title", "go to top of page");
            txt_node.textContent = "End of Results" + (aux.last_page ? " - Page " + aux.last_page : "");
            img_node.style.visibility = "hidden";
            img_node.style.width = "0px";
            break;
    }
}


function search_pages(cond) {
    //message(cond);

    var next_str = "//*[contains(@class,'search-pager')]/a[contains(@class,'yt-uix-button') and (@href) and (preceding-sibling::button)]";

    var parent = docsearch("//*[@id='results']/ol/li/ol").snapshotItem(0);
    if (!parent) return;

    function find_next_search() {
        if (aux.next_button) {
            aux.next_href = aux.next_button.getAttribute("href");
            if (aux.next_href.indexOf(win.location.origin) != 0) {
                aux.next_href = win.location.origin + aux.next_href;
                //message("fixed url");
            }
            //message(aux.next_href);
            //message(aux.next_button.textContent);
            aux.last_page = aux.next_button.textContent;
            bottom_bar("loading");
        }
        else
            bottom_bar("end");
    }

    //Initialize
    if (!parent.getAttribute("gridtube_auto_page_started")) {

        parent.setAttribute("gridtube_auto_page_started", "true");

        //disable ajax from results
        //var liitems = docsearch("//*[@id='results']/ol/li/ol/li");
        //for (var i = 0; i < liitems.snapshotLength; i++) {
        //    liitems.snapshotItem(i).onclick = disable_ajax;
        //}

        aux.bottom_area = newNode("div", "gridtube_bottom_area", null, parent);
        newNode("div", "gridtube_results_end_bar", "gridtube_result_bar", aux.bottom_area);

        aux.last_page = null;
        aux.next_button = docsearch(next_str).snapshotItem(0);
        find_next_search();
        aux.fetch_pending = false;
    }


    function exec_page(htm) {
        //message(htm);
        var newdoc = myparser.parseFromString(htm, "text/html");

        var li = xpath(newdoc, newdoc, "//*[@id='results']/ol/li/ol/li[not(.//*[contains(@class,'spell-correction') or contains(@class,'display-message')])]");

        //message(li.snapshotLength);

        for (var i = 0; i < li.snapshotLength; i++) {
            var clone = li.snapshotItem(i).cloneNode(true);
            clone.setAttribute("gridtube_clone_node", "true");
            parent.insertBefore(clone, aux.bottom_area);
            //disable ajax
            //clone.onclick = disable_ajax;
        }

        aux.next_button = xpath(newdoc, newdoc, next_str).snapshotItem(0);
        find_next_search();
        aux.fetch_pending = false;
        //message("done");
    }


    function fetch() {
        if (aux.fetch_pending) return;

        if (aux.next_button) {
            httpReq(aux.next_href, exec_page);
            aux.fetch_pending = true;
        }
    }

    if (cond) fetch();
}


//==================================================================
// Plist

function plist_adjust() {
    if (!pref_gridPlist) return;

    //adjust thumb quality
    var aitems = docsearch("//*[contains(@class,'pl-video')]//img[contains(@src,'hqdefault.jpg?custom') or contains(@data-thumb, 'hqdefault.jpg?custom')]");

    for (var i = 0; i < aitems.snapshotLength; i++) {
        var item = aitems.snapshotItem(i);
        var src = item.getAttribute("src");
        var data = item.getAttribute("data-thumb");

        if (src) {
            var new_src = src.replace(/hqdefault.jpg[?]custom(.*)/, 'mqdefault.jpg');
            if (src != new_src)
                item.setAttribute("src", new_src);
        }

        if (data) {
            var new_data = data.replace(/hqdefault.jpg[?]custom(.*)/, 'mqdefault.jpg');
            if (data != new_data)
                item.setAttribute("data-thumb", new_data);
        }
    }

    //remove deleted vids
    var ditems = docsearch("//*[(@id='pl-video-list') and (not(contains(@class,'pl-video-list-editable')))]\
                            //tr[contains(@class,'pl-video') and (not(@gridtube_marked_deleted))\
                            and ((@data-title='[Deleted Video]') or (@data-title='[Private Video]'))]");

    for (var i = 0; i < ditems.snapshotLength; i++) {
        var item = ditems.snapshotItem(i);
        item.style.display = "none";
        item.setAttribute("gridtube_marked_deleted", true);
    }
}

//==================================================================
// Related

function related_adjust(win_resized) {
    if (!pref_gridRel) return;

    var node = doc.getElementById("watch7-sidebar-contents");
    if (!node) return;

    var strnum = node.getAttribute("gridtube_stored_num");
    var stored_num = strnum ? parseInt(strnum) : 0;

    var litems = docsearch("//ul[@id='watch-related']//li[contains(@class,'related-list-item')]");

    var num = litems.snapshotLength;

    //message(num);
    if (num == 0) return;

    if (num == stored_num && !win_resized) return;

    node.setAttribute("gridtube_stored_num", num.toString());

    //var first = litems.snapshotItem(0);
    var last = litems.snapshotItem(num - 1);

    var y1 = node.getBoundingClientRect().top;
    var y2 = last.getBoundingClientRect().bottom;

    var d = Math.round(Math.abs(y1 - y2));
    //message("diff=" + d);
    var res = d + 30;
    var str = res.toString() + "px";

    if (node.style.height != str)
        node.style.height = str;
}


//==================================================================
// Main

function in_search_page() {
    return (win.location.pathname.indexOf("/results") == 0);
}

function in_plist_page() {
    return (win.location.pathname.indexOf("/playlist") == 0);
}

function in_trend_page() {
    return (win.location.pathname == "/feed/trending");
}

function in_hist_page() {
    return (win.location.pathname == "/feed/history");
}

//insert styles
insertStyle(style_basic, "gridtube_style_basic");
insertStyle(style_ads_other, "gridtube_style_ads_other");

if (pref_playerEnable) //hide overlay of playlist
    insertStyle(".yt-pl-thumb-overlay {display:none !important;}", "gridtube_style_list_overlay");

if (pref_gridEnable) {
    if (pref_gridSearch)
        insertStyle(style_grid_search, "gridtube_style_grid_search");

    if (pref_gridPlist)
        insertStyle(style_grid_plist, "gridtube_style_grid_plist");

    if (pref_gridTrend)
        insertStyle(style_grid_trending, "gridtube_style_grid_trending");

    if (pref_gridHist)
        insertStyle(style_grid_history, "gridtube_style_grid_history");

    if (pref_gridRel)
        insertStyle(style_grid_related, "gridtube_style_grid_related");
}

//mark content if in search mode to apply correct style
function mark_content() {
    var content = doc.getElementById("content");
    if (!content) return;

    var insearch = in_search_page();

    if (insearch && pref_gridSearch && !content.getAttribute("gridtube_grid_search"))
        content.setAttribute("gridtube_grid_search", "true");
    else
        if (!insearch && content.getAttribute("gridtube_grid_search"))
            content.removeAttribute("gridtube_grid_search");

    if (insearch && pref_autoLoadSearch && !content.getAttribute("gridtube_auto_load_search"))
        content.setAttribute("gridtube_auto_load_search", "true");
    else
        if (!insearch && content.getAttribute("gridtube_auto_load_search"))
            content.removeAttribute("gridtube_auto_load_search");

    var intrend = in_trend_page();

    if (intrend && pref_gridTrend && !content.getAttribute("gridtube_grid_trend"))
        content.setAttribute("gridtube_grid_trend", "true");
    else
        if (!intrend && content.getAttribute("gridtube_grid_trend"))
            content.removeAttribute("gridtube_grid_trend");

    var inhist = in_hist_page();

    if (inhist && pref_gridHist && !content.getAttribute("gridtube_grid_hist"))
        content.setAttribute("gridtube_grid_hist", "true");
    else
        if (!inhist && content.getAttribute("gridtube_grid_hist"))
            content.removeAttribute("gridtube_grid_hist");
}


//remove more_ads in grid search mode or auto load
function remove_more_ads() {
    if (in_search_page() && (pref_gridSearch || pref_autoLoadSearch)) {
        var nodes = docsearch("//li/*[(contains(@class,'pyv-afc-ads-container')\
                                or contains(@class,'search-refinements')\
                                or contains(@class,'exploratory-section')\
                                or contains(@class,'feed-item-container'))\
                                and (not(@gridtube_ads_mark))]");

        for (var i = 0; i < nodes.snapshotLength; i++) {
            var node = nodes.snapshotItem(i);
            node.setAttribute("gridtube_ads_mark", "true");
            node.parentNode.style.display = "none";
        }
    }
}


//auto_page load everything
function auto_page_load(win_resize_scroll) {
    if (!pref_autoLoadSearch && !pref_autoLoadOther) return;

    var scrollMaxY = (win.scrollMaxY | (doc.documentElement.scrollHeight - doc.documentElement.clientHeight));

    if (in_search_page() && pref_autoLoadSearch) {
        //message(win.pageYOffset + "    " + win.scrollMaxY + "    " + win.innerHeight);
        search_pages(win.pageYOffset >= scrollMaxY - win.innerHeight);
        //search_pages(true);
    }

    //auto page for other pages

    if (pref_autoLoadOther) {
        var button_list = docsearch("//button[((@id='watch-more-related-button')\
                                or (contains(@class,'load-more-button')))\
                                and (not(contains(@class, 'error') or contains(@class, 'loading')))]");


        for (var i = 0; i < button_list.snapshotLength; i++) {
            var button = button_list.snapshotItem(i);

            if (win_resize_scroll) button.setAttribute("gridtubeclick", "0");
            var count = 0;
            var countstr = button.getAttribute("gridtubeclick");
            if (countstr) count = parseInt(countstr);

            if ((button.style.display != 'none') && (count < 10)) {
                //alert(cond + "  " + count);
                var rect = button.getBoundingClientRect();
                //message(rect.top + "  " +   win.pageYOffset);
                if (2 * win.innerHeight >= rect.top)
                    simulClick(button);
                button.setAttribute("gridtubeclick", (count + 1).toString());
            }
        }
    }
}


//close player at out of focus page (except last)
function get_storage_count() {
    var value = -1;
    var tabstr = win.localStorage.getItem("gridtube_tab_count");
    if (tabstr) value = parseInt(tabstr);
    return value;
}

function set_storage_count() {
    var value = get_storage_count();
    value++;
    if (value > 1000000) value = 0;
    win.localStorage.setItem("gridtube_tab_count", value.toString());
    return value;
}

var tab_count = -2;
var set_storage_executed = false;

function check_focus() {

    if (!doc.hasFocus()) {
        //message("out of focus: " + tab_count);
        //check if last focused tab
        if (get_storage_count() != tab_count) {
            if (pref_ytFocus) ytpause();
            if (pref_playerEnable)
                if (get_pref("playerFocus"))
                    player.playerPause();
        }
        set_storage_executed = false;
    }
    else {
        //message("in focus: " + tab_count);
        if (!set_storage_executed) {
            tab_count = set_storage_count();
            set_storage_executed = true;
        }
    }
}

var old_addr = win.location.href;
var nochanges_count = -1;

win.addEventListener("focus", function () { nochanges_count = -1; check_focus(); }, false);
win.addEventListener("blur", function () { nochanges_count = -1; check_focus(); }, false);
win.addEventListener("resize", function () { nochanges_count = -1; related_adjust(true); auto_page_load(true); }, false);
win.addEventListener("scroll", function () { nochanges_count = -1; auto_page_load(true); }, false);
win.addEventListener("click", function (e) { nochanges_count = -1; player_close(e); }, false);

//main routine
function check_changes() {
    if (old_addr == win.location.href) {
        nochanges_count++;
    }
    else {
        nochanges_count = 0;
        old_addr = win.location.href;
        player_close();
        //message("new addr");
    }

    if (nochanges_count >= 20) return;

    check_focus();

    if (pref_gridEnable) {
        mark_content();
        if (in_search_page()) choice_icons("search");
        if (in_hist_page()) choice_icons("hist");
        if (in_plist_page()) { choice_icons("plist"); plist_adjust(); }
        related_adjust(false);
    }
    meta_data();
    remove_more_ads();
    auto_page_load(false);
}

win.setInterval(check_changes, 1000);
check_changes();