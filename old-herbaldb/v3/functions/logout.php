<?php
    session_start();
    include 'functions.php';
    
    $use_id         = $_SESSION['use_id'];
    $last_logout    = date("d-m-Y-g:i-a");
    $last_ip        = $_SERVER[REMOTE_ADDR];

    mysql_query("update users set use_last_login_date='$last_logout', use_last_login_ip='$last_ip' where use_id='$use_id'");
    session_destroy();    
    header ("location: ../index.php?v=login&msg=loggedout");

?>