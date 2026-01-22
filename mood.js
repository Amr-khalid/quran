let mood=document.getElementById('mood');
let logo=document.getElementById('logo');
let light="dark"
let grou = document.querySelector(".groupButton");
let con=document.querySelector(".cq")
let sabha=document.getElementById("sabha");
mood.addEventListener("click",function(){
if(light=="dark")
{
document.documentElement.style.setProperty("--color", "white");
document.body.style.cssText =
  " background: linear-gradient(346deg, #253745, #000000);";
  mood.innerHTML=`<i class="fa fa-moon-o" ></i>`
  grou.style.cssText=
  " background: linear-gradient(346deg, #253745, #000000);"
  light="not"
  
}
else
{
  document.documentElement.style.setProperty("--color", "black");
  document.documentElement.style.setProperty("--colo2", "#677783");
  document.body.style.cssText =
    "background: linear-gradient(13deg, #677783, #ffffff);transition: 0.9s;";
      mood.innerHTML = `<i class="fa fa-sun-o" ></i>`;

logo.style.cssText= "filter: invert(1);";
grou.style.cssText =
  " background: linear-gradient(13deg, #677783, #ffffff);";
    light="dark"
}
})
logo.onclick=()=>{
  document.getElementById("s2").style.display = "none";
   document.getElementById("conqubla").style.display = "none";
  contime.style.display="flex";
  con.style.display="none"
 sabha.style.display = "none";
}
