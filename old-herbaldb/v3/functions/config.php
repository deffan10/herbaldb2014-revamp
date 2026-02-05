<?php

define("_HOST","localhost");
define("_DB","herbaldb");
define("_USER","root");
define("_PASS","root");
define("_SPECIES_FILES_PATH","speciesfiles/");
define("_MOL1_FILES_PATH","mol/mol1/");
define("_MOL2_FILES_PATH","mol/mol2/");
define("_UPLOADED_FILES_PATH","uploadedfiles/");
define("_SPECIES_FILES_PATH","speciesfiles/");
define("_USER_FILES_PATH","userfiles/");
define("_ADMIN_EMAIL","marjuqi.rahmat@gmail.com");

define("SUCCESS_COLOR","#ccffcc");
define("FAILED_COLOR","#ffcccc");
define("_N_PERPAGES","20");

$conn = mysql_connect(_HOST, _USER, _PASS);
if (!$conn)
  	{
  		die('Could not connect: ' . mysql_error());
  	}

mysql_select_db(_DB,$conn);


?>
