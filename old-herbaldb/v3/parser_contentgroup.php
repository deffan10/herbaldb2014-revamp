<?php session_start();

    require_once 'functions/reader.php';
    require_once 'functions/functions.php';
	
		$filename       =   'dbupdate_contentgroup.xls';
		$table			=	'contentgroup';
		$n_barisdata	=	19;
		$data 			= 	new Spreadsheet_Excel_Reader();
		
		$data->read($filename);
		error_reporting(E_ALL ^ E_NOTICE);

		for ($j = 2; $j <= $n_barisdata; $j++) {
			
			$arr_data[contgroup_code]  		=   $data->sheets[0]['cells'][$j][1];
			$arr_data[contgroup_name]  		=   htmlspecialchars($data->sheets[0]['cells'][$j][2], ENT_QUOTES);
			$arr_data[contgroup_insert_by]  	=   1;
			$arr_data[contgroup_insert_date]	=   date("Y-m-d-h:i-a");;
			$arr_data[contgroup_update_by]  	=   1;
			$arr_data[contgroup_update_date]	=   date("Y-m-d-h:i-a");;
			
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

			$sql_cek_duplicated = "select count(*) as n_all from ".$table." where contgroup_code='".$arr_data[contgroup_code]."'";
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
