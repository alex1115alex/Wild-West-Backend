//This function enables the button is both the username and password have some value
function enableButton(){
  if(document.getElementById('usernameLogin').value.length > 0 && document.getElementById('passwordLogin').value.length > 0){
    document.getElementById('signInButton').disabled = false;
  }
  else{
    document.getElementById('signInButton').disabled = true;
  }
}
