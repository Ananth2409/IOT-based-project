'use strict';
app.controller('roleCtrl',['$scope','$http',"UserService","$rootScope","$window",'toastr','$state','$stateParams',
   function($scope,$http,UserService,$rootScope,$window,toastr,$state,$stateParams) {

     $scope.role = {};
     $scope.submit= function ()
      {
       
       $http({
         method: 'POST',
         url: "/role",
         data: $scope.role,
       }).then(function (response) {
        $scope.response=response.data;
         if ($scope.response.status == 'success')
              {
                toastr.success("success");
                $state.go("rolelist");
              }
         else ($scope.response.status  == 'failure')
              { 
                toastr.error("something went wrong","failure"); 
              }
       });
     }//end submit scope
     $scope.list=function()
     {

        $http({
            method:'GET',
            url:"/role",
        }).then(function(response){
            console.log("role list");
            $scope.response=response.data;
            if ($scope.response.status == 'success')
            {
                $scope.role=response.data.data;
                toastr.clear();
                toastr.success("success");
            }
       else ($scope.response.status == 'failure')
            {   
              toastr.clear();
                toastr.error("something went wrong","failure"); 
            }
        })
     }//end list scope
     $scope.rolevalue=function()
  {
    var get_id=$stateParams.int;
    console.log(typeof(get_id))
    if (get_id)
    {
      $scope.getRole(get_id);
    }
    // $scope.roledropdown();
  }
  
  $scope.getRole=function(get_id)
  { 
    $http({
      method:"post",
      url:"/role/detail",
      data:{'id':get_id},
    }).then (function f(response)
    {
      if (response.data.status=="success")
      {   
          $scope.role=response.data.data;
      }
      else
      {
        // toastr.error("something went wrong","failure",{maxOpened: 1}) 
      }
      
  
    });
   }//end getrole
   $scope.delete=function(data)
  {
    $http({
      method:"delete",
      url:"/role",
      data:{"id":data},
      headers: {
        'Content-Type': 'application/json'
      }
        }).then(function f(response)
        {
          if (response.data.status=="success")
          {   
            toastr.success("success");
            $state.reload();
          }
          else
          {
            toastr.error("something went wrong","failure",{maxOpened: 1}) 
          }

        });

  }
  }//end controller
   ]);
  