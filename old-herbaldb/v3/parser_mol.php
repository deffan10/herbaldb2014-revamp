<?php session_start();

    require_once 'functions/functions.php';
	
	$mol			= '1';	//	FOR CHANGE ONLY	
	$table			= 'contents';
	$field_updated	= 'con_file_mol'.$mol.'';
	$dir    		= 'mol/mol'.$mol.'/';

	if($mol==1) { $mol_ext = ''; $field_checked	= 'con_contentname'; } // 'con_contentname' for MOL1 or 'con_metabolite_id' for MOL2
	else if($mol==2) { $mol_ext = '2'; $field_checked	= 'con_metabolite_id'; } // 'con_contentname' for MOL1 or 'con_metabolite_id' for MOL2
	
	echo '<h1>MOL '.$mol.'</h1>';
			
	$files  = scandir($dir);
	$ii = 1;
	foreach($files as $key=>$filename) {
		if($key>1) {
			
			$ori_filename		= $filename;
			
			$arr_filename		= explode(".mol".$mol_ext."",$filename);
			$checked_filename	= $arr_filename[0];
			
			$sql_cek_exist = "select count(*) as n_all from ".$table." 
									where 
										".$field_checked." ='".$checked_filename."'";
			$q_cek_exist = dbSingleRow($conn,$sql_cek_exist);
			 
			echo $sql_cek_exist;
			if($q_cek_exist[n_all]<=0)
				failed_note($ii."Not Found. Gagal menambahkan data ".$filename." ke table ".$table.".<br>");
			else {
				$arr_data[$field_updated]	= htmlspecialchars($ori_filename, ENT_QUOTES);
				$update 					= dbUpdateRow($conn,$arr_data,$table," where ".$field_checked." ='".$checked_filename."'",'r');
				if($update) success_note($ii."Sukses menambahkan data ".$filename." ke table ".$table.".<br>");
				else failed_note($ii."Query Failed. Gagal menambahkan data ".$filename." ke table ".$table.".<br>");
			}
			$ii++;
		}
	}		
?>
