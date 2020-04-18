'use strict';


app.controller('loginCtrl',['$scope','$http',"UserService","$rootScope","$window",'toastr','$cookies','$cookieStore','$interval','$location',
 function($scope,$http,UserService,$rootScope,$window,toastr,$cookies,$cookieStore,$interval,$location) {
     $scope.token_update;
     $scope.reset;
     $scope.forgot;
     $scope.loginData = {};

     $scope.forgotPassword=function()
     {
      window.location.href="/forgot/password";
     }
     $scope.submit= function ()
      {
      //  console.log("enter login");
       var data = $scope.loginData;
       $http({
         method: 'POST',
         url: "/loginuser",
         data: data
       }).then(function (response) {
        //  console.log(response.data.status);
         if (response.data.status == 'success')
              {
               UserService.setCurrentUser(response.data.token);
               
              //  console.log(UserService);
              
              
               toastr.success("let's go in","Welcome");
              
               $window.location.href='/welcome' ;
              //  $scope.update_token=setInterval();
              
              }
         else
              { 
              toastr.error("your credentials are wrong","please try again");
              }
              
       });
       
     }//end login scope
    $scope.sendResetEmail=function(){
       console.log("er",$scope.forgot);
      $http({
        method:'POST',
        url:'/resetpwd/email/send',
        data:$scope.forgot,
        headers:{'Content-Type':'application/json'},
      }).then(function(response){
        console.log(response)
        if(response.data.status=='success'){
          window.location.href="/email/sent";
        }
        else{
          alert("error1");
          toastr.error('Email not Found');
        }
      });  
    }

     $scope.resetPassword=function(){
      var url=$location.absUrl().split('/');
      $scope.reset.token=url[url.length-1];
        $http({
          method:'POST',
          url:'/new',
          data:$scope.reset,
          headers:{'Content-Type':'application/json'},
        }).then(function(response){
          if(response.data.status=='success'){
            toastr.success('Password resetted successfully',{'timeout':10000});
            window.location.href="/login";
          }
          else{
            toastr.error('password mismatch')
          }
        });
    
      }//end resetPassword scope
      
    // // function good()
    // //  {
    // //   $scope.refresh_token();
    // //   if(!$scope.$$phase) {
    // //     //$digest or $apply
    // //     $scope.$apply();
    // //   }
      
      
    //    console.log("enjoy folks");
    //  }
// $interval(function(){$scope.refresh_token()},5000);
//     $scope.refresh_token=function(){
//       $scope.token1=window.localStorage['token'];
//       console.log("token1",$scope.token1);
//       $scope.split_token=$scope.token1.split(" ");
//       console.log("splitted one",$scope.split_token[1]);
//       console.log("ser");
//        $http({
//          method:'POST',
//          url:'/api-token-refresh/',
//          data:{"token":$scope.split_token[1]},
//          headers:{'Content-Type':'application/json'},
//        }).then(function (response){
//          if (response.status==200)  {
//         //  var token1=JSON.stringify(response.data)
           
//         console.log('cookie',response.data.token);
//         $cookies.cookie=response.data.token;
//            console.log("successfully updated token");
//          }
//          else
//          {
//           console.log("failed to update token");
//          }
//        });
//     }//end refresh scope
   }
   ]);
   app.controller('logoutController',['$scope','$window','$cookieStore',function($scope,$window,$cookieStore){

   $scope.logout=function()
   {
    localStorage.clear();
    $cookieStore.remove("cookie");
    $window.location.href="/login";
   }
  }
  ]);