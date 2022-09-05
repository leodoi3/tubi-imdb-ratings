var content =
  document.getElementsByClassName("Row Carousel__row")[0].childNodes;

for (let item of content) {
  addButton(item);
}

function addButton(item) {
var title = getTitle(item);
var year = getYear(item);

//console.log(title)
   getRating(title, year).then((data) => {
    if (data != undefined)
    { var btn = document.createElement("button");
     btn.innerHTML = data.rating + data.title;
     item.appendChild(btn);}

   })

}

async function getRating(title, year) {
  const response = await fetch("https://www.omdbapi.com/?apikey=57c52853" + "&t=" + title + "&y=" + year)
  const json = await response.json();

  return {title: json.Title ,
    rating: json.imdbRating,
         id: json.imdbID};
}

function getTitle(params){
return params.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerText

}

function getYear(params){
  let year = params.childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerText
  year = year.replace("(","")
  year = year.replace(")","")
return year;}

// fetch("https://www.omdbapi.com/?apikey=57c52853&t=the%20crumbs&y=2020")
//   .then(response => {
//     // indicates whether the response is successful (status code 200-299) or not
//     if (!response.ok) {
//       throw new Error(`Request failed with status ${reponse.status}`)
//     }
//     return response.json()
//   })
//   .then(data => {
//     console.log(data.count)
//     console.log(data.products)
//   })
//   .catch(error => console.log(error))
