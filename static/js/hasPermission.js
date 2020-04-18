// app.directive('hasPermission', function(permissions) {  
//     return {
//       link: function(scope, element, attrs) {
//         if(!_.isString(attrs.hasPermission)) {
//           throw 'hasPermission value must be a string'
//         }
//         var value = attrs.hasPermission.trim();
//         var notPermissionFlag = value[0] === '!';
//         if(notPermissionFlag) {
//           value = value.slice(1).trim();
//         }
  
//         function toggleVisibilityBasedOnPermission() {
//           var hasPermission = permissions.hasPermission(value);
//           if(hasPermission && !notPermissionFlag || !hasPermission && notPermissionFlag) {
//             element[0].style.display = 'block';
//           }
//           else {
//             element[0].style.display = 'none';
//           }
//         }
  
//         toggleVisibilityBasedOnPermission();
//         scope.$on('permissionsChanged', toggleVisibilityBasedOnPermission);
//       }
//     };
//   });
//   //permissions.js
//   // angular.module('newApp')  
//   app.factory('permissions', function($rootScope) {
//     var permissionList = [];
//     return {
//       setPermissions: function(permissions) {
//         permissionList = permissions;
//         $rootScope.$broadcast('permissionsChanged');
//       },
//       hasPermission: function (permission) {
//         permission = permission.trim();
//         return permissionList.some(item => {
//           if (typeof item.Name !== 'string') { // item.Name is only used because when I called setPermission, I had a Name property
//             return false;
//           }
//           return item.Name.trim() === permission;
//         });
//       }
//     };
//   });