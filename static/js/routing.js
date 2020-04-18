// console.log("enter routing");
// app.config(function(
//         $routeProvider,
//         $locationProvider
        
//         ){
//             console.log("entered routing");
         
// $routeProvider
//     .when("/welcome",
//     {
//         templateUrl:"templates/welcome.html",
  
//     })
//     .when("/adddata",
//     {
//         templateUrl:"templates/form.html",
        
//     })
//     .when("/adduser",
//     {
//         templateUrl:"templates/user.html",
        
//     })
//     $locationProvider.html5Mode(true);

// })
// app.config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {
    
//     $ocLazyLoadProvider.config({
//       debug:false,
//       events:true,
//     });

//     $urlRouterProvider.otherwise('/dashboard/home');

//     $stateProvider
//       .state('dashboard', {
//         url:'/dashboard',
//         templateUrl: 'templates/form.html',
        
//     })
//       .state('dashboard.home',{
//         url:'/home',
//         controller: 'MainCtrl',
//         templateUrl:'templates/user.html',
        
//       })
      
//   }]);