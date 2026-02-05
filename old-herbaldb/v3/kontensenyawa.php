<?php session_start();

		if($_POST[editcontent]==1) {
			//debug($_POST);
			//debug($_SESSION);
			
			foreach($_POST as $key=>$data) {
				if($key!='editcontent') {
					//if($data!='') 
						$arr_data[$key] = $data;  
					//else $blank_field = true;
				}
			}	
			if($blank_field)
				failed_note($_SESSION[lang][blank_field_notif][$lang]);

			$arr_data[con_update_date]          = date("d-m-Y-H:i-a");
			$arr_data[con_update_by] 	        = $_SESSION[use_id];	
			
			$update = dbUpdateRow($conn,$arr_data,"contents"," where con_id=".$arr_data[con_id]."",'r');//debug($update); 
			if($update)
				success_note($_SESSION[lang][success_update][$lang]);
			else
				failed_note($_SESSION[lang][failed_update][$lang]);			
		}
		
        // EKSEKUSI DELETE
        if($_GET[act]=='delcontent') {
            $q_del = dbQuery($conn,"delete from contents where con_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_del_data][$lang]);
            else 
                failed_note($_SESSION[lang][failed_del_data][$lang]);
        }
    
        // EKSEKUSI VERIFIKASI
        if($_GET[act]=='vercontent') {
            $q_del = dbQuery($conn,"update contents set con_verified_by=".$_SESSION[use_id].", con_verified_date='".date("Y-m-d-h:i-a")."' where con_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_verify_data][$lang]);
            else 
                failed_note($_SESSION[lang][failed_verify_data][$lang]);
        }
    
        // EKSEKUSI UNVERIFIKASI
        if($_GET[act]=='unvercontent') {
            $q_del = dbQuery($conn,"update contents set con_verified_by=-".$_SESSION[use_id].", con_verified_date='".date("Y-m-d-h:i-a")."' where con_id=".$_GET[id]."");
            if($q_del)
                success_note($_SESSION[lang][success_unverify_data][$lang]);
            else 
                failed_note($_SESSION[lang][failed_unverify_data][$lang]);
        }        
        
    $sql_all = "select count(con_id) as n_all from contents"; 
    $kontensenyawa_all = dbSelectAssoc($conn, $sql_all); //debug($kontensenyawa_all);
    
    $n_perpages = _N_PERPAGES/2;
    
    if($_GET[start]=='') $start = 0;
    else $start = $_GET[start];
    
    $sql = "select * from contents order by con_id desc limit 0,".$n_perpages."";
    $kontensenyawa = dbSelectAssoc($conn, $sql);
	
	if($_SESSION[rol_id]==1)
		$edit_view = '| <a href=?v=kontensenyawa&editview=true&start='.$_GET[start].'>Edit view</a>';	
    
        echo '<h3><a href=?v=kontensenyawa>'.$_SESSION[lang][daftar_recent_konten_senyawa][$lang].'</a> '.$edit_view.'</h3>
            <table border=0 width=100%>
                <tr style="background-color:#dd5;">
                    <td style=text-align:center;><br>No.<br><br></td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][senyawa_val][$lang].'</td>
                    <td style=text-align:center;>ID Knapsack</td>
                    <td style=text-align:center;>ID Metabolite</td>
                    <td style=text-align:center;>ID Pubchem</td>
';

/* *****  TEMPORARY REMOVE***
                    <td style=text-align:center;>ID Grup '.$_SESSION[lang][senyawa_val][$lang].'</td>
*/
echo '
                    <td style=text-align:left;padding-left:10px;>Status</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][action_val][$lang].'</td>
                </tr>';
                
        $ii_spesies = 1;
		if($_GET[editview]=='true' and $_SESSION[rol_id]==1) {
		
			$arr_contgroup_id = dbSelectAssoc($conn,"select * from contentgroup order by contgroup_name asc");
            foreach($kontensenyawa as $r) {

                if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
                if($r[con_verified_by]>0) {
                    $status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].'</span>';
                }
                else {
                    $status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
                }				

                echo '<form method=post>
                        <tr style="background-color:'.$col.';padding:5px;">
                          <td style=text-align:center;>'.$ii_spesies++.'.</td>
						  <td style=text-align:left;padding-left:10px;><input name=con_contentname type=text value="'.$r[con_contentname].'"></td>
                          <td style=text-align:center;><input style=width:100px; name=con_knapsack_id type=text value="'.$r[con_knapsack_id].'"></td>
                          <td style=text-align:center;><input style=width:100px; name=con_metabolite_id type=text value="'.$r[con_metabolite_id].'"></td>
                          <td style=text-align:center;><input style=width:100px; name=con_pubchem_id type=text value="'.$r[con_pubchem_id].'"></td>
';
			
/****		
                          <td style=text-align:center;>'.contgroup_dropdown($conn,$arr_contgroup_id,$r[contgroup_id]).'</td>
*****/            
echo '
			  <td style=text-align:center;>'.$status.'</td>
                          <td style=text-align:left;padding-left:10px;>
								<input type=hidden name="con_id" value='.$r[con_id].'>
								<input type=hidden name="editcontent" value=1>
								<input type=submit value="Save">
                          </td>                          
                        </tr>
						</form>';
            }		
		}
		else {
            foreach($kontensenyawa as $r) {

                if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
                
                $contgroup_name = GetFieldFromTable("contgroup_name","contentgroup"," where contgroup_id=".$r[contgroup_id]."",$conn);
                $del_link = '
                    <a href="index.php?v=kontensenyawa&act=delcontent&id='.$r[con_id].'">
                        <img style="padding:3px;" src="images/cancel_16.png" alt="delete" title="delete content" onclick="return confirm(\'Klik CANCEL untuk batal. Klik OK untuk melanjutkan menghapus content.\')">
                    </a>                
                ';
                
                if($r[con_verified_by]>0) {
                    $status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' <a target=blank href="?v=profile&id='.$r[con_verified_by].'">'.GetFieldFromTable("use_fullname","users"," where use_id=".$r[con_verified_by]."",$conn).'</a></span>';
                    $ver_link = '
                        <a href="index.php?v=kontensenyawa&act=unvercontent&id='.$r[con_id].'">
                            <img style="padding:3px;" src="images/circle_red.png" alt="unverify" title="unverify content" onclick="return confirm(\'Klik CANCEL untuk batal. Klik OK untuk melanjutkan verifikasi content.\')">
                        </a>
                    ';
                }
                else  if($_SESSION[rol_id]!=''){
                    $status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
                    $ver_link = '
                        <a href="index.php?v=kontensenyawa&act=vercontent&id='.$r[con_id].'">
                            <img style="padding:3px;" src="images/circle_green.png" alt="verify" title="verify content" onclick="return confirm(\'Klik CANCEL untuk batal. Klik OK untuk melanjutkan verifikasi content.\')">
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
						  <td style=text-align:left;padding-left:10px;><a onClick="window.open(\'popdetails_content.php?con_id='.$r[con_id].'\',null, \'height=800px,width=1000px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r[con_contentname].'</a></td>
                          <td style=text-align:center;>'.$r[con_knapsack_id].'</td>
                          <td style=text-align:center;>'.$r[con_metabolite_id].'</td>
                          <td style=text-align:center;>'.$r[con_pubchem_id].'</td>
';
/******
                          <td style=text-align:center;>'.$contgroup_name.'</td>
*******/
echo '
                          <td style=text-align:center;>'.$status.'</td>
                          <td style=text-align:left;padding-left:10px;>
                            '.$ver_link.'
                            '.$del_link.'
                          </td>                          
                        </tr>';
            }
		}
            
        echo '</table><br>';
		
        
    $sql_all = "select count(con_id) as n_all from contents"; 
    $kontensenyawa_all = dbSelectAssoc($conn, $sql_all); //debug($kontensenyawa_all);
    
    $n_perpages = _N_PERPAGES;

    if($_GET[sortby]=='con_knapsack_id')
        $sortby = "con_knapsack_id asc";
    else if($_GET[sortby]=='con_metabolite_id')
        $sortby = "con_metabolite_id asc";
    else if($_GET[sortby]=='con_pubchem_id')
        $sortby = "con_pubchem_id asc";
    else if($_GET[sortby]=='contgroup_id')
        $sortby = "contgroup_id asc";
    else $sortby = "con_contentname asc";
    
    if($_GET[start]=='') $start = 0;
    else $start = $_GET[start];
    
    $sql = "select * from contents order by ".$sortby." limit ".$_GET[start]*$n_perpages.",".$n_perpages."";
    $kontensenyawa = dbSelectAssoc($conn, $sql);

/*********************************************** TABLE TITLE *********************************/    
    echo '
	<h3><a href=?v=kontensenyawa>'.$_SESSION[lang][daftar_konten_senyawa][$lang].'</a> '.$edit_view.'</h3>
	<div style=text-align:center;>'.$_SESSION[lang][exist_total][$lang].'  <b>'.$kontensenyawa_all[0][n_all].'</b> data. <a href=download.php?data=senyawa><b>DOWNLOAD</b></a><br>';
    echo paging($start,$kontensenyawa_all[0][n_all],$n_perpages,"index.php?v=kontensenyawa&sortby=".$_GET[sortby]."");
    echo '</div>';
		
/************************************************ TABLE HEADER ******************************/
        echo '
            <table border=0 width=100%>
                <tr style="background-color:#dd5;">
                    <td style=text-align:center;><br>No.<br><br></td>
                    <td style=text-align:left;padding-left:10px;><a href="index.php?v=kontensenyawa&sortby=con_contentname">'.$_SESSION[lang][senyawa_val][$lang].'</a></td>
                    <td style=text-align:center;><a href="index.php?v=kontensenyawa&sortby=con_knapsack_id">ID Knapsack</a></td>
                    <td style=text-align:center;><a href="index.php?v=kontensenyawa&sortby=con_metabolite_id">ID Metabolite</a></td>
                    <td style=text-align:center;><a href="index.php?v=kontensenyawa&sortby=con_pubchem_id">ID Pubchem</a></td>';
			
			
/*****
                    <td style=text-align:center;><a href="index.php?v=kontensenyawa&sortby=contgroup_id">ID Grup '.$_SESSION[lang][senyawa_val][$lang].'</a></td>
	
******/
echo '		


                    <td style=text-align:left;padding-left:10px;>Status</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][action_val][$lang].'</td>
                </tr>';
          
