'use strict';


var app = angular.module('newApp', ['angular-storage', 'ui.router', 'ngFileUpload', 'toastr', 'ngCookies', 'ngDialog', 'ngSanitize', 'ui.select']);
var baseUrl = window.location;
console.log(baseUrl);
app.controller('mainController', ['$scope', '$cookies', '$http', function($scope, $cookies, $http) {

    // 	console.log("welcome to mainCtrl");
    // 	setInterval(function(){
    // 		$scope.test();
    // 	  }, 5000)	

    //      $scope.test=function() {
    // 		$scope.token1=window.localStorage['token'];
    // 		$scope.split_token=$scope.token1.split(" ");			
    // 		$http({
    // 			method:'POST',
    // 			url:'/api-token-refresh/',
    // 			data:{"token":$scope.split_token[1]},
    // 			headers:{'Content-Type':'application/json'},
    // 		}).then(function (response){
    // 			if (response.status==200)  {	
    // 			console.log('cookie',response.data.token);
    // 			var token;
    // 			token="Bearer "+response.data.token;
    // 			$cookies.cookie=token;
    // 			console.log("successfully updated token");
    // 			}
    // 			else
    // 			{
    // 			console.log("failed to update token");
    // 			window.location.href="/login";
    // 			}
    // 		});

    //     }
    $scope.role = "";
    $scope.check_current_role = function() {
        $http({
            method: 'get',
            url: 'check/role'
        }).then(function(response) {
            $scope.response = response.data.data;
            if (response.data.status == 'success') {
                $scope.role = $scope.response.role_name;
                console.log("role is", $scope.role);
            } else {
                $scope.role = "";
            }
        });
    }
}]); //end main controller

var base_URL = window.location.origin;
console.log(app);
console.log("base", base_URL)

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {


    $stateProvider.state('test', {
        url: '/test',
        templateUrl: 'static/templates/test.html',
        controller: "testCtrl"

    })

    .state('projectList', {
            url: '/project/list',
            templateUrl: 'static/templates/projectList.html',
            controller: "projectCtrl"

        })
        .state('formspage', {
            url: '/forms',
            templateUrl: 'static/templates/forms.html',
            controller: "myCtrl"

        })
        .state('userpage', {
            url: '/user',
            templateUrl: 'static/templates/user.html',
            controller: "myUser"
        })
        .state('userview', {
            url: '/userview',
            templateUrl: 'static/templates/userlist.html',
            controller: "myUser"
        })
        .state('dataview', {
            url: '/dataview',
            templateUrl: 'static/templates/list.html',
            controller: "myCtrl"
        })
        .state('editpage', {
            url: '/edit/{int}',
            templateUrl: 'static/templates/user.html',
            controller: "myUser"


        })
        .state('rolecreate', {
            url: '/role/create',
            templateUrl: 'static/templates/role.html',
            controller: "roleCtrl"


        })
        .state('rolelist', {
            url: '/role/list',
            templateUrl: 'static/templates/rolelist.html',
            controller: "roleCtrl"


        })
        .state('roleEdit', {
            url: '/role/edit/{int}',
            templateUrl: 'static/templates/role.html',
            controller: "roleCtrl"


        })
        .state('permissionCreate', {
            url: '/permission/create',
            templateUrl: 'static/templates/permission.html',
            controller: "permissionCtrl"


        })
        .state('permissionEdit', {
            url: '/permission/edit/{int}',
            templateUrl: 'static/templates/permission.html',
            controller: "permissionCtrl"


        })
        .state('permissionlist', {
            url: '/permission/list',
            templateUrl: 'static/templates/permissionList.html',
            controller: "permissionCtrl"


        })
        .state('attachpermission', {
            url: '/permission/attachpermission',
            templateUrl: 'static/templates/attach_permission.html',
            controller: "permissionCtrl"
        })
        .state('tagForm', {
            url: '/tag/create',
            templateUrl: 'static/templates/tag.html',
            controller: "tagCtrl"
        })
        .state('tagList', {
            url: '/tag/list',
            templateUrl: 'static/templates/tagList.html',
            controller: "tagCtrl"
        })
        .state('tagEdit', {
            url: '/tag/edit/{int}',
            templateUrl: 'static/templates/tag.html',
            controller: "tagCtrl"


        })
        .state('mimicCreate', {
            url: '/mimic/create/{int}',
            templateUrl: 'static/templates/MIMIChtml/index.html',
            controller: "myUser"
        })
        .state('listComponent', {
            url: '/listcomponent',
            templateUrl: 'static/templates/componentList.html',
            controller: "projectCtrl",

        })


    // // app.config(function(toastrConfig) {
    // // 	console.log("entering toastr");
    // // 	angular.extend(toastrConfig, {
    // // 	  autoDismiss: true,
    // // 	  maxOpened: 1,
    // // 	  preventDuplicates: true,    

    // // 	});
    //   });


    // .state('root',
    // {
    // 	url:'/',
    // 	template:'<strong>you are at root ....click something else</strong',

    // });
    // .state('noroute',
    // {
    // 	url:'*path',
    // 	template:'<strong>no routes available</strong',

    //  });
    // $urlRouterProvider.otherwise("/");
    // app.controller('myctrl1',['$scope',function($scope)
    // {
    //     $scope.a=10;
    //     $scope.b=20;

    // }]);

}]);
app.config(function(toastrConfig) {
    angular.extend(toastrConfig, {

        maxOpened: 1,
        timeOut: 500,
        preventDuplicates: false,
        preventOpenDuplicates: false,
        target: 'body',

    });
});

//   app.run(function(permissions) {  
// 	permissions.setPermissions(permissionList);
//   });

//   angular.element(document).ready(function() {  
// 	$.get('/role', function(data) {
// 	  permissionList = data;
// 	  console.log(data);
// 	//   angular.bootstrap(document, ['newApp']);
// 	});
//   });