<?php
header('Access-Control-Allow-Origin: *');  
$servername = "localhost";
$username = "root";
$password = "infoserver123";
$dbname = "ib_canteen_snacks";

// Create connection
$conn = mysql_connect($servername, $username, $password);
// Check connection
if (!$conn) {
    die("Connection failed: " . mysql_error());
} 
mysql_selectdb($dbname,$conn);
$response = array();
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$action = isset($_REQUEST['action']) && !empty($_REQUEST['action']) ? $_REQUEST['action']:'';
$add = isset($_REQUEST['add']) && !empty($_REQUEST['add']) ? $_REQUEST['add']:'';


if(!empty($action)){
    switch($action)
    {
        case 'authenticate':
            $username = isset($request->username) && !empty($request->username) ? $request->username :'';
            $pass = isset($request->password) && !empty($request->password) ? md5($request->password) :'';
            if(!empty($username) && !empty($pass)){
                $sql = "select count(id) as found from users where username = '".mysql_real_escape_string($username)."' and password = '".mysql_real_escape_string($pass)."'";
                $result = mysql_query($sql);
                if (mysql_numrows($result) > 0) {
                $row = mysql_fetch_row($result);
                if(isset($row[0]) && $row[0] > 0){
                    $response['status'] = 1;
                 $response['message'] = 'Login successfully...';
                }
                }else{
                    $response['status'] = 0;
                    $response['message'] = 'Invalid credential';
                }
            }else{
                $response['status'] = 0;
                 $response['message'] = 'Missing param';
            }
            
            break;
        case 'getitems':
            $current_date = date('Y-m-d');
            if($add!=1){
  	          $sql = "select * from items where `is_checked`='1' ";
            }else{
               $sql = "select * from items ";
 	        }
            $result =  mysql_query($sql);
            $items = array();
            $i =0;
            while($row = mysql_fetch_array($result)){
                $items[$i]['item_name'] = $row['item_name'];
                $items[$i]['price'] = $row['price'];
                $items[$i]['selected'] = $row['is_checked'];

                $i++;
            }
            $response['status'] = 1;
            $response['items'] = $items;
            break;
        case 'additem':
            mysql_query('TRUNCATE TABLE items');
            if(!empty($request)){

               $sql = 'Insert into items (item_name,price,is_checked,date) values ';
               $current_date = date('Y-m-d');
               $data = '';
               //print_r($request);die;
                foreach($request as $r){
                    
                    $name = isset($r->item_name)?$r->item_name:'';
                    $amount = isset($r->price)?$r->price:'';
                    $selected = isset($r->selected)?$r->selected:'';

                    if(!empty($name) && !empty($amount)){
                        $data .= '("'.mysql_real_escape_string($name).'","'.mysql_real_escape_string($amount).'","'.$selected.'" , "'.$current_date.'"),';
                    }
                }
            }
            if(!empty($data)){
                $data = rtrim($data, ',');
                  $sql .= $data;
                 // echo $sql;die;
                  mysql_query($sql);
                  $response['status'] = 1;
                $response['message'] = 'Item added to menu';
            }
          
           // echo $sql; die;
            break;
    }
}else{
    $response['status'] = 0;
    $response['message'] = 'Invalid action';
}
echo  json_encode($response);
die;
?>