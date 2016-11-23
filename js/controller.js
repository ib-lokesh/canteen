angular.module('constants', []).constant(
        'config',
            {
                site_url:'http://172.16.7.112/canteen/',
                service_url:'http://172.16.7.112/canteen/canteen/service.php'
            }
        );
    
var app = angular.module('canteenapp', ['ngRoute','constants','ngCookies','ui.bootstrap']);
app.config(function ($routeProvider) {
    $routeProvider

            // route for the home page
            .when('/', {
                templateUrl:  'template/menu.html',
                controller: 'menu'
            })
             .when('/login', {
                templateUrl:  'template/login.html',
                controller: 'login'
            })
        .when('/menu', {
                templateUrl:  'template/menu.html',
                controller: 'menu'
            })        
        .when('/additem', {
                templateUrl:  'template/addmenu.html',
                controller: 'additem'
            });
        });


 app.service('commonService', function($http, $q) {
      
        var request_wrapper = {    
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        };
        this.getData = function(request) {
            request_wrapper.url = request.url;
            request_wrapper.method = request.method;
            request_wrapper.data = ((typeof request.data !== 'undefined' ) ? request.data : '');
            var deferred = $q.defer();
            $http(request_wrapper).success(function(data) {
                deferred.resolve(data);
            }).error(function(data) {
                alert("error");
               // console.log(data);
                deferred.reject();
            });
            return deferred.promise;
        };
        
        
    });


app.controller("home", ['$scope', function ($scope) {                
               
}]);
app.controller('login', function($scope, config,$cookies,$cookieStore,$location,commonService) {
               $scope.login_data = {
                    username: 'admin',
                    password: 'admin'
                };
               
               $scope.doLogin = function() { 
            var request_header = {
                url: config.service_url + '?action=authenticate',
                method: 'POST',
                data:$scope.login_data
            };
            commonService.getData(request_header).then(function(response) {
                //alert(response.status);
                $scope.is_authenticate  = '';
                if(response.status == 1){
                     //alert(response.status);
                     //console.log($scope.login_data);
                     //alert($scope.login_data.username);

                    $cookies.put('user_data', {username:$scope.login_data.username});
                    //  var obj = {username:$scope.login_data.username};
                    //  $scope.usingCookieStore = { "cookieStore.get" : $cookieStore.get('user_data'), 'cookies.dotobject' : $cookies.obj };
                    //  console.log($scope.usingCookieStore);
                    $scope.is_authenticate  = response.message;
                    $location.path('/additem');
                }else{
                    $scope.is_authenticate  = response.message;
                }
                //$scope.data = response;
                //console.log($scope.data);
            });
        };
});

app.controller("additem", function ($scope,$rootScope, config,$cookies,$location,commonService) {
      //$scope.item_data = {};
      $rootScope.addItemMsg = '';
       getAppMenu($rootScope,$cookies);
      if(!$cookies.get('user_data')){
        $location.path('/');
      }      
     // $scope.dropdown_menu =  commonService.getMenu($cookies);

        $scope.insertData = function() { 
            //console.log($scope.personalDetails);
            var request_header = {
                url: config.service_url + '?action=additem',
                method: 'POST',
                data:$scope.personalDetails
            };
            commonService.getData(request_header).then(function(response) {
                if(response.status == 1){
                    $rootScope.addItemMsg = 'Items Updated SuccessFully.';
                }else{
                    $scope.is_authenticate  = response.message;
                }
            });
        };   
        
        var request_header = {
                url: config.service_url + '?action=getitems&add=1',
                method: 'POST',
                data:$scope.item_data
            };
        commonService.getData(request_header).then(function(response) {                
            if(response.status == 1){
                $scope.items = '';
                $scope.personalDetails = response['items'];

                angular.forEach($scope.personalDetails, function(value, key) {
                    angular.forEach(value, function(value1, key1) {
                        if(key1=='selected' && value1=='1'){
                            $scope.personalDetails[key].selected=true;
                        }
                    });
                });

            }else{
                $scope.is_authenticate  = response.message;
            }
            //$scope.data = response;
            //console.log($scope.data);
        }); 

     

        $scope.addNew = function(personalDetail){
            // alert("hii addNew"); 
            $scope.personalDetails.push({ 
                'item_name': "", 
                'price': "",
                'selected':"",
            });
        };

        $scope.remove = function(item){
            var newDataList=[];
            $scope.selectedAll = false;
            var index = $scope.personalDetails.indexOf(item);
            $scope.personalDetails.splice(index, 1); 

            /*angular.forEach($scope.personalDetails, function(selected){
                if(!selected.selected){
                    newDataList.push(selected);
                }
            });*/ 
            //$scope.personalDetails = newDataList;
        };
});

app.controller("menu", function ($scope,$rootScope, config,$cookies,$location,commonService) {             
          //$scope.dropdown_menu =  commonService.getMenu($cookies);
           getAppMenu($rootScope,$cookies);
         var request_header = {
                url: config.service_url + '?action=getitems',
                method: 'POST',
                data:$scope.item_data
            };
            commonService.getData(request_header).then(function(response) {                
                if(response.status == 1){
                    //console.log(response['items']);
                    if (response['items'][0] != null) {
                        $scope.items = response['items'];
                    }else{
                        $scope.msg = 'No Items Added Yet.'
                    }
                }else{
                    $scope.is_authenticate  = response.message;
                }
                //$scope.data = response;
                //console.log($scope.data);
            });        
               
});
getAppMenu = function($rootScope,$cookies){
    $rootScope.dropdown_menu = [];
            $rootScope.dropdown_menu.push({'click':'0','href':'menu','label':'Menu'});
            if($cookies.get('user_data')){
                $rootScope.dropdown_menu.push({'click':'0','href':'additem','label':'Add Items'},{'click':'1','href':'logout','label':'Logout'});
                
            }else{
                $rootScope.dropdown_menu.push({'click':'0','href':'login','label':'Login'});           
            }
};
app.controller("appmenu", function ($scope,$rootScope,$cookies,$location){
           
            getAppMenu($rootScope,$cookies);
            $rootScope.logOut = function(){        
                $cookies.remove('user_data');
                $location.url('/'); 
             };
           // console.log($scope.dropdown_menu);
});
