<?php session_start();

    require_once 'functions/reader.php';
    require_once 'functions/functions.php';

	$upload = upload($_FILES,"uploadedfile",'',_UPLOADED_FILES_PATH,1024000);
	
	if(!$upload)
		failed_note("<br>Gagal meng-upload file. Ukuran maksimum file yang diperbolehkan adalah 1 MB.<br><br>");
	
	else {
		$filename       =   $_FILES[uploadedfile][name];
		$n_barisdata	=	$_POST[n_barisdata];
		$data 			= 	new Spreadsheet_Excel_Reader();
		
		$data->read($filename);
		error_reporting(E_ALL ^ E_NOTICE);

		///*
		if($_POST[form] == 'addspecies') {
			for ($j = 1; $j <= $n_barisdata; $j++) {
					
				$arr_data[spe_species_id]       =   $data->sheets[0]['cells'][$j][1];
				$arr_data[spe_speciesname]      =   $data->sheets[0]['cells'][$j][2];
				$arr_data[spe_foundername]      =   $data->sheets[0]['cells'][$j][3];
				$arr_data[spe_varietyname]      =   $data->sheets[0]['cells'][$j][4];
				
				$ref_id = GetFieldFromTable("ref_id","ref"," where ref_name='".$data->sheets[0]['cells'][$j][5]."'",$conn);
				if($ref_id>0)
					$arr_data[ref_id]			=   $ref_id;
				else 
					$arr_data[ref_id]			=   insertNewReference($data->sheets[0]['cells'][$j][5],$_SESSION[use_id]);
					
				$arr_data[spe_insert_by]        =   $_SESSION[use_id];
				$arr_data[spe_insert_date]      =   date("Y-m-d-h:i-a");
				$arr_data[spe_update_by]        =   $_SESSION[use_id];
				$arr_data[spe_update_date]      =   date("Y-m-d-h:i-a");

				$sql_cek_duplicated = "select count(*) as n_all from species where spe_species_id='".$arr_data[spe_species_id]."'";
				$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
				 
				if($q_cek_duplicated[n_all]>0)
					failed_note("Gagal menambahkan spesies ke database. Duplicated entry detected. [ BARIS : ".$j."]<br>");
				else { 
					$insert = dbInsertRow($conn,$arr_data,"species","r");//debug($insert);
					if($insert) success_note("Sukses menambahkan spesies ke database.<br>");
					else failed_note("Gagal menambahkan spesies ke database.<br>");
				}
			}
		}
		//*/
	}
?>
