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
	function selectContents(id,name,f){
		window.close();
		if(f=='assignment') {
			opener.document.getElementById('div_con_id_assignment').innerHTML = name;
			opener.document.parentform_assignment.arr_con_id.value = id;
		}
	}
</script>

</head> 

<?php

	if($_GET[search_field]=='con_contentname') $name_sel = 'selected';	
	else if($_GET[search_field]=='con_knapsack_id') $knapsack_sel = 'selected';	
	else if($_GET[search_field]=='con_metabolite_id') $metabolite_sel = 'selected';
	
    echo '<div style="text-align:center;background-color:#fff;">
            <div id="mid3">
				<h2>'.$_SESSION[lang][senyawa_val][$lang].'</h2>
				<form method=get action="">
					'.$_SESSION[lang][search_key][$lang].' : 
					<select name=search_field style="width:175px;padding-left:5px;">
						<option value=con_contentname '.$name_sel.'>'.$_SESSION[lang][senyawa_val][$lang].'  </option>
						<option value=con_knapsack_id '.$knapsack_sel.'> Knapsack ID  </option>
						<option value=con_metabolite_id '.$metabolite_sel.'> Metabolite ID  </option>
					</select> = <input style="width:250px;padding-left:5px;" name=search_key type=text value="'.$_GET[search_key].'">
					<input type="submit" name="go" value="Search" class="go" />
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

    $sql_all = "select count(con_id) as n_all from  contents ".$where_search."";
    $contents_all = dbSelectAssoc($conn, $sql_all); //debug($contents_all);
    
    $n_perpages = _N_PERPAGES;
    
    if($_GET[sortby]=='con_id') $sortby = "con_id asc";
    else $sortby = "con_contentname asc";
        
    if($_GET[start]=='') $start = 0;
    else $start = $_GET[start];
    
    $sql = "select * from  contents ".$where_search." order by ".$sortby." limit ".$_GET[start]*$n_perpages.",".$n_perpages."";
    $contents = dbSelectAssoc($conn, $sql);  

	//debug($sql_all)	;
	//debug($sql)	;
	
    echo '<div style=text-align:center;>'.$_SESSION[lang][exist_total][$lang].' <b>'.$contents_all[0][n_all].'</b> data. <br>';
    echo paging($start,$contents_all[0][n_all],$n_perpages,"popcontents.php?f=".$_GET[f]."&v=contents&sortby=".$_GET[sortby]."&".$search_link."");
    echo '</div>';

        echo '<h3>'.$_SESSION[lang][daftar_senyawa][$lang].'</h3>
            <table border=0 width=100%>
                <tr style="background-color:#dd5;">
                    <td style=text-align:center;><br>No.<br><br></td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][senyawa_val][$lang].'</td>
                    <td style=text-align:center;>ID Knapsack</td>
                    <td style=text-align:center;>ID Metabolite</td>
                    <td style=text-align:center;>ID Pubchem</td>
                    <td style=text-align:center;>ID Grup '.$_SESSION[lang][senyawa_val][$lang].'</td>
                    <td style=text-align:left;padding-left:10px;>'.$_SESSION[lang][pilih_val][$lang].'</td>
                </tr>';
                
            $ii_contents = 1;
			
            foreach($contents as $r) {

                if($ii_contents%2==1) $col = '#eee'; else $col = '#fff';

                $ref_id = GetFieldFromTable("ref_name","ref"," where ref_id=".$r[ref_id]."",$conn);
                
                echo '
                        <tr style="background-color:'.$col.';padding:5px;">
                          <td style=text-align:center;>'.$ii_contents++.'.</td>
						  <td style=text-align:left;padding-left:10px;><a onClick="window.open(\'popdetails_content.php?con_id='.$r[con_id].'\',null, \'height=800px,width=1000px,status=yes,toolbar=no,scrollbars=yes,menubar=no,location=no\');" href=\'#\' >'.$r[con_contentname].'</a></td>
                          <td style=text-align:center;>'.$r[con_knapsack_id].'</td>
                          <td style=text-align:center;>'.$r[con_metabolite_id].'</td>
                          <td style=text-align:center;>'.$r[con_pubchem_id].'</td>
                          <td style=text-align:center;>'.$contgroup_name.'</td>
                          <td style=text-align:left;padding-left:10px;>
                              <a href="#" onclick="selectContents(\''.$r[con_id].'\',\''.$r[con_contentname].'\',\''.$_GET[f].'\')">'.$_SESSION[lang][pilih_val][$lang].'</a>
                          </td>
                        </tr>';
            }
            
        echo '</table>';

?>