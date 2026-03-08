const state={
schedule:[],
logs:{},
alerts:[]
};

/* LOGIN */

function login(){

if(username.value && password.value){

loginPage.style.display="none";
navbar.style.display="flex";

showPage("prescription");

}else{

alert("Enter login details");

}

}


/* NAVIGATION */

function showPage(id){

document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));

document.getElementById(id).classList.add("active");

}



/* ADD MEDICINE */

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



/* CREATE SCHEDULE */

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

medicine:m.name,
dose:m.dose,
time:t

});

}

});

renderCalendar();

showPage("calendarPage");

}



/* CALENDAR */

function renderCalendar(){

calendar.innerHTML="";

let days={};

state.schedule.forEach(d=>{

let date=new Date(d.time).toDateString();

if(!days[date]) days[date]=[];

days[date].push(d);

});


Object.keys(days).forEach(day=>{

let div=document.createElement("div");

div.className="day upcoming";

div.innerText=new Date(day).getDate();

div.onmouseover=()=>{

let html="<b>"+day+"</b><br><br>";

let meds={};

days[day].forEach(m=>meds[m.medicine]=m.dose);

Object.keys(meds).forEach(m=>{

html+=m+" — "+meds[m]+" mg<br>";

});

hoverDetails.innerHTML=html;

};

div.onmouseout=()=>hoverDetails.innerHTML="";

calendar.appendChild(div);

});

}



/* DASHBOARD CHART */

let chart;

function updateDashboard(){

let taken=Object.values(state.logs).filter(x=>x==="taken").length;

let missed=Object.values(state.logs).filter(x=>x==="missed").length;

taken.innerText=taken;

missed.innerText=missed;

if(chart) chart.destroy();

chart=new Chart(chart,{
type:"doughnut",
data:{
labels:["Taken","Missed"],
datasets:[{data:[taken,missed]}]
}
});

}



/* RISK DETECTION */

function detectRisk(){

let missed=Object.values(state.logs).filter(x=>x==="missed").length;

state.alerts=[];

if(missed>=3){

state.alerts.push("High risk: multiple doses missed");

}

renderAlerts();

}



/* ALERTS */

function renderAlerts(){

alerts.innerHTML="";

state.alerts.forEach(a=>{

let li=document.createElement("li");

li.innerText=a;

alerts.appendChild(li);

});

}



/* REPORT */

function renderReport(){

let total=state.schedule.length;

let taken=Object.values(state.logs).filter(x=>x==="taken").length;

let missed=Object.values(state.logs).filter(x=>x==="missed").length;

let adherence=((taken/total)*100||0).toFixed(1);

report.innerHTML=`

Patient: ${patientName.value}

Total Doses: ${total}

Taken: ${taken}

Missed: ${missed}

Adherence: ${adherence}%

`;

}



/* COUNTDOWN TIMER */

function updateCountdown(){

let now=new Date();

let next=state.schedule.find(d=>new Date(d.time)>now);

if(next){

let diff=(new Date(next.time)-now)/1000;

nextDose.innerText=Math.floor(diff/60)+"m";

}

}

setInterval(updateCountdown,1000);



/* REMINDER */

function reminder(){

let now=new Date();

state.schedule.forEach(d=>{

let diff=(new Date(d.time)-now)/60000;

if(diff>14 && diff<16){

alert("Reminder: "+d.medicine+" in 15 minutes");

}

});

}

setInterval(reminder,60000);