'use strict';
app.controller('permissionCtrl',['$scope','$http',"UserService","$rootScope","$window",'toastr','$state','$stateParams',
   function($scope,$http,UserService,$rootScope,$window,toastr,$state,$stateParams) {

     $scope.permission = {};
     $scope.selectedList={};
     $scope.selectedAll='';
     $scope.roledropdown=function()
   { 
    $http(
      {
        method:"get",
        url:"/getgroupdropdown",
      }).then (function(response)
      {
        if(response.data.status="success")
        {
          $scope.roledropdownlist=response.data.data;
          console.log(response.data.data);
        }
        else
        {
          toastr.error("something went wrong","failure") 
        }
      })
   }
  //  $scope.attach_permission=function()
  //  {
  //   $scope.roledropdown();
  //   $scope.list();

  //  }
     $scope.submit= function ()
      {
       
       $http({
         method: 'POST',
         url: "/permission/create",
         data: $scope.permission,
       }).then(function (response) {
        $scope.response=response.data;
         if ($scope.response.status == 'success')
              {  toastr.clear();
                toastr.success("success");
                $state.go("permissionlist");
              }
         else ($scope.response.status  == 'failure')
              {  toastr.clear();
                // toastr.error("something went wrong","failure"); 
              }
       });
     }//end submit scope
   
     $scope.list=function()
     {
        console.log("PERMISSION list");
        $http({
            method:'GET',
            url:"permission/create",
        }).then(function(response){
            
            $scope.response=response.data;
            if ($scope.response.status == 'success')
            {
                $scope.permission_list=response.data.data;
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
     $scope.submit_from_attach = function () 
     {
     
      $scope.permission.selectedpermission=[];
      angular.forEach($scope.selectedList, function (selected, permission)
       {
           if (selected)
          {
            
            console.log(permission);
            $scope.permission.selectedpermission.push(permission);
            
          }      
       });
       console.log($scope.permission);
       $http({
        method:'POST',
        url:"attachmodule",
        data:$scope.permission,
       }).then(function(response)
       {  
        $scope.response=response.data;
        if ($scope.response.status == 'success')
        {
            $scope.permission=response.data.data;
            toastr.clear();
            toastr.success("success","module attached successfully");
            $state.reload();
        }
        else ($scope.response.status == 'failure')
        {   
          toastr.clear();
          toastr.error("something went wrong","failure"); 
        }
    })  
     }//end submit_from_attach
     
     $scope.checkAll=function()
     {
       
      if($scope.selectedAll)
      {
        $scope.selectedAll=true;
      }
      else{
        $scope.selectedAll=false;
      } 
       
        angular.forEach($scope.permission_list ,function(obj)
        {
            $scope.selectedList[obj.id]=$scope.selectedAll;
        });
      

     }
//getting permission for roles
     $scope.getPermission=function()
     {
       console.log($scope.permission.role_id);
      $http({
          method:"POST",
          url:"role/permissionvalue",
          data:{"id":$scope.permission.role_id},
          // headers: {
          //           'Content-Type': 'application/json'
          //         }
          }).then(function(response)
          {
            $scope.response=response.data;
            console.log($scope.response);
            $scope.selectedList={};
            if($scope.response.status=="success")
            { 
             
              for (var i=0;i<$scope.response.data.length;i++)
              {
                $scope.selectedList[$scope.response.data[i]["id"]] = true;
              }
              

          }

          })
      
      };  
      // $scope.ischecked=function()
      // { 
      //   $scope.nothing={};
      //   // $scope.data=data;
      //   $scope.data=[{
      //       "id": 28
      //     }, 
      //     {
      //       "id": 29
      //     }]
         
      // }
     

     $scope.permissionIdCheck=function()
  {
    var get_id=$stateParams.int;
    console.log(typeof(get_id))
    if (get_id)
    {
      $scope.getPermissionById(get_id);
    }
    // $scope.roledropdown();
  }
  
  $scope.getPermissionById=function(get_id)
  { 
    $http({
      method:"put",
      url:"permission/create",
      data:{'id':get_id},
    }).then (function f(response)
    {
      if (response.data.status=="success")
      {   
          $scope.permission=response.data.data;
      }
      else
      {
        toastr.error("something went wrong","failure",{maxOpened: 1}) 
      }
      
  
    });
   }//end getrole
   $scope.delete=function(data)
  {
    $http({
      method:"delete",
      url:"/permission/create",
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
  