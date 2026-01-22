let ul = document.getElementById("ul");
let tare = document.querySelector(".tare");


/*
Get Api
+longitude
+latitude
----------
+ possion()
************
Get adhan   - اوثات الصلات
+dis play time
---------------
 Get qybla
 +direcion alphe - bate - gamma
 -------
 even divice orientati0n
 -----------------
 -getQuran
 -surahs
*****
get name
-option
-------
function select ()
****************
getsurah
-continer
-ayahs
*****
loob ayahs()
*/ 

 
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (possion) {
      let locx = possion.coords.longitude;
      let locy = possion.coords.latitude;
      console.log(locy, locx);
      let api = `https://api.aladhan.com/v1/timings?latitude=${locy}&longitude=${locx}`;
      async function get() {
        let res = await fetch(api);
        let date = await res.json();
        let ma = date.data.date.gregorian.date;
        let hi = date.data.date.hijri.date;
        tare.innerHTML = `<div class="cf">
        <p>التاريخ الهجري:</p>
        <p>${hi}</p>
      </div>
      

        <div class="cb">
        <p>التاريخ الملادى:</p>
        <p>${ma}</p>
      </div>  `;
        let time = date.data.timings;
        console.log(date);

        ul.innerHTML = `
  <li class="row1">
        <p>${time.Fajr}</p>
      <p>الفجر</p>
      </li>
      <li class="row2">
        <p>${time.Sunrise}</p>
        <p>الشروق</p>
      </li>
      <li class="row3">
        <p>${time.Dhuhr}</p>
        <p>الظهر</p>
      </li>
      <li class="row4">
        <p>${time.Asr}</p>
        <p>العصر</p>
      </li>
      <li class="row5">
        <p>${time.Maghrib}</p>
        <p>المغرب</p>
      </li>
      <li class="row6">
        <p>${time.Isha}</p>
        <p>الغشاء</p>
      </li>
`;
      }
      get();
    },
    function err(error) {
      locx = 29.81667;
      locy = 31.2;
      
      console.log("حط طول تقربي لانك لم تسمج ");
      let api = `https://api.aladhan.com/v1/timings?latitude=${locy}&longitude=${locx}`;
      async function get() {
        let res = await fetch(api);
        let date = await res.json();
        let ma = date.data.date.gregorian.date;
        let hi = date.data.date.hijri.date;
        tare.innerHTML = `<div class="cf">
        <p>التاريخ الهجري</p>
        <p>${hi}</p>
      </div>
        <p></p>
        <div class="cb">
        <p>التاريخ الملادى</p>
        <p>${ma}</p>
      </div>  `;
        let time = date.data.timings;
        console.log(time);
        ul.innerHTML = `
  <li class="row1">
        <p>${time.Fajr}</p>
      <p>الفجر</p>
      </li>
      <li class="row2">
        <p>${time.Sunrise}</p>
        <p>الشروق</p>
      </li>
      <li class="row3">
        <p>${time.Dhuhr}</p>
        <p>الظهر</p>
      </li>
      <li class="row4">
        <p>${time.Asr}</p>
        <p>العصر</p>
      </li>
      <li class="row5">
        <p>${time.Maghrib}</p>
        <p>المغرب</p>
      </li>
      <li class="row6">
        <p>${time.Isha}</p>
        <p>الغشاء</p>
      </li>
`;
      }
      get();
    }
  );
}
