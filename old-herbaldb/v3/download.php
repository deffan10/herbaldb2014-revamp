<?php session_start(); 
            
		require_once 'functions/functions.php';
		if($_SESSION[mylang][key]!='en') $_SESSION[mylang][key] = 'id';
		$lang	=	$_SESSION[mylang][key];
	
		unset($_SESSION['report_header']);
		unset($_SESSION['report_values']);
				
		//debug($_GET);
		//debug($_SESSION[search]);
		
		if($_GET[data]=='spesies' or $_GET[data]=='species') {
		
			if($_GET[req]=='search') $sql = $_SESSION[search][sql];
			else $sql 	= "select * from species where spe_verified_by>0 order by spe_speciesname asc";	
			$data 	= dbSelectAssoc($conn,$sql);
			$_SESSION['report_header']=array("No.","ID Spesies","Spesies","Varietas","Family","Founder","Reference","Status");
			
			$ii = 0;
			if(count($data)>0)
				foreach($data as $r) {
					
					$ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
					if($r[spe_verified_by]>0)
						$status = $_SESSION[lang][field_verified][$lang];
					else
						$status = $_SESSION[lang][field_notverified][$lang];
					
					$idx_r = 0;	
					$_SESSION['report_values'][$ii][++$idx_r]= ($ii+1);
					$_SESSION['report_values'][$ii][++$idx_r]= $r[spe_species_id];
					$_SESSION['report_values'][$ii][++$idx_r]= $r[spe_speciesname];
					$_SESSION['report_values'][$ii][++$idx_r]= $r[spe_varietyname];
					$_SESSION['report_values'][$ii][++$idx_r]= $r[spe_familyname];
					$_SESSION['report_values'][$ii][++$idx_r]= $r[spe_foundername];
					$_SESSION['report_values'][$ii][++$idx_r]= $ref_id;
					$_SESSION['report_values'][$ii][++$idx_r]= $status;
					$ii++;
				}

		}		
		
		if($_GET[data]=='senyawa' or $_GET[data]=='contents') {
		
			if($_GET[req]=='search') $sql = $_SESSION[search][sql];
			else $sql 	= "SELECT * FROM `contents` WHERE con_verified_by>0 order by `con_contentname` asc";	
			$data 	= dbSelectAssoc($conn,$sql);
		
			if($_SESSION[mylang][key]=='id')
				$_SESSION['report_header']=array("No.","Nama Senyawa","KNAPSACK ID","METABOLITE ID","PUBCHEM ID","GROUP","Status");
			else
				$_SESSION['report_header']=array("No.","Compound Name","KNAPSACK ID","METABOLITE ID","PUBCHEM ID","GROUP","Status");
			
			$ii = 0;
			if(count($data)>0)
				foreach($data as $r) {
					
					$contgroup_name = GetFieldFromTable("contgroup_name","contentgroup"," where contgroup_id=".$r[contgroup_id]."",$conn);
					$ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
					if($r[con_verified_by]>0)
						$status = $_SESSION[lang][field_verified][$lang];
					else
						$status = $_SESSION[lang][field_notverified][$lang];
					
					$idx_r = 0;	
					$_SESSION['report_values'][$ii][++$idx_r]= ($ii+1);
					$_SESSION['report_values'][$ii][++$idx_r]= $r[con_contentname];
					$_SESSION['report_values'][$ii][++$idx_r]= $r[con_knapsack_id];
					$_SESSION['report_values'][$ii][++$idx_r]= $r[con_metabolite_id];
					$_SESSION['report_values'][$ii][++$idx_r]= $r[con_pubchem_id];
					$_SESSION['report_values'][$ii][++$idx_r]= $contgroup_name;
					$_SESSION['report_values'][$ii][++$idx_r]= $status;

					$ii++;
				}

		}

		$fn = "list_of_".$_GET[data]."_generated_on_".date("d-m-Y-h-i:a");
        header("Location: functions/export_report.php?fn=".$fn."");
  
  ?>