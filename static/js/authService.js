'use strict';
 app.service("UserService",function(store){
   console.log("userservices");
  var service=this;
  var string=null;
    var currentUser=null;
    service.setCurrentUser=function (user) {
      currentUser=user;
      console.log(user);
      localStorage.setItem('token', user);
      return currentUser;
      
    };
      service.getCurrentUser=function()
      {
        if(!currentUser)
        {
          currentUser=store.get('user');

        }
        return currentUser;
      };
})


// app.config(function($stateProvider, $urlRouterProvider, $httpProvider)
// {
//   console.log("intercept soemthindg")
//   /*$stateProvider
//     .state('logina',{
//       url: '/login',
//       templateUrl : 'login.html',
//       controller : 'login',
//       controllerAs : 'logina',
//     });*/
//   /*.state('dashboard',{
//     url:'/dashboard';
//
// */
//   $httpProvider.interceptors.push("APIInterceptor");
// })
// app.factory("APIInterceptor",function ($rootScope,UserService) {
//   var service=this;
//   service.request=function (config) {
//     var current_User=UserService.getCurrentUser();
//         console.log("access_token")
//         access_token=current_User ? current_User:null;//conditon ? value1:value2
//     if (access_token){
//       config.headers.authorization =access_token;
//
//     }
//     return config;
//   };
//   service.responseError=function (response) {
//     if (response.status === 401) {
//             $rootScope.$broadcast('unauthorized');
//         }
//         return response;
//   };
// })




