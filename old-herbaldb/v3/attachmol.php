<?php
    require_once 'functions/functions.php';
	/*
	$dir    = 'mol/mol1/';
	$files  = scandir($dir);	
	//debug($dir);
	// MOL 1
	
		foreach($files as $key=>$r_filename) {
			if($key>1 and is_mol1($r_filename)) {
				$arr_filename	=	explode(".",$r_filename);
				$q_cek = "select con_id from contents where con_contentname like '%".$arr_filename[0]."%'";
				$r_cek = dbSelectAssoc($conn,$q_cek);
				//debug($r_cek);
				if(count($r_cek)>0) {
					$arr_data[con_file_mol1]          = $r_filename;
					$update = dbUpdateRow($conn,$arr_data,"contents"," where con_contentname like '%".$arr_filename[0]."%'",'r');
					//debug($update); 			
					if($update) echo $r_filename.' Sukses di-attach.</br>';
					else echo $r_filename.' Gagal di-attach.</br>';
				}
				else echo $r_filename.' Tidak ada di database.</br>';
			}
		}
		
	$dir    = 'mol/mol2/';
	$files  = scandir($dir);	
	//debug($dir);
	// MOL 2
	
	
		foreach($files as $key=>$r_filename) {
			if($key>1 and is_mol2($r_filename)) {
				$arr_filename	=	explode(".",$r_filename);
				$q_cek = "select con_id from contents where con_metabolite_id like '%".$arr_filename[0]."%'";
				$r_cek = dbSelectAssoc($conn,$q_cek);
				//debug($r_cek);
				if(count($r_cek)>0) {
					$arr_data[con_file_mol2]          = $r_filename;
					$update = dbUpdateRow($conn,$arr_data,"contents"," where con_metabolite_id like '%".$arr_filename[0]."%'",'r');
					//debug($update); 			
					if($update) echo $r_filename.' Sukses di-attach.</br>';
					else echo $r_filename.' Gagal di-attach.</br>';
				}
				else echo $r_filename.' Tidak ada di database.</br>';
			}
		}
	*/
?>