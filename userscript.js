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
// ==/UserScript==

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




