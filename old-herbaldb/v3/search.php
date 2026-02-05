<?php session_start();
require_once 'functions/functions.php';

    //if($_SESSION[logged_in]==1) {
    
        //debug($_SESSION[search]);   
        
        if($_SESSION[search][search_table]=='species')
            $field  =   'spe_speciesname';
        else if($_SESSION[search][search_table]=='aliases')
            $field  =   'ali_speciesname';
        else if($_SESSION[search][search_table]=='contents')
            $field  =   'con_contentname';
        else if($_SESSION[search][search_table]=='localname')
            $field  =   'loc_localname';
        else if($_SESSION[search][search_table]=='virtue')
            $field  =   'vir_value';
        
		if($_SESSION[search][search_key]!='')
			$sql    =   "select * from ".$_SESSION[search][search_table]." where ".$field." like '%".$_SESSION[search][search_key]."%'";
		
        $q      =   dbSelectAssoc($conn,$sql);

        $n      =   count($q);

        if($n > 0) {
		
			$_SESSION[search][sql] = $sql;
        
            echo '<h3>'.$_SESSION[lang][search_result][$lang].' ('.$_SESSION[lang][baris_data_val][$lang].' = '.$n.') 
				<!--| <a href=download.php?data='.$_SESSION[search][search_table].'&req=search><b>DOWNLOAD</b></a>--></h3>';
            
/************************************************************** SEARCH FROM LOCALNAME **********************************************************/          
            if($_SESSION[search][search_table]=='localname') {

                echo '<center><table border=0 width=100%>
                        <tr style=background-color:#dd5;>
                            <td style=text-align:left;padding-left:10px;><br>No.<br><br></td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][localname_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][spesies_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>Region</td>
';
/*******
                            <td style=text-align:left;padding-left:10px;>Status</td>
********/
echo '
                        </tr>';
                        
                    $ii = 1;
                    foreach($q as $r) {
                        
                        if($ii%2==1) $col = '#eee';
                        else $col = '#fff';        

						$sql_spe = "SELECT s.spe_id, s.spe_speciesname, s.spe_species_id
								FROM localname as loc, species AS s
								WHERE loc_id ='".$r[loc_id]."'
								AND loc.spe_id = s.spe_id
								ORDER BY s.spe_speciesname ASC";
						$q_spe = dbSelectAssoc($conn,$sql_spe);
						if(count($q_spe)>0) {
							$ii_spe = 1;
							$spe_list = '';
							foreach($q_spe as $r_spe) {								
								$linked_speciesname = '<a onClick="window.open(\'popdetails.php?speciesid='.$r_spe[spe_species_id].'\',null, \'height=800px,width=800px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r_spe[spe_speciesname].'</a>';                       
								$spe_list.=$ii_spe++.'. '.$linked_speciesname.'<br>';
							}
						}                        

                        if($r[loc_verified_by]>0)
                            $status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' <a target=blank href="?v=profile&id='.$r[loc_verified_by].'">'.GetFieldFromTable("use_fullname","users"," where use_id=".$r[loc_verified_by]."",$conn).'</a></span>';
                        else
                            $status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
                        
                        echo '
                            <tr style=background-color:'.$col.';>
                                <td style=text-align:left;padding-left:10px;><br>'.$ii++.'.<br><br></td>
                                <td style=text-align:left;padding-left:10px;>'.$r[loc_localname].'</td>
                                <td style=text-align:left;padding-left:10px;>'.$spe_list.'</td>
                                <td style=text-align:left;padding-left:10px;>'.$r[loc_region].'</td>
';
/*******
                                <td style=text-align:left;padding-left:10px;>'.$status.'</td>
********/
echo '
                            </tr>';                        
                    }

                echo '</table></center>';

            }
/************************************************************** END OF SEARCH FROM LOCALNAME **********************************************************/    

/************************************************************** SEARCH FROM ALIASES **********************************************************/                             
            if($_SESSION[search][search_table]=='aliases') {
            
                echo '<center><table border=0 width=100%>
                        <tr style=background-color:#dd5;>
                            <td style=text-align:left;padding-left:10px;><br>No.<br><br></td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][name_alias_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][founder_alias_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][varietas_alias_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>Status</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][spesies_val][$lang].'</td>
                        </tr>';
                
                    $ii = 1;
                    foreach($q as $r) {
                        
                        if($ii%2==1) $col = '#eee';
                        else $col = '#fff';
						
						$sql_spe = "SELECT s.spe_id, s.spe_speciesname, s.spe_species_id
								FROM aliases as ali, species AS s
								WHERE ali_id ='".$r[ali_id]."'
								AND ali.spe_id = s.spe_id
								ORDER BY s.spe_speciesname ASC";
						$q_spe = dbSelectAssoc($conn,$sql_spe);
						if(count($q_spe)>0) {
							$ii_spe = 1;
							$spe_list = '';
							foreach($q_spe as $r_spe) {								
								$linked_speciesname = '<a onClick="window.open(\'popdetails.php?speciesid='.$r_spe[spe_species_id].'\',null, \'height=800px,width=800px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r_spe[spe_speciesname].'</a>';                       
								$spe_list.=$ii_spe++.'. '.$linked_speciesname.'<br>';
							}
						}    						
                        
                        $ref_name = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
                        
                        if($r[ali_verified_by]>0)
                            $status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' <a target=blank href="?v=profile&id='.$r[ali_verified_by].'">'.GetFieldFromTable("use_fullname","users"," where use_id=".$r[ali_verified_by]."",$conn).'</a></span>';
                        else
                            $status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';

                        echo '
                            <tr style=background-color:'.$col.';>
                                <td style=text-align:left;padding-left:10px;><br>'.$ii++.'.<br><br></td>
                                <td style=text-align:left;padding-left:10px;>'.$r[ali_speciesname].'</td>
                                <td style=text-align:left;padding-left:10px;>'.$r[ali_foundername].'</td>
                                <td style=text-align:left;padding-left:10px;>'.$r[ali_varietyname].'</td>
                                <td style=text-align:left;padding-left:10px;>'.$ref_name.'</td>
                                <td style=text-align:left;padding-left:10px;>'.$status.'</td>
                                <td style=text-align:left;padding-left:10px;>'.$spe_list.'</td>
                            </tr>';                        
                    }
                
                echo '</table></center>';                
            
            }
