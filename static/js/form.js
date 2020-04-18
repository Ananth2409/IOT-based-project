'use strict';
app.controller('myCtrl',['$scope','$http','$location', 'Upload','$window','$state',"toastr",
function ($scope, $http,  $location , Upload,$window,$state,toastr)
 {
  // alert(baseurl)

  $scope.box={};
  // notify({
  //   message: "message",
  //   classes: 'alert-danger',
  //   duration: 0
  //  });
 
  // $scope.box.colors=[];
  // $scope.box.dimension=[];
  //$scope.box.patterns=[];

  // $scope.setcolors=function()
  //    {
  //      var color={ name:"#000"};
  //      $scope.box.colors.push(color);
  //      console.log($scope.box.colors);
  //    }
  // $scope.setcolors();

  // $scope.removeColor=function(x)
  //     {
  //       if($scope.box.colors.length>1)
  //       {
  //         $scope.box.colors.splice(x,1);
  //       }
  //     }

  //   $scope.fileformat=function(file)
  //   {
  //      console.log(file);
  //      var index=file.name.split(".");
    
  //     if(file.name.split(".")[index.length-1] != "png")
  //     {
  //     alert("upload a valid png file");
  //     return false;
  //     }
    
  //   }
      
  // $scope.setpattern=function()
  //      {
  //        var doll={};
  //        $scope.box.patterns.push(doll);
  //        console.log($scope.box.patterns);
  //       }
  //   $scope.setpattern();
    
  // $scope.removePattern=function(x)
  //   {
  //     if($scope.box.patterns.length>1)
  //     {
  //      $scope.box.patterns.splice(x,1);
  //     }
  //   }

  // $scope.setdimen=function()
  //   {
  //     var obj={};
  //     $scope.box.dimension.push(obj);
  //   }    
  //     $scope.setdimen();

  $scope.submit = function()
  {
    $http ({
    method: 'post', 
    url: '/create', 
    data: $scope.box
  }).then(function(response) 
        {
          $scope.response = response.data;
          if($scope.response.status =="success")
            { toastr.clear();
              toastr.success('Hello world!', 'Toastr fun!');
              $state.go("dataview");
                  // $window.location.href=baseurl +  'asset/assetlist' ;
                // $window.location.href='/welcome' ;
               
            }
          else 
          {
             notify({
                   message: $scope.response.message,
                   classes: 'alert-danger',
                   duration: 2000
                  });
          }

        });
  }

  // $scope.addData = function()
  //  {
  //  var dis="create";
  //  $window.location.href=dis;
  //  }

  // $scope.submit = function() 
  // {
  //   console.log($scope.box);
  //   if ($scope.box.model || $scope.box.patterns || $scope.box.image_url)
  //    {
  //      $scope.upload();
  //    }
  
  // };
  //   // $scope.uplaod($scope.file);
  //   $scope.upload = function () {
  //     // $scope.box.color="red";
  //      $scope.box.width=2;
  //       $scope.box.breadth=2;
  //        $scope.box.depth=2;

  //       Upload.upload({
  //           url: '/asset/create',
  //           data: $scope.box
  //       }).then(function (resp) {
  //           console.log(resp)
  //           console.log('Success' + resp.config.data + 'uploaded. Response: ' + resp.data);
  //           console.log(resp.data);
  //           if(resp.data.status =="success")
  //           {
  //               $scope.box.id=resp.data.id;
  //               $scope.Submit();
  //               //     $scope.list()
  //             // $window.location.href='/list' ;
  //             notify({
  //                     message: $scope.response.message,
  //                     classes: 'alert-success',
  //                     duration: 2000
  //                   });



  //           }

  
            
  //       }, function (resp) 
  //          {
  //           console.log('Error status: ' + resp.status);
  //             });
  //  }
   
 /* $scope.upload = function () 
  {
    Upload.upload({
      url: '/asset/create',
      data: $scope.box }).then(function (resp) 
        {
          console.log('Success' + resp.config.data + 'uploaded. Response: ' + resp.data);
          console.log(resp.data);
          if(resp.data.status =="success")
           {
            $scope.box.id=resp.data.id;
            $scope.Submit();
           }
            }, function (resp){ 
           console.log('Error status: ' + resp.status);
           }, function (evt) 
               {
                 var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                 console.log('progress: ' + progressPercentage + '% ' + evt.config.data);
                });
    };*/

//   $scope.removeDimension=function(x)
//     {
//       if($scope.box.dimension.length>1)
//       {
//          $scope.box.dimension.splice(x,1);
//       }
//     }
      
//   $scope.edit = function(data)
//  {
// var des="edit/" + data;
// $window.location.href=des;
// }

// $scope.getbyid = function()
//   {
//       var url=$location.absUrl().split('/');
//       console.log(url);
//       $scope.firstParameter=url[1];
//       $scope.secondParameter=url[2];
//       $scope.asset_id=url[4];
//       console.log("asset_id")
//       $http ({

//             method: 'get', 
//             url: 'asset/' + $scope.asset_id
//            }).then(function(response) 
//              {
//                console.log(response);
//                $scope.response=response.data;
//                if(response.status ==200)
//                  {   
//                    $scope.box=response.data.data;
//                    console.log($scope.box)
//                    notify({
//                       message: $scope.response.message,
//                       classes: 'alert-success',
//                       duration: 2000
//                       });
//                   } 
//                 else 
//                     {
//                       notify({
//                       message: $scope.response.message,
//                       classes: 'alert-danger',
//                       duration: 2000
//                        });
//                     }

//               });
//   }
  var array=[]
  $scope.list = function()
  {
    $http ({
            method: 'get', 
            url: '/create'
          }).then(function(response) 
              {
               $scope.response=response.data;
               $scope.datalist=response.data.data;
               if($scope.response.status =="success")
                {
                  toastr.success( 'Success');
                  
                }
                else 
                {
                 toastr.error('failed to load');
                }

              });
  }

  // $scope.update= function()
  // {
  //           $http ({
  //           method: 'post', 
  //           url: '/asset/edit', 
  //           data: $scope.list
  //         }).then(function(response) 
  //           {
  //             $scope.response = response.data;
  //             if($scope.response.status =="success")
  //              {
  //               notify({
  //                     message: $scope.response.message,
  //                     classes: 'alert-success',
  //                     duration: 2000
  //                   });

  //               }
  //             else 
  //                 {
  //                   notify({
  //                   message: $scope.response.message,
  //                   classes: 'alert-danger',
  //                   duration: 2000
  //                   });
  //                 } 

  //           });
  // }
  // console.log("id is passing")
  $scope.delete= function(id)
  {
    $http ({
    method: 'delete', 
    url: '/asset/' +id,
    data: id
          }).then(function(response) 
            {
              console.log(response.data)
              $scope.response=response.data;
              $scope.list();
              if($scope.response.status=="success")
                {
                  notify({
                      message: $scope.response.messages,
                      classes: 'alert-success',
                      duration: 2000
                    });
                 }
              else {
                    notify({
                    message: $scope.response.output,
                    classes: 'alert-danger',
                    duration: 2000
                    });
                   }

            });

  }



}]);


   
 

