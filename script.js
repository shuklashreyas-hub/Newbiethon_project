let state={
user:null,
prescription:null,
doses:[],
logs:[]
}


function showPage(id){

document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"))

document.getElementById(id).classList.add("active")

updateWelcome()

}


function saveUser(){

let name=document.getElementById("username").value

if(name===""){
alert("Enter your name")
return
}

state.user={name}

save()

showPage("prescription")

}


function updateWelcome(){

if(state.user){

let el=document.getElementById("welcomeUser")

if(el){
el.innerText="Welcome "+state.user.name
}

}

}


function addPrescription(){

let drug=document.getElementById("drug").value
let dosage=document.getElementById("dosage").value
let frequency=parseInt(document.getElementById("frequency").value)
let duration=parseInt(document.getElementById("duration").value)
let start=new Date(document.getElementById("start").value)

state.prescription={drug,dosage,frequency,duration,start}

generateSchedule()

generateCalendar()

startReminder()

updateNextDose()

save()

}


function generateSchedule(){

let {frequency,duration,start}=state.prescription

state.doses=[]

for(let h=0;h<duration*24;h+=frequency){

let t=new Date(start)

t.setHours(start.getHours()+h)

state.doses.push({time:t,status:"pending"})

}

}


function updateNextDose(){

let now=new Date()

let next=state.doses.find(d=>new Date(d.time)>now && d.status==="pending")

if(!next){
document.getElementById("nextDose").innerText="No upcoming dose"
return
}

document.getElementById("nextDose").innerText=new Date(next.time).toLocaleString()

}


function logDose(){

let now=new Date()

let dose=state.doses.find(d=>d.status==="pending")

if(!dose) return

let diff=(now-new Date(dose.time))/60000

let status="missed"

if(diff<=10 && diff>=-10) status="taken"
else if(diff<=60) status="late"

dose.status=status

state.logs.push({time:now,status:status})

generateCalendar()

updateTimeline()

updateChart()

save()

}


function generateCalendar(){

let cal=document.getElementById("calendar")

cal.innerHTML=""

let today=new Date()

let year=today.getFullYear()
let month=today.getMonth()

let days=new Date(year,month+1,0).getDate()

for(let i=1;i<=days;i++){

let cell=document.createElement("div")

cell.className="day"

if(i===today.getDate()) cell.classList.add("today")

cell.innerHTML="<b>"+i+"</b>"

let doses=state.doses.filter(d=>{
let dt=new Date(d.time)
return dt.getDate()===i && dt.getMonth()===month
})

if(i===today.getDate()){

doses.forEach(d=>{

let med=document.createElement("div")

med.className="med"

med.innerText=
state.prescription.drug+" "+
new Date(d.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})

med.onclick=()=>logDose()

cell.appendChild(med)

})

}else{

if(doses.length>0){

let count=document.createElement("div")

count.className="med"

count.style.background="#3498db"

count.innerText=doses.length+" doses"

cell.appendChild(count)

}

}

cal.appendChild(cell)

}

}


function startReminder(){

setInterval(()=>{

let now=new Date()

state.doses.forEach(d=>{

let diff=(new Date(d.time)-now)/60000

if(diff<30 && diff>29) alarm("30 minute reminder")
if(diff<20 && diff>19) alarm("20 minute reminder")
if(diff<10 && diff>9) alarm("10 minute reminder")
if(diff<5 && diff>4) alarm("5 minute reminder")

})

},60000)

}


function alarm(msg){

document.getElementById("alarm").play()

alert(msg+" for "+state.prescription.drug)

}


function updateTimeline(){

let div=document.getElementById("timeline")

div.innerHTML=""

state.logs.forEach(l=>{

let item=document.createElement("div")

item.className="timeline-item"

item.innerText=l.status+" at "+new Date(l.time).toLocaleTimeString()

div.appendChild(item)

})

}


function updateChart(){

let taken=state.logs.filter(l=>l.status==="taken").length
let late=state.logs.filter(l=>l.status==="late").length
let missed=state.logs.filter(l=>l.status==="missed").length

new Chart(document.getElementById("chart"),{

type:"doughnut",

data:{
labels:["Taken","Late","Missed"],
datasets:[{
data:[taken,late,missed]
}]
}

})

}


function toggleDark(){
document.body.classList.toggle("dark")
}


function save(){
localStorage.setItem("medState",JSON.stringify(state))
}


function load(){
let data=localStorage.getItem("medState")
if(data) state=JSON.parse(data)
}

load()

generateCalendar()