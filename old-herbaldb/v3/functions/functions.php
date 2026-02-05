<?php session_start();

	require_once 'dbutils.php';
	
function getmaxid($table,$col,$where=null) {
	global $conn;
	$sql = "select max(".$col.") as maxid from ".$table." ";
	if($where!=null)
		$sql.= $where;
	$q = dbSingleRow($conn,$sql);
	return $q['maxid'];
}

function GetMonthNameFromId($id) {
	
	$month[1] = 'Januari';
	$month[2] = 'Februari';
	$month[3] = 'Maret';
	$month[4] = 'April';
	$month[5] = 'Mei';
	$month[6] = 'Juni';
	$month[7] = 'Juli';
	$month[8] = 'Agustus';
	$month[9] = 'September';
	$month[10] = 'Oktober';
	$month[11] = 'Nopember';
	$month[12] = 'Desember';

	if(is_numeric($id) and $id>=1 and $id<=12)
		$result = $month[$id];
	else $result = '';

	return $result;
}

function getDateElement($date,$part) { // ex : 12-9-2009
	$dateParts = explode('-',$date);
	if($part=='y') $result = $dateParts['2'];	   // return 2009 
	else if($part=='m') $result = $dateParts['1'];  // return 9
	else if($part=='d') $result = $dateParts['0'];  // return 12
	return $result;
}

function is_image($filename) {
    $is_img = false;
    $arr_filename = explode(".",$filename);
    $n_arr_filename = count($arr_filename);
    if( 
        $arr_filename[$n_arr_filename-1]=='jpg' || $arr_filename[$n_arr_filename-1]=='JPG' ||
        $arr_filename[$n_arr_filename-1]=='png' || $arr_filename[$n_arr_filename-1]=='PNG' ||
        $arr_filename[$n_arr_filename-1]=='bmp' || $arr_filename[$n_arr_filename-1]=='BMP' ||
        $arr_filename[$n_arr_filename-1]=='gif' || $arr_filename[$n_arr_filename-1]=='GIF' ||
        $arr_filename[$n_arr_filename-1]=='tif' || $arr_filename[$n_arr_filename-1]=='TIF' ||
        $arr_filename[$n_arr_filename-1]=='jpeg' || $arr_filename[$n_arr_filename-1]=='JPEG'
    )
        $is_img = true;
    return $is_img;
}

function is_mol1($filename) {
    $is_mol1 = false;
    $arr_filename = explode(".",$filename);
    $n_arr_filename = count($arr_filename);
    if( 
        $arr_filename[$n_arr_filename-1]=='mol' || $arr_filename[$n_arr_filename-1]=='MOL'
    )
        $is_mol1 = true;
    return $is_mol1;
}

function is_mol2($filename) {
    $is_mol2 = false;
    $arr_filename = explode(".",$filename);
    $n_arr_filename = count($arr_filename);
    if( 
        $arr_filename[$n_arr_filename-1]=='mol2' || $arr_filename[$n_arr_filename-1]=='MOL2'
    )
        $is_mol2 = true;
    return $is_mol2;
}

function createFile($path) {
	
	$filename = $path.'/index.html';
	$somecontent = "-nna-";

	if (!$handle = fopen($filename, 'a')) {
		 echo "Cannot open file ($filename)";
		 exit;
	}

	// Write $somecontent to our opened file.
	if (fwrite($handle, $somecontent) === FALSE) {
		echo "Cannot write to file ($filename)";
		exit;
	}

	fclose($handle);	
}

function checkDirectory($dir){

	// CEK APAKAH DIREKTORI $target_path.$id ada..?
	// bila tidak ada maka BUATKAN..! dan create file index.html di dalamnya
	
	$dir_exist = false;
	if(!is_dir($dir)) {
		if(mkdir($dir)) {
			// create index.html file to deactivate automatic dir content listing
			//createFile($dir);
			$dir_exist = true;	
				if (chgrp($dir,'users') and chown($dir,'herbaldb')) { // group 100 (USER), owner 1093 (HERBALDB)
					echo "Success change chgrp and chown to ".$dir;
				}
				else {
					echo "Cannot change chgrp and chown to ".$dir;
					exit;
				}		
		}
	}
	else 
		$dir_exist = true;
	
	return $dir_exist;
}

