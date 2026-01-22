let sabhacon = document.getElementById("sabha");
let timecon = document.querySelector(".contime");
let bnclick = document.getElementById("b1");
let disnumber = document.getElementById("disnumber");
let plus = document.getElementById("plus");
let remove = document.getElementById("remove");
let color = document.getElementById("color");
let changecolor = "normal";
bnclick.onclick = () => {
  timecon.style.display = "none";
  sabhacon.style.display = "flex";
};
if (localStorage.x != null) {
  disnumber.innerHTML = localStorage.x;
}
plus.onclick = () => {
  disnumber.innerHTML -= -1;
  let x = disnumber.innerHTML;
  localStorage.setItem("x", x);
};
remove.onclick = () => {
  disnumber.innerHTML = 0;
  localStorage.removeItem("x");
};
if(localStorage.colors != null) {
document.documentElement.style.setProperty("--colorsabha", localStorage.colors)

}
color.onclick = () => {
  if (changecolor == "normal") {
    sabhacon.style.cssText = ` display: flex;
 border-radius: 77px 76px 106px 106px;
  border: 2px double white;

`;
    document.body.style.cssText = `  background: linear-gradient(346deg, var(--colorsabha), #000000);
`;
    document.documentElement.style.setProperty("--colorsabha", " #253745");
    localStorage.setItem("colors", " #253745");
    changecolor = "new";
  } else if (changecolor == "new") {
    sabhacon.style.cssText = ` display: flex;
 border-radius: 77px 76px 106px 106px;
  border: 2px double green;

`;    localStorage.setItem("colors", "#369a78");

    document.body.style.cssText = `  background: linear-gradient(346deg, var(--colorsabha), #000000);
`;
    document.documentElement.style.setProperty("--colorsabha", " #369a78");
    changecolor = "new2";
  } else if (changecolor=="new2") {
    sabhacon.style.cssText = ` display: flex;
 border-radius: 77px 76px 106px 106px;
  border: 2px double green;

`;
    document.body.style.cssText = `  background: linear-gradient(346deg, var(--colorsabha), #000000);
`;localStorage.setItem("colors", " rgb(188 143 33)");
    document.documentElement.style.setProperty(
      "--colorsabha",
      " rgb(188 143 33)"
    );
    changecolor = "nor";
  }

else
{
sabhacon.style.cssText = ` display: flex;
 border-radius: 77px 76px 106px 106px;
  border: 2px double green;

`;
document.body.style.cssText = `  background: linear-gradient(346deg, var(--colorsabha), #000000);
`;
localStorage.setItem("colors", " #7e357e");
document.documentElement.style.setProperty("--colorsabha", " #7e357e");
changecolor = "normal";
}
}



let x=new Date();
console.log(x.getHours()+":"+x.getMinutes()+":"+x.getSeconds());





let s2=document.getElementById("s2")
document.getElementById("b2").onclick=()=>{
  timecon.style.display = "none";
  s2.style.display="flex"
  
}