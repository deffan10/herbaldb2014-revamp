<?php session_start();

    require_once 'functions/reader.php';
    require_once 'functions/functions.php';
	
		$table				=	'aliases';
		$filename       	=   'dbupdate_'.$table.'.xls';
		$n_barisdata		=	3818;
		
		$data 				= 	new Spreadsheet_Excel_Reader();
		
		$data->read($filename);
		error_reporting(E_ALL ^ E_NOTICE);
		
		for ($j = 2; $j <= $n_barisdata; $j++) {
			
			/*
			// Species_id	
				Species_name1	
				Founder_name1	
				Variety_name1	
				Ref1	

				Species_name2	
				Founder_name2	
				Variety_name2	
				Ref2
			*/
			//`spe_id`, `ali_speciesname`, `ali_foundername`, `ali_varietyname`, `ref_id`, 
			//`ali_insert_by`, `ali_insert_date`, `ali_update_by`, `ali_update_date`
			
			if($data->sheets[0]['cells'][$j][1]!='' and $data->sheets[0]['cells'][$j][2]!='' and $data->sheets[0]['cells'][$j][3]!='') {
				

				$arr_data[spe_id]  			=   GetFieldFromTable("spe_id","species"," where spe_species_id like '%".$data->sheets[0]['cells'][$j][1]."%'",$conn);
				
				$col_species	= 2;
				$col_founder	= 3;
				$col_variety	= 4;
				$col_ref		= 5;
				
				$ii = 1;
				do {
					$arr_data[ali_speciesname]	=   htmlspecialchars($data->sheets[0]['cells'][$j][$col_species], ENT_QUOTES);
					$arr_data[ali_foundername]	=   htmlspecialchars($data->sheets[0]['cells'][$j][$col_founder], ENT_QUOTES);
					$arr_data[ali_varietyname]	=   htmlspecialchars($data->sheets[0]['cells'][$j][$col_variety], ENT_QUOTES);
					$arr_data[ref_id]			=   $data->sheets[0]['cells'][$j][$col_ref];
					
					$arr_data[ali_insert_by]    =   1;
					$arr_data[ali_insert_date]  =   date("Y-m-d-h:i-a");
					$arr_data[ali_update_by]    =   1;
					$arr_data[ali_update_date]  =   date("Y-m-d-h:i-a");
					//*/

					$sql_cek_duplicated = "select count(*) as n_all from ".$table." 
											where 
												spe_id ='".$arr_data[spe_id]."' and 
												ali_speciesname ='".$arr_data[ali_speciesname]."' and 
												ali_foundername ='".$arr_data[ali_foundername]."' 
												";
					$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
					 
					if($q_cek_duplicated[n_all]>0)
						failed_note("Gagal menambahkan data ".$table." ke database. Duplicated entry detected. [ BARIS : ".$j.", kolom data ke ".$ii."].<br>");
					else { 
						$insert = dbInsertRow($conn,$arr_data,$table,"r");//debug($insert);
						if($insert) success_note($j." Sukses menambahkan data ".$table." ke database, kolom data ke ".$ii.".<br>");
						else failed_note($j." Gagal menambahkan data ".$table." ke database, kolom data ke ".$ii.".<br>");
					}
					
					$col_species	+= 4;
					$col_founder	+= 4;
					$col_variety	+= 4;
					$col_ref		+= 4;		
					
					$ii++;
					
				} while($data->sheets[0]['cells'][$j][$col_species]!='' or $data->sheets[0]['cells'][$j][$col_founder]!='');
			}
			else warning_note($j." Baris ini dilewat. Data kosong 3 kolom.<br>");;
		}
?>
