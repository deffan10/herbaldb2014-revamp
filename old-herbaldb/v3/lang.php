<?php session_start();

	if($_GET[val]=='id') {
		$_SESSION[mylang][key] = 'id';
	}
	else if($_GET[val]=='en') {
		$_SESSION[mylang][key] = 'en';
	}
	
	header("location: index.php?".$_GET[url]."");

?>