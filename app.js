const state={
schedule:[],
logs:{}
};

function login(){

let user=username.value;
let pass=password.value;

if(user==="shivam" && pass==="#shukla123@123"){

loginPage.style.display="none";
navbar.style.display="flex";

showPage("prescription");

}

else{

alert("Incorrect username or password");

}

}


function showPage(id){

document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));

document.getElementById(id).classList.add("active");

}



function addMedicine(){

let div=document.createElement("div");

div.innerHTML=`

<input class="medName" placeholder="Medicine">
<input class="medDose" placeholder="Dose mg">
<input class="medFreq" placeholder="Frequency hours">
<input class="medDur" placeholder="Duration days">

`;

medicineList.appendChild(div);

}



function createSchedule(){

let meds=[...document.querySelectorAll(".medName")].map((m,i)=>({

name:m.value,
dose:document.querySelectorAll(".medDose")[i].value,
freq:parseInt(document.querySelectorAll(".medFreq")[i].value),
dur:parseInt(document.querySelectorAll(".medDur")[i].value)

}));

let start=new Date(startTime.value);

state.schedule=[];

meds.forEach(m=>{

let total=(24/m.freq)*m.dur;

for(let i=0;i<total;i++){

let t=new Date(start.getTime()+i*m.freq*3600000);

state.schedule.push({
id:m.name+"_"+i,
medicine:m.name,
dose:m.dose,
time:t
});

}

});

renderCalendar();
renderTimeline();
updateDashboard();

showPage("calendarPage");

}


function renderCalendar(){

const cal=document.getElementById("calendar");
const hover=document.getElementById("hoverDetails");

cal.innerHTML="";



let days={};

state.schedule.forEach(d=>{

let date=new Date(d.time).toDateString();

if(!days[date]) days[date]=[];

days[date].push(d);

});


Object.keys(days).forEach(day=>{

let div=document.createElement("div");

div.className="day";

div.innerText=new Date(day).getDate();




div.onmouseover=()=>{

let html="<b>"+day+"</b><br><br>";

days[day].forEach(d=>{

html+=`
${d.medicine} — ${d.dose} mg
(${new Date(d.time).toLocaleTimeString()})
<br>
`;

});

hover.innerHTML=html;

};



div.onmouseout=()=>{

hover.innerHTML="";

};



div.onclick=()=>{

let html="<b>"+day+"</b><br><br>";

days[day].forEach(d=>{

html+=`

<div class="doseBox">

<b>${d.medicine}</b> ${d.dose} mg
<br>
${new Date(d.time).toLocaleTimeString()}

<br>

<button onclick="logDose('${d.id}','taken')">Taken</button>
<button onclick="logDose('${d.id}','missed')">Skip</button>

</div>

`;

});

hover.innerHTML=html;

};

cal.appendChild(div);

});

}


function renderTimeline(){

timeline.innerHTML="";

state.schedule.forEach(d=>{

let div=document.createElement("div");

div.innerHTML=`

<b>${d.medicine}</b> ${d.dose} mg
<br>
${new Date(d.time).toLocaleString()}

<br>

<button onclick="logDose('${d.id}','taken')">Taken</button>
<button onclick="logDose('${d.id}','missed')">Skip</button>

`;

timeline.appendChild(div);

});

}



function logDose(id,status){

state.logs[id]=status;

updateDashboard();

}



let chart;

function updateDashboard(){

let total=state.schedule.length;

let taken=Object.values(state.logs).filter(x=>x==="taken").length;

let missed=Object.values(state.logs).filter(x=>x==="missed").length;

let adherence=((taken/total)*100||0).toFixed(1);

adherence.innerText=adherence+"%";

takenCount.innerText=taken;
missedCount.innerText=missed;

if(chart) chart.destroy();

chart=new Chart(document.getElementById("chart"),{

type:"doughnut",

data:{
labels:["Taken","Missed"],
datasets:[{data:[taken,missed]}]
}

});

}



function updateCountdown(){

let now=new Date();

let next=state.schedule.find(d=>new Date(d.time)>now);

if(next){

let diff=(new Date(next.time)-now)/1000;

let m=Math.floor(diff/60);
let s=Math.floor(diff%60);

countdown.innerText=m+":"+String(s).padStart(2,"0");

}

}

setInterval(updateCountdown,1000);



function reminder(){

let now=new Date();

state.schedule.forEach(d=>{

let diff=(new Date(d.time)-now)/60000;

if(diff>14 && diff<16){

alert("Reminder: "+d.medicine+" dose in 15 minutes");

}

});

}

setInterval(reminder,60000);


function generateReport(){

let total=state.schedule.length;

let taken=Object.values(state.logs).filter(x=>"taken").length;

let missed=Object.values(state.logs).filter(x=>"missed").length;

let adherence=((taken/total)*100||0).toFixed(1);

reportContent.innerText=

"Patient: "+patientName.value+
"\nTotal Doses: "+total+
"\nTaken: "+taken+
"\nMissed: "+missed+
"\nAdherence: "+adherence+"%";

}

function downloadReport(){

let blob=new Blob([reportContent.innerText]);

let a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="Medication_Report.txt";

a.click();


}
