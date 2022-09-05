// ==UserScript==
// @name         IMDB Ratings on Tubi
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://tubitv.com/movies/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @grant        none
// @require      file:///C:\Users\matte\Repos\tubi-imdb-ratings\userscript.js
// ==/UserScript==

// window.addEventListener('load', function () {
//   //var url = window.location.href;
//   //if (url.match("https:\/\/tubitv.com\/movies\/\d+") || url.match("127.0.0.1"))
//   setTimeout(addRecommendedButtons, 3000);
// this.alert("Hello")
// }, false);



waitForElm("div:nth-child(5) > div").then((elm) => {
  setTimeout(addRecommendedButtons, 1000);
});

waitForElm("div:nth-child(5) > div").then((elm) => {
  //setTimeout(addRecommendedButtons, 1000);
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
  const content = document.getElementsByClassName("Row Carousel__row")[0].childNodes;
  const nextBtn = document.querySelector(".Button--round.Carousel__next.Carousel__arrow-active");


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

  const prevBtn = document.querySelector(".Button--round.Carousel__prev.Carousel__arrow-active");;
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
  return params.querySelector("h3 > a").innerText
  

}

function getYear(params) {
  let year = params.childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerText
  if (!year.match(/\(\d+\)/)) return ""
  year = year.replace("(", "")
  year = year.replace(")", "")
  return year;
}

// var url = window.location.href;
// if (url.match("https:\/\/tubitv.com\/movies\/\d+") || url.match("127.0.0.1"))
//   addRecommendedButtons()