function upload($_FILES,$var_name,$id,$target_path, $maxsize = 300000){
	$is_success = false;
	$file = basename($_FILES[$var_name][name]);
	    
	if($_FILES[$var_name][size]<=$maxsize) {  // max file size 250kb
		
		// cek existing directory
		$dir = checkDirectory($target_path.$id);
		
		if($dir) {
			$target_path = $target_path.'/'.$id.'/'.$file;
			if(move_uploaded_file($_FILES[$var_name]['tmp_name'], $target_path))	 {
				$is_success = true;
			}
		}
	}
	
	return $is_success;
}

function debug($msg) {
	echo '<pre style="background-color:#ccccff;color:black;text-align:left;">';
		print_r($msg);
	echo '</pre>';
}
function success_note($msg,$noblink=true) {
	
	if($noblink==true) {
		$blink_start = '';
		$blink_end = '';  
	}
	if($noblink==false) {
		$blink_start  = '<blink>';
		$blink_end = '</blink>';
	}


	echo '<center><div style="width:600px;padding:5px;font-weight:bold;font-size:16px;background-color:'.SUCCESS_COLOR.';color:black;text-align:center;">'.$blink_start;
		echo $msg;
	echo $blink_end.'</div></center>';

}
function failed_note($msg,$noblink=true) {
	if($noblink==true) {
		$blink_start = '';
		$blink_end = '';  
	}
	if($noblink==false) {
		$blink_start = '<blink>';
		$blink_end = '</blink>';
	}


	echo '<center><div style="width:600px;padding:5px;font-weight:bold;font-size:16px;background-color:'.FAILED_COLOR.';color:black;text-align:center;">'.$blink_start;
		echo $msg;
	echo $blink_end.'</div></center>';
}

function warning_note($msg,$noblink=true) {
	if($noblink==true) {
		$blink_start = '';
		$blink_end = '';  
	}
	if($noblink==false) {
		$blink_start = '<blink>';
		$blink_end = '</blink>';
	}


	echo '<div width=300px style="padding:5px;font-weight:bold;font-size:16px;background-color:#ffc;color:black;text-align:center;">'.$blink_start;
		echo $msg;
	echo $blink_end.'</div>';
}

function paging($start,$N,$N_per_pages,$href) {

	// $start   --> bila kita berada di halaman pertama hasil pencarian, maka $start=0, dst.
	// $N	   --> jumlah total baris record yg akan di-paging
	// $N_per_pages --> mengambil nilai dari MAX_SEARCH_RESULT_LINE
	// $href	--> misal "http://localhost/apps/kse/new/adm_search.php?mode=search"

	$n = (int)($N/$N_per_pages);
	$nLink = $n ;
	if($N % $N_per_pages != 0) $n +=1;
	
	if(($start+1)==$n) $next = 'next';
	else $next = '<a style="color:#900000;" href="'.$href.'&start='.($start+1).'">next</a>';
	
	if($start == 0) $prev = 'prev';
	else $prev = '<a style="color:#900000;" href="'.$href.'&start='.($start-1).'">prev</a>';
	
	$result= '  <div style="text-align:center;">
					<center>
						<a style="color:#900000;" href="'.$href.'&start=0">first</a> |
						'.$prev.' | 
						Page : <span style="color:red;"><b>'.($start+1).'</b></span> of <b>'.$n.'</b> page(s) | 
						'.$next.' |
						<a style="color:#900000;" href="'.$href.'&start='.$nLink.'">end</a>
					</center>
				</div><br>';
	
	return $result;
}

function loginBox(){

	echo '
    <div id="gbox">
        <div id="gbox-top"></div>
        
        <div id="gbox-bg">
        
          <div id="gbox-grd">
            <h2>Login Ke Sistem</h2><br>
            
            <div>
              <form method="post" enctype="multipart-form-data" action="functions/login.php">
                <table border="0" id="loginbox">
                <tr>
                       <td>Username</td>
                       <td>:</td>
					   <td><input type="text" class="text" name="username" /></td>
                </tr>
                <tr>
                       <td>Password</td>
                       <td>:</td>
					   <td><input type="password" class="text" name="password" /></td>
                </tr>
                <tr>
                       <td colspan=3 style="height:15px;"></td>
                </tr>
                <tr>
                       <td colspan=3 align=center><input style="font-size:17px;" type="submit" name="login" value="&nbsp;&nbsp;Login&nbsp;&nbsp;"></td>
                </tr>
                </table>
              </form>
            </div>
          </div>
        </div>
        <div id="gbox-bot"> </div>
    </div>
    ';
}
function GetFieldFromTable($field,$table,$where=null,$conn) {

	$sql = "select ".$field." from ".$table." ";
	if($where!=null)
		$sql.=$where;
	$data = dbSelectAssoc($conn,$sql);
	return $data[0][$field];
}

