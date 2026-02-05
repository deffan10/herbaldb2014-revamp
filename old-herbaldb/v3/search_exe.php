<?php session_start();
require_once 'functions/functions.php';

    //if($_SESSION[logged_in]==1) {
            
        foreach($_POST as $key=>$data)
            $_SESSION[search][$key] =   $data;
        
        header ("location: index.php?v=search");

    //}

?>