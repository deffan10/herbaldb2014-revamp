<?php session_start();
	require_once 'functions/functions.php';
	unset($lang);
	if($_SESSION[mylang][key]!='en') $_SESSION[mylang][key] = 'id';
	$lang	=	$_SESSION[mylang][key];
	require_once 'lang_db.php';
	?>
<html>
<head>

<script langauge="javascript">
	function selectSpecies(id,name,f){
		window.close();
		if(f=='assignment') {
			opener.document.getElementById('div_spe_id_assignment').innerHTML = name;
			opener.document.parentform_assignment.spe_id_assignment.value = id;
		}
		if(f=='aliasname') {
			opener.document.getElementById('div_spe_id_aliasname').innerHTML = name;
			opener.document.parentform_aliasname.spe_id_aliasname.value = id;
		}
		if(f=='localname') {
			opener.document.getElementById('div_spe_id_localname').innerHTML = name;
			opener.document.parentform_localname.spe_id_localname.value = id;
		}
		if(f=='species_photos') {
			opener.document.getElementById('div_spe_id_species_photos').innerHTML = name;
			opener.document.parentform_species_photos.spe_id_species_photos.value = id;
		}
	}
</script>

</head> 

<?php

	if($_GET[search_field]=='spe_species_id') $id_sel = 'selected';
	else if($_GET[search_field]=='spe_speciesname') $name_sel = 'selected';
	
    echo '<div style="text-align:center;background-color:#fff;">
            <div id="mid3">
				<h2>'.$_SESSION[lang][spesies_val][$lang].'</h2>
				<form method=get action="">
					'.$_SESSION[lang][search_key][$lang].' : 
					<select name=search_field style="width:100px;padding-left:5px;">
						<option value=spe_species_id '.$id_sel.'>
							'.ID.' 
						</option>
						<option value=spe_speciesname '.$name_sel.'>
							'.$_SESSION[lang][spesies_val][$lang].' 
						</option>
					</select> = <input style="width:150px;padding-left:5px;" name=search_key type=text value="'.$_GET[search_key].'">
					<input type="submit" name="go" value="Search" class="go" /><input type="hidden" name="f" value="species_photos"/>
					<br class="spacer" />
				</form>
                
                <p class="memberBottom"></p>
                <br class="spacer" />
            </div>	
	</div>';
	
	if($_GET[search_field]!='' and $_GET[search_key]!='') {
		$where_search = " where ".$_GET[search_field]." like '%".$_GET[search_key]."%'";	
		$search_link = "search_field=".$_GET[search_field]."&search_key=".$_GET[search_key]."&go=Search";
	}	

    $sql_all = "select count(spe_id) as n_all from species ".$where_search."";
    $spesies_all = dbSelectAssoc($conn, $sql_all); //debug($spesies_all);
    
    $n_perpages = _N_PERPAGES;
    
    if($_GET[sortby]=='spe_species_id')
        $sortby = "spe_species_id asc";
    else $sortby = "spe_speciesname asc";
        
    if($_GET[start]=='') $start = 0;
    else $start = $_GET[start];
    
    $sql = "select * from species ".$where_search." order by ".$sortby." limit ".$_GET[start]*$n_perpages.",".$n_perpages."";
    $spesies = dbSelectAssoc($conn, $sql);  

	//debug($sql_all)	;
	//debug($sql)	;
	
    echo '<div style=text-align:center;>'.$_SESSION[lang][exist_total][$lang].' <b>'.$spesies_all[0][n_all].'</b> data. <br>';
    echo paging($start,$spesies_all[0][n_all],$n_perpages,"popspecies.php?f=".$_GET[f]."&v=spesies&sortby=".$_GET[sortby]."&".$search_link."");
    echo '</div>';

        echo '<h3>'.$_SESSION[lang][daftar_spesies][$lang].'</h3>
            <table border=0 width=100%>
                <tr style="background-color:#dd5;">
                    <td style=text-align:center;><br>No.<br><br></td>
                    <td style=text-align:center;><a href="popspecies.php?f='.$_GET[f].'&sortby=spe_species_id">ID '.$_SESSION[lang][spesies_val][$lang].'</a></td>
                    <td style=text-align:left;padding-left:10px;><a href="popspecies.php?f='.$_GET[f].'&sortby=spe_speciesname">'.$_SESSION[lang][spesies_val][$lang].'</a></td>
                    <td style=text-align:left;padding-left:10px;>Varietas</td>
                    <td style=text-align:left;padding-left:10px;>Family</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][penemu_val][$lang].'</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][ref_val][$lang].'</td>
                    <!--<td style=text-align:left;padding-left:10px;>Status</td>-->
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][pilih_val][$lang].'</td>
                </tr>';
                
            $ii_spesies = 1;
			$species_files_path = _SPECIES_FILES_PATH;
			
            foreach($spesies as $r) {

                if($ii_spesies%2==1) $col = '#eee'; else $col = '#fff';
                if($r[spe_foto]=='') $foto = ''; else $foto = '<br><img src='.$species_files_path.'/'.$r[spe_foto].' width=150px height=100px>';

                $ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
                
                if($r[spe_verified_by]>0)
                    $status = '<span style=color:green;>verified</span>';
                else 
                    $status = '<span style=color:red;>not verified</span>';

                $klik = '<a href="#" onclick="selectSpecies(\''.$r[spe_id].'\',\''.$r[spe_speciesname].'\',\''.$_GET[f].'\')">'.$_SESSION[lang][pilih_val][$lang].'</a>';
                echo '
                        <tr style="background-color:'.$col.';padding:5px;">
                          <td style=text-align:center;>'.$ii_spesies++.'.</td>
                          <td style=text-align:center;><a onClick="window.open(\'popdetails.php?speciesid='.$r[spe_species_id].'\',null, \'height=800px,width=1000px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r[spe_species_id].$foto.'</a></td>
                          <td style=text-align:left;padding-left:10px;>'.$r[spe_speciesname].'</td>
                          <td style=text-align:left;padding-left:10px;>'.$r[spe_varietyname].'</td>
                          <td style=text-align:left;padding-left:10px;>'.$r[spe_familyname].'</td>
                          <td style=text-align:left;padding-left:10px;>'.$r[spe_foundername].'</td>
                          <td style=text-align:left;padding-left:10px;>'.$ref_id.'</td>
                          <!--<td style=text-align:left;padding-left:10px;>'.$status.'</td>-->
                          <td style=text-align:left;padding-left:10px;>
                              '.$klik.'
                          </td>
                        </tr>';
            }
            
        echo '</table>'; //print_r("selectSpecies(\''.$r[spe_id].'\',\''.$r[spe_speciesname].'\',\''.$_GET[f].'\')");

?>