function GetAllRowTable($table, $where=null, $orderby=null, $conn) {

	$sql = "select * from ".$table."";
	if($where!=null)
		$sql.= " ".$where;
	if($orderby!=null)
		$sql.= " ".$orderby;
	$data = dbSelectAssoc($conn,$sql);
	return $data;
}

function DateConverter($date,$conn) {

	// $date = 16-3-2010-00.08-am
	
	$arr = explode("-",$date);
	if(is_numeric($arr[1]))
		$arr[1] = $arr[1] + 6;	  // January => ID = 7 on table categories
	$month = GetCategoriesDetails($conn,$arr[1]);
	
	$result = $arr[0].' '.$month.' '.$arr[2];
	
	if($arr[3]!='')
		$result.=', '.$arr[3].''.$arr[4];
	
	return $result;
	
}

function SelectMonths($bulan='bulan',$data=-1) {

    if($data>0)
        $selected[$data] = ' selected';

    $months = '
        <select name='.$bulan.'>
            <option value=""></option>
            <option value=1 '.$selected[1].'>Januari</option>
            <option value=2 '.$selected[2].'>Februari</option>
            <option value=3 '.$selected[3].'>Maret</option>
            <option value=4 '.$selected[4].'>April</option>
            <option value=5 '.$selected[5].'>Mei</option>
            <option value=6 '.$selected[6].'>Juni</option>
            <option value=7 '.$selected[7].'>Juli</option>
            <option value=8 '.$selected[8].'>Agustus</option>
            <option value=9 '.$selected[9].'>September</option>
            <option value=10 '.$selected[10].'>Oktober</option>
            <option value=11 '.$selected[11].'>Nopember</option>
            <option value=12 '.$selected[12].'>Desember</option>
        </select>    
    ';

    return $months;
}

function sendEmail($email_to,$arr_data,$uname,$pass,$admin=null) {
    $result = false;
    $to = $email_to;
    $arr_email = explode("@",$email_to);
    $arr_domain = explode(".",$arr_email);
    
    $subject = "Registrasi Database 3D Senyawa Aktif Tanaman Obat Indonesia";
    $subject_admin = "[New Registration] Database 3D Senyawa Aktif Tanaman Obat Indonesia";
    
    $body_admin = "
                    Telah terdaftar user baru dengan data sebagai berikut :
                    
                        Nama : ".$arr_data[use_fullname]."
                        Email : ".$arr_data[use_email]."
                        Role : ".$arr_data[rol_id]."
                        
                    Silakan aktivasi user tersebut dengan terlebih dahulu login ke sistem.
    ";
    
    $body = "
                Anda telah berhasil ter-registrasi ke Database 3D Senyawa Aktif Tanaman Obat Indonesia.
                Account anda baru bisa digunakan setelah mendapat konfirmasi dari Admin.
                
                Berikut ini account anda untuk mengakses sistem: 
                
                    Username :  ".$uname."
                    Password :  ".$pass."
                
                Terima kasih,
                
                Pengurus Database 3D Senyawa Aktif Tanaman Obat Indonesia
                
            ";

    if($arr_domain[0]=='gmail')
    $header = "From: [Database 3D Senyawa Aktif Tanaman Obat Indonesia] ".$admin."\r\nReply-To: ".$admin."";
    else 
        $header = "From: ".$admin."\r\nReply-To: ".$admin."\r\nX-Message-Status: n:0\r\nX-AUTH-Result: NONE";

    //if (mail($to, $subject, $body, $header) and mail($admin, $subject_admin, $body_admin, $header))
        $result = true;
        
    return $result;
}

