window.fbAsyncInit = function() {
  FB.init({
    appId      : '1057959741304725',
    cookie     : true,
    xfbml      : true,
    version    : 'v9.0'
  });

};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));



function fblogin(){
  FB.login(function(response){
    if (response.status === 'connected') {
      console.log(response);
      window.location.replace("http://localhost:3000/auth/fb/secretes")
    } else {
      console.log("Something Went Wrong");
    }
  }, {scope: 'email'} );
}

function fblogout(){
  FB.getLoginStatus(function(response){
    console.log(response);
    if(response.status === 'connected'){
      FB.logout();
      // FB.logout(function(response){
      //   console.log("Logged Out");
      // });
    }else{
      console.log("Not Logged In");
    }
  });
}

$(document).ready(function () {
  $('.bodyText').fadeOut(5000);
});
