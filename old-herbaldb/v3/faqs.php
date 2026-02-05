<?php session_start();
	
	if($_SESSION[mylang][key]=='id') {
		echo '
		<h3 style=background-color:#dda;padding:5px;>FAQs</h3>
		Definisi Senyawa dan Spesies.
		<div style="padding:15px;">
			<b>A. Definisi Senyawa</b>
			<div style="padding:15px;">
				Adalah suatu zat tunggal yang terbentuk dari beberapa unsur melalui reaksi kimia. 
				Setiap senyawa dapat diuraikan menjadi unsur-unsur pembentuknya melalui suatu reaksi kimia.
			</div>
			<b>B. Definisi Spesies</b>
			<div style="padding:15px;">
				Adalah suatu takson yang terdapat dalam tingkatan taksonomi untuk menunjuk kepada
				satu atau beberapa beberapa kelompok individu yang serupa dan dapat saling membuahi
				satu sama lain di dalam kelompoknya namun tidak dapat dengan anggota kelompok spesies lain.
				Anggota-anggota dalam satu spesies bila dikawinkan akan menghasilkan keturunan yang fertil
				tanpa hambatan reproduktif. Dua spesies yang berbeda bila saling berkawin akan menghadapi masalah
				hambatan biologis.
			</div>
		</div>
		Fitur yang tersedia untuk tiap User adalah sebagai berikut.
		<div style="padding:15px;">
			<b>A. Role Expert</b>
			<ol>
				<li>Melakukan validasi/verifikasi terhadap semua data yang dimasukkan user ke database.</li>
				<li>Menginput data spesies, senyawa, maupun assignment senyawa-senyawa ke suatu spesies.</li>
				<li>Mengunggah file berisi data spesies, senyawa, maupun assignment senyawa-senyawa ke suatu spesies.</li>
				<li>Menambahkan nama lokal dari suatu spesies.</li>
				<li>Menambahkan nama alias dari suatu spesies.</li>
				<li>Menambahkan data group senyawa.</li>
				<li>Menambahkan data referensi.</li>
				<li>Melakukan editing data profil pribadi, termasuk password.</li>
			</ol>
			<b>B. Role Contributor</b>
			<ol>
				<li>Menginput data spesies, senyawa, maupun assignment senyawa-senyawa ke suatu spesies.</li>
				<li>Mengunggah file berisi data spesies, senyawa, maupun assignment senyawa-senyawa ke suatu spesies.</li>
				<li>Menambahkan nama lokal dari suatu spesies.</li>
				<li>Menambahkan nama alias dari suatu spesies.</li>
				<li>Menambahkan data group senyawa.</li>
				<li>Menambahkan data referensi.</li>
				<li>Melakukan editing data profil pribadi, termasuk password.</li>
			</ol>
		</div>';
	}	
	
	else if($_SESSION[mylang][key]=='en') {
		echo '
		<h3>FAQs</h3>
		The following fitures are available for each User.<br>
		<div style="padding:15px;">
			<b>A. Role Expert</b>
			<ol>
				<li>Validate/verify all data inserted to the database.</li>
				<li>Edit own profile data and password.</li>
				<li>Inserting species or Compounds data, or assign Compound(s) as a content of species.</li>
				<li>Uploading species or Compounds files, or file that consist of assignment Compound(s) as a content of species.</li>
				<li>Adding one or more local name for a species.</li>
				<li>Adding one or more alias name for a species.</li>
				<li>Adding Compound group(s).</li>
				<li>Adding reference(s) data.</li>
			</ol>
			<b>B. Role Contributor</b>
			<ol>
				<li>Edit own profile data and password.</li>
				<li>Inserting species or Compounds data, or assign Compound(s) as a content of species.</li>
				<li>Uploading species or Compounds files, or file that consist of assignment Compound(s) as a content of species.</li>
				<li>Adding one or more local name for a species.</li>
				<li>Adding one or more alias name for a species.</li>
				<li>Adding Compound group(s).</li>
				<li>Adding reference(s) data.</li>
			</ol>
		</div>';
	}
?>