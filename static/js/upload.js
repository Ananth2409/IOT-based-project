app.controller('uploadCtrl',['$scope','$http','$location', 'Upload','$window','$state',"toastr","ngDialog","$stateParams",
function ($scope, $http,  $location , Upload,$window,$state,toastr,ngDialog,$stateParams)
{
    $scope.saveFile = function() { 
        {
          $scope.upload($scope.file);
        }
      };
      $scope.upload = function (file) {
        Upload.upload({
            url: 'project/library',
            data: $scope.component
        }).then(function (response){
          $scope.response=response.data
          console.log("response",$scope.response)
          if ($scope.response.status=="success")
          {
            toastr.success("Saved successfullly "); 
            ngDialog.close();
            
          }
          else
          {
           toastr.error("something went wrong");
          }
          //$scope.getFormData()

          
       });
    
     }
     
    $scope.getTagList=function()
    {
    $http({
      method:"get",
      url:"tag/type",
    }).then (function f(response)
    {
      if (response.data.status=="success")
      {   
          $scope.tagType=response.data.data;
          console.log("tagtype",$scope.tagType);
      }
      else
      {
        toastr.error("something went wrong","failure",{maxOpened: 1}) 
      }
    });
  }

  $scope.getFormData=function()
    {
      console.log("called getform data")
    $http({
      method:"get",
      url:"project/library",
    }).then (function f(response)
    {
      if (response.data.status=="success")
      {   
          $scope.tagType=response.data.data;
          console.log("tagtype",$scope.tagType);
      }
      else
      {
        toastr.error("something went wrong","failure",{maxOpened: 1}) 
      }
      //WHITEBOARD.load("myID",{"width":w,"height":h,"position":"relative","top":0,"bottom":0},JSON.parse($scope.tagType));
    });
  }
  // $scope.getFormData=function()
  //  {
  //    $scope.project={
  //      "id":$stateParams.int,
  //      }
  //    console.log("getData")
  //    $http({
  //      method: 'PUT',
  //      url: "/project/",
  //      data:$scope.project
  //    }).then(function (response){
  //      console.log("getdata",response)
  //     $scope.response=response.data
  //     $scope.getData=response.data.data
  //     console.log("getdata",$scope.getData.project_design_json)
  //     WHITEBOARD.load("myID",{"width":w,"height":h,"position":"relative","top":0,"bottom":0},JSON.parse($scope.getData.project_design_json));
  //    });

  //  }


  






}])