<?php session_start();
    require_once 'functions/reader.php';
    require_once 'functions/functions.php';

    if($_SESSION[logged_in]==1) {
	
		//debug($_FILES);
	
		if($_POST[form] =='addphotos') {
			debug($_POST);
			debug($_FILES);
			
			$arr_data[spe_id] = $_POST[spe_id_species_photos];
			
			for($ii=0;$ii<(count($_FILES));$ii++) {
				$fullname = 'uploadedfile_'.$ii;
				$fullnote = 'note_'.$ii;
				
				if($_FILES[$fullname][error]==0 and is_image($_FILES[$fullname][name])) {
				
					$upload = upload($_FILES,"speciesfiles",$arr_data[spe_id],_SPECIES_FILES_PATH,1024000); // 1 MB
					if($upload) {
						$arr_data[sph_filename] = $_FILES[$fullname][name];
						$arr_data[sph_note] 	= $_POST[$fullnote];
						$insert = dbInsertRow($conn,$arr_data,"species_photos","r");//debug($insert);
						if($insert) {
							$exist_success = true;
							$success_note.= "#".$j." [Ok]<br>";
						}
						else {
							$exist_failed = true;
							$failed_note.= "#".$j." [-]<br>";
						}						
					}
					if(!$upload)
						failed_note($_SESSION[lang][failed_upload][$lang]);
						
				}				
			}
			
			/////////////// end of if
		}
		else if($_POST[form] !='') {
			$file_ext = checkFileExtention($_FILES[uploadedfile][name]);
			if($file_ext=='xls' or $file_ext=='XLS')
				$upload = upload($_FILES,"uploadedfile",'',_UPLOADED_FILES_PATH,1024000);
			if(!$upload)
				failed_note($_SESSION[lang][failed_upload][$lang]);
			
			else {
				$filename       =   $_FILES[uploadedfile][name];
				$n_barisdata	=	$_POST[n_barisdata];
				$data 			= 	new Spreadsheet_Excel_Reader();
				
				$data->read($filename);
				error_reporting(E_ALL ^ E_NOTICE);

				///*
				if($_POST[form] == 'addspecies') {
					for ($j = 1; $j <= $n_barisdata; $j++) {
						
						if($data->sheets[0]['cells'][$j][1]!='') {
						
							$arr_data[spe_species_id]       =   $data->sheets[0]['cells'][$j][1];
							$arr_data[spe_speciesname]      =   $data->sheets[0]['cells'][$j][2];
							$arr_data[spe_foundername]      =   $data->sheets[0]['cells'][$j][3];
							$arr_data[spe_varietyname]      =   $data->sheets[0]['cells'][$j][4];
							
							// SET REFERENCE ID FROM REF NAME
							if($data->sheets[0]['cells'][$j][5]!='') {
								$ref_id = GetFieldFromTable("ref_id","ref"," where ref_name='".$data->sheets[0]['cells'][$j][5]."'",$conn);
								if($ref_id>0)
									$arr_data[ref_id]			=   $ref_id;
								else 
									$arr_data[ref_id]			=   insertNewReference($data->sheets[0]['cells'][$j][5],$_SESSION[use_id]);
							}
								
							$arr_data[spe_insert_by]        =   $_SESSION[use_id];
							$arr_data[spe_insert_date]      =   date("Y-m-d-h:i-a");
							$arr_data[spe_update_by]        =   $_SESSION[use_id];
							$arr_data[spe_update_date]      =   date("Y-m-d-h:i-a");

							$sql_cek_duplicated = "select count(*) as n_all from species where spe_species_id='".$arr_data[spe_species_id]."'";
							$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
							 
							if($q_cek_duplicated[n_all]>0) {
								failed_note($_SESSION[lang][duplicated_entry_notif][$lang].". [#".$j."]<br>");
								$exist_duplicated = true;
							}							
							else { 
								$insert = dbInsertRow($conn,$arr_data,"species","r");//debug($insert);
								if($insert) {
									$exist_success = true;
									$success_note.= "#".$j." [Ok]<br>";
								}
								else {
									$exist_failed = true;
									$failed_note.= "#".$j." [-]<br>";
								}
							}
						}
					}
					
					if(!$exist_failed and !$exist_duplicated)
						success_note($_SESSION[lang][success_adding_data][$lang]);
					else if(!$exist_success and !$exist_duplicated)
						failed_note($_SESSION[lang][failed_adding_data][$lang]);
					else 
						warning_note($failed_note."<br>---".$success_note);
				}
				//*/
				
				if($_POST[form] == 'addsenyawa') {
				
					for ($j = 1; $j <= $n_barisdata; $j++) {
						
						if($data->sheets[0]['cells'][$j][1]!='') {
						
							$arr_data[con_contentname]      =   $data->sheets[0]['cells'][$j][1];
							$arr_data[con_knapsack_id]      =   $data->sheets[0]['cells'][$j][2];
							$arr_data[con_metabolite_id]    =   $data->sheets[0]['cells'][$j][3];
							$arr_data[con_pubchem_id]      	=   $data->sheets[0]['cells'][$j][4];
							$arr_data[contgroup_id]      	=   $data->sheets[0]['cells'][$j][5];

							// SET contgroup_id FROM contgroup_name
							if($data->sheets[0]['cells'][$j][5]!='') {
								$contgroup_id = GetFieldFromTable("contgroup_id","contentgroup"," where contgroup_name='".$data->sheets[0]['cells'][$j][5]."'",$conn);
								if($contgroup_id>0)
									$arr_data[contgroup_id]			=   $contgroup_id;
								else 
									$arr_data[contgroup_id]			=   insertNewContentGroup($data->sheets[0]['cells'][$j][5],$_SESSION[use_id]);
							}
								
							$arr_data[con_insert_by]       =   $_SESSION[use_id];
							$arr_data[con_insert_date]     =   date("Y-m-d-h:i-a");
							$arr_data[con_update_by]       =   $_SESSION[use_id];
							$arr_data[con_update_date]     =   date("Y-m-d-h:i-a");
							//$arr_data[con_verified_by]     =   $_SESSION[use_id];
							//$arr_data[con_verified_date]   =   date("Y-m-d-h:i-a");
								
							$sql_cek_duplicated = "select count(*) as n_all from contents where con_contentname='".$arr_data[con_contentname]."'";
							$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
						 
							if($q_cek_duplicated[n_all]>0) {
								failed_note($_SESSION[lang][duplicated_entry_notif][$lang].". [#".$j."]<br>");
								$exist_duplicated = true;
							}
							else {

								$insert = dbInsertRow($conn,$arr_data,"contents");//debug($insert);
								if($insert) {
									$exist_success = true;
									$success_note.= "#".$j." [Ok]<br>";
								}
								else {
									$exist_failed = true;
									$failed_note.= "#".$j." [-]<br>";
								}
							}
							
						}

					}
						
					if(!$exist_failed and !$exist_duplicated)
						success_note($_SESSION[lang][success_adding_data][$lang]);
					else if(!$exist_success and !$exist_duplicated)
						failed_note($_SESSION[lang][failed_adding_data][$lang]);
					else 
						warning_note($failed_note."<br>---".$success_note);
				}
				//*/
			}	
		}
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
		<h3> UPLOAD | <?php echo $_SESSION[lang][spesies_val][$lang]; ?></h3>
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
                            <td style=text-align:left;padding-left:10px;>File Data</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px;padding:3px; type=file name=uploadedfile> <a href=example_'. $_SESSION[lang][spesies_val][$lang].'.xls>example '. $_SESSION[lang][spesies_val][$lang].'</a></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][baris_data_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>
								<select name=n_barisdata>';
								
								for($ii_n=1;$ii_n<=1000;$ii_n++)
									echo '<option value='.$ii_n.'>'.$ii_n.'</option>';
									
							echo '
								</select>
							</td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="addspecies"/> 
                                <input style=padding:5px; name=add type=submit value="'.$_SESSION[lang][adding_spesies_val][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                    </table></form></center>';

            ?>
			</div>
		</div>
	</li>
	<li>
		<h3> UPLOAD | <?php echo $_SESSION[lang][senyawa_val][$lang]; ?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php

                echo '<center>
                    <form enctype="multipart/form-data" action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br>'.$_SESSION[lang][adding_senyawa_val][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>File Data</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px;padding:3px; type=file name=uploadedfile> <a href=example_'.$_SESSION[lang][senyawa_val][$lang].'.xls>example '.$_SESSION[lang][senyawa_val][$lang].'</a></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][baris_data_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>
								<select name=n_barisdata>';
								
								for($ii_n=1;$ii_n<=1000;$ii_n++)
									echo '<option value='.$ii_n.'>'.$ii_n.'</option>';
									
							echo '
								</select>
							</td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="addsenyawa"/> 
                                <input style=padding:5px; name=add type=submit value="'.$_SESSION[lang][adding_senyawa_val][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                    </table></form></center>';

            ?>
			</div>
		</div>
	</li>
	<li>
		<h3> UPLOAD | <?php echo $_SESSION[lang][photos_val][$lang]; ?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php

                echo '<center>
                    <form name="parentform_species_photos" enctype="multipart/form-data" action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br>'.$_SESSION[lang][add_photos_val][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:10px;font-weight:bold;>'.$_SESSION[lang][spesies_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>
								<input type=hidden name="spe_id_species_photos">
								<div id="div_spe_id_species_photos"></div>
									<a href=\'#\' onClick="window.open(\'popspecies.php?f=species_photos\',null, 
										\'height=800px,width=1200px,status=yes,toolbar=no,menubar=no,location=no,scrollbars=yes\')";>'.$_SESSION[lang][klik_val][$lang].'
									</a>								
                            </td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:30px;>File Foto 1</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px;padding:3px; type=file name=uploadedfile_0>
								Note Foto 1 : <input name=note_0 type=text style=width:400px;>
							</td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:30px;>File Foto 2</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px;padding:3px; type=file name=uploadedfile_1>
								Note Foto 2 : <input name=note_1 type=text style=width:400px;>
							</td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding-left:30px;>File Foto 3</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px;padding:3px; type=file name=uploadedfile2>
								Note Foto 3 : <input name=note_2 type=text style=width:400px;>
							</td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="addphotos"/> 
                                <input style=padding:5px; name=add type=submit value="'.$_SESSION[lang][add_photos_val][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                    </table></form></center>';

            ?>
			</div>
		</div>
	</li>
</ul>

<?php

    $autoopen = 0;
    if(!$insert) {
        if($_POST[form]=='addspecies')
            $autoopen = 0;
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