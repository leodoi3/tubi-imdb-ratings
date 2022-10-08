// ==UserScript==
// @name         IMDB Ratings on Tubi
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Shows IMDB ratings on Tubi
// @author       You
// @match        https://tubitv.com/*
// @icon         https://tubitv.com/favicon.ico
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      file:///C:\Users\matte\Repos\tubi-imdb-ratings\userscript.js
// @require            https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant              GM_getValue
// @grant              GM_setValue

// ==/UserScript==

waitForKeyElements("div.nsU2J", addSettingButton, true);

var fireOnHashChangesToo = true;
var pageURLCheckTimer = setInterval(
  function () {
    if (this.lastPathStr !== location.pathname
      || this.lastQueryStr !== location.search
      || (fireOnHashChangesToo && this.lastHashStr !== location.hash)
    ) {
      this.lastPathStr = location.pathname;
      this.lastQueryStr = location.search;
      this.lastHashStr = location.hash;

      if (this.lastPathStr.startsWith("/movie")) {
        waitForKeyElements("div.web-carousel-shell.t3vzq > div.web-carousel__container", () => {
          addRatingNearTitle();
          addRecommendedButtons();
        });
      }
      else if (this.lastPathStr.startsWith("/home")) { //adds buttons on the homepage
        waitForKeyElements("div.web-carousel__container", (row) => {
          addHomeRecommendedButtons(row);
        });
      }
      
    }
  }
  , 111
);


GM_config.init(
  {
    'id': 'tubi-imdb-ratings', // The id used for this instance of GM_config
    'title' :  `${GM.info.script.name} v${GM.info.script.version} Settings`,
    'fields': // Fields object
    {
      'OMDbApiKey': // This is the id of the field
      {
        'label': 'OMDb API Key', // Appears next to field
        'section' : ['You can request a free OMDb API Key at:', 'https://www.omdbapi.com/apikey.aspx'],
        'type': 'text', // Makes this setting a text field
        'title': "Your OMDb API Key",
        'size' : 20,
        'default': '' // Default value if user doesn't change it
      }
    },
    css: ':root{--accent:rgb(226, 182, 22);--background:rgb(24, 26, 27);--black:rgb(0, 0, 0);--font:Roboto,Helvetica,Arial,sans-serif;--white:rgb(255, 255, 255)}#tubi-imdb-ratings *{color:var(--white)!important;font-family:var(--font)!important;font-size:14px!important;font-weight:400!important}#tubi-imdb-ratings{background:var(--background)!important}#tubi-imdb-ratings .config_header{font-size:20pt!important;line-height:1.1!important}#tubi-imdb-ratings .section_desc,#tubi-imdb-ratings .section_header{background-color:var(--accent)!important;border:1px solid transparent!important;color:var(--black)!important}#tubi-imdb-ratings .config_var{align-items:center!important;display:flex!important}#tubi-imdb-ratings_field_OMDbApiKey{background-color:var(--white)!important;border:1px solid var(--black)!important;color:var(--black)!important;flex:1!important}#tubi-imdb-ratings button,#tubi-imdb-ratings input[type=button]{background:var(--white)!important;border:1px solid var(--black)!important;color:var(--black)!important}#tubi-imdb-ratings button:hover,#tubi-imdb-ratings input[type=button]:hover{filter:brightness(85%)!important}#tubi-imdb-ratings .reset{margin-right:10px!important}',
    'events' : 
    {
      'init': () => {
        // initial configuration if OMDb API Key is missing
        if (!GM_config.isOpen && GM_config.get('OMDbApiKey') === '') {
          $(() => GM_config.open())
        }
      },
      'save': () => {
        if (GM_config.isOpen) {
          if (GM_config.get('OMDbApiKey') === '') {
            alert('check your settings and save')
          } else {
            alert('settings saved')
            GM_config.close()
            setTimeout(window.location.reload(false), 500)
          }
        }
      }
     // 'close': function() { alert('onClose()'); },
     // 'reset': function() { alert('onReset()'); }
    } 
  });

  /**
   * Adds a link to the menu to access the script configuration
   */
