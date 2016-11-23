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
        
        this.getMenu = function($cookies){
            var dropdown_menu = [];
            dropdown_menu.push({'menu':{'href':'menu','label':'Menu'}});
            if($cookies.get('user_data')){
                dropdown_menu.push({'menu':{'href':'logout','label':'Logout'}});
                
            }else{
                dropdown_menu.push({'menu':{'href':'login','label':'Login'}});           
            }
            console.log(dropdown_menu);
          
            return dropdown_menu;
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

app.controller("additem", function ($scope, config,$cookies,$location,commonService) {
      //$scope.item_data = {};
      if(!$cookies.get('user_data')){
        $location.path('/');
      }      
      $scope.dropdown_menu =  commonService.getMenu($cookies);

        $scope.insertData = function() { 
            //console.log($scope.personalDetails);
            var request_header = {
                url: config.service_url + '?action=additem',
                method: 'POST',
                data:$scope.personalDetails
            };
            commonService.getData(request_header).then(function(response) {
                
                if(response.status == 1){
                
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
                'fname': "", 
                'lname': "",
                'selected':"",
            });
        };

        $scope.remove = function(){
            var newDataList=[];
            $scope.selectedAll = false;
            angular.forEach($scope.personalDetails, function(selected){
                if(!selected.selected){
                    newDataList.push(selected);
                }
            }); 
            $scope.personalDetails = newDataList;
        };
});

app.controller("menu", function ($scope, config,$cookies,$location,commonService) {             
        
         var request_header = {
                url: config.service_url + '?action=getitems',
                method: 'POST',
                data:$scope.item_data
            };
            commonService.getData(request_header).then(function(response) {                
                if(response.status == 1){
                    $scope.items = response['items'];
                }else{
                    $scope.is_authenticate  = response.message;
                }
                //$scope.data = response;
                //console.log($scope.data);
            });        
               
});