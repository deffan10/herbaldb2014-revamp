<?php session_start();
    require_once 'functions/functions.php';

    //if($_SESSION[logged_in]!=1) {
        
        if($_POST[add]!='') {
            //debug($_POST);
            //debug($_FILES);
            
            foreach($_POST as $key=>$data) {
                if($key!='add' and $key!='form' and $key!='birth_y' and $key!='birth_m' and $key!='birth_d') {
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
                        $pass_ori                   =   $arr_data[use_password];
                        $arr_data[use_fullname]     =   strtoupper(htmlspecialchars($arr_data[use_fullname], ENT_QUOTES));
                        $arr_data[use_password]     =   md5($pass_ori);
                        $arr_data[use_pass_ori]     =   $pass_ori;
                        $arr_data[use_birthdate]    =   $_POST[birth_y].'-'.$_POST[birth_m].'-'.$_POST[birth_d];
						
                        $arr_data[use_is_active]    =   '0';
                        $arr_data[use_reg_date]     =   date("Y-m-d-h:i-a");
                        
                        $ADMIN_EMAIL                =   _ADMIN_EMAIL;
                        
                        $insert = dbInsertRow($conn,$arr_data,"users","r");//debug($insert);
                        if($insert) {
                            
							if($lang=='id')
								success_note("  <br><h3 style=color:dark;>Mohon Perhatikan Informasi/Petunjuk Di Halaman Ini</h3><br>
												<hr><br><br>Registrasi Berhasil Dilakukan. <br>
												Anda telah ter-registrasi ke Database 3D Senyawa Aktif Tanaman Obat Indonesia. 
												<br><br>Account anda baru bisa digunakan setelah mendapat konfirmasi dari Admin.<br><br>
												<br><b>Account Anda<br><br>Username : ".$arr_data[use_username]."<br>Password : ".$pass_ori."</b>
												<br><br>
													<span style=color:red;>
													Bila sudah mendapat konfirmasi, segera login ke sistem dan ubah password anda.
													</span>
												<br><br>",true
											);
							else 
								success_note("  <br><h3 style=color:dark;>Please read information in this page carefully.</h3><br>
												<hr><br><br>Registration done successfully.
												You are now registered as Member in Database of Active Compounds of Indonesian's Medical Plants. 
												Your account can not be used to access more fitures in this system until Administrator activate your account.<br><br>
												Your account details<br><br>Username : ".$arr_data[use_username]."<br>Password : ".$pass_ori."</b>
												<br><br>
													<span style=color:red;>
													If your account has been activated, please login to the system and change your password immediatelly.
													</span>
												<br><br>",true
											);
                                            
                            $send_email = sendEmail($arr_data[use_email],$arr_data,$arr_data[use_username],$pass_ori, $ADMIN_EMAIL);
                            if($send_email)
                                success_note($_SESSION[lang][success_send_email][$lang]);
                            else 
                                failed_note($_SESSION[lang][failed_send_email][$lang]);
                        }
                        
                        else failed_note($_SESSION[lang][failed_insert_notif][$lang]);
                        
                    }
                }
                
            }                

        }
   
        if(!$insert) {
            echo '<center>
                <form action="" method="post">
                <table border=0 width=100%>
                    <tr style=background-color:#dd5;padding:5px;>
                        <td style=text-align:center; colspan=3><h3> REGISTER</h3></td>
                    </tr>
                    <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                    <tr style=background-color:#eee;>
                        <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][field_fullname][$lang].'</td>
                        <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=use_fullname></td>
                    </tr>
                    <tr style=background-color:#eee;>
                        <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][field_gender][$lang].'</td>
                        <td style=text-align:left;padding-left:10px;>
                            <input type=radio name=use_gender value=1 checked=checked> '.$_SESSION[lang][male_val][$lang].'
                            <input type=radio name=use_gender value=2> '.$_SESSION[lang][female_val][$lang].'
                        </td>
                    </tr>
                    <tr style=background-color:#eee;>
                        <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][field_birthdate][$lang].'</td>
                        <td style=text-align:left;padding-left:10px;>
                            <select name="birth_d"><option> </option>';
                                
                                for($ii=1;$ii<=31;$ii++)
                                    echo '<option value='.$ii.'> '.$ii.' </option>';
                                
                            echo 
                            '</select>			  
                            <select name="birth_m"><option> </option>';
                            
                                for($ii=1;$ii<=12;$ii++)
                                    echo '<option value='.$ii.'> '.GetMonthNameFromId($ii).' </option>';
                            
                            echo
                            '</select>
                            <select name="birth_y"><option> </option>';
                            
                                $start_y = date("Y")-10;
                                $end_y = date("Y")-100;
                                for($ii=$start_y;$ii>=$end_y;$ii--)
                                    echo '<option value='.$ii.'> '.$ii.' </option>';
                            echo
                            '</select>
                        </td>
                    </tr>
                    <tr style=background-color:#eee;>
                        <td style=text-align:left;padding-left:10px;>Email</td>
                        <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=use_email></td>
                    </tr>
                    <tr style=background-color:#eee;>
                        <td style=text-align:left;padding-left:10px;>Username</td>
                        <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=use_username></td>
                    </tr>
                    <tr style=background-color:#eee;>
                        <td style=text-align:left;padding-left:10px;>Password</td>
                        <td style=text-align:left;padding-left:10px;><input style=width:300px; type=text name=use_password></td>
                    </tr>
                    <tr style=background-color:#eee;>
                        <td style=text-align:left;padding-left:10px;>Role</td>
                        <td style=text-align:left;padding-left:10px;>';
                        
                        $rol_id = dbSelectAssoc($conn,"select * from roles order by rol_name asc");
                        
                        echo '<select name=rol_id style=width:300px;><option></option>';
                            
                            foreach($rol_id as $r) {
                                if($r[rol_id]!=1)
                                    echo '<option style=text-align:left;padding-left:10px; value='.$r[rol_id].'>'.$r[rol_name].'</option>';
                            }
                        
                        echo '</select>';
                        
                    echo '
                        </td>
                    </tr>
                    <tr style=background-color:#fff;><td colspan=3>&nbsp;</td></tr>
                    <tr style=background-color:#fff;>
                        <td colspan=3 style=text-align:center;>
                            <input name=form type=hidden value="adduser"/> 
                            <input name=add type=submit value="Register"  onclick="return confirm(\''.$_SESSION[lang][field_confirm_insert][$lang].'\')" /> 
                        </td>
                    </tr>
                </table></form></center>';
        }

	/*
    }

    else {
        echo 'You must be logged out to access this fitur. <a style=color:red; href="functions/logout.php">Logout</a>';
    }
	*/
    ?>