/************************************************* TABLE CONTENT ***************************/      
        $ii_spesies = 1;

        /******** CHECK EDIT STATUS **********/   
		if($_GET[editview]=='true' and $_SESSION[rol_id]==1) {
		
			$arr_contgroup_id = dbSelectAssoc($conn,"select * from contentgroup order by contgroup_name asc");
   
        /******* CHEK VERIFICATION STATUS ****/
        foreach($kontensenyawa as $r) {

                if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
                if($r[con_verified_by]>0) {
                    $status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].'</span>';
                }
                else {
                    $status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
                }				
       /******** SHOW CONTENT **********/
                echo '<form method=post>
                        <tr style="background-color:'.$col.';padding:5px;">
                          <td style=text-align:center;>'.$ii_spesies++.'.</td>
						  <td style=text-align:left;padding-left:10px;><input name=con_contentname type=text value="'.$r[con_contentname].'"></td>
                          <td style=text-align:center;><input style=width:100px; name=con_knapsack_id type=text value="'.$r[con_knapsack_id].'"></td>
                          <td style=text-align:center;><input style=width:100px; name=con_metabolite_id type=text value="'.$r[con_metabolite_id].'"></td>
                          <td style=text-align:center;><input style=width:100px; name=con_pubchem_id type=text value="'.$r[con_pubchem_id].'"></td>
';
/******
                          			
			  <td style=text-align:center;>'.contgroup_dropdown($conn,$arr_contgroup_id,$r[contgroup_id]).'</td>
				
*****/
echo '       
                   <td style=text-align:center;>'.$status.'</td>
                          <td style=text-align:left;padding-left:10px;>
								<input type=hidden name="con_id" value='.$r[con_id].'>
								<input type=hidden name="editcontent" value=1>
								<input type=submit value="Save">
                          </td>                          
                        </tr>
						</form>';
            }		
		}
		else {
            foreach($kontensenyawa as $r) {

                if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
                
                $contgroup_name = GetFieldFromTable("contgroup_name","contentgroup"," where contgroup_id=".$r[contgroup_id]."",$conn);
                $del_link = '
                    <a href="index.php?v=kontensenyawa&act=delcontent&id='.$r[con_id].'">
                        <img style="padding:3px;" src="images/cancel_16.png" alt="delete" title="delete content" onclick="return confirm(\'Klik CANCEL untuk batal. Klik OK untuk melanjutkan menghapus content.\')">
                    </a>                
                ';
                
                if($r[con_verified_by]>0) {
                    $status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' <a target=blank href="?v=profile&id='.$r[con_verified_by].'">'.GetFieldFromTable("use_fullname","users"," where use_id=".$r[con_verified_by]."",$conn).'</a></span>';
                    $ver_link = '
                        <a href="index.php?v=kontensenyawa&act=unvercontent&id='.$r[con_id].'">
                            <img style="padding:3px;" src="images/circle_red.png" alt="unverify" title="unverify content" onclick="return confirm(\'Klik CANCEL untuk batal. Klik OK untuk melanjutkan verifikasi content.\')">
                        </a>
                    ';
                }
                else  if($_SESSION[rol_id]!=''){
                    $status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
                    $ver_link = '
                        <a href="index.php?v=kontensenyawa&act=vercontent&id='.$r[con_id].'">
                            <img style="padding:3px;" src="images/circle_green.png" alt="verify" title="verify content" onclick="return confirm(\'Klik CANCEL untuk batal. Klik OK untuk melanjutkan verifikasi content.\')">
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
						  <td style=text-align:left;padding-left:10px;><a onClick="window.open(\'popdetails_content.php?con_id='.$r[con_id].'\',null, \'height=800px,width=1000px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r[con_contentname].'</a></td>
                          <td style=text-align:center;>'.$r[con_knapsack_id].'</td>
                          <td style=text-align:center;>'.$r[con_metabolite_id].'</td>
                          <td style=text-align:center;>'.$r[con_pubchem_id].'</td>
';
/********
                          <td style=text-align:center;>'.$contgroup_name.'</td>
*****/
echo '
                          <td style=text-align:center;>'.$status.'</td>
                          <td style=text-align:left;padding-left:10px;>
                            '.$ver_link.'
                            '.$del_link.'
                          </td>                          
                        </tr>';
            }
		}
            
        echo '</table>';

?>
