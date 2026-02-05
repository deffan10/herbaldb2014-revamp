<?php session_start();

    require_once 'functions/reader.php';
    require_once 'functions/functions.php';
	
		//$filename       =   'dbupdate_herbal_part.xls';
		$n_barisdata	=	50;
		$data 			= 	new Spreadsheet_Excel_Reader();
		
		$data->read($filename);
		error_reporting(E_ALL ^ E_NOTICE);

		for ($j = 2; $j <= $n_barisdata; $j++) {
			
			$arr_data[hp_code]       =   $data->sheets[0]['cells'][$j][1];
			$arr_data[hp_part_name]  =   htmlspecialchars($data->sheets[0]['cells'][$j][2], ENT_QUOTES);
			
			/*
			$ref_id = GetFieldFromTable("ref_id","ref"," where ref_name='".$data->sheets[0]['cells'][$j][5]."'",$conn);
			if($ref_id>0)
				$arr_data[ref_id]			=   $ref_id;
			else 
				$arr_data[ref_id]			=   insertNewReference($data->sheets[0]['cells'][$j][5],$_SESSION[use_id]);
			
			
			$arr_data[spe_insert_by]        =   $_SESSION[use_id];
			$arr_data[spe_insert_date]      =   date("Y-m-d-h:i-a");
			$arr_data[spe_update_by]        =   $_SESSION[use_id];
			$arr_data[spe_update_date]      =   date("Y-m-d-h:i-a");
			*/

			$sql_cek_duplicated = "select count(*) as n_all from herbal_part where hp_code='".$arr_data[hp_code]."'";
			$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
			 
			if($q_cek_duplicated[n_all]>0)
				failed_note("Gagal menambahkan data ke database. Duplicated entry detected. [ BARIS : ".$j."]<br>");
			else { 
				$insert = dbInsertRow($conn,$arr_data,"herbal_part","r");//debug($insert);
				if($insert) success_note($j." Sukses menambahkan data ke database.<br>");
				else failed_note($j." Gagal menambahkan data ke database.<br>");
			}
		}
?>