function addSettingButton() {
  const navBar =   document.getElementsByClassName("nsU2J")[0]
  var btn = document.createElement("button");
  btn.innerHTML = "Get IMDB rating";
  btn.onclick = () => {
   // console.log(GM_config.get("ApiKey"))
    GM_config.open();
  }
  btn.style.backgroundColor = "black";
  btn.innerHTML = "Tubi IMDB Ratings"
  btn.style.color = "white"
  navBar.appendChild(btn);
}

async function addHomeRecommendedButtons(row) {
  const movieRow = row[0].getElementsByClassName("web-grid-container web-carousel web-carousel--enable-transition");
  for (let row of movieRow) {
    for (let item of row.childNodes) {
      try {
        addButton(item);
      }
      catch (e) { console.log(e) };
    };
  }
}

async function addRecommendedButtons() {
  const movieColumns = document.getElementsByClassName("web-grid-container web-grid-container--no-margin web-carousel web-carousel--enable-transition")[0].childNodes;

  //console.log(movieColumns)
  for (let item of movieColumns) {
    try {
      addButton(item);
    }
    catch (e) { console.log(e) }
    ;
  }
}

function addButton(item) {
  var title = getTitle(item);
  var year = getYear(item);
  var btn = document.createElement("button");

  btn.innerHTML = "Get IMDB rating";
  btn.onclick = () => {
    getRating(title, year).then((data) => {
      if (data.title != undefined) {
        btn.innerHTML = data.rating + "/10" + "<br>" + data.votes + " votes";
        btn.onclick = () => { window.open("https://www.imdb.com/title/" + data.id) }
        btn.setAttribute('title', data.plot)

      }
      else {
        btn.onclick = () => { window.open("https://www.google.com/search?q=" + title + " " + year) }
        btn.innerHTML = "Google Search: " + title + " " + year;
        btn.setAttribute('title', btn.innerHTML)

      }

    }
    ).catch((err) => {console.error(err)})
  }
  btn.style.backgroundColor = "yellow";
  btn.style.color = "black"
  item.appendChild(btn);




}


async function getRating(title, year) {
  const response = await fetch("https://www.omdbapi.com/?apikey=57c52853" + "&t=" + title + "&y=" + year)
  const json = await response.json();

  return {
    title: json.Title,
    rating: json.imdbRating,
    id: json.imdbID,
    votes: json.imdbVotes,
    plot: json.Plot
  };
}

function getTitle(params) {
  // params.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerText
  return params.querySelector("a").innerText


}
function getTitle2(params) {
  //document.querySelector("div.Col.Col > div > h1").innerText
  return document.getElementsByClassName("c1jX9")[0].innerText

}


function getYear(params) {
  let year = params.getElementsByClassName("web-content-tile__year")[0].innerText;
  if (!year.match(/\(?\d+\)?/)) return ""
  year = year.replace("(", "")
  year = year.replace(")", "")
  return year;
}

function getYear2(params) {
  let year = document.getElementsByClassName("web-attributes__meta")[0].innerText;
  //document.querySelector("div.Col.Col > div > div > div > div:nth-child(1)").innerText
  if (!year.match(/\(?\d+\)?/)) return ""
  year = year.replace("(", "")
  year = year.replace(")", "")
  return year
}

function addRatingNearTitle() {

  var title = getTitle2()
  var year = getYear2()
  const content = document.getElementsByClassName("web-attributes__meta")[0];
  //document.querySelector("div.Col.Col  > div:nth-child(2) > div > div")
  var btn = document.createElement("button");


  getRating(title, year).then((data) => {
    if (data.title != undefined) {
      btn.innerHTML = data.rating + "/10  - " + data.votes + " votes";
      btn.onclick = () => { window.open("https://www.imdb.com/title/" + data.id) }
      btn.setAttribute('title', data.plot)
      btn.style.marginLeft = "15px"

    }
    else {
      btn.onclick = () => { window.open("https://www.google.com/search?q=" + title + " " + year) }
      btn.innerHTML = "Google Search: " + title + " " + year;

    }

    btn.style.backgroundColor = "yellow";
    btn.style.color = "black"
    content.appendChild(btn);
  })


}