/************************************************************** END OF SEARCH FROM ALIASES **********************************************************/  
                            
/************************************************************** SEARCH FROM CONTENT **********************************************************/          
            if($_SESSION[search][search_table]=='contents') {
                echo '<center><table border=0 width=100%>
                        <tr style=background-color:#dd5;>
                            <td style=text-align:left;padding-left:10px;><br>No.<br><br></td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][content_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>Knapsack ID</td>
                            <td style=text-align:left;padding-left:10px;>Metabolite ID</td>
                            <td style=text-align:left;padding-left:10px;>Pubchem ID</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][spesies_val][$lang].'</td>
';
/****
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][contgroup_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>Status</td>
*****/
echo '


                        </tr>';
                
                    $ii = 1;
                    foreach($q as $r) {
                        
                        if($ii%2==1) $col = '#eee';
                        else $col = '#fff';
                        
						$sql_spe = "SELECT s.spe_id, s.spe_speciesname, s.spe_species_id, sc.ref_id
								FROM speciescontent AS sc, species AS s
								WHERE con_id ='".$r[con_id]."'
								AND sc.spe_id = s.spe_id
								ORDER BY s.spe_speciesname ASC";
						$q_spe = dbSelectAssoc($conn,$sql_spe);
						if(count($q_spe)>0) {
							$ii_spe = 1;
							$spe_list = '';
							foreach($q_spe as $r_spe) {
								$linked_speciesname = '<a onClick="window.open(\'popdetails.php?speciesid='.$r_spe[spe_species_id].'\',null, \'height=800px,width=800px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r_spe[spe_speciesname].'</a>';                       
								$spe_list.=$ii_spe++.'. '.$linked_speciesname.'<br>';
							}
						}							
						
						$contgroup_name = GetFieldFromTable("contgroup_name","contentgroup"," where contgroup_id=".$r[contgroup_id]."",$conn);
/********                
                        if($r[con_verified_by]>0)
                            $status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' <a target=blank href="?v=profile&id='.$r[con_verified_by].'">'.GetFieldFromTable("use_fullname","users"," where use_id=".$r[con_verified_by]."",$conn).'</a></span>';
                        else
                            $status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';

         
*******/               
                        echo '
                            <tr style=background-color:'.$col.';>
                                <td style=text-align:left;padding-left:10px;><br>'.$ii++.'.<br><br></td>
                                <td style=text-align:left;padding-left:10px;><a onClick="window.open(\'popdetails_content.php?con_id='.$r[con_id].'\',null, \'height=800px,width=1000px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r[con_contentname].'</a></td>
                                <td style=text-align:left;padding-left:10px;>'.$r[con_knapsack_id].'</td>
                                <td style=text-align:left;padding-left:10px;>'.$r[con_metabolite_id].'</td>
                                <td style=text-align:left;padding-left:10px;>'.$r[con_pubchem_id].'</td>
                                <td style=text-align:left;padding-left:10px;>'.$spe_list.'</td>
';
/****
                                <td style=text-align:left;padding-left:10px;>'.$contgroup_name.'</td>

                                <td style=text-align:left;padding-left:10px;>'.$status.'</td>
*****/
echo'
                            </tr>';                        
                    }
                
                echo '</table></center>';                
            }
      
/************************************************************** END OF SEARCH FROM CONTENT **********************************************************/ 
               
