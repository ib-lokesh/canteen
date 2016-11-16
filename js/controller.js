angular.module('constants', []).constant(
        'config',
            {
                site_url:'http://172.16.2.115/canteen/',
                service_url:'http://172.16.2.115/canteen/service.php'
            }
        );
    
var app = angular.module('canteenapp', ['ngRoute','constants','ngCookies']);
app.config(function ($routeProvider) {
    $routeProvider

            // route for the home page
            .when('/', {
                templateUrl:  'template/home.html',
                controller: 'home'
            })
             .when('/login', {
                templateUrl:  'template/login.html',
                controller: 'login'
            })
        .when('/menu', {
                templateUrl:  'template/menu.html',
                controller: 'menu'
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
app.controller('login', function($scope, config,$cookies,$location,commonService) {
               $scope.login_data = {
                    username: 'test@yopmail.com',
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
                if(response.status == 0){
                     //alert(response.status);
                     //console.log($scope.login_data);
                      $cookies.put('user_data', {email:$scope.login_data.email});
                      //console.log($cookies.get('user_data'));
                    $scope.is_authenticate  = response.message;
                    $location.path('/application');
                }else{
                    $scope.is_authenticate  = response.message;
                }
                //$scope.data = response;
                //console.log($scope.data);
            });
        };
});