function sendActivationEmail($email_to,$arr_data,$uname,$pass,$admin=null) {
    $result = false;
    $to = $email_to;
    $arr_email = explode("@",$email_to);
    $arr_domain = explode(".",$arr_email);
    
    $subject = "Activasi Account Database 3D Senyawa Aktif Tanaman Obat Indonesia";
    
    $body = "
                Account anda di Database 3D Senyawa Aktif Tanaman Obat Indonesia sudah diaktivasi oleh Admin.
                
                Silakan gunakan account (username + password yang sudah diberikan sebelumnya) untuk mengakses sistem.
                
                Terima kasih,
                
                Pengurus Database 3D Senyawa Aktif Tanaman Obat Indonesia
                
            ";

    if($arr_domain[0]=='gmail')
    $header = "From: [Database 3D Senyawa Aktif Tanaman Obat Indonesia] ".$admin."\r\nReply-To: ".$admin."";
    else 
        $header = "From: ".$admin."\r\nReply-To: ".$admin."\r\nX-Message-Status: n:0\r\nX-AUTH-Result: NONE";

    //if (mail($to, $subject, $body, $header))
        $result = true;
        
    return $result;
}

function insertNewReference($refname,$user_id) {

	global $conn;
	
	$arr_data[ref_name]       	   =   $refname;
	$arr_data[ref_insert_by]       =   $_SESSION[use_id];
	$arr_data[ref_insert_date]     =   date("Y-m-d-h:i-a");
	$arr_data[ref_update_by]       =   $_SESSION[use_id];
	$arr_data[ref_update_date]     =   date("Y-m-d-h:i-a");

	$insert = dbInsertRow($conn,$arr_data,"ref");
	
	if($insert) $ref_id = getmaxid("ref","ref_id");
	else $ref_id = 0;
	
	return $ref_id;
}

function insertNewContentGroup($contgroup_name,$user_id) {

	global $conn;
	
	$arr_data[contgroup_name]       	 =   $contgroup_name;
	$arr_data[contgroup_insert_by]       =   $_SESSION[use_id];
	$arr_data[contgroup_insert_date]     =   date("Y-m-d-h:i-a");
	$arr_data[contgroup_update_by]       =   $_SESSION[use_id];
	$arr_data[contgroup_update_date]     =   date("Y-m-d-h:i-a");

	$insert = dbInsertRow($conn,$arr_data,"contentgroup");
	
	if($insert) $contgroup_id = getmaxid("contentgroup","contgroup_id");
	else $contgroup_id = 0;
	
	return $contgroup_id;
}

function checkFileExtention($filename) {
	$arr_dot 	= explode(".",$filename);
	$n_elemen	= count($arr_dot);
	
	return $arr_dot[$n_elemen-1];
}

function ref_dropdown($conn,$arr_ref,$ref_id) {
	// REFERENCE ID
	$ref_text.='<select name=ref_id style=width:100px;><option></option>';
		foreach($arr_ref as $r) {
			if($r[ref_id]==$ref_id)
				$selected = ' selected ';
			$ref_text.='<option style=text-align:left;padding-left:10px; value='.$r[ref_id].' '.$selected.'>'.$r[ref_name].'</option>';
			if($selected != '')
				$selected = '';
		}
	$ref_text.='</select>';
	return $ref_text;
}

function contgroup_dropdown($conn,$arr_group,$group_id){
	// CONTENTGROUP ID
	$contentgroup_text.='<select name=contgroup_id style=width:100px;><option></option>';
		foreach($arr_group as $r) {
			if($r[contgroup_id]==$group_id)
				$selected = ' selected ';
			$contentgroup_text.='<option style=text-align:left;padding-left:10px; value='.$r[contgroup_id].' '.$selected.'> ('.$r[contgroup_code].') | '.$r[contgroup_name].'</option>';
			if($selected != '')
				$selected = '';			
		}
	$contentgroup_text.='</select>';
	return $contentgroup_text;
}

function role_dropdown($conn,$arr_rol,$rol_id) {
	$rol_text.= '<select name=rol_id style=width:125px;><option></option>';
		foreach($arr_rol as $r) {
			if($r[rol_id]==$rol_id)
				$selected = ' selected ';
			$rol_text.= '<option style=text-align:left;padding-left:10px; value='.$r[rol_id].' '.$selected.'>'.$r[rol_name].'</option>';
			if($selected != '')
				$selected = '';			
		}
	$rol_text.= '</select>';
	return $rol_text;
}

?>