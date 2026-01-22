let rotatex = document.getElementById("rotatex");
let showx = document.getElementById("show");
let span = document.getElementById("span");
let bnqubla = document.getElementById("b4");

bnqubla.onclick = () => {
  document.querySelector(".contime").style.display = "none";
  document.getElementById("conqubla").style.display = "block";
};

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (possion) {
      let longitude = possion.coords.longitude;
      let latitude = possion.coords.latitude;
      async function get() {
        let api = `https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`;
        let res = await fetch(api);
        let data = await res.json();
        console.log(data.data);

        rotatex.style.transform = `rotate(${data.data.direction}deg)`;
        span.innerHTML = `${Math.round(data.data.direction)}`;
      }
      get();
    },
    function error() {
      if (window.DeviceMotionEvent) {
        window.addEventListener("deviceorientation", function e(even) {
          let alph = even.alpha;
          rotatex.style.transform = `rotate(${alph - 58}deg)`;
          span.innerHTML = `
  ${Math.round(alph)}
  
  `;
        });
      }
    }
  );
}

