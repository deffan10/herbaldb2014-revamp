<?php session_start();

    require_once 'functions/reader.php';
    require_once 'functions/functions.php';
	
		//$filename       =   'dbupdate_species.xls';
		$table			=	'species';
		$n_barisdata	=	3818;
		$data 			= 	new Spreadsheet_Excel_Reader();
		
		$data->read($filename);
		error_reporting(E_ALL ^ E_NOTICE);

		// gagal : 2842,3177 ==> INPUT di XLS dibersihkan dari char '
		
		for ($j = 2; $j <= $n_barisdata; $j++) {
			
			// Species_id	Species_name	Founder_name	Variety_name	Ref	Family_name

			$arr_data[spe_species_id]  		=   htmlspecialchars($data->sheets[0]['cells'][$j][1], ENT_QUOTES);
			$arr_data[spe_speciesname]  	=   htmlspecialchars($data->sheets[0]['cells'][$j][2], ENT_QUOTES);
			$arr_data[spe_foundername]		=   htmlspecialchars($data->sheets[0]['cells'][$j][3], ENT_QUOTES);
			$arr_data[spe_varietyname]  	=   htmlspecialchars($data->sheets[0]['cells'][$j][4], ENT_QUOTES);
			
			///*
			//$ref_id = GetFieldFromTable("ref_id","ref"," where ref_id='".$data->sheets[0]['cells'][$j][5]."'",$conn);
			//if($ref_id>0)
				$arr_data[ref_id]			=   $data->sheets[0]['cells'][$j][5];
			//else 
				//$arr_data[ref_id]			=   insertNewReference($data->sheets[0]['cells'][$j][5],1);
			
			
			$arr_data[spe_familyname]		=   $data->sheets[0]['cells'][$j][6];
			$arr_data[spe_insert_by]        =   1;
			$arr_data[spe_insert_date]      =   date("Y-m-d-h:i-a");
			$arr_data[spe_update_by]        =   1;
			$arr_data[spe_update_date]      =   date("Y-m-d-h:i-a");
			//*/

			$sql_cek_duplicated = "select count(*) as n_all from ".$table." where spe_species_id='".$arr_data[spe_species_id]."'";
			$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
			 
			if($q_cek_duplicated[n_all]>0)
				failed_note("Gagal menambahkan data ".$table." ke database. Duplicated entry detected. [ BARIS : ".$j."]<br>");
			else { 
				$insert = dbInsertRow($conn,$arr_data,$table,"r");//debug($insert);
				if($insert) success_note($j." Sukses menambahkan data ".$table." ke database.<br>");
				else failed_note($j." Gagal menambahkan data ".$table." ke database.<br>");
			}
		}
?>
