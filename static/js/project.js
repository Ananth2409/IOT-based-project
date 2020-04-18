'use strict';

app.controller('projectCtrl',['$scope','$http','$location', 'Upload','$window','$state',"toastr","ngDialog","$stateParams",'$templateCache','$cookieStore','$cookies','$interval',
function ($scope, $http,  $location , Upload,$window,$state,toastr,ngDialog,$stateParams,$cookieStore,$cookies,$interval)
 {
    
    
  $scope.current_page="1";
  $scope.previous_page=null;
  $scope.next_page=null;
  $scope.num_pages = null;
  $scope.new_comp={};
  $scope.select="";
  $scope.items_per_page=1;
  $scope.show_paginate=true;
  $scope.component = {
    status_on_email: false,
    status_on_sms: false,
    status_off_email:false,
    status_off_sms:false
  }
$scope.project={};
$scope.clickToOpen = function () 
{
  ngDialog.open({ templateUrl: 'static/templates/project.html',
      className: 'ngdialog-theme-default',
      height: 400,
      scope:$scope,
      controller:"projectCtrl",
  });
}



// $(document).ready(function(){
//   $('#hide_data').on('click', function () {
//     $("input").html("");
//   });
 


// });

$scope.openModal=function(data)
{

  if(data)
  {
    $scope.editproj(data);
  }
  else
  {
    $scope.project="";
  }
   $('#smallModal').modal('show');
}
$scope.savePost=function()
{
  //console.log("ghg",$scope.project.name);
  $http({
    method: 'POST',
    url: "/project/",
    data: $scope.project,
    headers: {
              'Content-Type': 'application/json'
            }
    
  }).then(function (response) {
  $scope.response=response.data;
  if ($scope.response.status == 'success'){ 
          $("#smallModal").modal("hide");
          $(".modal-backdrop").remove();             
          toastr.success("success","successfullly created project");
          $state.reload();
          
        }
    else 
        {  
          toastr.error("something went wrong","failure"); 
        }
  });


}
$scope.dialogClose=function(data)
{
  if(data){
    $scope.checkDuplicateProjectName(data);
  } 
}
  $scope.checkDuplicateProjectName=function(data)
  {
    $http({
      method: 'POST',
      url: "/project/validate",
      data: {"project_name":data},
      headers: {
                'Content-Type': 'application/json'
              }
      
    }).then(function (response) {
     $scope.response=response.data;
     if (response.data.status=="success")
     {
       //console.log("project_name");
       $scope.project.validateProject="projectname already exists";
       
     }  
     else
      {       // UserService.getCurrentUser();
       $scope.project.validateProject="";
     } 
    });



  }

 
  $scope.submit = function()
  { 
    //console.log($stateParams.int);
    //console.log("submit")
    var whiteboard_content =JSON.stringify(WHITEBOARD.json());
    // var whiteboard_content = WHITEBOARD.json();
    //console.log("text")
    $scope.project={
      "id":$stateParams.int,
      "project_design_json": whiteboard_content,
      }
    $http({
        method: 'POST',
        url: "/project/",
        data: $scope.project
      }).then(function (response){
       $scope.response=response.data
       if ($scope.response.status=="success")
       {
         toastr.success("Saved successfullly "); 
         
       }
       else
       {
        toastr.error("something went wrong");
       }
    });

  }
$scope.editproj=function(data){
  
  if (data){
    $http({
      method: 'PUT',
      url: "/project/",
      data: {"id":data},
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response){
      
    $scope.response=response.data;
    // console.log("ds",$scope.response);
      if ($scope.response.status=="success"){
        $scope.project=response.data.data;     
      }
      else{
        toastr.error("data not found");
      }
    });
  }
 
  
}

$scope.delete_id=null;
 $scope.test=function(data){
  // $("#confirmDelete").modal();
  $("#confirmDelete").modal("show");
  
  $scope.delete_id=data;
 }

$scope.delete=function(){

  // console.log("id value",data);
  
var data=$scope.delete_id;
  if (data){
  $http({
    method: 'DELETE',
    url: "/project/",
    data: {"id":data},
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (response){
    if ($scope.response.status=="success"){
      $("#confirmDelete").modal("hide");
      $(".modal-backdrop").remove();    
      $state.reload();
      
      
    }
    else{
      toastr.error("data not found");
    }
  });
}




}
// var count=0;
// $scope.create_index=function(data){

//     for(var i=0;i<data.length;i++)
//     {
//       $scope.new_comp.index[i]=count+1;
//     }
//     //console.log($scope.new_comp);

// }
  // $scope.getData=function()  
  //   { 
  //     $scope.project={
  //       "id":$stateParams.int,
  //       }
  //     //console.log("getData")  
  //     $http({
  //       method: 'PUT',
  //       url: "/project//create",
  //       data:$scope.project
  //     }).then(function (response){
  //       //console.log("getdata",response)
  //      $scope.response=response.data
  //      $scope.getData=response.data.data
  //      //console.log("getdata",JSON.parse($scope.getData.project_design_json))
  //      WHITEBOARD.load("myID",{"width":w,"height":h,"position":"relative","top":0,"bottom":0},JSON.parse($scope.getData.project_design_json));
  //     });

    
  //   }
  //end submit scope
  //$scope.project={};
  //end submit scope
  //$scope.project={};

  // notify({
  //   message: "message",
  //   classes: 'alert-danger',
  //   duration: 0
  //  });
 
  // $scope.project.colors=[];
  // $scope.project.dimension=[];
  //$scope.project.patterns=[];

  // $scope.setcolors=function()
  //    {
  //      var color={ name:"#000"};
  //      $scope.project.colors.push(color);
  //      //console.log($scope.project.colors);
  //    }
  // $scope.setcolors();

  // $scope.removeColor=function(x)
  //     {
  //       if($scope.project.colors.length>1)
  //       {
  //         $scope.project.colors.splice(x,1);
  //       }
  //     }

  //   $scope.fileformat=function(file)
  //   {
  //      //console.log(file);
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
  //        $scope.project.patterns.push(doll);
  //        //console.log($scope.project.patterns);
  //       }
  //   $scope.setpattern();
    
  // $scope.removePattern=function(x)
  //   {
  //     if($scope.project.patterns.length>1)
  //     {
  //      $scope.project.patterns.splice(x,1);
  //     }
  //   }

  // $scope.setdimen=function()
  //   {
  //     var obj={};
  //     $scope.project.dimension.push(obj);
  //   }    
  //     $scope.setdimen();

//   $scope.submit = function()
//   {
//     $http ({
//     method: 'post', 
//     url: '/create', 
//     data: $scope.project
//   }).then(function(response) 
//         {
//           $scope.response = response.data;
//           if($scope.response.status =="success")
//             { toastr.clear();
//               toastr.success('Hello world!', 'Toastr fun!');
//               $state.go("dataview");
//                   // $window.location.href=baseurl +  'asset/assetlist' ;
//                 // $window.location.href='/welcome' ;
               
//             }
//           else 
//           {
//              notify({
//                    message: $scope.response.message,
//                    classes: 'alert-danger',
//                    duration: 2000
//                   });
//           }

//         });
//   }

  // $scope.addData = function()
  //  {
  //  var dis="create";
  //  $window.location.href=dis;
  //  }

  // $scope.submit = function() 
  // {
  //   //console.log($scope.project);
  //   if ($scope.project.model || $scope.project.patterns || $scope.project.image_url)
  //    {
  //      $scope.upload();
  //    }
  
  // };
  //   // $scope.uplaod($scope.file);
  //   $scope.upload = function () {
  //     // $scope.project.color="red";
  //      $scope.project.width=2;
  //       $scope.project.breadth=2;
  //        $scope.project.depth=2;

  //       Upload.upload({
  //           url: '/asset/create',
  //           data: $scope.project
  //       }).then(function (resp) {
  //           //console.log(resp)
  //           //console.log('Success' + resp.config.data + 'uploaded. Response: ' + resp.data);
  //           //console.log(resp.data);
  //           if(resp.data.status =="success")
  //           {
  //               $scope.project.id=resp.data.id;
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
  //           //console.log('Error status: ' + resp.status);
  //             });
  //  }
   
 /* $scope.upload = function () 
  {
    Upload.upload({
      url: '/asset/create',
      data: $scope.project }).then(function (resp) 
        {
          //console.log('Success' + resp.config.data + 'uploaded. Response: ' + resp.data);
          //console.log(resp.data);
          if(resp.data.status =="success")
           {
            $scope.project.id=resp.data.id;
            $scope.Submit();
           }
            }, function (resp){ 
           //console.log('Error status: ' + resp.status);
           }, function (evt) 
               {
                 var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                 //console.log('progress: ' + progressPercentage + '% ' + evt.config.data);
                });
    };*/

//   $scope.removeDimension=function(x)
//     {
//       if($scope.project.dimension.length>1)
//       {
//          $scope.project.dimension.splice(x,1);
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
//       //console.log(url);
//       $scope.firstParameter=url[1];
//       $scope.secondParameter=url[2];
//       $scope.asset_id=url[4];
//       //console.log("asset_id")
//       $http ({

//             method: 'get', 
//             url: 'asset/' + $scope.asset_id
//            }).then(function(response) 
//              {
//                //console.log(response);
//                $scope.response=response.data;
//                if(response.status ==200)
//                  {   
//                    $scope.project=response.data.data;
//                    //console.log($scope.project)
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
 $scope.func=function(data)
 {
   //console.log("got data",data);
   if(data=="unassign")
   {
    $scope.show_paginate=true;
     $scope.unAssign("1");
   }
   else if (data=="")
   {
    $scope.show_paginate=true;
    $scope.compList("1");
   }
  else
  {
    $scope.show_paginate=false;
  $http({
          method: 'POST',
          url: '/project/listcomponent',  
          data: {"project_id":data}
              }).then(function (response)
              {
                $scope.response=response.data;
                if ($scope.response.status=="success")
                {
                  $scope.new_comp=response.data.data;
                  toastr.success("Success"); 
                }
                else
                {
                  $scope.new_comp="";
                  toastr.error("Project doesn't have component ");
                }
              });
      }
 }
$scope.goToUPage=function(data)
{
  if($scope.select=="unassign")
  {
    $scope.unAssign(data);
  }
  else
  {
    $scope.compList(data);
  }
}
 $scope.unAssign=function(data)
 {
  $scope.current_page=data;
   $scope.items_per_page=3;
  $http ({
    method: 'get', 
    url: '/tag/unassign?page='+data+'&count='+$scope.items_per_page,
  }).then(function(response) 
      {
        $scope.response=response.data;
        
        if($scope.response.status =="success")
            {
              $scope.new_comp       = $scope.response.data;
              $scope.previous_page  = $scope.response.previous_page
              $scope.next_page      = $scope.response.next_page
              $scope.num_pages      = $scope.response.num_of_pages;
              // $scope.items_per_page = $scope.new_comp.length;
            }
            else 
            {
            toastr.error('failed to load unassign tag');
            }
      });
 }
 $scope.compList=function(data)
 {
  $scope.current_page=data;
   $scope.items_per_page=3;
  $http ({
                  method:'get',
                  url:'/project/listcomponent?page='+data+'&count='+$scope.items_per_page,
          }).then(function(response)  
          {
            $scope.response=response.data;
            if($scope.response.status =="success")
            {
            $scope.new_comp=response.data.data;
            $scope.previous_page=response.data.previous_page;
            $scope.next_page=response.data.next_page;
            $scope.num_pages      = $scope.response.num_of_pages;
            
              
              
             
            toastr.success( 'Success');
            }
            else 
            {
            toastr.error('failed to load');
            }
          });
 }

  $scope.list = function()
  {
    $http ({
            method: 'get', 
            url: '/project/'
          }).then(function(response) 
              {
                $scope.response=response.data;
                $scope.projectList=response.data.data;
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
  // $scope.gotoPage = function(page){
   
  //   $scope.selectPage = page.toString();
  //   $scope.current_page = page.toString();
  //   $scope.listComponent(page.toString());
  // }
  // $scope.listComponent=function(pgno='1')
  // {
   
  //       //console.log(pgno);
  //       if(typeof(pgno) != "string")
  //       $scope.current_page = pgno.selectPage.toString();
  //       else
  //       $scope.current_page = pgno.toString();
  //   $scope.typeOf=typeof($scope.current_page);
  //   //console.log("current_page values is ",$scope.current_page,$scope.typeOf);
    
  //   if (pgno!="none"){
  //       $http ({
  //               method:'get',
  //               url:'/project/listcomponent?page='+$scope.current_page+'&count=3',
  //       }).then(function(response)  
  //       {
  //         $scope.response=response.data;
  //         if($scope.response.status =="success")
  //         {
  //         $scope.new_comp=response.data.data;
  //         $scope.previous_page=response.data.previous_page;
  //         $scope.next_page=response.data.next_page;
  //         $scope.total_page=response.data.num_of_pages;
  //         $scope.items_per_page=$scope.new_comp.length;
          
            
            
           
  //         toastr.success( 'Success');
  //         }
  //         else 
  //         {
  //         toastr.error('failed to load');
  //         }
  //       });
  //   }
  // }
  
  // $scope.listComponent=function()
  // {
  //   var data={
  //     "component_name":"All_project"
  //   }
  //   $http ({
  //           method:'get',
  //           url:'/project/listcomponent'
  //   }).then(function(response)
  //   {
  //     $scope.response=response.data;
  //     if($scope.response.status =="success")
  //     {
  //     $scope.new_comp=response.data.data;
  //     // $scope.list_comp=response.data.data;
  //   //   angular.forEach($scope.list_comp,function(obj,selected)
  //   // {
      
     
  //   // });
  //   // //console.log($scope.new_comp_list);
  //     toastr.success( 'Success');
      
  //     }
  //     else 
  //     {
  //     toastr.error('failed to load');
  //     }
  //   });
  // }

// $scope.prev_next_pg_no=function(data){
//   for (var i=0;i<data.length;i++)
//   {
//     if(data[i].previous_page!=undefined)
//     $scope.previous_page=data[i].previous_page.toString();
//     //console.log($scope.previous_page);
//     if(data[i].next_page!=undefined)
//     $scope.next_page=data[i].next_page.toString();
//     //console.log($scope.next_page);
//     $scope.total_page=data[i].number_of_pages;
//     break;
//   }
// }
//socket data
// var message;
var data=0;
var gauge_data=270;
var inc_data=0;
var startPoint=270;
var timer;
var idVar;
var array=[];
var arraylist=[];
var newarray=[150,90,48,75,35,10,0,200,150,30,70];
var newvar;
var startX;
var endX;
var startY;
var inc;
var single;
var final_data;
var global_obj;
var trend_data;
var ratioData;
  $(document).ready(function(){
    var socket = io.connect('http://127.0.0.1:4000');
    socket.on('connect', function(){ 
    });
    socket.on("project-"+$stateParams.int,function(message)
    {  
      var object = JSON.parse(message);
      var new_status_on;
      var new_status_off;
      for(i=0;i<STACK.figures.length;i++)
      {
        var text = STACK.figures[i].tagid;
        var obj = STACK.figures[i];
        if(parseInt(text)==parseInt(object.tag_id)){
          var componentlibrary_id=STACK.figures[i].componentLibraryId;
          if(object_data!=null){
            for(i=0;i<object_data.length;i++){
              if(object_data[i].id==componentlibrary_id)
              { 
                new_status_on=object_data[i].status_on;
                new_status_off=object_data[i].status_off;
                break;
              }
            }
          }
          var message=object.output;
          if(obj.name=="Image"){
            if(message==1)
            { 
              obj.primitives[0].setUrl(base_URL+"/"+new_status_on,base_URL+"/"+new_status_on);
            }else 
            { 
              obj.primitives[0].setUrl(base_URL+"/"+new_status_off,base_URL+"/"+new_status_off);
            }
          }
          else if(obj.name=="Circle"){
            if(message==0)
            {
              updateShape(obj.id,'style.fillStyle',"rgba(255,59,60)");
              updateShape(obj.id,'style.strokeStyle',"rgba(255,59,60)");
            }
            else
            {
              updateShape(obj.id,'style.fillStyle',"rgba(116,204,84)");
              updateShape(obj.id,'style.strokeStyle',"rgba(116,204,84)");
            }
          }
          else if(obj.name=="slider")
          {
            clearInterval(idVar);
            if(obj.properties!=null){
              if(obj.properties.minValue==0){
                var maxVal=obj.properties.maxValue;
                var minVal=obj.properties.minValue;
                var canvasHeight=400;
                var cal=maxVal/canvasHeight;
                final_data=((parseInt(message)-minVal)/cal);
                alert(final_data)
              }else{
                var maxVal=obj.properties.maxValue;
                var minVal=obj.properties.minValue;
                var canvasHeight=400;
                var cal=maxVal/canvasHeight;
                final_data=((parseInt(message)-minVal)/cal);
              }
            }else{
              final_data=parseInt(message);
            }
            if(Math.round(final_data)>data){
              idVar = setInterval(function(){
              change(1)}, 100);
            }else{
              inc_data=1;
              idVar = setInterval(function(){
              change(0)}, 100);
            }
            function change(direction){
              for(i=0;i<STACK.figures.length;i++)
              {
                var text = STACK.figures[i].tagid;
                var obj=STACK.figures[i];
                if(parseInt(text)==parseInt(object.tag_id)){
                  if(obj.name=="slider"){
                    updateShape(obj.id,'primitives.1.points.0.x',(obj.primitives[0].points[0].x)+20);
                    updateShape(obj.id,'primitives.1.points.1.x',(obj.primitives[0].points[1].x)-20);
                    updateShape(obj.id,'primitives.1.points.2.x',(obj.primitives[0].points[2].x)-20);
                    updateShape(obj.id,'primitives.1.points.3.x',(obj.primitives[0].points[3].x)+20);
                    if(direction==1)
                    {
                      updateShape(obj.id,'primitives.1.points.0.y',(obj.primitives[0].points[0].y)-data);
                      updateShape(obj.id,'primitives.1.points.1.y',(obj.primitives[0].points[1].y)-data);
                    }
                    else{
                      updateShape(obj.id,'primitives.1.points.0.y',((obj.primitives[0].points[0].y))-data);
                      updateShape(obj.id,'primitives.1.points.1.y',((obj.primitives[0].points[1].y))-data);
                    }
                    updateShape(obj.id,'primitives.1.points.2.y',(obj.primitives[0].points[2].y)+400);
                    updateShape(obj.id,'primitives.1.points.3.y',(obj.primitives[0].points[3].y)+400);
                    if (data == (Math.round(final_data))){
                      clearInterval(idVar)
                    } 
                    else if(direction==1){
                      data = data+1 ;
                    }
                    else if(direction==0)
                    {
                      data = data - inc_data;
                    }
                  }
                }
              }
            } 
          }
          else if(obj.name=="gauge"){
            alert("gauge")
            if(obj.properties!=null){
              if(obj.properties.minValue<=0 && obj.properties.maxValue>900){
                alert("first")
                var l_Val=obj.properties.maxValue;
                var s_Val=obj.properties.minValue;
                var a=parseInt(message);
                var d=180;
                ratioData=d*(a/l_Val);
                alert(ratioData)
              }else if(obj.properties.minValue>=0 && obj.properties.maxValue<900){
                alert("second")
                var l_Val=obj.properties.maxValue;
                var s_Val=obj.properties.minValue;
                var a=parseInt(message);
                var d=180;
                ratioData=d*((a-s_Val)/(l_Val-s_Val));
              }
              else if(obj.properties.minValue<0){
                alert("third")
                var l_Val=obj.properties.maxValue;
                var s_Val=obj.properties.minValue;
                var a=parseInt(message);
                var d=180;
                ratioData=d*(l_Val+(a))/(l_Val*2);
              }
            }
            else{
              alert("fourth")
              ratioData=parseInt(message);
            }
            clearInterval(timer);
            if(gauge_data<Math.round(ratioData)+startPoint){ 
              timer=setInterval(function(){
                gauge(2,object,ratioData)}, 100);
            }else{
              timer=setInterval(function(){
                gauge(1,object,ratioData)}, 100);
            }
            function gauge(arg,object,ratioData){
              for(i=0;i<STACK.figures.length;i++)
              {
               
                var text = STACK.figures[i].tagid;
                var obj=STACK.figures[i];
                if(parseInt(text)==parseInt(object.tag_id)){
                  if(obj.name == "gauge")
                  {
                    var getendpoint=Util.getEndPoint(obj.startdata,170,(Math.PI/180)*gauge_data);
                    console.log("getendpoint",getendpoint)
                    updateShape(obj.id,'primitives.60.endPoint',getendpoint);
                    if(gauge_data==Math.round(ratioData)+startPoint){
                      clearInterval(timer)
                    }else if(arg==2){
                      gauge_data=gauge_data+1;
                    }else if(arg==1){
                      gauge_data=gauge_data-1;
                    }   
                  }
                }  //if case
              }
            }//function close
          }//else if 
          else{
              function graph(){
                  var startX=obj.xValue;
                  var endX=obj.xValue+35;
                  var startY=(obj.yValue+(200-newarray[0]));
                  var counter = 0;
                  var limit = 1*4;
                  var loopChart = setInterval(function(){
                    for(i=63;i<obj.primitives.length;i++){
                      var p=obj.primitives[i].startPoint.x -= 5;
                      var q=obj.primitives[i].endPoint.x -= 5; 
                      var x=obj.xValue;
                      var y=obj.yValue+200;
                      if(x>obj.primitives[i].startPoint.x){
                        obj.primitives.splice(i,1);
                        i--;
                      }
                    }
                    draw();
                    if(counter>=limit)
                    {
                      clearInterval(loopChart);
                    }  
                    counter+=1;
                  },500);
              function finalizeChart(){
                  newarray=arraylist;
                  for(i=0;i<newarray.length;i++){
                      var start=new Point(startX,startY);
                      var endY=(obj.yValue+(200-newarray[i]));
                      var end=new Point(endX,endY);
                      var line=new Line(start,end);
                      startY=endY;
                      endX=endX+35;
                      startX=startX+35;
                      line.style.strokeStyle ="rgb(116,204,84)";
                      obj.addPrimitive(line);
                      draw();
                  };
              }
              finalizeChart();
              }
              if(obj.name=="trend"){
                if(parseInt(text)==parseInt(object.tag_id)){
                  var datalist=10;
                  var index=0;
                if(newarray.length>datalist){
                  var remove=newarray.length-datalist;
                  var x=obj.primitives;
                  x.splice(63);
                  newarray.splice(index,remove);
                  if(parseInt(message)>200){
                    var maxVal=obj.properties.maxValue;
                    var minVal=obj.properties.minValue;
                    var canvasHeight=200;
                    var cal=maxVal/canvasHeight;
                    trend_data=((parseInt(message)-minVal)/cal);
                    newarray.push(trend_data);
                    arraylist=newarray;
                    }else{
                    newarray.push(parseInt(message));
                    arraylist=newarray;
                    }
                  graph();
                }
                else
                {
                  if(parseInt(message)>200){
                    var maxVal=obj.properties.maxValue;
                    var minVal=obj.properties.minValue;
                    var canvasHeight=200;
                    var cal=maxVal/canvasHeight;
                    trend_data=((parseInt(message)-minVal)/cal);
                    newarray.push(trend_data);
                    arraylist=newarray;
                  }else{
                    newarray.push(parseInt(message));
                    arraylist=newarray;
                    }
                }
                }
              }else if(obj.name=="video"){
                if(parseInt(text)==parseInt(object.tag_id)){
                  obj.video_tag.src=message;
                }
              }
              else if(obj.name=="Text")
              { 
                console.log("text");
                if(parseInt(text)==parseInt(object.tag_id)){
                  updateShape(obj.id,'primitives.1.str',"RPM:"+parseInt(message));
                  updateShape(obj.id,'primitives.1.size',20); 
                }
              }
          }
          draw();
          
        }  
        
      }
      
    });
  });
  // function change(direction,object,final_data){
  //   for(i=0;i<STACK.figures.length;i++)
  //   {
  //     var text = STACK.figures[i].tagid;
  //     if(parseInt(text)==parseInt(object.tag_id)){
  //       if(obj.name=="slider"){
  //         updateShape(obj.id,'primitives.1.points.0.x',(obj.primitives[0].points[0].x)+20);
  //         updateShape(obj.id,'primitives.1.points.1.x',(obj.primitives[0].points[1].x)-20);
  //         updateShape(obj.id,'primitives.1.points.2.x',(obj.primitives[0].points[2].x)-20);
  //         updateShape(obj.id,'primitives.1.points.3.x',(obj.primitives[0].points[3].x)+20);
  //         if(direction==1)
  //         {
  //           updateShape(obj.id,'primitives.1.points.0.y',(obj.primitives[0].points[0].y)-data);
  //           updateShape(obj.id,'primitives.1.points.1.y',(obj.primitives[0].points[1].y)-data);
  //         }
  //         else{
  //           updateShape(obj.id,'primitives.1.points.0.y',((obj.primitives[0].points[0].y))-data);
  //           updateShape(obj.id,'primitives.1.points.1.y',((obj.primitives[0].points[1].y))-data);
  //         }
  //         updateShape(obj.id,'primitives.1.points.2.y',(obj.primitives[0].points[2].y)+400);
  //         updateShape(obj.id,'primitives.1.points.3.y',(obj.primitives[0].points[3].y)+400);
  //         if (data == (Math.round(final_data))){
  //           clearInterval(idVar)
  //         } 
  //         else if(direction==1){
  //           data = data+1 ;
  //         }
  //         else if(direction==0)
  //         {
  //           data = data - inc_data;
  //         }
  //       }
  //     }
  //   }
  // }
  // function gauge(arg,object,ratioData){
  //   for(i=0;i<STACK.figures.length;i++)
  //   {
  //     var text = STACK.figures[i].tagid;
  //     var obj=STACK.figures[i];
  //     if(parseInt(text)==parseInt(object.tag_id)){
  //       if(obj.name=="gauge"){
  //         updateShape(obj.id,'primitives.60.endPoint',Util.getEndPoint(obj.startdata,170,(Math.PI/180)*gauge_data));
  //         if(gauge_data==Math.round(ratioData)+startPoint){
  //           clearInterval(timer)
  //         }else if(arg==2){
  //           gauge_data=gauge_data+1;
  //         }else if(arg==1){
  //           gauge_data=gauge_data-1;
  //         }   
  //       }  //if case
  //     }
  //   }
  // }//function close
 
  $scope.getData=function()
   {
     $scope.project={
       "id":$stateParams.int,
       }
     //console.log("getData")
     $http({
       method: 'PUT',
       url: "/project/",
       data:$scope.project
     }).then(function (response){
       ////console.log("getdata",response)
      $scope.response=response.data
      $scope.getData=response.data.data
      ////console.log("getdata",$scope.getData.project_design_json)
      WHITEBOARD.load("myID",{"width":w,"height":h,"position":"relative","top":0,"bottom":0},JSON.parse($scope.getData.project_design_json));
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
          //console.log("tagtype",$scope.tagType);
      }
      else
      {
        toastr.error("something went wrong","failure",{maxOpened: 1}) 
      }
    });
  }
  $scope.saveFile = function() { 
    {
      $scope.upload($scope.file);
    }
  };
  $scope.upload = function(file) {
    //console.log("upload",$scope.component)
    Upload.upload({
        method:'POST',
        url: '/project/library',
        data: $scope.component
    }).then(function (response){
      $scope.response=response.data
      //console.log("response",$scope.response)
      if ($scope.response.status=="success")
      {
        toastr.success("Saved successfullly ");
        $("#largeModal").modal("hide");
        $("div").remove(".modal-backdrop");
        $state.reload() 
      }
      else
      {
       toastr.error("something went wrong");
      }
      //$scope.getStatusData()

      
   });

 }

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
 
// $scope.numberOfPages=function(total,count){
//   //console.log("number of pages",Math.ceil(10/3));
//   return (10);
// }
// $scope.currentPage=parseInt($stateParams.page);
// //console.log("page no is",$scope.currentPage);
// $scope.listCount=$stateParams.count;    
// $scope.nextPage=function(){
//   //console.log("nextpage",$scope.currentPage);
// $state.go('.',{page:$scope.currentPage+1,count:$scope.listCount});
// }
// $scope.previousPage=function(){
//       if($scope.currentPage==1)
//       {
//       $("#previous").css('pointer-events',none);
//       }
//     $state.go('.',{page:$scope.currentPage-1,count:$scope.listCount});
// }
  }
  $scope.submitTag= function ()
  
      {
       $http({
         method: 'POST',
         url: "/tag/",
         data: $scope.tag,
       }).then(function (response) {
        //console.log("qwerty")
        $scope.response=response.data;
         if ($scope.response.status == 'success')
              {  toastr.clear();
                toastr.success("success");
                //$state.reload();
              }
         else
              {  
                toastr.clear();
                // toastr.error("something went wrong","failure"); 
              }
            //console.log("response",$scope.response.data.id)
            tagCreate();
            updateShape(selectedFigureId,'tagid',$scope.response.data.id);  
       });
        document.getElementById("tagname").value="";
        document.getElementById("description").value="";
        document.getElementById("tagtype").value="";
     }//end submit scope
  
     $scope.closeTag= function()
     {  
      alert("hiiii")
      document.getElementById("tagname").value="";
      document.getElementById("description").value="";
      document.getElementById("tagtype").value="";
     }
  
  $scope.submitForm= function()
  {     
          alert("submitform")
          //$scope.config="";
          if ($scope.testform.$valid) {
            alert($scope.config);
          var obj = STACK.figureGetById(selectedFigureId);
          if(obj.name=="slider")
          {
            updateShape(obj.id,'properties',angular.copy($scope.config));
            //var cons=global_obj.properties.minValue;
            // for(i=1;i<=global_obj.primitives.length;i++)
            // {
            //     updateShape(selectedFigureId,'primitives.'+i+'.str',cons.toString());
            //     cons=cons+(global_obj.properties.maxValue/20);
            // }
            for(i=0;i<=STACK.figures.length;i++)
            {
              var slider_loop=STACK.figures[i];
              //var s_primitive=slider_loop.primitives;
              var slider_minvalue=obj.properties.minValue;
           // alert(slider_minvalue)
            //t_primitive.splice(52);
            ////console.log("t_primitives",s_primitive)
            for(j=44;j<obj.primitives.length;j++){
              var s_primitive=slider_loop.primitives[j];
              //console.log("tprimitive",s_primitive)
              if(slider_minvalue==0){
                updateShape(obj.id,'primitives.'+j+'.str',slider_minvalue.toString());
                slider_minvalue=slider_minvalue+(obj.properties.maxValue/20);
              }
              else if(slider_minvalue>0)
              {
                //console.log("greater zero")
                updateShape(obj.id,'primitives.'+j+'.str',slider_minvalue.toString());
                slider_minvalue=slider_minvalue+(obj.properties.maxValue-obj.properties.minValue)/20;
                //ceil_min_gauge=Math.round(min_gauge);

              }
            }
          }
          }
        else if(obj.name=="gauge")
        {
          //console.log("slidernot ")
        updateShape(obj.id,'properties',angular.copy($scope.config));
        for(i=0;i<STACK.figures.length;i++){
          var array=STACK.figures[i];
          var arr_loop=[];
          var min_gauge=obj.properties.minValue;
          //console.log("min_gauge",min_gauge)
          var ceil_min_gauge=obj.properties.minValue;
          for(var j=0;j<obj.primitives.length;j++)
          {
          var loop=obj.primitives[j];
              if(loop.oType=="OrdinaryText")
              {   
                  if(ceil_min_gauge==0){
                    alert(ceil_min_gauge==0,ceil_min_gauge<0)
                    updateShape(obj.id,'primitives.'+j+'.str',ceil_min_gauge.toString());
                    min_gauge=min_gauge+(obj.properties.maxValue/18);
                    ceil_min_gauge=Math.round(min_gauge);
                  }
                  else if(ceil_min_gauge>0)
                  {
                    updateShape(obj.id,'primitives.'+j+'.str',ceil_min_gauge.toString());
                    min_gauge=min_gauge+(obj.properties.maxValue-obj.properties.minValue)/18;
                    ceil_min_gauge=Math.round(min_gauge);
                  }
                  else if(ceil_min_gauge<0) 
                  {
                    updateShape(obj.id,'primitives.'+j+'.str',ceil_min_gauge.toString());
                    min_gauge=min_gauge+(obj.properties.maxValue)/9;
                    ceil_min_gauge=Math.round(min_gauge);
                    if(ceil_min_gauge==0){
                      ceil_min_gauge=ceil_min_gauge+(obj.properties.maxValue)/9;
                      ceil_min_gauge=Math.round(ceil_min_gauge);
                      updateShape(obj.id,'primitives.'+j+'.str',ceil_min_gauge.toString());
                    }
                  }
                  
            }
          }
        }
      }else if(obj.name=="trend")
      {
        //console.log("trend")
        //console.log("response",$scope.config);
        updateShape(obj.id,'properties',angular.copy($scope.config));
        for(i=0;i<STACK.figures.length;i++)
        {
          var trend_loop=STACK.figures[i];
          var t_primitive=trend_loop.primitives;
          var trend_minvalue=trend_loop.properties.minValue;
          //alert(trend_minvalue)
          //t_primitive.splice(52);
          //console.log("t_primitives",t_primitive)
          for(j=52;j<63;j++){
            var t_primitive=trend_loop.primitives[j];
            //console.log("tprimitive",t_primitive)
            if(trend_minvalue==0){
            updateShape(obj.id,'primitives.'+j+'.str',trend_minvalue.toString());
            trend_minvalue=trend_minvalue+(obj.properties.maxValue/10);
            }
            else if(trend_minvalue>0)
            {
              //console.log("greater zero")
              updateShape(obj.id,'primitives.'+j+'.str',trend_minvalue.toString());
              trend_minvalue=trend_minvalue+(obj.properties.maxValue-obj.properties.minValue)/10;
              //ceil_min_gauge=Math.round(min_gauge);

            }
          }
        }

      }
    //}
  //}
   }
    // var form = document.getElementById("myform");
    // form.reset();
    document.getElementById("textfield1").value="";
    document.getElementById("description").value="";
    document.getElementById("minValue").value="";
    document.getElementById("maxValue").value="";
  }
  $scope.closeModal= function()
  {
    alert("close")
    document.getElementById("textfield1").value="";
    document.getElementById("description").value="";
    document.getElementById("minValue").value="";
    document.getElementById("maxValue").value="";
  }
}]);


   
 

