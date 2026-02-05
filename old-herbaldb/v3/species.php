<?php session_start();
		
		if($_POST[editspesies]==1) {
			//debug($_POST);
			//debug($_SESSION);
			
			foreach($_POST as $key=>$data) {
				if($key!='editspesies') {
					//if($data!='') 
						$arr_data[$key] = $data;  
					//else $blank_field = true;
				}
			}	
			if($blank_field)
				failed_note($_SESSION[lang][blank_field_notif][$lang]);

			$arr_data[spe_update_date]          = date("d-m-Y-H:i-a");
			$arr_data[spe_update_by] 	        = $_SESSION[use_id];	
			
			$update = dbUpdateRow($conn,$arr_data,"species"," where spe_id=".$arr_data[spe_id]."",'r');//debug($update); 
			if($update)
				success_note($_SESSION[lang][success_update][$lang]);
			else
				failed_note($_SESSION[lang][failed_update][$lang]);			
		}
		
        // EKSEKUSI DELETE
        if($_GET[act]=='delspecies') {
            $q_del = dbQuery($conn,"delete from species where spe_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_del_data][$lang]);
            else 
                failed_note($_SESSION[lang][failed_del_data][$lang]);
        }
    
        // EKSEKUSI VERIFIKASI
        if($_GET[act]=='verspecies') {
            $q_del = dbQuery($conn,"update species set spe_verified_by=".$_SESSION[use_id].", spe_verified_date='".date("Y-m-d-h:i-a")."' where spe_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_verify_data][$lang]);
            else 
                failed_note($_SESSION[lang][failed_verify_data][$lang]);
        }
    
        // EKSEKUSI UNVERIFIKASI
        if($_GET[act]=='unverspecies') {
            $q_del = dbQuery($conn,"update species set spe_verified_by=-".$_SESSION[use_id].", spe_verified_date='".date("Y-m-d-h:i-a")."' where spe_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_unverify_data][$lang]);
            else 
                failed_note($_SESSION[lang][failed_unverify_data][$lang]);
        }
		
    $n_perpages = _N_PERPAGES/2;
    
    $sql = "select * from species order by spe_id desc limit 0,".$n_perpages."";
    $spesies = dbSelectAssoc($conn, $sql);
    	
	if($_SESSION[rol_id]==1)
		$edit_view = '| <a href=?v=spesies&editview=true&start='.$_GET[start].'>Edit view</a>';
	
        echo '<h3><a href=?v=spesies>'.$_SESSION[lang][daftar_recent_spesies][$lang].'</a> '.$edit_view.'</h3>
            <table border=0 width=100%>
                <tr style="background-color:#dd5;">
                    <td style=text-align:center;><br>No.<br><br></td>
                    <td style=text-align:center;>ID '.$_SESSION[lang][spesies_val][$lang].'</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][spesies_val][$lang].'</td>
                    <td style=text-align:left;padding-left:10px;>Varietas</td>
                    <td style=text-align:left;padding-left:10px;>Family</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][penemu_val][$lang].'</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                    <td style=text-align:left;padding-left:10px;>Status</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][action_val][$lang].'</td>
                </tr>';
                
            $ii_spesies = 1;
			$species_files_path = _SPECIES_FILES_PATH;
			
			if($_GET[editview]=='true' and $_SESSION[rol_id]==1) {
				$arr_ref_id = dbSelectAssoc($conn,"select * from ref order by ref_name asc");
				foreach($spesies as $r) {

					if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
					//if($r[spe_foto]=='') $foto = ''; else $foto = '<br><img src='.$species_files_path.'/'.$r[spe_foto].' width=150px height=100px>';
					
					if($r[spe_verified_by]>0)
						$status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' '.GetFieldFromTable("use_fullname","users"," where use_id=1",$conn).'</span>';
					else
						$status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';

					echo '	<form method=post>
							<tr style="background-color:'.$col.';padding:5px;">
							  <td style=text-align:center;>'.$ii_spesies++.'.</td>
							  <td style=text-align:center;>'.$r[spe_species_id].$foto.'</td>
							  <td style=text-align:left;padding-left:10px;><input name=spe_speciesname type=text value="'.$r[spe_speciesname].'"></td>
							  <td style=text-align:left;padding-left:10px;><input name=spe_varietyname type=text value="'.$r[spe_varietyname].'"></td>
							  <td style=text-align:left;padding-left:10px;><input name=spe_familyname type=text value="'.$r[spe_familyname].'"></td>
							  <td style=text-align:left;padding-left:10px;><input name=spe_foundername type=text value="'.$r[spe_foundername].'"></td>
							  <td style=text-align:left;padding-left:10px;>'.ref_dropdown($conn,$arr_ref_id,$r[ref_id]).'</td>
							  <td style=text-align:left;padding-left:10px;>'.$status.'</td>
							  <td style=text-align:left;padding-left:10px;>
									<input type=hidden name="spe_id" value='.$r[spe_id].'>
									<input type=hidden name="editspesies" value=1>
									<input type=submit value="Save">
							  </td>
							</tr>
							</form>';
				}			
			}
			else {
				foreach($spesies as $r) {

					if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
					//if($r[spe_foto]=='') $foto = ''; else $foto = '<br><img src='.$species_files_path.'/'.$r[spe_foto].' width=150px height=100px>';

					$ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
					
					$del_link = '
						<a href="index.php?v=spesies&act=delspecies&id='.$r[spe_id].'">
							<img style="padding:3px;" src="images/cancel_16.png" alt="delete" title="delete species" onclick="return confirm(\''.$_SESSION[lang][del_confirm][$lang].'\')">
						</a>
					';
					
					if($r[spe_verified_by]>0) {
						$status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' <a target=blank href="?v=profile&id='.$r[spe_verified_by].'">'.GetFieldFromTable("use_fullname","users"," where use_id=".$r[spe_verified_by]."",$conn).'</a></span>';
						$ver_link = '
							<a href="index.php?v=spesies&act=unverspecies&id='.$r[spe_id].'">
								<img style="padding:3px;" src="images/circle_red.png" alt="unverify" title="unverify species" onclick="return confirm(\''.$_SESSION[lang][ver_confirm][$lang].'\')">
							</a>
						';
					}
					else  if($_SESSION[rol_id]!=''){
						$status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
						$ver_link = '
							<a href="index.php?v=spesies&act=verspecies&id='.$r[spe_id].'">
								<img style="padding:3px;" src="images/circle_green.png" alt="verify" title="verify species" onclick="return confirm(\''.$_SESSION[lang][unver_confirm][$lang].'\')">
							</a>
						';
					}
					
					if($_SESSION[rol_id]!=1 and $_SESSION[rol_id]!=2) {
						$del_link = '-';
						$ver_link = '-';
					}

					echo '
							<tr style="background-color:'.$col.';padding:5px;">
							  <td style=text-align:center;>'.$ii_spesies++.'.</td>
							  <td style=text-align:center;><a onClick="window.open(\'popdetails.php?speciesid='.$r[spe_species_id].'\',null, \'height=800px,width=1000px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r[spe_species_id].$foto.'</a></td>
							  <td style=text-align:left;padding-left:10px;>'.$r[spe_speciesname].'</td>
							  <td style=text-align:left;padding-left:10px;>'.$r[spe_varietyname].'</td>
							  <td style=text-align:left;padding-left:10px;>'.$r[spe_familyname].'</td>
							  <td style=text-align:left;padding-left:10px;>'.$r[spe_foundername].'</td>
							  <td style=text-align:left;padding-left:10px;>'.$ref_id.'</td>
							  <td style=text-align:left;padding-left:10px;>'.$status.'</td>
							  <td style=text-align:left;padding-left:10px;>
									'.$ver_link.'
									'.$del_link.'
							  </td>
							</tr>';
				}
			}
            
        echo '</table><br>';
		
    $sql_all = "select count(spe_id) as n_all from species";
    $spesies_all = dbSelectAssoc($conn, $sql_all); //debug($spesies_all);
    
    $n_perpages = _N_PERPAGES;
    
    if($_GET[sortby]=='spe_species_id')
        $sortby = "spe_species_id asc";
    else $sortby = "spe_speciesname asc";
        
    if($_GET[start]=='') $start = 0;
    else $start = $_GET[start];
    
    $sql = "select * from species order by ".$sortby." limit ".$_GET[start]*$n_perpages.",".$n_perpages."";
    $spesies = dbSelectAssoc($conn, $sql);
    
    echo '
	<h3><a href=?v=spesies>'.$_SESSION[lang][daftar_spesies][$lang].'</a> '.$edit_view.'</h3>
	<div style=text-align:center;>'.$_SESSION[lang][exist_total][$lang].' <b>'.$spesies_all[0][n_all].'</b> data. <a href=download.php?data=spesies><b>DOWNLOAD</b></a>';
    echo paging($start,$spesies_all[0][n_all],$n_perpages,"index.php?v=spesies&sortby=".$_GET[sortby]."");
    echo '</div>';		
		
        echo '
            <table border=0 width=100%>
                <tr style="background-color:#dd5;">
                    <td style=text-align:center;><br>No.<br><br></td>
                    <td style=text-align:center;><a href="index.php?v=spesies&sortby=spe_species_id">ID '.$_SESSION[lang][spesies_val][$lang].'</a></td>
                    <td style=text-align:left;padding-left:10px;><a href="index.php?v=spesies&sortby=spe_speciesname">'.$_SESSION[lang][spesies_val][$lang].'</a></td>
                    <td style=text-align:left;padding-left:10px;>Varietas</td>
                    <td style=text-align:left;padding-left:10px;>Family</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][penemu_val][$lang].'</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                    <td style=text-align:left;padding-left:10px;>Status</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][action_val][$lang].'</td>
                </tr>';
                
            $ii_spesies = 1;
			$species_files_path = _SPECIES_FILES_PATH;
			
			if($_GET[editview]=='true' and $_SESSION[rol_id]==1) {
				$arr_ref_id = dbSelectAssoc($conn,"select * from ref order by ref_name asc");
				foreach($spesies as $r) {

					if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
					//if($r[spe_foto]=='') $foto = ''; else $foto = '<br><img src='.$species_files_path.'/'.$r[spe_foto].' width=150px height=100px>';
					
					if($r[spe_verified_by]>0)
						$status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].'</span>';
					else if($_SESSION[rol_id]!='')
						$status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';

					echo '	<form method=post>
							<tr style="background-color:'.$col.';padding:5px;">
							  <td style=text-align:center;>'.$ii_spesies++.'.</td>
							  <td style=text-align:center;>'.$r[spe_species_id].$foto.'</td>
							  <td style=text-align:left;padding-left:10px;><input name=spe_speciesname type=text value="'.$r[spe_speciesname].'"></td>
							  <td style=text-align:left;padding-left:10px;><input name=spe_varietyname type=text value="'.$r[spe_varietyname].'"></td>
							  <td style=text-align:left;padding-left:10px;><input name=spe_familyname type=text value="'.$r[spe_familyname].'"></td>
							  <td style=text-align:left;padding-left:10px;><input name=spe_foundername type=text value="'.$r[spe_foundername].'"></td>
							  <td style=text-align:left;padding-left:10px;>'.ref_dropdown($conn,$arr_ref_id,$r[ref_id]).'</td>
							  <td style=text-align:left;padding-left:10px;>'.$status.'</td>
							  <td style=text-align:left;padding-left:10px;>
									<input type=hidden name="spe_id" value='.$r[spe_id].'>
									<input type=hidden name="editspesies" value=1>
									<input type=submit value="Save">
							  </td>
							</tr>
							</form>';
				}			
			}
			else {
				foreach($spesies as $r) {

					if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
					//if($r[spe_foto]=='') $foto = ''; else $foto = '<br><img src='.$species_files_path.'/'.$r[spe_foto].' width=150px height=100px>';

					$ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
					
					$del_link = '
						<a href="index.php?v=spesies&act=delspecies&id='.$r[spe_id].'">
							<img style="padding:3px;" src="images/cancel_16.png" alt="delete" title="delete species" onclick="return confirm(\''.$_SESSION[lang][del_confirm][$lang].'\')">
						</a>
					';
					
					if($r[spe_verified_by]>0) {
						$status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' <a target=blank href="?v=profile&id='.$r[spe_verified_by].'">'.GetFieldFromTable("use_fullname","users"," where use_id=".$r[spe_verified_by]."",$conn).'</a></span>';
						$ver_link = '
							<a href="index.php?v=spesies&act=unverspecies&id='.$r[spe_id].'">
								<img style="padding:3px;" src="images/circle_red.png" alt="unverify" title="unverify species" onclick="return confirm(\''.$_SESSION[lang][ver_confirm][$lang].'\')">
							</a>
						';
					}
					else  if($_SESSION[rol_id]!=''){
						$status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
						$ver_link = '
							<a href="index.php?v=spesies&act=verspecies&id='.$r[spe_id].'">
								<img style="padding:3px;" src="images/circle_green.png" alt="verify" title="verify species" onclick="return confirm(\''.$_SESSION[lang][unver_confirm][$lang].'\')">
							</a>
						';
					}
					
					if($_SESSION[rol_id]!=1 and $_SESSION[rol_id]!=2) {
						$del_link = '-';
						$ver_link = '-';
					}

					echo '
							<tr style="background-color:'.$col.';padding:5px;">
							  <td style=text-align:center;>'.$ii_spesies++.'.</td>
							  <td style=text-align:center;><a onClick="window.open(\'popdetails.php?speciesid='.$r[spe_species_id].'\',null, \'height=800px,width=1000px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r[spe_species_id].$foto.'</a></td>
							  <td style=text-align:left;padding-left:10px;>'.$r[spe_speciesname].'</td>
							  <td style=text-align:left;padding-left:10px;>'.$r[spe_varietyname].'</td>
							  <td style=text-align:left;padding-left:10px;>'.$r[spe_familyname].'</td>
							  <td style=text-align:left;padding-left:10px;>'.$r[spe_foundername].'</td>
							  <td style=text-align:left;padding-left:10px;>'.$ref_id.'</td>
							  <td style=text-align:left;padding-left:10px;>'.$status.'</td>
							  <td style=text-align:left;padding-left:10px;>
									'.$ver_link.'
									'.$del_link.'
							  </td>
							</tr>';
				}
			}
            
        echo '</table>';

?>