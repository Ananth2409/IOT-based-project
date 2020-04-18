'use strict';
//keep user login by adding token to the headers for the authorization when making every request or change one webpages to another page
app.config(['$interpolateProvider','$httpProvider',function($interpolateProvider,$httpProvider){
    $interpolateProvider.startSymbol('{$').endSymbol('$}');
    $httpProvider.interceptors.push('APIInterceptor');

}]);
app.factory('APIInterceptor',['$q','$location','$rootScope','$cookieStore',function($q,$location,$rootScope,$cookieStore){
    console.log("intercepting ");
     // console.log($cookieStore.get("cookie"));
    return {
     request: function (config) {
           if (window.localStorage['token']) {
            //console.log("asdf");

            config.headers['Authorization'] =  window.localStorage['token'];
            //console.log(config)
               return config;
            }
            else
            {
              alert("Session Expired.Please Login ...");
              window.location.href="/login";
            }
          // if ($cookieStore.get['cookie']) {
          //   console.log("asdf");

          //   config.headers['Authorization'] =  $cookieStore.get['cookie'];
          //   console.log(config)
          //      return config;
          //   }
          //   else
          //   {
          //     alert("Session Expired.Please Login ...");
          //     window.location.href="/login";
          //   }
        },
        response: function(response){
          //console.log(response);
          
          if(response.status==400 || response.status == 401)
          {
             alert("Session Expired.Please Login !!!");
             window.location.href="/login";

          }
          return response;

        },
        responseError: function(response) {
          //console.log(response);
          if(response.status == 500){
            alert("Something went wrong,Please try again");
          }else if(response.status == -1){
            alert("Network Error");
          }else if(response.status == 401)
          {
             alert("Session Expired.Please Login @");
              // window.location.href=baseurl+"/loginnow";
              window.location.href="/login";
          }
          else if(response.status==400)
          {
            alert("Session Expired.Please Login!");
            // window.location.href=baseurl+"/loginnow";
            window.location.href="login";
          }
          else{
             window.location.href="/login";
          }
            //alert("Session Expired.Please Login ...");
           // window.location.href=baseurl+"/login";
        }
    }
}]);
