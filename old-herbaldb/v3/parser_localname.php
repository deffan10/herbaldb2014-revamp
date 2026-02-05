<?php session_start();

    require_once 'functions/reader.php';
    require_once 'functions/functions.php';
	
		$table			=	'localname';
		$filename       =   'dbupdate_'.$table.'.xls';
		$n_barisdata	=	16112;
		$data 			= 	new Spreadsheet_Excel_Reader();
		
		$data->read($filename);
		error_reporting(E_ALL ^ E_NOTICE);
		
		for ($j = 2; $j <= $n_barisdata; $j++) {
			
			// Species_id	Local_name	Region	Ref
			
			if($data->sheets[0]['cells'][$j][1]!='' and $data->sheets[0]['cells'][$j][2]!='' and $data->sheets[0]['cells'][$j][3]!='') {
				$arr_data[spe_id]  				=   GetFieldFromTable("spe_id","species"," where spe_species_id='".$data->sheets[0]['cells'][$j][1]."'",$conn);;		
				$arr_data[loc_localname]		=   htmlspecialchars($data->sheets[0]['cells'][$j][2], ENT_QUOTES);
				$arr_data[loc_region]			=   htmlspecialchars($data->sheets[0]['cells'][$j][3], ENT_QUOTES);
				$arr_data[ref_id]				=   $data->sheets[0]['cells'][$j][4];
				$arr_data[loc_insert_by]        =   1;
				$arr_data[loc_insert_date]      =   date("Y-m-d-h:i-a");
				$arr_data[loc_update_by]        =   1;
				$arr_data[loc_update_date]      =   date("Y-m-d-h:i-a");
				//*/

				$sql_cek_duplicated = "select count(*) as n_all from ".$table." 
										where 	spe_id='".$arr_data[spe_id]."' 
											and loc_localname='".$arr_data[loc_localname]."' 
											and loc_region='".$arr_data[loc_region]."'";
				$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
				 
				if($q_cek_duplicated[n_all]>0)
					failed_note("Gagal menambahkan data ".$table." ke database. Duplicated entry detected. [ BARIS : ".$j."]<br>");
				else { 
					$insert = dbInsertRow($conn,$arr_data,$table,"r");//debug($insert);
					if($insert) success_note($j." Sukses menambahkan data ".$table." ke database.<br>");
					else failed_note($j." Gagal menambahkan data ".$table." ke database.<br>");
				}
			}
			else warning_note($j." Baris ini dilewat. Data kosong 3 kolom.<br>");;
		}
?>
