'use strict';
app.controller('myUser', ['$scope', '$http', '$window', '$location', '$state', 'toastr', '$stateParams', 'UserService', function($scope, $http, $window, $location, $state, toastr, $stateParams, UserService) {
    $scope.reg = {};
    $scope.testform = false;
    var array = [];
    //projectlist-dropdown declaration
    $scope.projects = {};
    $scope.project_array = []
    $scope.projects.selectedProject = []
        // $scope.role = "admi";
    $scope.userlist = function() {
        $http({
            method: "get",
            url: "/createuser",
        }).then(function(response) {
            console.log(response);
            $scope.response = response.data;
            // var userdata = response.data.data;
            // var userdata_len=userdata.length;
            // console.log(userdata_len);
            // for (var i=userdata_len-1,j=0;i>=0;i--,j++)
            // {
            //     array[j]=userdata[i];
            // }
            // console.log(array);
            $scope.userlist = response.data.data;

            if ($scope.response.status == "success") {
                toastr.success("success");

            } else {
                toastr.error("something went wrong", "failure")

            }
        });
    }
    $scope.submitonce = function() {
        $scope.testform = true;
        $scope.register();

    }

    $scope.submitUser = function() {
        $scope.reg.project_id = [];
        var id = $stateParams.int;
        if (id) {
            $scope.reg.id = id;
            $scope.register();
        } else {
            $scope.register();
        }
    }

    $scope.register = function() {
        angular.forEach($scope.projects.selectedProject, function(value, obj) {
            $scope.reg.project_id.push(value.id)
        })
        $http({
            method: 'post',
            url: '/createuser',
            data: $scope.reg
        }).then(function f(response) {
            if (response.data.status = "success") {
                console.log("register success");
                toastr.success("successfully created", "success")
                $state.go("userview");

                //  $window.location.href='/welcome/#userlist' ;

            } else {
                console.log(response.data.status)
                toastr.error("something went wrong", "failure")
            }

        });
    }
    $scope.uservalue = function() {
        var get_id = $stateParams.int;
        if (get_id) {
            $scope.getUser(get_id);
        }
        // $scope.roledropdown();
    }
    var retrieveSelectedProject = function(data) {
        angular.forEach(data, function(value) {
            $scope.projects.selectedProject.push(value);

        })
    }

    $scope.getUser = function(get_id) {
        $http({
            method: "post",
            url: "/getuserbyid",
            data: { 'id': get_id },
        }).then(function f(response) {
            if (response.data.status == "success") {
                $scope.reg = response.data.data;
                retrieveSelectedProject($scope.reg.projects_id)
            } else {
                toastr.error("something went wrong", "failure", { maxOpened: 1 })
            }


        });
    }
    $scope.projectList = [];
    // $scope.setting1 = {
    //     scrollableHeight: '200px',
    //     scrollable: true,
    //     enableSearch: true
    // };

    // var vm = this;



    //   $scope.example2settings = {
    //     scrollableHeight: '200px',
    //     scrollable: true,
    //     enableSearch: false,
    //     externalIdProp: ''
    // };


    // $scope.people = [
    //     { name: 'Adam', email: 'adam@email.com', age: 12, country: 'United States' },
    //     { name: 'Amalie', email: 'amalie@email.com', age: 12, country: 'Argentina' },
    //     { name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
    //     { name: 'Adrian', email: 'adrian@email.com', age: 21, country: 'Ecuador' },
    //     { name: 'Wladimir', email: 'wladimir@email.com', age: 30, country: 'Ecuador' },
    //     { name: 'Samantha', email: 'samantha@email.com', age: 30, country: 'United States' },
    //     { name: 'Nicole', email: 'nicole@email.com', age: 43, country: 'Colombia' },
    //     { name: 'Natasha', email: 'natasha@email.com', age: 54, country: 'Ecuador' },
    //     { name: 'Michael', email: 'michael@email.com', age: 15, country: 'Colombia' },
    //     { name: 'Nicolás', email: 'nicolas@email.com', age: 43, country: 'Colombia' }
    // ];


    // $scope.multipleDemo = {};

    // $scope.multipleDemo.selectedPeople = [$scope.people[5], $scope.people[4]];


    angular.forEach($scope.projects.selectedProject, function(value, obj) {
        console.log("values ", value);
        console.log("v_id", value.id);
    })
    $scope.projectList = function() {
            $http({
                method: 'get',
                url: '/project/'
            }).then(function(response) {
                $scope.response = response.data;
                console.log("$scope.projects type is", typeof($scope.projects))
                if ($scope.response.status == "success") {
                    $scope.project_array = response.data.data;
                    toastr.success('Success');
                } else {
                    toastr.error('failed to load');
                }
            });
        }
        // $scope.delete=function(data)
        // {
        //   $http({
        //     method:,
        //     url:,
        //     data:{"id":data};

    //   })

    // }

    //   $scope.edit=function(data)
    //   {
    //     var edit_web_url="useredit/"+data;
    //     $window.location.href=edit_web_url;

    //   }


    //   $scope.getUser=function()
    //   {
    //     var split_url=$location.absUrl().split('/');
    //     console.log(split_url);
    //     var get_id=split_url.length-1;
    //     $scope.edit_id=split_url[get_id];
    //     $http({
    //       method:"get",
    //       url:"/usermanagement/"+$scope.edit_id,
    //       }).then (function (response)
    //       {   
    //           $scope.response=response.data;
    //           console.log(response.data)
    //           if($scope.response.status=="success")
    //           {   console.log("enter 200");
    //               $scope.reg=response.data.data;
    //               console.log($scope.reg);z
    //           }
    //           else
    //           {

    //           }
    //       })//end then function


    //   }//end getuser scope

    // $scope.delete=function(id)
    //   {
    //     $http(
    //     {
    //       method:"delete",
    //       url:"/usermanagement/"+id,
    //    }).then (function(response)
    //    {
    //     $scope.response=response.data;
    //     if (response.data.status=="success")
    //     {
    //        $window.location.href="/userlist"; 

    //     }
    //     else
    //     {

    //     }
    //    })


    //   }//end delete scope
    $scope.checkuser = function(username) {
        var get_id = $stateParams.int;
        if (get_id) {
            var data = { 'username': username, 'id': get_id };
        } else {
            var data = { 'username': username }
        }
        $scope.check(data);
    }
    $scope.check = function(data) {
        console.log(data);
        // data=$scope.reg.username;
        // console.log(data);
        $http({
            method: "post",
            url: "/checkusername",
            data: data,
        }).then(function(response) {
            if (response.data.status == "success") {
                $scope.validateUser = "username already exists";

            } else
            if (response.data.status == "failure") {
                // UserService.getCurrentUser();
                $scope.validateUser = "";
            }
        })


    }
    $scope.roledropdown = function() {
            $http({
                method: "get",
                url: "/getgroupdropdown",
            }).then(function(response) {
                if (response.data.status = "success") {
                    $scope.roledropdownlist = response.data.data;
                    $scope.reg.role = $scope.roledropdownlist;
                    console.log(response.data.data);
                } else {
                    toastr.error("something went wrong", "failure")
                }
            })
        }
        // end controller
}]);