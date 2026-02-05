<?php session_start();
    
    $sql_all = "select count(contgroup_id) as n_all from contentgroup";
    $contentgroup_all = dbSelectAssoc($conn, $sql_all); //debug($contentgroup_all);
    
    $n_perpages = _N_PERPAGES;
    
    if($_GET[start]=='') $start = 0;
    else $start = $_GET[start];
    
    $sql = "select * from contentgroup order by contgroup_name asc limit ".$_GET[start]*$n_perpages.",".$n_perpages."";
    $contentgroup = dbSelectAssoc($conn, $sql);
    
    echo '<div style=text-align:center;>Ada total <b>'.$contentgroup_all[0][n_all].'</b> Grup Senyawa.<br>';
    echo paging($start,$contentgroup_all[0][n_all],$n_perpages,"index.php?v=grupsenyawa");
    echo '</div>';

        echo '<h3>Daftar Group Senyawa</h3>
            <table border=0 width=60%>
                <tr style="background-color:#dd5;">
                    <td style=text-align:center;>No.</td>
                    <td style=text-align:center;>ID Group</td>
                    <td style=text-align:left;padding-left:10px;>Nama Group</td>
                </tr>';
                
            $ii_contgroup = 1;
            foreach($contentgroup as $r) {

                if($ii_contgroup % 2==1) $col = '#eee'; else $col = '#fff';
                
                echo '
                        <tr style="background-color:'.$col.';padding:5px;">
                          <td style=text-align:center;>'.$ii_contgroup++.'.</td>
                          <td style=text-align:center;>'.$r[contgroup_code].'</td>
                          <td style=text-align:left;padding-left:10px;>'.$r[contgroup_name].'</td>
                        </tr>';
            }
            
        echo '</table>';

?>