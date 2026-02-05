<?php session_start();
	require_once 'functions/functions.php';
	unset($lang);
	if($_SESSION[mylang][key]!='en') $_SESSION[mylang][key] = 'id';
	$lang	=	$_SESSION[mylang][key];
	require_once 'lang_db.php';
	?>
<html>
<head>

<script langauge="javascript">
	function selectSpecies(id,name,f){
		window.close();
		if(f=='assignment') {
			opener.document.getElementById('div_spe_id_assignment').innerHTML = name;
			opener.document.parentform_assignment.spe_id_assignment.value = id;
		}
		if(f=='aliasname') {
			opener.document.getElementById('div_spe_id_aliasname').innerHTML = name;
			opener.document.parentform_aliasname.spe_id_aliasname.value = id;
		}
		if(f=='localname') {
			opener.document.getElementById('div_spe_id_localname').innerHTML = name;
			opener.document.parentform_localname.spe_id_localname.value = id;
		}
		if(f=='species_photos') {
			opener.document.getElementById('div_spe_id_species_photos').innerHTML = name;
			opener.document.parentform_species_photos.spe_id_species_photos.value = id;
		}
	}
</script>

</head> 

<?php


?>