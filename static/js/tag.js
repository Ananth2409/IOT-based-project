'use strict';
app.controller('tagCtrl',['$scope','$http',"UserService","$rootScope","$window",'toastr','$state','$stateParams',
   function($scope,$http,UserService,$rootScope,$window,toastr,$state,$stateParams) {

     $scope.tag = {};
     $scope.selectedList={};
     $scope.selectedAll='';
     $scope.tagType ={};
     $scope.items_per_page = 3;
     $scope.num_pages = null;
     $scope.previous_page = null;
     $scope.next_page = null;
     $scope.current_page = "1";
     console.log("type",typeof($scope.current_page));
//      $scope.roledropdown=function()
//    { 
//     $http(
//       {
//         method:"get",
//         url:"/getgroupdropdown",
//       }).then (function(response)
//       {
//         if(response.data.status="success")
//         {
//           $scope.roledropdownlist=response.data.data;
//           console.log(response.data.data);
//         }
//         else
//         {
//           toastr.error("something went wrong","failure") 
//         }
//       })
//    }
//   //  $scope.attach_tag=function()
//   //  {
//   //   $scope.roledropdown();
//   //   $scope.list();

//   //  }
     $scope.submit= function ()
      {
       $http({
         method: 'POST',
         url: "/tag/",
         data: $scope.tag,
       }).then(function (response) {
        $scope.response=response.data;
         if ($scope.response.status == 'success')
              {  toastr.clear();
                toastr.success("success");
                $state.go("tagList");
              }
         else ($scope.response.status  == 'failure')
              {  toastr.clear();
                // toastr.error("something went wrong","failure"); 
              }
       });
     }//end submit scope
   
     $scope.list=function(data)
     {
        console.log("tag list");
        $http({
            method:'GET',
            url:"/tag/?page="+data+"&count="+$scope.items_per_page,
        }).then(function(response){
            
            $scope.response=response.data;
            console.log("$scope.response.data")
            if ($scope.response.status == 'success')
            {
                $scope.tag_list       =$scope.response.data;
                $scope.previous_page  =$scope.response.previous_page
                $scope.next_page      =$scope.response.next_page
                $scope.num_pages      =$scope.response.num_of_pages;
                toastr.clear();
                toastr.success("success");
            }
            else
            {   
              toastr.error("something went wrong","failure"); 
            }
        })
      }//end list scope

      $scope.goToPage=function(data)
      {
        $scope.current_page=data;
        console.log("type",typeof($scope.current_page));
        $scope.list(data);
      }
//      $scope.submit_from_attach = function () 
//      {
     
//       $scope.tag.selectedtag=[];
//       angular.forEach($scope.selectedList, function (selected, tag)
//        {
//            if (selected)
//           {
            
//             console.log(tag);
//             $scope.tag.selectedtag.push(tag);
            
//           }      
//        });
//        console.log($scope.tag);
//        $http({
//         method:'POST',
//         url:"attachmodule",
//         data:$scope.tag,
//        }).then(function(response)
//        {  
//         $scope.response=response.data;
//         if ($scope.response.status == 'success')
//         {
//             $scope.tag=response.data.data;
//             toastr.clear();
//             toastr.success("success","module attached successfully");
//             $state.reload();
//         }
//         else ($scope.response.status == 'failure')
//         {   
//           toastr.clear();
//           toastr.error("something went wrong","failure"); 
//         }
//     })  
//      }//end submit_from_attach
     
//      $scope.checkAll=function()
//      {
       
//       if($scope.selectedAll)
//       {
//         $scope.selectedAll=true;
//       }
//       else{
//         $scope.selectedAll=false;
//       } 
       
//         angular.forEach($scope.tag_list ,function(obj)
//         {
//             $scope.selectedList[obj.id]=$scope.selectedAll;
//         });
      

//      }

//      $scope.gettag=function()
//      {
//        console.log($scope.tag.role_id);
//       $http({
//           method:"POST",
//           url:"role/tagvalue",
//           data:{"id":$scope.tag.role_id},
//           // headers: {
//           //           'Content-Type': 'application/json'
//           //         }
//           }).then(function(response)
//           {
//             $scope.response=response.data;
//             console.log($scope.response);
//             $scope.selectedList={};
//             if($scope.response.status=="success")
//             { 
             
//               for (var i=0;i<$scope.response.data.length;i++)
//               {
//                 $scope.selectedList[$scope.response.data[i]["id"]] = true;
//               }
              

//           }

//           })
      
//       };
//       // $scope.ischecked=function()
//       // { 
//       //   $scope.nothing={};
//       //   // $scope.data=data;
//       //   $scope.data=[{
//       //       "id": 28
//       //     }, 
//       //     {
//       //       "id": 29
//       //     }]
         
//       // }
     

     $scope.tagIdCheck=function()
  {
    var get_id=$stateParams.int;
    if (get_id)
    {
      $scope.getTagById(get_id);
    }
    // $scope.roledropdown();
  }
  
  $scope.getTagById=function(get_id)
  { 
    $http({
      method:"put",
      url:"/tag/",
      data:{'id':get_id},
    }).then (function f(response)
    {
      if (response.data.status=="success")
      {   
          $scope.tag=response.data.data;
      }
      else
      {
        toastr.error("something went wrong","failure"); 
      }
      
  
    });
   }//end getrole
   $scope.delete=function(data)
  {
    $http({
      method:"delete",
      url:"/tag/",
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
  $scope.getTagType=function()
  {
    $http({
      method:"get",
      url:"tag/type",
    }).then (function f(response)
    {
      if (response.data.status=="success")
      {   
          $scope.tagType=response.data.data;
          console.log($scope.tagType);
      }
      else
      {
        toastr.error("something went wrong","failure",{maxOpened: 1}) 
      }
    });
  }
}//end controller

]);
  