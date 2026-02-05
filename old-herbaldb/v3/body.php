<?php session_start();

    $v      =   $_GET[v];
    $msg    =   $_GET[msg];
    
    if($msg == 'loggedout')
        $msg_det = $_SESSION[lang][logout_success][$lang];
        
    else if($msg == 'notactive')
        $msg_det = $_SESSION[lang][account_not_active][$lang];
    
    else if($msg == 'notregistered')
        $msg_det = $_SESSION[lang][account_not_registered][$lang];
    
    echo '  <div style=background-color:#ffc;text-align:center;width:600px;>
                '.$msg_det.'
            </div>';    

    if($v == 'spesies')
        require_once 'species.php';
        
    else if($v == 'grupsenyawa')
        require_once 'grupsenyawa.php';
        
    else if($v == 'kontensenyawa')
        require_once 'kontensenyawa.php';

    else if($v == 'unggahfile')
        require_once 'unggahfile.php';

    else if($v == 'admin')
        require_once 'admin.php';

    else if($v == 'adm_user')
        require_once 'adm_user.php';

    else if($v == 'reg')
        require_once 'reg.php';

    else if($v == 'search')
        require_once 'search.php';

    else if($v == 'profile')
        require_once 'profile.php';

    else if($v == 'faqs')
        require_once 'faqs.php';

    else if($v == 'aboutus')
        require_once 'aboutus.php';

    else {
        echo '<h3>Database Senyawa Aktif Tanaman Obat Indonesia</h3>';
        ?>
		
	  <div id="container">
		<div id="gallery" class="ad-gallery">
		  <div class="ad-image-wrapper">
		  </div>
		  <div class="ad-controls">
		  </div>
		  <div class="ad-nav">
			<div class="ad-thumbs">
			  <ul class="ad-thumb-list">
				<li>
				  <a href="images/1.jpg">
					<img src="images/thumbs/1.jpg" title="Mengkudu (pace)" longdesc="
						Keistimewaan buah ini adalah nempunyai kandungan scopoletin, serotin, 
						damnacantal, athraquinon,dll. Buah pace sangat efisien untuk mengobati 
						diabetes, penyakit jantung, strooke, memperbaiiki tekanan darah bahkan 
						dapat menyehatkan kelenjar throid, meningkatkan kekebalan tubuh. 		
					" class="image1">
				  </a>
				</li>
				<li>
				  <a href="images/2.jpg">
					<img src="images/thumbs/2.jpg" title="Temulawak" longdesc="
						Saat ini, sebagian besar budidaya temu lawak berada di Indonesia, 
						Malaysia, Thailand, dan Filipina.				
					" class="image2">
				  </a>
				</li>
				<li>
				  <a href="images/3.jpg">
					<img src="images/thumbs/3.jpg" title="Avocado (Alpukat)" longdesc="
						Tumbuhan Avocado berasal dari Meksiko dan Amerika Tengah dan kini banyak dibudidayakan di Amerika 
						Selatan dan Amerika Tengah sebagai tanaman perkebunan monokultur dan sebagai tanaman pekarangan di 
						daerah-daerah tropika lainnya di dunia.					
					" class="image3">
				  </a>
				</li>
			</ul>
			</div>
		  </div>
		</div>
	  </div>		
		
		<?php
    }

?>