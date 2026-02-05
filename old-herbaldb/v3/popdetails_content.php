<?php session_start();
	unset($lang);
	if($_SESSION[mylang][key]!='en') $_SESSION[mylang][key] = 'id';
	$lang	=	$_SESSION[mylang][key];
	require_once 'lang_db.php';
    require_once 'functions/functions.php';
	
    //if($_SESSION[logged_in]==1) {
		if($_POST[form]=='editkonten') {
		
			$arr_data[con_id]	= $_GET[con_id];
			//$sql_cek_duplicated = "select count(*) as n_all from contents where con_contentname='".$_POST[con_contentname]."'";
			//$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
			
			if($_POST[mol_type]=='mol1') {
				if($_FILES[con_file_mol1][error] == 0) {
					if(is_mol1($_FILES[con_file_mol1][name])) {
						$uploadmol= upload($_FILES,"con_file_mol1",'',_MOL1_FILES_PATH);
						if($uploadmol)
							$arr_data[con_file_mol1] = $_FILES[con_file_mol1][name];
						else $mol1_failed = true;
					}
					else $mol1_invalid = true;
				}
				
				if(!$mol1_failed and !$mol1_invalid) {
					$arr_data[con_update_by]       =   $_SESSION[use_id];
					$arr_data[con_update_date]     =   date("Y-m-d-h:i-a");
					
					$update = dbUpdateRow($conn,$arr_data,"contents"," where con_id=".$arr_data[con_id]."",'r');//debug($update); 
					if($update)
						success_note($_SESSION[lang][success_update][$lang]);
					else
						failed_note($_SESSION[lang][failed_update][$lang]);					
				}
				else if($mol1_failed)
					failed_note($_SESSION[lang][mol1_failed][$lang]);
				else if($mol1_invalid)
					failed_note($_SESSION[lang][mol1_invalid][$lang]);
			}			
			else if($_POST[mol_type]=='mol2') {
				if($_FILES[con_file_mol2][error] == 0) {
					if(is_mol2($_FILES[con_file_mol2][name])) {
						$uploadmol= upload($_FILES,"con_file_mol2",'',_MOL2_FILES_PATH);
						if($uploadmol)
							$arr_data[con_file_mol2] = $_FILES[con_file_mol2][name];
						else $mol2_failed = true;
					}
					else $mol2_invalid = true;
				}
				
				if(!$mol2_failed and !$mol2_invalid) {
					$arr_data[con_update_by]       =   $_SESSION[use_id];
					$arr_data[con_update_date]     =   date("Y-m-d-h:i-a");
					
					$update = dbUpdateRow($conn,$arr_data,"contents"," where con_id=".$arr_data[con_id]."",'r');//debug($update); 
					if($update)
						success_note($_SESSION[lang][success_update][$lang]);
					else
						failed_note($_SESSION[lang][failed_update][$lang]);					
				}
				else if($mol2_failed)
					failed_note($_SESSION[lang][mol2_failed][$lang]);
				else if($mol2_invalid)
					failed_note($_SESSION[lang][mol2_invalid][$lang]);
			}
		}
	
		if($_POST[form]=='addcomment') {
			if($_SESSION[logged_in]==1) {
				foreach($_POST as $key=>$data) {
					if($key!='add' and $key!='form') {
						if($data!='') $arr_data[$key] = $data;  
						else $blank_field = true;
					}
				}
				
				if($blank_field) failed_note($_SESSION[lang][blank_field_notif][$lang]);		
				else {
					//debug($_POST);
					//debug($arr_data);
					$arr_data[comcon_insert_date]     =   date("Y-m-d-h:i-a");
					$insert = dbInsertRow($conn,$arr_data,"comments_contents");
					if($insert) success_note($_SESSION[lang][success_add_comment][$lang]);
					else failed_note($_SESSION[lang][failed_add_comment][$lang]);				
				}
			}
			else failed_note($_SESSION[lang][not_logged_in_notif][$lang]);
		}
    
        // EKSEKUSI DELETE
        else if($_GET[act]=='del') {
            $q_del = dbQuery($conn,"delete from ".$_GET[tbl]." where ".$_GET[field]."_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_del_data][$lang]);
            else 
                failed_note($_SESSION[lang][failed_del_data][$lang]);
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
    
        $con_id = $_GET[con_id];
        $con_contentname = GetFieldFromTable("con_contentname","contents"," where con_id='".$_GET[con_id]."'",$conn);
        
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title> <? echo $_SESSION[lang][web_title][$lang]; ?> </title>
<link rel="stylesheet" href="functions/modules/tinyaccordion/style.css" type="text/css" />
</head>
<div id="options">
	<a href="javascript:parentAccordion.pr(1)">Expand All</a> | <a href="javascript:parentAccordion.pr(-1)">Collapse All</a>
</div>

<ul class="acc" id="acc">
	<li>
		<h3><?php echo $con_contentname; ?> | <? echo $_SESSION[lang][link_list_species_cont][$lang].' '.$con_contentname; ?> </h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
                
                $sql = "SELECT s.spe_id, s.spe_speciesname, s.spe_species_id, sc.ref_id
						FROM speciescontent AS sc, species AS s
						WHERE con_id ='".$con_id."'
						AND sc.spe_id = s.spe_id
						ORDER BY s.spe_speciesname ASC";
                $q = dbSelectAssoc($conn,$sql);
                
                echo '<center><table border=0 width=98%>
                        <tr style=background-color:#dd5;>
                            <td style=text-align:left;padding-left:10px;><br>No.<br><br></td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][spesies_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                        </tr>';
                      
				$ii = 1;
                if(count($q)>0) {
				
                    foreach($q as $r) {
                        
                        if($ii%2==1) $col = 'ffe';
                        else $col = '#fafafa';
						
						$ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
						$linked_speciesname = '<a onClick="window.open(\'popdetails.php?speciesid='.$r[spe_species_id].'\',null, \'height=800px,width=1000px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r[spe_species_id].'</a> | '.$r[spe_speciesname].'';
                        echo '
                            <tr style=background-color:'.$col.';>
                                <td style=text-align:left;padding-left:10px;><br>'.$ii++.'.<br><br></td>
                                <td style=text-align:left;padding-left:10px;>'.$linked_speciesname.'</td>
                                <td style=text-align:left;padding-left:10px;>'.$ref_id.'</td>
                            </tr>';                        
                    }

                }
                else echo '
                        <tr><td colspan=10 style=text-align:center;><br>'.$_SESSION[lang][data_not_exist][$lang].'<br><br></td></tr>';

            ?>
			</table></center></div>
		</div>

	</li>
	<li>
		<h3><?php echo $con_contentname; ?> | <? echo $_SESSION[lang][download_file_mol][$lang];?> </h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
                
                $sql = "SELECT con_file_mol1,con_file_mol2
						FROM contents AS sc 
						WHERE con_id ='".$con_id."'";
                $q = dbSingleRow($conn,$sql);
                
                echo '<center><table border=0 width=98%>
                        <tr style=background-color:#dd5;>
                            <td style=text-align:left;padding-left:10px;><br>MOL1<br><br></td>
                            <td style=text-align:left;padding-left:10px;><br>MOL2<br><br></td>
                        </tr>';
				
				if($q[con_file_mol1]=='') $file_mol1	=	'--not found--';
				else $file_mol1 = '<a href="'._MOL1_FILES_PATH.$q[con_file_mol1].'"><img src="images/download_button.jpg">
					<span style="font-size:20px;">'.$q[con_file_mol1].'</span></a>';						
						
				if($q[con_file_mol2]=='') $file_mol2	=	'--not found--';
				else $file_mol2 = '<a href="'._MOL2_FILES_PATH.$q[con_file_mol2].'"><img src="images/download_button.jpg">
					<span style="font-size:20px;">'.$q[con_file_mol2].'</span></a>';						
						
				$ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
				
				if($_SESSION[rol_id]==1) {
					$form_mol1	=
						'
						<form method=post enctype="multipart/form-data" action=""><br>
							<table border=0>
								<tr style=background-color:#fff;>
									<td style=text-align:left;padding-left:10px;> >> Upload File .MOL</td>
									<td style=text-align:left;padding-left:10px;><input style=width:200px; type=file name=con_file_mol1></td>
									<td style=text-align:center;>
										<input name=form type=hidden value="editkonten"/> 
										<input name=mol_type type=hidden value="mol1"/> 
										<input name=add type=submit value="Upload" onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
									</td>
								</tr>
								<tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
								<tr style=background-color:#fff;>
								</tr>
							</table><br><br>
						</form>						
						';
					$form_mol2	=
						'
						<form method=post enctype="multipart/form-data" action=""><br>
							<table border=0>
								<tr style=background-color:#fff;>
									<td style=text-align:left;padding-left:10px;> >> Upload File .MOL2</td>
									<td style=text-align:left;padding-left:10px;><input style=width:200px; type=file name=con_file_mol2></td>
									<td style=text-align:center;>
										<input name=form type=hidden value="editkonten"/> 
										<input name=mol_type type=hidden value="mol2"/> 
										<input name=add type=submit value="Upload" onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
									</td>
								</tr>
								<tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
								<tr style=background-color:#fff;>
								</tr>
							</table><br><br>
						</form>						
						';
				}
				
				echo '
					<tr style=background-color:'.$col.';>
						<td style=text-align:left;padding-left:10px;><br>'.$file_mol1.$form_mol1.'
						</td>
						<td style=text-align:left;padding-left:10px;><br>'.$file_mol2.$form_mol2.'
						</td>
					</tr>';
				
            ?>
			</table></center></div>
		</div>
	</li>	
	<li>
		<h3><?php echo $con_contentname; ?> | <? echo $_SESSION[lang][comment_val][$lang]; ?> </h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
                
                $sql = "select * from comments_contents where con_id='".$con_id."' order by comcon_id asc";
                $q = dbSelectAssoc($conn,$sql);
                
                echo '<center><table border=0 width=98%>
                        <tr style=background-color:#dd5;>
                            <td style=text-align:left;padding-left:10px;><br>No.<br><br></td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][date_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][comment_val][$lang].'</td>
                        </tr>';
                      
				$ii = 1;
                if(count($q)>0) {
				
                    foreach($q as $r) {
                        
                        if($ii%2==1) $col = 'ffe';
                        else $col = '#fafafa';
						
						$fullname			= GetFieldFromTable("use_fullname","users"," where use_id='".$r[use_id]."'",$conn);
						$linked_fullname 	= '<a target=blank href=index.php?v=profile&id='.$r[use_id].'>'.$fullname.'</a>';
						
                        echo '
                            <tr style=background-color:'.$col.';>
                                <td style=text-align:left;padding-left:10px;><br>'.$ii++.'.<br><br></td>
                                <td style=text-align:left;padding-left:10px;>'.$r[comcon_insert_date].'</td>
                                <td style=text-align:left;padding-left:10px;>
									<br>'.$linked_fullname.' '.$_SESSION[lang][say_comment_val][$lang].' :
									<br><br>
										<center><div style=margin:5px;padding:5px;background-color:#fff;text-align:justify;>'.$r[comcon_content].'</div></center>
									<br>
								</td>
                            </tr>';                        
                    }

                }
                else echo '
                        <tr><td colspan=10 style=text-align:center;><br>'.$_SESSION[lang][data_not_exist][$lang].'<br><br></td></tr>';
                
                echo '
                        <tr style=background-color:#ffe;>
						<form method=post>
                            <td style=text-align:left;padding-left:10px;><br>'.$ii.'.<br><br></td>
                            <td style=text-align:left;padding-left:10px;><br></td>
                            <td style=text-align:left;padding-left:10px;>
								<br><b>'.$_SESSION[lang][fill_comment_val][$lang].'</b><br><br>
								<textarea style=width:450px;height:100px; name=comcon_content></textarea><br>
                                <input name=form type=hidden value="addcomment"/>
                                <input name=use_id type=hidden value="'.$_SESSION[use_id].'"/>
                                <input name=con_id type=hidden value="'.$con_id.'"/>
                                <br><input name=add type=submit value="'.$_SESSION[lang][fill_comment_val][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
								<br><br>
							</td>
						</form>
                        </tr>				
					</table></center>';

            ?>
			</div>
		</div>

	</li>
</ul>

<script type="text/javascript" src="functions/modules/tinyaccordion/script.js"></script>

<script type="text/javascript">

var parentAccordion=new TINY.accordion.slider("parentAccordion");
parentAccordion.init("acc","h3",-1,0);

</script>

</html>    

<?php
/*
    }

    else {
        echo 'You must be logged in to access this fitur. <a href="index.php">Login</a>';
    }
	*/
    ?>