<?php session_start();
    
    //$_SESSION[lang] = array();

    if($_SESSION[logged_in]==1) {
        $logged_in_link.= '<li><a style=color:yellow; href="index.php?v=admin">'.$_SESSION[lang][link_admin][$lang].'</a></li>';
        $logged_in_link.= '<li><a style=color:yellow; href="index.php?v=unggahfile">'.$_SESSION[lang][link_upload][$lang].'</a></li>';
    }

    if($_SESSION[rol_id]==1) {
        $logged_in_link.= '<li><a style=color:yellow; href="index.php?v=adm_user">'.$_SESSION[lang][link_user][$lang].'</a></li>';
    }

        echo '
                <li><a href="index.php">'.$_SESSION[lang][link_home][$lang].'</a></li>
                <li><a href="index.php?v=spesies">'.$_SESSION[lang][link_list_species][$lang].'</a></li>
                <li><a href="index.php?v=kontensenyawa">'.$_SESSION[lang][link_list_content][$lang].'</a></li>
                '.$logged_in_link.'
                <li><a href="index.php?v=faqs">FAQs</a></li>
                <li><a href="index.php?v=aboutus">'.$_SESSION[lang][aboutus_val][$lang].'</a></li>
                <li class=lang>
					<div>
						<a href="lang.php?val=id&url='.$_SERVER[QUERY_STRING].'">IND</a>
					</div>
				</li>
                <li class=lang>
					<div>
						<a href="lang.php?val=en&url='.$_SERVER[QUERY_STRING].'">ENG</a>
					</div>
				</li>
				<!--
                <li>
                    <div style=background-color:#222;padding:7px 10px 7px 10px;>
                        <form method=post action="search_exe.php">
                            <select name=search_table>
                                <option>-category-</option>
                                <option value=species>'.$_SESSION[lang][spesies_val][$lang].'</option>
                                <option value=contents>'.$_SESSION[lang][senyawa_val][$lang].'</option>
                                <option value=aliases>'.$_SESSION[lang][aliases_val][$lang].'</option>
                                <option value=localname>'.$_SESSION[lang][localname_val][$lang].'</option>
                            </select>
                            <input style=padding-left:5px; name=search_key type=text/>
                            <input type=submit value="Search"/>
                        </form>
                    </div>
                </li>
				-->
            ';
    ?>