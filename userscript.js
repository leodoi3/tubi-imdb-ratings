// ==UserScript==
// @name         IMDB Ratings on Tubi
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://tubitv.com/movies/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @grant        none
// ==/UserScript==

window.addEventListener('load', function () {
  //var url = window.location.href;
  //if (url.match("https:\/\/tubitv.com\/movies\/\d+") || url.match("127.0.0.1"))
  setTimeout(addRecommendedButtons, 3000);

}, false);

function addRecommendedButtons() {
  const content = document.getElementsByClassName("Row Carousel__row")[0].childNodes;
  const nextBtn = document.getElementsByClassName("Button Button--secondary Button--round Carousel__next Carousel__arrow-active")[0];
  const prevBtn = document.getElementsByClassName("Button Button--secondary Button--round Carousel__prev Carousel__arrow-active")[0];
  nextBtn.click();
  setTimeout(nextBtn.click(), 500);
  setTimeout(nextBtn.click(), 1000);

  setTimeout(() => {
    for (let item of content) {
      try {
        addButton(item);
      }
      catch (e) { console.log(e) }
      ;
    }
  }, 5000)

    setTimeout(prevBtn.click(), 10000)
    setTimeout(prevBtn.click(), 12000)
    setTimeout(prevBtn.click(), 15000)


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
    else
    {
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
  return params.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerText

}

function getYear(params) {
  let year = params.childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerText
  year = year.replace("(", "")
  year = year.replace(")", "")
  return year;
}

var url = window.location.href;
if (url.match("https:\/\/tubitv.com\/movies\/\d+") || url.match("127.0.0.1"))
  addRecommendedButtons()





