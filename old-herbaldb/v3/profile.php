<?php session_start();
    require_once 'functions/functions.php';

    if($_SESSION[logged_in]==1) {
        
        
        if($_POST[form]=='changepassword') {
        
			if($_GET[id]>0) $id = $_GET[id];
			else $id = $_SESSION[use_id];
			
            $q = dbSelectAssoc($conn,"select use_password from users where use_id=".$id."");
            
            //if(md5($_POST[oldpassword])==$q[0][use_password]) {
            
                if($_POST[newpassword]==$_POST[renewpassword]) {
                
                    if($_POST[newpassword]!='') {
                        $data[use_password] = md5($_POST[newpassword]);
                        $q = dbUpdateRow($conn,$data,"users","where use_id=".$id."");
                        if($q)
                            success_note($_SESSION[lang][success_update_pass][$lang]);
                        else 
                            failed_note($_SESSION[lang][failed_update_pass][$lang]);
                    }
                    else 
                        failed_note($_SESSION[lang][failed_update_pass][$lang]);
                }
                else 
                    failed_note($_SESSION[lang][newpass_not_same][$lang]);
            //}
            //else 
                //failed_note($_SESSION[lang][wrong_old_pass][$lang]);
            
        }
        
        if($_POST[form]=='editdata') {
		
			//debug($_POST);
			//debug($_FILES);
        
            foreach($_POST as $key=>$data) {
                if($key!='edit' and $key!='form' and $key!='birth_y' and $key!='birth_m' and $key!='birth_d' and $key!='foto' and $key!='cv') {
                    if($data!='') $arr_data[$key] = $data;  
                    else $blank_field = true;
                }
            }
            
            if($blank_field) failed_note($_SESSION[lang][blank_field_notif][$lang]);
			else {
				$arr_data[use_birthdate]    =   $_POST[birth_y].'-'.$_POST[birth_m].'-'.$_POST[birth_d];
				//debug($arr_data);
				
				///*
				if($_FILES[foto][error] == 0) {
					$userfilespath	=	_USER_FILES_PATH;
					$uploadfoto = upload($_FILES,"foto",$arr_data[use_id],$userfilespath);
					if($uploadfoto)
						$arr_data[use_foto] = $_FILES[foto][name]; 
					else
						failed_note($_SESSION[lang][failed_upload_foto][$lang]);
				}
				//*/
				///*
				if($_FILES[cv][error] == 0) {
					$userfilespath	=	_USER_FILES_PATH;
					$uploadcv = upload($_FILES,"cv",$arr_data[use_id],$userfilespath);
					if($uploadcv)
						$arr_data[use_cv] = $_FILES[cv][name]; 
					else
						failed_note($_SESSION[lang][failed_upload_cv][$lang]);
				}
				//*/
				
				$q = dbUpdateRow($conn,$arr_data,"users","where use_id=".$arr_data[use_id]."");
				if($q)
					success_note($_SESSION[lang][success_update_profile][$lang]);
				else 
					failed_note($_SESSION[lang][failed_update_profile][$lang]);
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

<?php
	
	if($_GET[id]>0)
		$use_id		=	$_GET[id];
	else 
		$use_id		=	$_SESSION[use_id];
	
	
    $user_data 	= 	dbSingleRow($conn,"select * from users where use_id=".$use_id."");
	
	if($user_data[use_gender]==1) {
		$gender 		= $_SESSION[lang][male_val][$lang];
		$gender_check[1]= ' checked ';
	}
	else {
		$gender = $_SESSION[lang][female_val][$lang];
		$gender_check[2]= ' checked ';
	}
	
	$arr_birthdate = explode('-',$user_data[use_birthdate]);
	$y_val	= $arr_birthdate[0];
	$m_val	= $arr_birthdate[1];
	$d_val	= $arr_birthdate[2];
	//debug($user_data);
	//debug($arr_birthdate);
	$userfilespath	=	_USER_FILES_PATH;

echo '
    <li>
		<h3>PROFILE | BIODATA</h3>
		<div class="acc-section">
			<div class="acc-content">
                <table width="98%" border="0">
                    <tr>
                        <td width="175px" rowspan="15" valign=top>
                            <img alt="Foto '.$user_data[use_fullname].'" src="'.$userfilespath.'/'.$user_data[use_id].'/'.$user_data[use_foto].'" width="95%" height="95%">
                        </td>
                        <td width="150px" style="padding:3px;">'.$_SESSION[lang][field_fullname][$lang].'</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$user_data[use_fullname].'</td>
                    </tr>
                    <tr>
                        <td style="padding:3px;">'.$_SESSION[lang][field_gender][$lang].'</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$gender.'</td>
                    </tr>
                    <tr>
                        <td style="padding:3px;">'.$_SESSION[lang][field_birthdate][$lang].'</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$user_data[use_birthdate].'</td>
                    </tr>
					<!--
                    <tr>
                        <td style="padding:3px;">Pekerjaan</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$user_data[use_occupation].'</td>
                    </tr>
                    <tr>
                        <td style="padding:3px;">Negara</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$user_data[use_country].'</td>
                    </tr>
                    <tr>
                        <td style="padding:3px;">Kota</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$user_data[use_city].'</td>
                    </tr>
                    <tr>
                        <td style="padding:3px;">Alamat</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$user_data[use_use_address].'</td>
                    </tr>
					-->
                    <tr>
                        <td style="padding:3px;">Role</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.GetFieldFromTable("rol_name","roles"," where rol_id=".$user_data[rol_id]."",$conn).'</td>
                    </tr>
                    <tr>
                        <td style="padding:3px;">Email</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$user_data[use_email].'</td>
                    </tr>
                    <tr>
                        <td style="padding:3px;">Registration Date</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$user_data[use_reg_date].'</td>
                    </tr>';
					
			if($user_data[use_cv]!='')
				$cv_link_or_note = '<a href="'.$userfilespath.'/'.$user_data[use_id].'/'.$user_data[use_cv].'">'.$user_data[use_cv].'</a>';
			else 
				$cv_link_or_note = $_SESSION[lang][cv_note][$lang];
					
			echo '
                    <tr>
                        <td style="padding:3px;">Curriculum Vitae (CV)</td>
                        <td width="3px" >:</td>
                        <td style="padding:3px;">'.$cv_link_or_note.'</td>
                    </tr>
                    <tr>
                        <td style="padding:3px;">&nbsp;</td>
                        <td width="3px" >&nbsp;</td>
                        <td style="padding:3px;">&nbsp;</td>
                    </tr>
                </table>
            </div>
		</div>
	</li>';
	
	if($_SESSION[use_id] == $_GET[id] or $_GET[id]=='' or $_SESSION[rol_id]==1) {
	
		echo '
		<li>
			<h3>PROFILE | EDIT BIODATA</h3>
			<div class="acc-section">
				<div class="acc-content">
					<center>
						<form enctype="multipart/form-data" action="" method="post">
						<table border=0 width=100%>
							<tr style=background-color:#eee;>
								<td style=text-align:left;padding:10px;>'.$_SESSION[lang][field_fullname][$lang].'</td>
								<td style=text-align:left;padding:10px;><input style=width:300px;padding:3px; type=text name=use_fullname value="'.$user_data[use_fullname].'"></td>
							</tr>
							<tr style=background-color:#eee;>
								<td style=text-align:left;padding:10px;>Foto<br> <span style="font-size:10px;color:red;">max file size 250kb</span></td>
								<td style=text-align:left;padding:10px;><input name="foto" style="width:250px;" type="file" /> </td>
							</tr>
							<tr style=background-color:#eee;>
								<td style=text-align:left;padding:10px;>Curriculum Vitae (CV)<br> <span style="font-size:10px;color:red;">max file size 250kb</span></td>
								<td style=text-align:left;padding:10px;><input name="cv" style="width:250px;" type="file" /> </td>
							</tr>
							<tr style=background-color:#eee;>
								<td style=text-align:left;padding:10px;>'.$_SESSION[lang][field_gender][$lang].'</td>
								<td style=text-align:left;padding:10px;>
									<input type=radio name=use_gender value=1 '.$gender_check[1].'> '.$_SESSION[lang][male_val][$lang].'
									<input type=radio name=use_gender value=2 '.$gender_check[2].'> '.$_SESSION[lang][female_val][$lang].'
								</td>
							</tr>
							<tr style=background-color:#eee;>
								<td style=text-align:left;padding:10px;>'.$_SESSION[lang][field_birthdate][$lang].'</td>
								<td style=text-align:left;padding:10px;>
									<select style=padding:3px; name="birth_d"><option> </option>';
										
										for($ii=1;$ii<=31;$ii++) {
											if($ii==$d_val) $selected = ' selected';
											echo '<option style=padding:3px; value='.$ii.' '.$selected.'> '.$ii.' </option>';
											if($selected!='') $selected = '';
										}
										
									echo 
									'</select>			  
									<select style=padding:3px;width:125px; name="birth_m"><option> </option>';
									
										for($ii=1;$ii<=12;$ii++) {
											if($ii==$m_val) $selected = ' selected';
											echo '<option style=padding:3px; value='.$ii.' '.$selected.'> '.GetMonthNameFromId($ii).' </option>';
											if($selected!='') $selected = '';
										}								
									echo
									'</select>
									<select style=padding:3px; name="birth_y"><option> </option>';
									
										$start_y = date("Y")-10;
										$end_y = date("Y")-100;
										for($ii=$start_y;$ii>=$end_y;$ii--) {
											if($ii==$y_val) $selected = ' selected';
											echo '<option style=padding:3px; value='.$ii.' '.$selected.'> '.$ii.' </option>';
											if($selected!='') $selected = '';
										}										
									echo
									'</select>
								</td>
							</tr>
							<tr style=background-color:#eee;>
								<td style=text-align:left;padding:10px;>Email</td>
								<td style=text-align:left;padding:10px;><input style=width:300px;padding:3px; type=text name=use_email value="'.$user_data[use_email].'"></td>
							</tr>
							<tr style=background-color:#eee;>
								<td style=text-align:left;padding:10px;>Role</td>
								<td style=text-align:left;padding:10px;>
									'.GetFieldFromTable("rol_name","roles"," where rol_id=".$user_data[rol_id]."",$conn).'
								</td>
							</tr>
							<tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
							<tr style=background-color:#fff;>
								<td colspan=3 style=text-align:center;>
									<input name=form type=hidden value="editdata"/> 
									<input name=use_id type=hidden value="'.$user_data[use_id].'"> 
									<input style=padding:5px; name=edit type=submit value="Save Changes"  onclick="return confirm(\'Klik CANCEL untuk mengecek kembali data yang diinput. Klik OK untuk melanjutkan.\')" /> 
								</td>
							</tr>
						</table></form></center>
			</div>
		</li>
		<li>
			<h3>PROFILE | PASSWORD</h3>
			<div class="acc-section">
				<div class="acc-content">
						<form enctype="multipart/form-data" method="post" action="">
						<center>
							<table width="450" style="border-style:outset;border-color:rgb(230,230,200);">
								<tr align="center">
									<td style="font-family:verdana;">
										<table border="0" >
											<tr valign="middle" align="center">
												<td colspan="2" style="padding:10px 0px 10px 0px;">
														&nbsp;
												</td>
											</tr>
											<!--<tr>
												<td style="padding:5px 0px 5px 0px;" ><span style="font-size:small;color:orange;">'.$_SESSION[lang][field_oldpass][$lang].'</span></td>
												<td style="padding-left:20px;"><input type="password" name="oldpassword"></td>
											</tr>-->
											<tr>
												<td style="padding:5px 0px 5px 0px;" ><span style="font-size:small;color:green;">'.$_SESSION[lang][field_newpass][$lang].'</span></td>
												<td style="padding-left:20px;"><input type="password" name="newpassword"></td>
											</tr>
											<tr>
												<td style="padding:5px 0px 5px 0px;" ><span style="font-size:small;color:green;">'.$_SESSION[lang][field_retypenewpass][$lang].'</span></td>
												<td style="padding-left:20px;"><input type="password" name="renewpassword"></td>
											</tr>
											<tr valign="middle" align="center">
												<td colspan="2" style="padding-left:10px;text-align:center;"><br>
													<input name="form" type="hidden" value="changepassword">
													<input style=padding:5px; name="button_pressed" type="hidden" value="1">
													<button type="submit" value="Submit &lt;button&gt;" class="submit">    
														<span ><span>Change Password</span></span>
													</button>
													<br><br>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</center>
						</form>
				</div>
			</div>
		</li>';
	}
	
echo '
</ul>';

    $autoopen = 0;
    if(!$update) {
        if($_POST[form]=='editdata')
            $autoopen = 1;    
        if($_POST[form]=='changepassword')
            $autoopen = 2;    

    }
  

echo '
    <script type="text/javascript" src="functions/modules/tinyaccordion/script.js"></script>
    <script type="text/javascript">
    var parentAccordion=new TINY.accordion.slider("parentAccordion");
    parentAccordion.init("acc","h3",-1,'.$autoopen.');
    </script>
    </html>';

    }

    else {
        echo 'You must be logged in to access this fitur. <a href="index.php">Login</a>';
    }
    ?>