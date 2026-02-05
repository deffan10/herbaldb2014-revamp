<?
session_start();

    require_once 'functions.php';
    
    if(!empty($_POST['username'])){

                $sql = "select * from users where use_username='".$_POST['username']."' and use_password='".md5($_POST[password])."'";
                $r = dbSingleRow($conn,$sql);
                
                if($r==null)
                    header("location: ../index.php?msg=notregistered");
                else {
					if($r[use_is_active]!=1)
						header("location: ../index.php?msg=notactive");
						
					else {
						foreach($r as $key=>$data)
							$_SESSION[$key] = $data;
							
						$_SESSION[logged_in] = 1;
						$use_id         = $_SESSION['use_id'];
						$last_logout    = date("d-m-Y-g:i-a");
						$last_ip        = $_SERVER[REMOTE_ADDR];

						mysql_query("update users set use_last_login_date='$last_logout', use_last_login_ip='$last_ip' where use_id='$use_id'");
						header("location: ../index.php?msg=loggedin");
					}
                }
    }

    else if($_SESSION[logged_in]==1)
        echo 'You are now logged in. <a href="logout.php">Logout</a>';

?>