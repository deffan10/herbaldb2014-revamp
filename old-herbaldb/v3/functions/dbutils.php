<?php

require_once('config.php');

function autoinc ($table,$coloumn) {
    global $conn;
    //////////////////////////////////
    $q = "select max(".$coloumn.") as maxid from ".$table."";
    $qid = mysql_query($q,$conn);
    $rid = mysql_fetch_assoc($qid);
    $id = $rid['maxid']+1;      // implementation of autoincrement for coloumn = $coloumn on table = $table   
    //////////////////////////////////
    return $id;
}

function dbSingleObject($conn,$sql) {
	$rs = mysql_query($sql,$conn);
	if ($rs):
		$row = mysql_fetch_object($rs);
	endif;
	return $row;
}
function dbSingleRow($conn,$sql) {
	$output = array();
	$rs = mysql_query($sql,$conn);
	if ($rs):
		$row = mysql_fetch_assoc($rs);
		//if($row):
			$output = $row;
		//endif;
	endif;
	return $output;
}

function dbSingleField($conn,$sql) {
	$output = array();
	$rs = mysql_query($sql,$conn);
	if($rs):
	    while ($row = mysql_fetch_array($rs)) {
	        $output[] = $row[0];
	    }
	endif;
	return $output;
}

function dbSingleValue($conn,$sql) {
	$output = array();
	$rs = mysql_query($sql,$conn);
	if($rs):
	    while ($row = mysql_fetch_array($rs)) {
	        $output = $row[0];
	    }
	endif;
	return $output;
}

function dbSelectArray($conn,$sql) {
	$output = array();
	$rs = mysql_query($sql,$conn);
	if ($rs):
		while ($row = mysql_fetch_array($rs)) {
			$output[] = $row;
		}
	endif;
	return $output;
}

function dbSelectAssoc($conn,$sql) {
	$output = array();
	$rs = mysql_query($sql,$conn);
	if ($rs):
		while ($row = mysql_fetch_assoc($rs)) {
			$output[] = $row;
		}
	endif;
	return $output;
}

function dbQuery($conn,$sql) {
	$rs = mysql_query($sql,$conn);
	return $rs;
}

function dbCount($conn,$sql) {
	$rs = mysql_query($sql,$conn);
    if($rs):
	    $row = mysql_fetch_array($rs);
	    $output = $row[0];
	else:
		$output = 0;
	endif;
	return $output;
}

function dbShowFields($conn,$tblname) {
	$output = array();
	$sql = "SHOW FIELDS FROM $tblname";
	$rs = mysql_query($sql,$conn);
	if($rs):
	    while ($row = mysql_fetch_assoc($rs)) {
	        $output[] = $row['Field'];
	    }
	endif;
	return $output;
}

function dbShowCreateTable($conn,$dbmain,$tblname) {
	$sql = "SHOW CREATE TABLE $tblname";
	$rs = mysql_query($sql,$conn);
	if ($rs) {
		$row = mysql_fetch_assoc($rs);
		$output = $row[1];		
	} 
	return $output;
}

function dbFreeResult($rsResult) {
	return mysql_free_result($rsResult);
}

function dbClose($conn) {
	return mysql_close($conn);
}

function dbUpdateRow($conn,&$value_array,$table_name,$where,$q_or_r='r') {
	$query = 'UPDATE '.$table_name.' SET ';
	$delimiter = '';
	foreach ($value_array as $key=>$value) {
		if ($value === 0) {
			$values_list .= $delimiter."0";
		} else if ($value != "") {
			$value = htmlspecialchars($value, ENT_QUOTES);
			$query .= $delimiter.$key."='".$value."' ";
		} else
			$query .= $delimiter.$key."=null";
		$delimiter = ",";
	}
	$query .= " ".$where;
	$result = dbQuery($conn,$query);
	if($q_or_r=='q') $result = $query;
	return $result;
}
	
function dbInsertRow($conn,$value_array,$table_name,$q_or_r='r') {
	$columns_list = '';
	$values_list = '';
	$delimiter = '';
	foreach ($value_array as $key=>$value) {
		$columns_list .= $delimiter.$key;
		if ($value === 0) {
			$values_list .= $delimiter."0";
		} else  if ($value != "") {
			if($key=='id') $values_list .= $delimiter.$value;
			else {
				//$value = str_replace("'","\'",$value);
                //$value = htmlspecialchars($value, ENT_QUOTES);
				$values_list .= $delimiter."'".$value."'";
			}
		} else
			$values_list .= $delimiter."null";
		$delimiter = ",";
	}
	$query = 'INSERT INTO '.$table_name.' ('.$columns_list.') VALUES ('.$values_list.')';
	$result = dbQuery($conn,$query);
	if($q_or_r=='q') $result = $query;
	return $result;
}

function dbTransactionBegin($conn)
{
	return mysql_query($conn,"begin transaction");
}
function dbTransactionCommit($conn)
{
	return mysql_query($conn,"commit");
}
function dbTransactionRollBack($conn)
{
	return mysql_query($conn,"rollback");
}

?>