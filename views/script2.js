var like=document.getElementById("btn1");
var unlike=document.getElementById("btn2");
var idlike=document.getElementById("like");
var idunlike=document.getElementById("dislike");
var ul = document.querySelector("div");
var button=document.getElementById("enter");
var input = document.getElementById("userinput");
var a=0;
var b=0;c=0;
function inputLength() {
	return input.value.length;
}


like.addEventListener("click",function(){
{  
	idlike.innerHTML=1;
	idunlike.innerHTML=0;
	like.disabled=true;
	unlike.disabled=false;
}
});
unlike.addEventListener("click",function(){
	{
		idunlike.innerHTML=1;
		idlike.innerHTML=0;
		unlike.disabled=true;
		like.disabled=false;
	}
})



button.addEventListener("click", addListAfterClick);

function addListAfterClick() {
	if (inputLength() > 0) {
		createListElement();
	}
}

function createListElement() {
	var li = document.createElement("p");
	var lii=document.getElementById("in");
	li.style.fontSize='20px';
	li.style.width='600px';
	li.style.height='50px';
	li.style.marginRight='5px';
	li.style.marginTop='0px';
	li.style.marginBottom='0px';
    lii.hidden=false;
    li.appendChild(document.createTextNode(input.value));
	ul.appendChild(li);
	input.value = "";

	var btn = document.createElement("button");
	btn.style.float='right';
	btn.style.height='20px';
     btn.appendChild(document.createTextNode("Delete!"));
 		li.appendChild(btn);
 		btn.onclick = removeParent;
}

function removeParent(evt){
	evt.target.parentNode.remove();
}
