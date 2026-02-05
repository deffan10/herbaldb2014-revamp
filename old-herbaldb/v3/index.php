<?php session_start();
	require_once 'functions/functions.php';
	unset($lang);
	
	if($_SESSION[mylang][key]!='en' and $_GET[val]!='en') $lang = 'id';
	else if($_SESSION[mylang][key]!='id' and $_GET[val]!='id') $lang = 'en';
	
	//$lang	=	$_SESSION[lang][key];
	require_once 'lang_db.php';

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title><? echo $_SESSION[lang][web_title][$lang]; ?></title>
<link href="style.css" rel="stylesheet" type="text/css" />
  <link rel="stylesheet" type="text/css" href="jquery.ad-gallery.css">
	<script type="text/javascript" src="jquery-1.4.3.min.js"></script>
	<script type="text/javascript" src="jquery.ad-gallery.js?rand=995"></script>
	<!--
	<script type="text/javascript" src="functions/editinplace/src/jquery.js"></script>
	<script type="text/javascript" src="functions/editinplace/src/jquery.editinplace.packed.js"></script>
	<script type="text/javascript" src="functions/editinplace/src/demo.js"></script>
	-->
  
  <script type="text/javascript">
  $(function() {
    var galleries = $('.ad-gallery').adGallery();
    $('#switch-effect').change(
      function() {
        galleries[0].settings.effect = $(this).val();
        return false;
      }
    );
    $('#toggle-slideshow').click(
      function() {
        galleries[0].slideshow.toggle();
        return false;
      }
    );
  });
  </script>


</head>
<body>
<!--header start -->
<div id="headerMain">
<div id="header">
  <!--<a href="index.html"><img src="images/logo.gif" alt="extreme updates" width="411" height="96" border="0" /></a>-->
  <h1> <? echo $_SESSION[lang][web_title][$lang]; ?> </h1>
<ul class="nav">
<?php
    
    require_once 'mainmenu.php';

?>
</ul>
</div>
<br class="spacer" />
</div>
<!--header end -->
<!--bodyTopMain start -->
<div id="bodyTopMain">
<center>
<table border=0 width=97%>
    <tr>
        <td width="21%" valign="top">
            <img src="images/mid1_top.gif"><br>
            <!--mid2 start -->
            <div id="mid3">
				<h2>Box of<span>Search</span></h2>
				<form method=post action="search_exe.php">
					<br><label class="yellow"><? echo $_SESSION[lang][search_cat][$lang]; ?><br></label> 
					<select name=search_table class="txtBox" style="width:175px;padding-left:5px;">
						<option></option>
						<option value=species <? if($_SESSION[search][search_table]=='species') echo 'selected';?>>
							<? echo $_SESSION[lang][spesies_val][$lang]; ?>
						</option>
						<option value=contents <? if($_SESSION[search][search_table]=='contents') echo 'selected';?>>
							<? echo $_SESSION[lang][senyawa_val][$lang]; ?>
						</option>
						<option value=aliases <? if($_SESSION[search][search_table]=='aliases') echo 'selected';?>>
							<? echo $_SESSION[lang][aliases_val][$lang]; ?>
						</option>
						<option value=localname <? if($_SESSION[search][search_table]=='localname') echo 'selected';?>>
							<? echo $_SESSION[lang][localname_val][$lang]; ?>
						</option>
						<option value=virtue <? if($_SESSION[search][search_table]=='virtue') echo 'selected';?>>
							<? echo $_SESSION[lang][khasiat_val][$lang]; ?>
						</option>
					</select>
					<br><br><label class="yellow"><? echo $_SESSION[lang][search_key][$lang]; ?><br></label>
					<input style="width:175px;padding-left:5px;" name=search_key type=text class="txtBox" value="<? echo $_SESSION[search][search_key];?>">
					<br><input type="submit" name="go" value="Search" class="go" />
					<br class="spacer" />
				</form>
                
                <p class="memberBottom"></p>
                <br class="spacer" />
            </div>
            <!--mid2 end -->
            <!--mid3 start -->
            <div id="mid2">
            <?php 
                
                if($_SESSION[logged_in]==1) {
				
					//debug($lang);
                    
                    $fullname   = GetFieldFromTable("use_fullname","users"," where use_id=".$_SESSION[use_id]."",$conn);
                    $rol_id     = GetFieldFromTable("rol_id","users"," where use_id=".$_SESSION[use_id]."",$conn);
                    $rol_name   = GetFieldFromTable("rol_name","roles"," where rol_id=".$rol_id."",$conn);
                
                     echo '<h2>Members<span>Page</span></h2>
                        <center>
                        <div style=background-color:#ffc;width:97%;text-align:center;padding:3px;><br>
                            '.$_SESSION[lang][logged_in_notif][$lang].' <br><br> 
                            <a href=index.php?v=profile>'.$fullname.'</a> ('.$rol_name.')<br><br>
							'.$_SESSION[lang][please_read_faqs][$lang].'<br><br>
                            <a style=color:red;font-weight:bold; href="functions/logout.php">Logout</a><br><br>
                        </div>
                        </center>';
                }
                else {
                
                    echo '
                    <h2>Members<span>Login</span></h2>
                    <form name="memberLogin" action="functions/login.php" method="post">
                    <input type="text" name="username" class="txtBox" />
                    <input type="password" name="password" class="txtBox"/>
					<label class="yellow"><a href="index.php?v=reg" class="register">'.$_SESSION[lang][want_register][$lang].'</a></label>
                    <input type="submit" name="go" value="Login" class="go" />
                    <br class="spacer" />
                    </form>';
                }
            ?>
				<p class="memberBottom"></p>
				<br class="spacer" />
            </div>
            <!--mid3 end -->

        </td>
        <td valign="top">
            <?php include 'body.php'; ?>
        </td>
    </tr>
</table>
</center><br>
<br class="spacer" />
</div>
<!--bodyTopMain end -->
<!--bodyBotMain start -->
<div id="bodyBotMain">
<!--bodyBot start -->
<div id="bodyBot">

<br class="spacer" />
</div>
<!--bodyBot end -->
<br class="spacer" />
</div>
<!--bodyBotMain end -->
<!--footer start -->
<div id="footerMain">
<div id="footer">
<div style="width:300px;text-align:center;">
	<p class="copyright">&copy; Departemen Farmasi Universitas Indonesia 2011. All rights reserved. </p>
</div>
    <!--<a href="http://www.templateworld.com/" target="_blank">Template World</a>-->
    
</div>
</div>
<!--footer end -->
</body>
<!--
<script type="text/javascript" charset="utf-8">
    $(".inplace-editor").editInPlace({
        url: "server_editinplace.php"
    });
</script>
-->
</html>
