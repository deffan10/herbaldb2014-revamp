<?php session_start();
    require_once 'functions/functions.php';

    if($_SESSION[rol_id]==1) {
        
        if($_POST[add]!='') {
            //debug($_POST);
            //debug($_FILES);
            
            foreach($_POST as $key=>$data) {
                if($key!='add' and $key!='form' and $key!='arr_con_id' and $key!='birth_y' and $key!='birth_m' and $key!='birth_d') {
                    if($data!='') $arr_data[$key] = $data;  
                    else $blank_field = true;
                }
            }
            
            if($blank_field) failed_note($_SESSION[lang][blank_field_notif][$lang]);
            
            else {
            
                // add user
                if($_POST[form]=='adduser') {
                    //$sql_cek_duplicated = "";
                    //$q_cek_duplicated = dbSingleRow($conn,$sql_cek_duplicated);
                    $q_cek_duplicated[n_all] = 0;
                     
                    if($q_cek_duplicated[n_all]>0)
                        failed_note($_SESSION[lang][duplicated_entry_notif][$lang]);
                    else {
                        $arr_data[use_fullname]     =   strtoupper(htmlspecialchars($arr_data[use_fullname], ENT_QUOTES));
                        $arr_data[use_password]     =   md5($arr_data[use_password]);
						$arr_data[use_birthdate]    =   $_POST[birth_y].'-'.$_POST[birth_m].'-'.$_POST[birth_d];
                    
                        $arr_data[use_is_active]    =   '0';
                        $arr_data[use_reg_date]     =   date("Y-m-d-h:i-a");
                        
                        $insert = dbInsertRow($conn,$arr_data,"users");
                        if($insert) success_note($_SESSION[lang][success_adding_data][$lang]);
                        else failed_note($_SESSION[lang][failed_insert_notif][$lang]);
                    }
                }
                
            }                

        }
		if($_POST[edituser]==1) {
			//debug($_POST);
			//debug($_SESSION);
			
			foreach($_POST as $key=>$data) {
				if($key!='edituser') {
					//if($data!='') 
						$arr_data[$key] = $data;  
					//else $blank_field = true;
				}
			}	
			if($blank_field)
				failed_note($_SESSION[lang][blank_field_notif][$lang]);

			$arr_data[use_update_date]          = date("d-m-Y-H:i-a");
			$arr_data[use_update_by] 	        = $_SESSION[use_id];	
			
			$update = dbUpdateRow($conn,$arr_data,"users"," where use_id=".$arr_data[use_id]."",'r');//debug($update); 
			if($update)
				success_note($_SESSION[lang][success_update][$lang]);
			else
				failed_note($_SESSION[lang][failed_update][$lang]);			
		}		
        
        
        if($_GET[douser]=='act') {
            $q_del = dbQuery($conn,"update users set use_is_active='1' where use_id=".$_GET[id]."");
            if($q_del) {
                success_note($_SESSION[lang][success_act_user][$lang]); 
                $user_data = dbSingleRow($conn,"select * from users where use_id=".$_GET[id]."");
                $ADMIN_EMAIL = _ADMIN_EMAIL;
                $send_email  = sendActivationEmail($user_data[use_email],$user_data,$user_data[use_username],'', $ADMIN_EMAIL);
                if($send_email)
                    success_note($_SESSION[lang][success_send_email][$lang],true);
                else 
                    failed_note($_SESSION[lang][failed_send_email][$lang]);
            }
            else 
                failed_note($_SESSION[lang][failed_act_user][$lang]);
        }        
        
        else if($_GET[douser]=='deact') {
            $q_del = dbQuery($conn,"update users set use_is_active='0' where use_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_deact_user][$lang]);
            else 
                failed_note($_SESSION[lang][failed_deact_user][$lang]);
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
		<h3> USER | <? echo $_SESSION[lang][field_add_user][$lang];?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
                echo '<center>
                    <form action="" method="post">
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=3><br> '.$_SESSION[lang][field_add_user][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding:10px;>'.$_SESSION[lang][field_fullname][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px;padding:3px; type=text name=use_fullname></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding:10px;>'.$_SESSION[lang][field_gender][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>
                                <input type=radio name=use_gender value=1 checked=checked> '.$_SESSION[lang][male_val][$lang].'
                                <input type=radio name=use_gender value=2> '.$_SESSION[lang][female_val][$lang].'
                            </td>
                        </tr>
						<tr style=background-color:#eee;>
							<td style=text-align:left;padding:10px;>'.$_SESSION[lang][field_birthdate][$lang].'</td>
							<td style=text-align:left;padding-left:10px;>
								<select name="birth_d" width:125px;><option> </option>';
									
									for($ii=1;$ii<=31;$ii++)
										echo '<option style=padding:3px; value='.$ii.'> '.$ii.' </option>';
									
								echo 
								'</select>			  
								<select name="birth_m" width:125px;><option> </option>';
								
									for($ii=1;$ii<=12;$ii++)
										echo '<option style=padding:3px; value='.$ii.'> '.GetMonthNameFromId($ii).' </option>';
								
								echo
								'</select>
								<select name="birth_y" width:125px;><option> </option>';
								
									$start_y = date("Y")-10;
									$end_y = date("Y")-100;
									for($ii=$start_y;$ii>=$end_y;$ii--)
										echo '<option style=padding:3px; value='.$ii.'> '.$ii.' </option>';
								echo
								'</select>
							</td>
						</tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding:10px;>Email</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px;padding:3px; type=text name=use_email></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding:10px;>Username</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px;padding:3px; type=text name=use_username></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding:10px;>Password</td>
                            <td style=text-align:left;padding-left:10px;><input style=width:300px;padding:3px; type=text name=use_password></td>
                        </tr>
                        <tr style=background-color:#eee;>
                            <td style=text-align:left;padding:10px;>Role</td>
                            <td style=text-align:left;padding-left:10px;>';
                            
                            $rol_id = dbSelectAssoc($conn,"select * from roles order by rol_name asc");
                            
                            echo '<select name=rol_id style=width:125px;><option></option>';
                                
                                foreach($rol_id as $r)
                                    echo '<option style=text-align:left;padding:3px; value='.$r[rol_id].'>'.$r[rol_name].'</option>';
                            
                            echo '</select>';
                            
                        echo '
                            </td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                        <tr style=background-color:#fff;>
                            <td colspan=3 style=text-align:center;>
                                <input name=form type=hidden value="adduser"/> 
                                <input style=padding:5px; name=add type=submit value="'.$_SESSION[lang][field_add_user][$lang].'"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                            </td>
                        </tr>
                    </table></form></center>';

            ?>
			</div>
		</div>
	</li>
	<li>
		<h3> USER |  <? echo $_SESSION[lang][field_list_user][$lang];?></h3>
		<div class="acc-section">
			<div class="acc-content">
            <?php
            
                echo '<center>
                    <table border=0 width=100%>
                        <tr style=background-color:#dd5;padding:5px;>
                            <td style=text-align:center; colspan=10><br> '.$_SESSION[lang][field_list_user][$lang].'<br><br></td>
                        </tr>
                        <tr style=background-color:#fff;><td colspan=10>&nbsp;</td></tr>
                        <tr style=background-color:#ddd;>
                            <td style=text-align:left;padding-left:10px;font-weight:bold;><br>No.<br><br></td>
                            <td style=text-align:left;padding-left:10px;font-weight:bold;>'.$_SESSION[lang][field_fullname][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;font-weight:bold;>Email</td>
                            <td style=text-align:left;padding-left:10px;font-weight:bold;>Role</td>
                            <td style=text-align:left;padding-left:10px;font-weight:bold;>Status</td>
                            <td style=text-align:left;padding-left:10px;font-weight:bold;>'.$_SESSION[lang][action_val][$lang].'</td>
                        </tr> 
                        <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>';
                        
                    $sql    = "select * from users order by use_fullname asc";
                    $q      = dbSelectAssoc($conn,$sql);
                    
                    if(count($q)>0) {
						$arr_rol_id = dbSelectAssoc($conn,"select * from roles order by rol_name asc");
                        $ii = 1;
                        foreach($q as $r) {
                        
                            if($ii%2==1) $col = '#eee';
                            else $col = '#fff';
                            
							$rol_id	=	GetFieldFromTable("rol_id","users"," where use_id=".$r[use_id]."",$conn);
							
							if($r[use_is_active]!=1) {
								$status = '<b style=color:red;>not active</b>';
								$act = '<a href=index.php?v=adm_user&douser=act&id='.$r[use_id].'><i>activate</i></a> |';
							}
							else {
								$status = '<b style=color:green;>active</b>';
								$act = '<a href=index.php?v=adm_user&douser=deact&id='.$r[use_id].'><i>deactivate</i></a> |';
							}
							
							//else $act = GetFieldFromTable("rol_name","roles"," where rol_id=".$rol_id."",$conn);
							
                            echo '
								<form method=post>
                                <tr style=background-color:'.$col.';>
                                    <td style=text-align:left;padding-left:10px;><br>'.$ii++.'.<br><br></td>
                                    <td style=text-align:left;padding-left:10px;><a target=blank href=index.php?v=profile&id='.$r[use_id].'>'.$r[use_fullname].'</a></td>
                                    <td style=text-align:left;padding-left:10px;>'.$r[use_email].'</td>
                                    <td style=text-align:left;padding-left:10px;>'.role_dropdown($conn,$arr_rol_id,$r[rol_id]).'</td>
                                    <td style=text-align:left;padding-left:10px;>'.$status.'</td>
                                    <td style=text-align:left;padding-left:10px;>'.$act.' 
										<input type=hidden name="use_id" value='.$r[use_id].'>
										<input type=hidden name="edituser" value=1>
										<input type=submit value="Save">
									</td>
                                </tr>    
								</form>
                            ';
                        }
                    }
                    else 
                        echo '
                            <tr style=background-color:#ddd;>
                                <td colspan=10> '.$_SESSION[lang][data_not_exist][$lang].'</td>
                            </tr>                         
                        ';    
                        
                    echo '
                    </table></center>';

            ?>
			</div>
		</div>
	</li>
</ul>

<?php

    $autoopen = 1;
    if(!$insert) {
        if($_POST[form]=='adduser')
            $autoopen = 0;    
        if($_POST[form]=='appuser')
            $autoopen = 1;    

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