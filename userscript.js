// ==UserScript==
// @name         IMDB Ratings on Tubi
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Shows IMDB ratings on Tubi
// @author       You
// @match        https://tubitv.com/movies/*
// @icon         https://tubitv.com/favicon.ico
// @grant        none
// @require      file:///C:\Users\matte\Repos\tubi-imdb-ratings\userscript.js
// ==/UserScript==



window.addEventListener("load", ()=> {
  //alert("loaded")
 // addRatingNearTitle();
// addRecommendedButtons();
}, false)



waitForElm("div.zHQGA > div > div > div > h1").then((elm) => {
  //#app > div.tnutt > div > div.rjiTB > div > div.zHQGA > div > div > div > div.Col.Col--9 > div.QBlcb.AbRBx > div.UBdQP
  setTimeout(addRatingNearTitle,2500);
});

waitForElm("div:nth-child(5) > div").then((elm) => {
  //sleep(1500)
 setTimeout(addRecommendedButtons,1000);
});

function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addRecommendedButtons() {
  const content = document.getElementsByClassName("web-grid-container web-grid-container--no-margin web-carousel web-carousel--enable-transition")[0].childNodes;
  const nextBtn = document.getElementsByClassName("web-carousel-shell__next web-carousel-shell__next--for-no-overflowing-item")[0];

  for (i = 0; i < 4; i++) {
    if (nextBtn) {
      nextBtn.click()
      await sleep(500)
    }

  }

  for (let item of content) {
    try {
      addButton(item);
    }
    catch (e) { console.log(e) }
    ;
  }

  const prevBtn = document.getElementsByClassName("web-carousel-shell__previous web-carousel-shell__previous--for-no-overflowing-item")[0];
  for (i = 0; i < 4; i++) {
    if (prevBtn) {
      prevBtn.click()
      await sleep(500)
    }
  }
}



function addButton(item) {
  var title = getTitle(item);
  var year = getYear(item);
  var btn = document.createElement("button");

  //console.log(title)
  getRating(title, year).then((data) => {
    if (data.title != undefined) {
      btn.innerHTML = data.rating + "/10" + "<br>" + data.votes + " votes";
      btn.onclick = () => { window.open("https://www.imdb.com/title/" + data.id) }
      btn.setAttribute('title', data.plot)

    }
    else {
      btn.onclick = () => { window.open("https://www.google.com/search?q=" + title + " " + year) }
      btn.innerHTML = "Google Search: " + title + " " + year;

    }
    btn.style.backgroundColor = "yellow";
    btn.style.color = "black"
    item.appendChild(btn);

  }
  )

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
  if (!year.match(/\(\d+\)/)) return ""
  year = year.replace("(", "")
  year = year.replace(")", "")
  return year;
}

function getYear2(params) {
  let year = document.getElementsByClassName("web-attributes__meta")[0].innerText;
  //document.querySelector("div.Col.Col > div > div > div > div:nth-child(1)").innerText
  if (!year.match(/\(\d+\)/)) return ""
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
// var url = window.location.href;
// if (url.match("https:\/\/tubitv.com\/movies\/\d+") || url.match("127.0.0.1"))
//   addRecommendedButtons()





