let bn3 = document.getElementById("b3");
let contime=document.querySelector(".contime");
let cq = document.querySelector(".cq")
let select=document.getElementById("select");
let sr = document.getElementById("sr");
b3.onclick=()=>{contime.style.display="none";cq.style.display="block"; document.body.style.overflowX="auto";}

/*
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




 async function getQuran()

{
    let api = "https://api.alquran.cloud/v1/quran/ar.asad";
    let res=await fetch(api)
    let data=await res.json();
    let surahs=data.data.surahs
    getName(surahs)
    console.log(data)
}
function getName(name)
{
let nameselect=name.map(name=> name.name)
select.innerHTML =
 `
<select onchange="getayas(this.value)">
<option>
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
</option>
${name.map(name=>`<option>${name.number+'    '+ name.name}</option>`)}
</select>
`;
}
async function getayas(nameSurah)
{ 
   let apiayahs = `https://api.alquran.cloud/v1/surah/${nameSurah}/ar.asad`;
   let resnumber= await fetch(apiayahs)
   let data= await resnumber.json()
    let map_ayahs=data.data.ayahs;
    let imap = map_ayahs.map((aya, i) => `${aya.text} ⟨${i + 1}⟩`).join('');
   sr.innerHTML=
   `<p class="ayaha">
    ${imap}
   </p>
   `
  
   
}
getQuran();




