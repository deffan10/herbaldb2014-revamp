<?php session_start();

    require_once 'functions/reader.php';
    require_once 'functions/functions.php';
	
		$table			=	'contents';
		$filename       =   'dbupdate_'.$table.'.xls';
		$n_barisdata	=	12676;//6000;//;
		$data 			= 	new Spreadsheet_Excel_Reader();
		
		$data->read($filename);
		error_reporting(E_ALL ^ E_NOTICE);
		
		for ($j = 2; $j <= $n_barisdata; $j++) {
			
			// content	Knapsack_id	 metabolite_id	Pubchem_id	group_id	sumber	Species Name
			
			if($data->sheets[0]['cells'][$j][1]!='') {
				
				$arr_data[con_contentname]		=   htmlspecialchars($data->sheets[0]['cells'][$j][1], ENT_QUOTES);
				$arr_data[con_knapsack_id]		=   htmlspecialchars($data->sheets[0]['cells'][$j][2], ENT_QUOTES);
				$arr_data[con_metabolite_id]	=   htmlspecialchars($data->sheets[0]['cells'][$j][3], ENT_QUOTES);
				$arr_data[con_pubchem_id]		=   htmlspecialchars($data->sheets[0]['cells'][$j][4], ENT_QUOTES);

				$arr_data[contgroup_id]  		=   GetFieldFromTable("contgroup_id","contentgroup"," where contgroup_code like '%".$data->sheets[0]['cells'][$j][5]."%'",$conn);		
				
				$arr_data[con_source]			=   htmlspecialchars($data->sheets[0]['cells'][$j][6], ENT_QUOTES);
				$arr_data[con_speciesname]		=   htmlspecialchars($data->sheets[0]['cells'][$j][7], ENT_QUOTES);
				
				$arr_data[con_insert_by]        =   1;
				$arr_data[con_insert_date]      =   date("Y-m-d-h:i-a");
				$arr_data[con_update_by]    	=   1;
				$arr_data[con_update_date]      =   date("Y-m-d-h:i-a");
				//*/

				$sql_cek_duplicated = "select count(*) as n_all from ".$table." 
										where con_contentname ='".$arr_data[con_contentname]."' ";
				$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
				 
				if($q_cek_duplicated[n_all]>0)
					failed_note("Gagal menambahkan data ".$table." ke database. Duplicated entry detected. [ BARIS : ".$j."]<br>");
				else { 
					$insert = dbInsertRow($conn,$arr_data,$table,"r");//debug($insert);
					if($insert) success_note($j." Sukses menambahkan data ".$table." ke database.<br>");
					else failed_note($j." Gagal menambahkan data ".$table." ke database.<br>");
				}
			}
			else
				warning_note($j." Baris ini dilewat. Data kosong 3 kolom.<br>");
		}
?>
