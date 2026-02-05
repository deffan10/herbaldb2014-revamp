<?php session_start();
	
	if($_SESSION[mylang][key]=='id') {
		echo '
		<h3 style=background-color:#dda;padding:5px;>Tentang Kami</h3>
		
		<div style="padding:15px;">
			<b>1. Prof. Heru Suhartanto, Ph. D</b>
			<div style="padding:15px;">
				<table border=0 width=750px>
					<tr>
						<td><img src="images/def-foto.jpg" width=150px height=175px></td>
						<td valign=top style="padding:15px;">
							Heru Suhartanto is a Professor in Faculty of Computer Science, Universitas Indonesia (Fasilkom UI). He has been with Fasilkom UI since 1986. Previously he held some positions such as Post doctoral fellow at Advanced Computational Modelling Centre, the University of Queensland, Australia in 1998 � 2000; two periods vice Dean for General Affair at Fasilkom UI since 2000. He graduated from undergraduate study at Department of Mathematics, UI in 1986. He holds Master of Science, from Department of Computer Science, The University of Toronto,Canada since 1990. He also holds Ph.D in Parallel Computing from Department of Mathematics, The University of Queensland since 1998. His main research interests are Numerical, Parallel,Cloud and Grid computing. He is also a member of reviewer of several referred international journal such as journal of Computational and Applied Mathematics, International Journal of Computer Mathematics, and Journal of Universal Computer Science. Furthermore, he has supervised some Master and PhD students; he has won some research grants; holds several software copyrights; published a number of books in Indonesian and international papers in proceeding and journal. He is also member of IEEE and ACM.
					</tr>
				</table>
			</div>
			<b>2. Dr. Arry Yanuar, M.S.</b>
			<div style="padding:15px;">
				<table border=0 width=750px>
					<tr>
						<td><img src="images/def-foto.jpg" width=150px height=175px></td>
						<td valign=top style="padding:15px;">
							Arry Yanuar is an assistant Professor at Department of Pharmacy, Universitas Indonesia. He has been with Department of Pharmacy since 1990. He graduated from undergraduate program Department of Pharmacy, University of Indonesia in 1990. He also holds Pharmacist Profession certificate in 1991. In 1997, he finished his Master Program from Faculty of Pharmacy, Gadjah Mada University. He holds PhD in 2006 from Nara Institute of Science and Technology (NAIST), Japan, from Structural Biology/protein crystallography laboratory. In 1999-2003 he worked as pharmacy expert in ISO certification for pharmacy industries at Llyod Register Quality Assurance. In 2002, he visited National Institute of Health (NIH), Bethesda, USA. He won several research grants and published some paper at international journals and conferences.						
						</td>
					</tr>
				</table>
			</div>
			<b>3. Marjuqi Rahmat S.Kom</b>
			<div style="padding:15px;">
				<table border=0 width=750px>
					<tr>
						<td><img src="images/def-foto.jpg" width=150px height=175px></td>
						<td valign=top style="padding:15px;">
							Marjuqi Rahmat hold BSc from Faculty of Computer Sciences, University of Indonesia in 2010.						
						</td>
					</tr>
				</table>
			</div>
		</div>';
	}	
	
	else if($_SESSION[mylang][key]=='en') {
		echo '
		<h3 style=background-color:#dda;padding:5px;>About Us</h3>
		
		<div style="padding:15px;">
			<b>1. Prof. Heru Suhartanto, Ph. D</b>
			<div style="padding:15px;">
				<table border=0 width=750px>
					<tr>
						<td><img src="images/def-foto.jpg" width=150px height=175px></td>
						<td valign=top style="padding:15px;">
							Heru Suhartanto is a Professor in Faculty of Computer Science, Universitas Indonesia (Fasilkom UI). He has been with Fasilkom UI since 1986. Previously he held some positions such as Post doctoral fellow at Advanced Computational Modelling Centre, the University of Queensland, Australia in 1998 � 2000; two periods vice Dean for General Affair at Fasilkom UI since 2000. He graduated from undergraduate study at Department of Mathematics, UI in 1986. He holds Master of Science, from Department of Computer Science, The University of Toronto,Canada since 1990. He also holds Ph.D in Parallel Computing from Department of Mathematics, The University of Queensland since 1998. His main research interests are Numerical, Parallel,Cloud and Grid computing. He is also a member of reviewer of several referred international journal such as journal of Computational and Applied Mathematics, International Journal of Computer Mathematics, and Journal of Universal Computer Science. Furthermore, he has supervised some Master and PhD students; he has won some research grants; holds several software copyrights; published a number of books in Indonesian and international papers in proceeding and journal. He is also member of IEEE and ACM.					
						</td>
					</tr>
				</table>
			</div>
			<b>2. Dr. Arry Yanuar, M.S.</b>
			<div style="padding:15px;">
				<table border=0 width=750px>
					<tr>
						<td><img src="images/def-foto.jpg" width=150px height=175px></td>
						<td valign=top style="padding:15px;">
							Arry Yanuar is an assistant Professor at Department of Pharmacy, Universitas Indonesia. He has been with Department of Pharmacy since 1990. He graduated from undergraduate program Department of Pharmacy, University of Indonesia in 1990. He also holds Pharmacist Profession certificate in 1991. In 1997, he finished his Master Program from Faculty of Pharmacy, Gadjah Mada University. He holds PhD in 2006 from Nara Institute of Science and Technology (NAIST), Japan, from Structural Biology/protein crystallography laboratory. In 1999-2003 he worked as pharmacy expert in ISO certification for pharmacy industries at Llyod Register Quality Assurance. In 2002, he visited National Institute of Health (NIH), Bethesda, USA. He won several research grants and published some paper at international journals and conferences.				
						</td>
					</tr>
				</table>
			</div>
			<b>3. Marjuqi Rahmat S.Kom</b>
			<div style="padding:15px;">
				<table border=0 width=750px>
					<tr>
						<td><img src="images/def-foto.jpg" width=150px height=175px></td>
						<td valign=top style="padding:15px;">
							Marjuqi Rahmat hold BSc from Faculty of Computer Sciences, University of Indonesia in 2010.						
						</td>
					</tr>
				</table>
			</div>
		</div>';
	}
?>
