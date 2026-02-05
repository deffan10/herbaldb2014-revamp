<?php session_start();
    require_once 'functions/functions.php';

    if($_SESSION[logged_in]==1) {
        
        if($_POST[add]!='') {
            //debug($_POST);
            //debug($_FILES);
            
            foreach($_POST as $key=>$data) {
                if($key!='add' and $key!='form' and $key!='arr_con_id') {
                    if($data!='') $arr_data[$key] = $data;  
                    else $blank_field = true;
                }
            }
            
            if($blank_field) failed_note($_SESSION[lang][blank_field_notif][$lang]);
            
            else {
			
                // add konten senyawa
                if($_POST[form]=='addkonten') {
                    $sql_cek_duplicated = "select count(*) as n_all from contents where con_contentname='".$_POST[con_contentname]."'";
                    $q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
                     
                    if($q_cek_duplicated[n_all]>0)
                        failed_note($_SESSION[lang][duplicated_entry_notif][$lang]);
                    else {
					
                        if($_FILES[con_file_mol1][error] == 0) {
                            if(is_mol1($_FILES[con_file_mol1][name])) {
                                $uploadmol= upload($_FILES,"con_file_mol1",'',_MOL1_FILES_PATH);
                                if($uploadmol)
                                    $arr_data[con_file_mol1] = $_FILES[con_file_mol1][name];
								else $mol1_failed = true;
							}
							else $mol1_invalid = true;
						}					
                        if($_FILES[con_file_mol2][error] == 0) {
                            if(is_mol2($_FILES[con_file_mol2][name])) {
                                $uploadmol= upload($_FILES,"con_file_mol2",'',_MOL2_FILES_PATH);
                                if($uploadmol)
                                    $arr_data[con_file_mol2] = $_FILES[con_file_mol2][name];
								else $mol2_failed = true;
							}
							else $mol2_invalid = true;
						}
						
							if(!$mol1_failed and !$mol2_failed and !$mol1_invalid and !$mol2_invalid) {
								$arr_data[con_insert_by]       =   $_SESSION[use_id];
								$arr_data[con_insert_date]     =   date("Y-m-d-h:i-a");
								$arr_data[con_update_by]       =   $_SESSION[use_id];
								$arr_data[con_update_date]     =   date("Y-m-d-h:i-a");
								//$arr_data[con_verified_by]     =   $_SESSION[use_id];
								//$arr_data[con_verified_date]   =   date("Y-m-d-h:i-a");
								
								$insert = dbInsertRow($conn,$arr_data,"contents");
								if($insert) success_note($_SESSION[lang][success_adding_data][$lang]);
								else failed_note($_SESSION[lang][failed_insert_notif][$lang]);
							}
							else if($mol1_failed)
								failed_note($_SESSION[lang][mol1_failed][$lang]);
							else if($mol2_failed)
								failed_note($_SESSION[lang][mol2_failed][$lang]);
							else if($mol1_invalid)
								failed_note($_SESSION[lang][mol1_invalid][$lang]);
							else if($mol2_invalid)
								failed_note($_SESSION[lang][mol2_invalid][$lang]);
                    }
                }
                
                // add species
                if($_POST[form]=='addspecies') {
                    $sql_cek_duplicated = "select count(*) as n_all from species where spe_species_id='".$_POST[spe_species_id]."'";
                    $q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
                     
                    if($q_cek_duplicated[n_all]>0)
                        failed_note($_SESSION[lang][duplicated_entry_notif][$lang]);
                    else {
                    
                        if($_FILES[spe_foto][error] == 0) {
                            if(is_image($_FILES[spe_foto][name])) {
                                $uploadfoto = upload($_FILES,"spe_foto",'',_SPECIES_FILES_PATH);
                                if($uploadfoto) {
                                    $arr_data[spe_foto] = $_FILES[spe_foto][name]; 

                                    $arr_data[spe_insert_by]       =   $_SESSION[use_id];
                                    $arr_data[spe_insert_date]     =   date("Y-m-d-h:i-a");
                                    $arr_data[spe_update_by]       =   $_SESSION[use_id];
                                    $arr_data[spe_update_date]     =   date("Y-m-d-h:i-a");
                                    //$arr_data[con_verified_by]     =   $_SESSION[use_id];
                                    //$arr_data[con_verified_date]   =   date("Y-m-d-h:i-a");

                                    $insert = dbInsertRow($conn,$arr_data,"species");
                                    if($insert) success_note($_SESSION[lang][success_adding_data][$lang]);
                                    else failed_note($_SESSION[lang][failed_insert_notif][$lang]);

                                }
                                else
                                    failed_note($_SESSION[lang][failed_upload_foto][$lang]);
                            }
                            else failed_note($_SESSION[lang][invalid_image_type][$lang]);
                        }
                        else if($_FILES[spe_foto][name]==''){
                                $arr_data[spe_foto]            =   'def-foto';
                                $arr_data[spe_insert_by]       =   $_SESSION[use_id];
                                $arr_data[spe_insert_date]     =   date("Y-m-d-h:i-a");
                                $arr_data[spe_update_by]       =   $_SESSION[use_id];
                                $arr_data[spe_update_date]     =   date("Y-m-d-h:i-a");
                                //$arr_data[con_verified_by]     =   $_SESSION[use_id];
                                //$arr_data[con_verified_date]   =   date("Y-m-d-h:i-a");
                                
                                $insert = dbInsertRow($conn,$arr_data,"species");
                                if($insert) success_note($_SESSION[lang][success_adding_data][$lang]);
                                else failed_note($_SESSION[lang][failed_insert_notif][$lang]);                                
                        }
                    }
                }
                
                // add konten senyawa ke spesies
                if($_POST[form]=='addcontenttospecies') {
				
					//debug($_POST);
					$arr_data[spe_id]	=	$_POST[spe_id_assignment];
					unset($arr_data[spe_id_assignment]);
                    
                    //foreach($_POST[arr_con_id] as $con_id) {
                        //$arr_data[con_id]   = $con_id;
                        $arr_data[con_id]   = $_POST[arr_con_id];
                        
                        $sql_cek_duplicated = "select * from speciescontent where spe_id=".$arr_data[spe_id]." and con_id=".$arr_data[con_id]."";
                        $q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
                         
                        if($q_cek_duplicated[n_all]>0)
                            failed_note($_SESSION[lang][failed_assign][$lang]." : spesies id=".$arr_data[spe_id].", compound id=".$arr_data[con_id].".<br>".$_SESSION[lang][duplicated_entry_notif][$lang]."");
                        else {
                            $arr_data[specon_insert_by]       =   $_SESSION[use_id];
                            $arr_data[specon_insert_date]     =   date("Y-m-d-h:i-a");
                            $arr_data[specon_update_by]       =   $_SESSION[use_id];
                            $arr_data[specon_update_date]     =   date("Y-m-d-h:i-a");
                            //$arr_data[con_verified_by]     =   $_SESSION[use_id];
                            //$arr_data[con_verified_date]   =   date("Y-m-d-h:i-a");
                            
                            $insert = dbInsertRow($conn,$arr_data,"speciescontent");
                            if($insert) success_note($_SESSION[lang][success_assign][$lang]);
                            else failed_note($_SESSION[lang][failed_assign][$lang]);
                        }
                    //}
                }                
                
                // add alias
                if($_POST[form]=='addalias') {
				
					$arr_data[spe_id]	=	$_POST[spe_id_aliasname];
					unset($arr_data[spe_id_aliasname]);
                    				
                    $sql_cek_duplicated = "select count(*) as n_all from aliases where spe_id='".$arr_data[spe_id]."' and ali_speciesname='".$_POST[ali_speciesname]."' and ali_foundername='".$_POST[ali_foundername]."'";
                    $q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
                     
                    if($q_cek_duplicated[n_all]>0)
                        failed_note($_SESSION[lang][duplicated_entry_notif][$lang]);
                    else {
                        $arr_data[ali_insert_by]       =   $_SESSION[use_id];
                        $arr_data[ali_insert_date]     =   date("Y-m-d-h:i-a");
                        $arr_data[ali_update_by]       =   $_SESSION[use_id];
                        $arr_data[ali_update_date]     =   date("Y-m-d-h:i-a");
                        //$arr_data[ali_verified_by]     =   $_SESSION[use_id];
                        //$arr_data[ali_verified_date]   =   date("Y-m-d-h:i-a");
                        
                        $insert = dbInsertRow($conn,$arr_data,"aliases");
                        if($insert) success_note($_SESSION[lang][success_adding_data][$lang]);
                        else failed_note($_SESSION[lang][failed_insert_notif][$lang]);
                    }
                }
                
                // add lokal
                if($_POST[form]=='addlocal') {
				
					$arr_data[spe_id]	=	$_POST[spe_id_localname];
					unset($arr_data[spe_id_localname]);
					
                    $sql_cek_duplicated = "select count(*) as n_all from localname where spe_id='".$arr_data[spe_id]."' and loc_localname='".$_POST[loc_localname]."' and loc_region='".$_POST[loc_region]."'";
                    $q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
                     
                    if($q_cek_duplicated[n_all]>0)
                        failed_note($_SESSION[lang][duplicated_entry_notif][$lang]);
                    else {
                        $arr_data[loc_insert_by]       =   $_SESSION[use_id];
                        $arr_data[loc_insert_date]     =   date("Y-m-d-h:i-a");
                        $arr_data[loc_update_by]       =   $_SESSION[use_id];
                        $arr_data[loc_update_date]     =   date("Y-m-d-h:i-a");
                        //$arr_data[ali_verified_by]     =   $_SESSION[use_id];
                        //$arr_data[ali_verified_date]   =   date("Y-m-d-h:i-a");
                        
                        $insert = dbInsertRow($conn,$arr_data,"localname");
                        if($insert) success_note($_SESSION[lang][success_adding_data][$lang]);
                        else failed_note($_SESSION[lang][failed_insert_notif][$lang]);
                    }
                }
                
                // add groupsenyawa
                if($_POST[form]=='addgroupsenyawa') {
                    $sql_cek_duplicated = "select count(*) as n_all from contentgroup where contgroup_code='".$_POST[contgroup_code]."' or contgroup_name='".$_POST[contgroup_name]."'";
                    $q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
                     
                    if($q_cek_duplicated[n_all]>0)
                        failed_note($_SESSION[lang][duplicated_entry_notif][$lang]);
                    else {                        
                        $arr_data[contgroup_insert_by]       =   $_SESSION[use_id];
                        $arr_data[contgroup_insert_date]     =   date("Y-m-d-h:i-a");
                        $arr_data[contgroup_update_by]       =   $_SESSION[use_id];
                        $arr_data[contgroup_update_date]     =   date("Y-m-d-h:i-a");
                        //$arr_data[contentgroup_verified_by]     =   $_SESSION[use_id];
                        //$arr_data[contentgroup_verified_date]   =   date("Y-m-d-h:i-a");
						
                        $insert = dbInsertRow($conn,$arr_data,"contentgroup",'r');//debug($insert);
                        if($insert) success_note($_SESSION[lang][success_adding_data][$lang]);
                        else failed_note($_SESSION[lang][failed_insert_notif][$lang]);
                    }
                }
                
                // add ref
                if($_POST[form]=='addref') {
                    $sql_cek_duplicated = "select count(*) as n_all from ref where ref_name='".$_POST[ref_name]."'";
                    $q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
                     
                    if($q_cek_duplicated[n_all]>0)
                        failed_note($_SESSION[lang][duplicated_entry_notif][$lang]);
                    else {                        
                        $arr_data[ref_insert_by]       =   $_SESSION[use_id];
                        $arr_data[ref_insert_date]     =   date("Y-m-d-h:i-a");
                        $arr_data[ref_update_by]       =   $_SESSION[use_id];
                        $arr_data[ref_update_date]     =   date("Y-m-d-h:i-a");
                        //$arr_data[ref_verified_by]     =   $_SESSION[use_id];
                        //$arr_data[ref_verified_date]   =   date("Y-m-d-h:i-a");
					
                        $insert = dbInsertRow($conn,$arr_data,"ref");
                        if($insert) success_note($_SESSION[lang][success_adding_data][$lang]);
                        else failed_note($_SESSION[lang][failed_insert_notif][$lang]);
                    }
                }
                
            }                

        }
        // EKSEKUSI VERIFIKASI
        else if($_GET[act]=='ver') {
            $q_del = dbQuery($conn,"update ".$_GET[tbl]." set ".$_GET[field]."_verified_by=".$_SESSION[use_id].", ".$_GET[field]."_verified_date='".date("Y-m-d-h:i-a")."' where ".$_GET[field]."_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_verify_data][$lang]);
            else 
                failed_note($_SESSION[lang][failed_verify_data][$lang]);
        }
    
        // EKSEKUSI UNVERIFIKASI
        else if($_GET[act]=='unver') {
            $q_del = dbQuery($conn,"update ".$_GET[tbl]." set ".$_GET[field]."_verified_by=-".$_SESSION[use_id].", ".$_GET[field]."_verified_date='".date("Y-m-d-h:i-a")."' where ".$_GET[field]."_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_unverify_data][$lang]);
            else 
                failed_note($_SESSION[lang][failed_unverify_data][$lang]);
        }       		
        
        
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
            // REFERENCE ID
            $ref_id = dbSelectAssoc($conn,"select * from ref order by ref_name asc");
            $ref_text.='<select name=ref_id style=width:300px;><option></option>';
                foreach($ref_id as $r) {
					if($r[ref_verified_by]>0) $ref_status = $_SESSION[lang][field_verified][$lang];
					else $ref_status = $_SESSION[lang][field_notverified][$lang];
                    $ref_text.='<option style=text-align:left;padding-left:10px; value='.$r[ref_id].'>'.$r[ref_name].' ('.$ref_status.')</option>';
				}
            $ref_text.='</select><br><span class=notif_red>*'.$_SESSION[lang][notif_add_before][$lang].' tab ADMIN | '.$_SESSION[lang][ref_val][$lang].' </span>';
			
			// CONTENTGROUP ID
			$contgroup_id = dbSelectAssoc($conn,"select * from contentgroup order by contgroup_name asc");
			$contentgroup_text.='<select name=contgroup_id style=width:300px;><option></option>';
				foreach($contgroup_id as $r) {
					if($r[contgroup_verified_by]>0) $contgroup_status = $_SESSION[lang][field_verified][$lang];
					else $contgroup_status = $_SESSION[lang][field_notverified][$lang];
					$contentgroup_text.='<option style=text-align:left;padding-left:10px; value='.$r[contgroup_id].'> ('.$r[contgroup_code].') | '.$r[contgroup_name].' ('.$contgroup_status.')</option>';
				}
			$contentgroup_text.='</select>';
                        
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>TinyAccordion JavaScript Accordion</title>
<link rel="stylesheet" href="functions/modules/tinyaccordion/style.css" type="text/css" />
</head>
<div id="options">
	<a href="javascript:parentAccordion.pr(1)">Expand All</a> | <a href="javascript:parentAccordion.pr(-1)">Collapse All</a>
</div>

<ul class="acc" id="acc">
	<li>
		<h3> ADMIN | <? echo $_SESSION[lang][senyawa_val][$lang];?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
                
                echo '<center>
                    <form enctype="multipart/form-data" action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br> '.$_SESSION[lang][adding_senyawa_val][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'. $_SESSION[lang][senyawa_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=con_contentname></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>ID Knapsack</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=con_knapsack_id></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>ID Metabolite</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=con_metabolite_id></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>ID Pubchem</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=con_pubchem_id></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>File .MOL</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=file name=con_file_mol1></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>File .MOL2</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=file name=con_file_mol2></td>
                        </tr>						
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][link_list_group][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>';
                            
                            echo $contentgroup_text;
                            
                        echo ' <br><span class=notif_red>*'.$_SESSION[lang][notif_add_before][$lang].' tab ADMIN | '.$_SESSION[lang][link_list_group][$lang].'. </span>
                            </td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="addkonten"/> 
                                <input name=add type=submit value="'.$_SESSION[lang][adding_senyawa_val][$lang].'" onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                    </table></form></center>';

            ?>
			</div>
		</div>
	</li>
	<li>
		<h3> ADMIN | <? echo $_SESSION[lang][spesies_val][$lang]; ?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php

                echo '<center>
                    <form enctype="multipart/form-data" action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br> '.$_SESSION[lang][adding_spesies_val][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>ID '.$_SESSION[lang][spesies_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=spe_species_id>
							<br><span style=color:#f77;font-style:italic;>'.$_SESSION[lang][notif_spe_id][$lang].'</br>
							</td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][spesies_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=spe_speciesname></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>Varietas</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=spe_varietyname></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>Family</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=spe_familyname></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][penemu_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=spe_foundername></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>Foto '.$_SESSION[lang][spesies_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=file name=spe_foto></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>';
                            
                            echo $ref_text;
                            
                        echo '
                            </td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="addspecies"/> 
                                <input name=add type=submit value="'.$_SESSION[lang][adding_spesies_val][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                    </table></form></center>';

            ?>
			</div>
		</div>
	</li>
	<li>
		<h3> ADMIN | <? echo $_SESSION[lang][assignment_val][$lang];?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
            ///*
                echo '<center>
                    <form name="parentform_assignment" action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br> '.$_SESSION[lang][assignment_val][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][spesies_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>
								<input type=hidden name="spe_id_assignment">
								<div id="div_spe_id_assignment"></div>
									<a href=\'#\' onClick="window.open(\'popspecies.php?f=assignment\',null, \'height=800px,width=1200px,status=yes,toolbar=no,menubar=no,location=no,scrollbars=yes\')";>'.$_SESSION[lang][klik_val][$lang].'</a>
                            </td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'. $_SESSION[lang][senyawa_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>
							<input type=hidden name="arr_con_id">
							<div id="div_con_id_assignment"></div>
								<a href=\'#\' onClick="window.open(\'popcontents.php?f=assignment\',null, \'height=800px,width=1200px,status=yes,toolbar=no,menubar=no,location=no,scrollbars=yes\')";>'.$_SESSION[lang][klik_val][$lang].'</a>
                            </td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>';
                            
                            echo $ref_text;
                            
                        echo '
                            </td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="addcontenttospecies"/> 
                                <input name=add type=submit value="'.$_SESSION[lang][assignment_val][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                    </table></form></center>';//*/

            ?>
			</div>
		</div>
	</li>	
	<li>
		<h3> ADMIN | <? echo $_SESSION[lang][aliases_val][$lang];?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
            
                echo '<center>
                    <form name="parentform_aliasname" action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br> '.$_SESSION[lang][add_aliases_val][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][spesies_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>
								<input type=hidden name="spe_id_aliasname">
								<div id="div_spe_id_aliasname"></div>
									<a href=\'#\' onClick="window.open(\'popspecies.php?f=aliasname\',null, \'height=800px,width=1200px,status=yes,toolbar=no,menubar=no,location=no,scrollbars=yes\')";>'.$_SESSION[lang][klik_val][$lang].'</a>
                            </td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][aliases_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=ali_speciesname></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][penemu_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=ali_foundername></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>Varietas</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=ali_varietyname></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>';
                            
                            echo $ref_text;
                            
                        echo '
                            </td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="addalias"/> 
                                <input name=add type=submit value="'.$_SESSION[lang][add_aliases_val][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                    </table></form></center>';

            ?>
			</div>
		</div>
	</li>
	<li>
		<h3> ADMIN | <? echo $_SESSION[lang][localname_val][$lang];?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
            
                echo '<center>
                    <form name="parentform_localname" action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br> '.$_SESSION[lang][add_localname_val][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][spesies_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>
								<input type=hidden name="spe_id_localname">
								<div id="div_spe_id_localname"></div>
									<a href=\'#\' onClick="window.open(\'popspecies.php?f=localname\',null, \'height=800px,width=1200px,status=yes,toolbar=no,menubar=no,location=no,scrollbars=yes\')";>'.$_SESSION[lang][klik_val][$lang].'</a>
                            </td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][localname_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=loc_localname ></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>Region</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=loc_region ></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="addlocal"/> 
                                <input name=add type=submit value="'.$_SESSION[lang][add_localname_val][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                    </table></form></center>';

            ?>
			</div>
		</div>
	</li>
	<li>
		<h3> ADMIN | <? echo $_SESSION[lang][link_list_group][$lang];?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
            
                echo '<center>
                    <form action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br> '.$_SESSION[lang][add_link_list_group][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][kode_link_list_group][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=contgroup_code ></td>
                        </tr> 
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][nama_link_list_group][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=contgroup_name ></td>
                        </tr> 
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="addgroupsenyawa"/> 
                                <input name=add type=submit value="'.$_SESSION[lang][add_link_list_group][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                    </table></form>';
					
				echo '
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=6><br>'.$_SESSION[lang][list_link_list_group][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;><br>No.<br><br></td>
                            <td style=text-align:left;padding-left:10px;><br>'.$_SESSION[lang][kode_link_list_group][$lang].'<br><br></td>
                            <td style=text-align:left;padding-left:10px;><br>'.$_SESSION[lang][nama_link_list_group][$lang].'<br><br></td>
                            <td style=text-align:left;padding-left:10px;><br>'.$_SESSION[lang][added_by][$lang].'<br><br></td>
                            <td style=text-align:left;padding-left:10px;><br>Status<br><br></td>';
							if($_SESSION[rol_id]!=3)
								echo '<td style=text-align:left;padding-left:10px;><br>'.$_SESSION[lang][action_val][$lang].'<br><br></td>';
						echo'
                        </tr>';
						
						$sql 	=	"select * from contentgroup order by contgroup_name asc";
						$q		=	dbSelectAssoc($conn,$sql);
						$ii 	=	1;					
						$ver_link	= '';
						
						foreach($q as $r) {
							$fullname 			= GetFieldFromTable("use_fullname","users"," where use_id=".$r[contgroup_insert_by]."",$conn);
							$linked_fullname 	= '<a href=index.php?v=profile&id='.$r[contgroup_insert_by].'>'.$fullname.'</a>';

							if($r[contgroup_verified_by]>0) {
								$status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].'</span>';
								if($_SESSION[rol_id]!=3)
									$ver_link = '
										<td style=text-align:left;padding-left:10px;>
										<a href="index.php?v=admin&act=unver&tbl=contentgroup&field=contgroup&id='.$r[contgroup_id].'">
											<img style="padding:3px;" src="images/circle_red.png" alt="unverify" title="unverify group senyawa" onclick="return confirm(\''.$_SESSION[lang][unver_confirm][$lang].'\')">
										</a></td>
									';
							}
							else {
								$status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
								if($_SESSION[rol_id]!=3)
									$ver_link = '
										<td style=text-align:left;padding-left:10px;>
										<a href="index.php?v=admin&act=ver&tbl=contentgroup&field=contgroup&id='.$r[contgroup_id].'">
											<img style="padding:3px;" src="images/circle_green.png" alt="verify" title="verify group senyawa" onclick="return confirm(\''.$_SESSION[lang][ver_confirm][$lang].'\')">
										</a></td>
									';
							}							
							
							echo '
								<tr style=background-color:#ffd;>
									<td style=text-align:left;padding-left:10px;>'.$ii++.'.</td>
									<td style=text-align:left;padding-left:10px;>'.$r[contgroup_code].'</td>
									<td style=text-align:left;padding-left:10px;>'.$r[contgroup_name].'</td>
									<td style=text-align:left;padding-left:10px;>'.$linked_fullname.'</td>
									<td style=text-align:left;padding-left:10px;>'.$status.'</td>
									'.$ver_link.'
								</tr>
							';
						}
					
				echo '	
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                    </table></center>
				';
				
            ?>
			</div>
		</div>
	</li>
	<li>
		<h3> ADMIN | <? echo $_SESSION[lang][ref_val][$lang];?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
            
                echo '<center>
                    <form action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br> '.$_SESSION[lang][add_ref_val][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][name_ref_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=ref_name></td>
                            <td style=text-align:center;>
                                <input name=form type=hidden value="addref"/> 
                                <input name=add type=submit value="'.$_SESSION[lang][add_ref_val][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr> 
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                    </table></form>';
					
				echo '
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=5><br> '.$_SESSION[lang][ref_list][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;><br>No.<br><br></td>
                            <td style=text-align:left;padding-left:10px;><br>'.$_SESSION[lang][name_ref_val][$lang].'<br><br></td>
                            <td style=text-align:left;padding-left:10px;><br>'.$_SESSION[lang][added_by][$lang].'<br><br></td>
                            <td style=text-align:left;padding-left:10px;><br>Status<br><br></td>';
							if($_SESSION[rol_id]!=3)
								echo '<td style=text-align:left;padding-left:10px;><br>'.$_SESSION[lang][action_val][$lang].'<br><br></td>';
						echo'
                        </tr>';
						
						$sql 	=	"select * from ref order by ref_name asc";
						$q		=	dbSelectAssoc($conn,$sql);
						$ii 	=	1;					
						$ver_link	= '';
						
						foreach($q as $r) {
							$fullname 			= GetFieldFromTable("use_fullname","users"," where use_id=".$r[ref_insert_by]."",$conn);
							$linked_fullname 	= '<a href=index.php?v=profile&id='.$r[ref_insert_by].'>'.$fullname.'</a>';

							if($r[ref_verified_by]>0) {
								$status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].'</span>';
								if($_SESSION[rol_id]!=3)
									$ver_link = '
										<td style=text-align:left;padding-left:10px;>
										<a href="index.php?v=admin&act=unver&tbl=ref&field=ref&id='.$r[ref_id].'">
											<img style="padding:3px;" src="images/circle_red.png" alt="unverify" title="unverify reference" onclick="return confirm(\''.$_SESSION[lang][unver_confirm][$lang].'\')">
										</a></td>
									';
							}
							else {
								$status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
								if($_SESSION[rol_id]!=3)
									$ver_link = '
										<td style=text-align:left;padding-left:10px;>
										<a href="index.php?v=admin&act=ver&tbl=ref&field=ref&id='.$r[ref_id].'">
											<img style="padding:3px;" src="images/circle_green.png" alt="verify" title="verify referensi" onclick="return confirm(\''.$_SESSION[lang][ver_confirm][$lang].'\')">
										</a></td>
									';
							}							
							
							echo '
								<tr style=background-color:#ffd;>
									<td style=text-align:left;padding-left:10px;>'.$ii++.'.</td>
									<td style=text-align:left;padding-left:10px;>'.$r[ref_name].'</td>
									<td style=text-align:left;padding-left:10px;>'.$linked_fullname.'</td>
									<td style=text-align:left;padding-left:10px;>'.$status.'</td>
									'.$ver_link.'
								</tr>
							';
						}
					
				echo '	
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                    </table></center>
				';

            ?>
			</div>
		</div>
	</li>
</ul>

<?php

    $autoopen = -1;
    if(!$insert) {
        if($_POST[form]=='addkonten')
            $autoopen = 0;    
        else if($_POST[form]=='addspecies')
            $autoopen = 1;    
        else if($_POST[form]=='addcontenttospecies')
            $autoopen = 2;    
        else if($_POST[form]=='addalias')
            $autoopen = 3;    
        else if($_POST[form]=='addlocal')
            $autoopen = 4;    
        else if($_POST[form]=='addgroupsenyawa')
            $autoopen = 5;    
        else if($_POST[form]=='addref')
            $autoopen = 6;    
    }
    
?>

<script type="text/javascript" src="functions/modules/tinyaccordion/script.js"></script>

<script type="text/javascript">

var parentAccordion=new TINY.accordion.slider("parentAccordion");
parentAccordion.init("acc","h3",-1,<?php echo $autoopen; ?>);

</script>

</html>    

<?php
    }

    else {
        echo 'You must be logged in as admin to access this fitur. <a href="index.php">Login</a>';
    }
    ?>