/************************************************************** SEARCH FROM SPECIES **********************************************************/
            if($_SESSION[search][search_table]=='species') {
            
                echo '
                    <table border=0 width=100%>
                        <tr style="background-color:#dd5;">
                            <td style=text-align:center;><br>No.<br><br></td>
                            <td style=text-align:center;><a href="index.php?v=spesies&sortby=spe_species_id">ID Spesies</a></td>
                            <td style=text-align:left;padding-left:10px;><a href="index.php?v=spesies&sortby=spe_speciesname">Spesies</a></td>
                            <td style=text-align:left;padding-left:10px;>Varietas</td>
                            <td style=text-align:left;padding-left:10px;>Family</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][penemu_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>Status</td>
                        </tr>';
                        
                    $ii_spesies = 1;
                    foreach($q as $r) {

                        if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
                        //if($r[spe_foto]=='') $foto = 'no foto'; //else $foto = 'ada foto';

                        $ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
                        
                        if($r[spe_verified_by]>0)
                            $status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' <a target=blank href="?v=profile&id='.$r[spe_verified_by].'">'.GetFieldFromTable("use_fullname","users"," where use_id=".$r[spe_verified_by]."",$conn).'</a></span>';
                            
                        else
                            $status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
                            
                        echo '
                                <tr style="background-color:'.$col.';padding:5px;">
                                  <td style=text-align:center;>'.$ii_spesies++.'.</td>
                                  <td style=text-align:center;><a onClick="window.open(\'popdetails.php?speciesid='.$r[spe_species_id].'\',null, \'height=800px,width=800px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r[spe_species_id].'</a><br>'.$foto.'</td>
                                  <td style=text-align:left;padding-left:10px;>'.$r[spe_speciesname].'</td>
                                  <td style=text-align:left;padding-left:10px;>'.$r[spe_varietyname].'</td>
                                  <td style=text-align:left;padding-left:10px;>'.$r[spe_familyname].'</td>
                                  <td style=text-align:left;padding-left:10px;>'.$r[spe_foundername].'</td>
                                  <td style=text-align:left;padding-left:10px;>'.$ref_id.'</td>
                                  <td style=text-align:left;padding-left:10px;>'.$status.'</td>
                                </tr>';
                    }
                    
                echo '</table>';                
            
            }
/************************************************************** END OF SEARCH FROM SPECIES **********************************************************/

/************************************************************** END OF SEARCH FROM EFECT   **********************************************************/
            if($_SESSION[search][search_table]=='virtue') {
            
                echo '
                    <table border=0 width=100%>
                        <tr style="background-color:#dd5;">
                            <td style=text-align:center;><br>No.<br><br></td>
                            <td style=text-align:left;padding-left:10px;>Spesies</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][khasiat_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][khasiat_val][$lang].' (en)</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][khasiat_val][$lang].' (latin)</td>
                            <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                            <td style=text-align:left;padding-left:10px;>Status</td>
                        </tr>';
                        
                    $ii_spesies = 1;
                    foreach($q as $r) {

                        if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';

                        $ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
                        $spe_speciesname = GetFieldFromTable("spe_speciesname","species"," where spe_id=".$r[spe_id]."",$conn);
                        $spe_species_id = GetFieldFromTable("spe_species_id","species"," where spe_id=".$r[spe_id]."",$conn);
                        
                        if($r[vir_verified_by]>0)
                            $status = '<span style=color:green;>'.$_SESSION[lang][field_verified][$lang].' <a target=blank href="?v=profile&id='.$r[vir_verified_by].'">'.GetFieldFromTable("use_fullname","users"," where use_id=".$r[vir_verified_by]."",$conn).'</a></span>';
                            
                        else
                            $status = '<span style=color:red;>'.$_SESSION[lang][field_notverified][$lang].'</span>';
                            
                        echo '
                                <tr style="background-color:'.$col.';padding:5px;">
                                  <td style=text-align:center;>'.$ii_spesies++.'.</td>
								  <td style=padding-left:10px;><a onClick="window.open(\'popdetails.php?speciesid='.$spe_species_id.'\',null, \'height=800px,width=1000px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$spe_speciesname.'</a></td>
								  <td style=text-align:left;padding-left:10px;>'.$r[vir_value].'</td>
								  <td style=text-align:left;padding-left:10px;>'.$r[vir_value_en].'</td>
								  <td style=text-align:left;padding-left:10px;>'.$r[vir_value_latin].'</td>
                                  <td style=text-align:left;padding-left:10px;>'.$ref_id.'</td>
                                  <td style=text-align:left;padding-left:10px;>'.$status.'</td>
                                </tr>';
                    }
                    
                echo '</table>';                
            
            }

             
        }
        else {
            failed_note($_SESSION[lang][search_not_found][$lang]);
        }
/************************************************************** END OF SEARCH FROM EFECT   **********************************************************/
    //}

    //else {
        //echo 'You must be logged in to access this fitur. <a href="index.php">Login</a>';
    //}
    ?>
