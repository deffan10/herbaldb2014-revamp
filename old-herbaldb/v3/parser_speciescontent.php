<?php session_start();

    require_once 'functions/reader.php';
    require_once 'functions/functions.php';
	
		$table			=	'speciescontent';
		$filename       =   'dbupdate_'.$table.'.xls';
		$n_barisdata	=	9912;
		$data 			= 	new Spreadsheet_Excel_Reader();
		
		$data->read($filename);
		error_reporting(E_ALL ^ E_NOTICE);
		
		for ($j = 2; $j <= $n_barisdata; $j++) {
			
			// `spe_id`, `con_id`, `ref_id`,
			
			if($data->sheets[0]['cells'][$j][1]!='' and $data->sheets[0]['cells'][$j][2]!='') {
				

				$arr_data[spe_id]  		=   GetFieldFromTable("spe_id","species"," where spe_species_id like '%".$data->sheets[0]['cells'][$j][1]."%'",$conn);
				$temp_contentname		=   htmlspecialchars($data->sheets[0]['cells'][$j][2], ENT_QUOTES);
				$arr_data[con_id]  		=   GetFieldFromTable("con_id","contents"," where con_contentname='".$temp_contentname."'",$conn);
				
				$arr_data[specon_insert_by]     =   1;
				$arr_data[specon_insert_date]   =   date("Y-m-d-h:i-a");
				$arr_data[specon_update_by]    	=   1;
				$arr_data[specon_update_date]   =   date("Y-m-d-h:i-a");
				//*/

				$sql_cek_duplicated = "select count(*) as n_all from ".$table." 
										where 
											spe_id ='".$arr_data[spe_id]."' and
											con_id ='".$arr_data[con_id]."' 
											";
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
