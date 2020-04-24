//All of these variables must be set true in order for the button to be enabled
var nameValid = false;
var emailValid = false;
var usernameValid = false;
var passwordValid = false;
var passwordMatch = false;

//This functions ensures that both the 'First Name' and 'Last Name' have some value
function checkNames(){
  if(document.getElementById('firstName').value.length == 0 || document.getElementById('lastName').value.length == 0){
    document.getElementById('nameHelpBlock').innerHTML = "Please enter a first AND last name.";
    nameValid = false;
  }
  else{
    document.getElementById('nameHelpBlock').innerHTML = "";
    document.getElementById('firstName').classList.add('is-valid');
    document.getElementById('lastName').classList.add('is-valid')
    nameValid = true;
  }
}

//This function uses a regular expression to ensure the email is valid
function checkEmail(){
  var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var userEmail = document.getElementById('email');

  if(userEmail.value.match(regexEmail)){
    document.getElementById('emailHelpBlock').innerHTML = "Valid email!";
    document.getElementById('email').classList.remove('is-invalid');
    document.getElementById('email').classList.add('is-valid');
    emailValid = true;
  }
  else{
    document.getElementById('emailHelpBlock').innerHTML = "Invalid email - please re-enter your email address.";
    document.getElementById('email').classList.remove('is-valid');
    document.getElementById('email').classList.add('is-invalid');
    emailValid = false;
  }
}

//This function makes sure the 'Username' has some value
function checkUsername(){
  if(document.getElementById('usernameRegister').value.length == 0){
    document.getElementById('usernameHelpBlock').innerHTML = "Please enter a username!";
    document.getElementById('usernameRegister').classList.remove('is-valid');
    document.getElementById('usernameRegister').classList.add('is-invalid');
    usernameValid = false;
  }
  else{
    document.getElementById('usernameHelpBlock').innerHTML = "";
    document.getElementById('usernameRegister').classList.remove('is-invalid');
    document.getElementById('usernameRegister').classList.add('is-valid');
    usernameValid = true;
  }
}

//This function uses a regular expression to ensure the password meets the given criteria
//The criteria are: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
function checkPassword(){
  var regexPassword = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~@#\$%\^&\*_\-\+=`|{}:;!\.\?\"()\[\]]).{8,25})/;
  var userPassword = document.getElementById('passwordRegister');

  if(userPassword.value.match(regexPassword)){
    document.getElementById('passwordHelpBlock').innerHTML = "Your password meets all criteria!";
    document.getElementById('passwordRegister').classList.remove('is-invalid');
    document.getElementById('passwordRegister').classList.add('is-valid');
    passwordValid = true;
  }
  else{
    document.getElementById('passwordHelpBlock').innerHTML = "Your password doesn't meet all criteria - you need at least 8 characters, one uppercase, one lowercase, one number, and one special character.";
    document.getElementById('passwordRegister').classList.remove('is-valid');
    document.getElementById('passwordRegister').classList.add('is-invalid');
    passwordValid = false;
  }
}

//This function makes sure that the 'Confirm Password' field is equal to the 'Password' field
function confirmPassword(){
  var confirmed = (document.getElementById('passwordRegister').value == document.getElementById('passwordConfirm').value);

  if(confirmed){
    document.getElementById('confirmHelpBlock').innerHTML = "Passwords match!";
    document.getElementById('passwordConfirm').classList.remove('is-invalid');
    document.getElementById('passwordConfirm').classList.add('is-valid');
    passwordMatch = true;
  }
  else{
    document.getElementById('confirmHelpBlock').innerHTML = "Passwords don't match - please re-type."
    document.getElementById('passwordConfirm').classList.remove('is-valid');
    document.getElementById('passwordConfirm').classList.add('is-invalid');
    passwordMatch = false;
  }
}

//If all criteria are met, the button becomes enabled
function enableButton(){
  if(nameValid && emailValid && usernameValid && passwordValid && passwordMatch){
    document.getElementById('submitButton').disabled = false;
  }
  else{
    document.getElementById('submitButton').disabled = true;
  }
}
