function validate() {
  var email = document.forms["myform"]["email"].value; 
  var pass = document.forms["myform"]["password"].value;
  ValidateEmail(email);
  
}
function ValidateEmail(email)
{
var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
if(email.match(mailformat))
{
return true;
}
else
{
alert("You have entered an invalid email address!");
return false;
}
}