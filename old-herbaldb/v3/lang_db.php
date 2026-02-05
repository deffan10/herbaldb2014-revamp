<?php session_start();

	//debug(id);
	$_SESSION[lang] = array();
	$_SESSION[lang][logged_in_notif][id]	=	'Anda sekarang login sebagai';
	$_SESSION[lang][logged_in_notif][en]	=	'You are currently logged in as';
	
	$_SESSION[lang][not_logged_in_notif][id]	=	'Mohon login terlebih dahulu.';
	$_SESSION[lang][not_logged_in_notif][en]	=	'Please logged in first.';
	
	$_SESSION[lang][blank_field_notif][id]	=	'Mohon melengkapi field yang belum terisi.';
	$_SESSION[lang][blank_field_notif][en]	=	'Please fill ALL field correctly.';
	
	$_SESSION[lang][duplicated_entry_notif][id]	=	"Gagal menambahkan data ke database. Cek apakah data yang sama sudah ada sebelumnya.";
	$_SESSION[lang][duplicated_entry_notif][en]	=	"Failed inserting data to the database. Duplicated entry detected.";
	
	$_SESSION[lang][failed_insert_notif][id]	=	"Gagal menambahkan data ke database.";
	$_SESSION[lang][failed_insert_notif][en]	=	"Failed inserting data to the database.";
	
	$_SESSION[lang][success_send_email][id]	=	"Informasi berhasil dikirim ke email yang bersangkutan.<br>Silakan cek di folder INBOX/SPAM pada email tersebut.";
	$_SESSION[lang][success_send_email][en]	=	"Information successfully being sent to that e-mail.<br>Check INBOX/SPAM folder in that e-mail account.";
	
	$_SESSION[lang][failed_send_email][id]	=	"Informasi gagal dikirim ke email yang bersangkutan.<br>Silakan kontak Administrator";
	$_SESSION[lang][failed_send_email][en]	=	"Information failed being sent to that e-mail.<br>Please contact Administrator.";
	
	$_SESSION[lang][please_read_faqs][id]	=	'Silakan baca <a href="index.php?v=faqs">FAQs</a> untuk mengetahui informasi fitur-fitur yang tersedia.';
	$_SESSION[lang][please_read_faqs][en]	=	'Please read <a href="index.php?v=faqs">FAQs</a> for further information about available fitures.';
	
	//$_SESSION[lang][web_title] = array();
	$_SESSION[lang][web_title][id]	=	'Basis Data Tanaman Obat Indonesia';
	$_SESSION[lang][web_title][en]	=	'Database of Indonesian Medicinal Plants';
	
	$_SESSION[lang][want_register][id]	=	'Ingin Mendaftar?';
	$_SESSION[lang][want_register][en]	=	'Want To Register?';
	
	$_SESSION[lang][logout_success][id]	=	'Anda berhasil logout.';
	$_SESSION[lang][logout_success][en]	=	'You are successfully logged out.';
	
	$_SESSION[lang][account_not_active][id]	=	'Status account anda tidak aktif. Silakan kontak Administrator.';
	$_SESSION[lang][account_not_active][en]	=	'Your account not active yet. Please contact Administrator.';
	
	$_SESSION[lang][account_not_registered][id]	=	'Anda tidak terdaftar dalam sistem ini. <a href="index.php?v=reg" class="register">Daftar!</a>';
	$_SESSION[lang][account_not_registered][en]	=	'You are not registered in this system. <a href="index.php?v=reg" class="register">Register.</a>';
	
	//$_SESSION[lang][link_home] = array();
    $_SESSION[lang][link_home][id]	=	'Beranda';
    $_SESSION[lang][link_home][en]	=	'Home';
	
    $_SESSION[lang][link_admin][id]	=	'Admin';
    $_SESSION[lang][link_admin][en]	=	'Admin';
	
    $_SESSION[lang][link_upload][id]	=	'Unggah File';
    $_SESSION[lang][link_upload][en]	=	'Upload File';

    $_SESSION[lang][link_user][id]	=	'Daftar Pengguna';
    $_SESSION[lang][link_user][en]	=	'Users';
    
	$_SESSION[lang][link_list_species][id]	=	'Daftar Spesies';
	$_SESSION[lang][link_list_species][en]	=	'List of Species';
	
	$_SESSION[lang][link_list_species_cont][id]	=	'Daftar Spesies Yang Mengandung';
	$_SESSION[lang][link_list_species_cont][en]	=	'List of Species Containing';
	
    $_SESSION[lang][link_list_group][id]	=	'Group Senyawa';
    $_SESSION[lang][link_list_group][en]	=	'Compounds Group';
	
    $_SESSION[lang][add_link_list_group][id]	=	'Tambah Group Senyawa';
    $_SESSION[lang][add_link_list_group][en]	=	'Add Compounds Group';
	
    $_SESSION[lang][kode_link_list_group][id]	=	'Kode Group Senyawa';
    $_SESSION[lang][kode_link_list_group][en]	=	'Compounds Group Code';
	
    $_SESSION[lang][nama_link_list_group][id]	=	'Nama Group Senyawa';
    $_SESSION[lang][nama_link_list_group][en]	=	'Compounds Group Name';
	
    $_SESSION[lang][list_link_list_group][id]	=	'Daftar Group Senyawa';
    $_SESSION[lang][list_link_list_group][en]	=	'List of Compounds Group';
	
    $_SESSION[lang][link_list_content][id]	=	'Daftar Senyawa';
    $_SESSION[lang][link_list_content][en]	=	'List of Compounds';
	
	$_SESSION[lang][field_fullname][id]	=	'Nama lengkap';
	$_SESSION[lang][field_fullname][en]	=	'Full name';
	
	$_SESSION[lang][field_gender][id]	=	'Jenis Kelamin';
	$_SESSION[lang][field_gender][en]	=	'Gender';
	
	$_SESSION[lang][field_birthdate][id]	=	'Tanggal Lahir';
	$_SESSION[lang][field_birthdate][en]	=	'Birthdate';
	
	$_SESSION[lang][field_confirm_insert][id]	=	'Klik CANCEL untuk mengecek kembali data yang diinput. Klik OK untuk melanjutkan.';
	$_SESSION[lang][field_confirm_insert][en]	=	'Click CANCEL for checking data will be inserted. Click OK for continue anyway.';
	
    $_SESSION[lang][male_val][id]	=	'Laki-laki';
    $_SESSION[lang][male_val][en]	=	'Male';
	
    $_SESSION[lang][female_val][id]	=	'Perempuan';
    $_SESSION[lang][female_val][en]	=	'Female';

	$_SESSION[lang][success_del_data][id]	= 'Data berhasil dihapus.';
	$_SESSION[lang][success_del_data][en]	= 'Data removed successfully.';
	
	$_SESSION[lang][failed_del_data][id]	= 'Data gagal dihapus.';
	$_SESSION[lang][failed_del_data][en]	= 'Failed removing data.';
	
	$_SESSION[lang][success_verify_data][id]	= 'Data berhasil di-verifikasi.';
	$_SESSION[lang][success_verify_data][en]	= 'Data verified successfully.';
	$_SESSION[lang][failed_verify_data][id] 	= 'Data gagal di-verifikasi.';
	$_SESSION[lang][failed_verify_data][en] 	= 'Failed verifying data.';
	
	$_SESSION[lang][success_unverify_data][id] 	= 'Data berhasil di-unverifikasi.';
	$_SESSION[lang][success_unverify_data][en] 	= 'Data unverified successfully.';
	$_SESSION[lang][failed_unverify_data][id] 	= 'Data gagal di-unverifikasi.';
	$_SESSION[lang][failed_unverify_data][en] 	= 'Failed unverifying data.';
	
	$_SESSION[lang][exist_total][id]	=	'Ada total';
	$_SESSION[lang][exist_total][en]	=	'There is';
	
	$_SESSION[lang][daftar_konten_senyawa][id]	=	'Daftar Konten Senyawa';
	$_SESSION[lang][daftar_konten_senyawa][en]	=	'List of Compounds';
	
	$_SESSION[lang][daftar_recent_konten_senyawa][id]	=	'Daftar 10 Konten Senyawa Terbaru';
	$_SESSION[lang][daftar_recent_konten_senyawa][en]	=	'List of 10th Newest Compounds';
	
	$_SESSION[lang][daftar_spesies][id]	=	'Daftar Spesies';
	$_SESSION[lang][daftar_spesies][en]	=	'List of Species';
	
	$_SESSION[lang][daftar_recent_spesies][id]	=	'Daftar 10 Spesies Terbaru';
	$_SESSION[lang][daftar_recent_spesies][en]	=	'List of 10th Newest Species';
	
	$_SESSION[lang][del_confirm][id]	=	'Klik Cancel untuk batal. Klik Ok untuk melanjutkan penghapusan data.';
	$_SESSION[lang][del_confirm][en]	=	'Click Ok for continue anyway deleting data.';
	
	$_SESSION[lang][ver_confirm][id]	=	'Klik Cancel untuk batal. Klik Ok untuk melanjutkan verifikasi data.';
	$_SESSION[lang][ver_confirm][en]	=	'Click Ok for continue anyway verify the data.';
	
	$_SESSION[lang][unver_confirm][id]	=	'Klik Cancel untuk batal. Klik Ok untuk melanjutkan unverifikasi data.';
	$_SESSION[lang][unver_confirm][en]	=	'Click Ok for continue anyway unverify the data.';
	
	$_SESSION[lang][success_add_comment][id]	=	'Sukses menambahkan komentar.';
	$_SESSION[lang][success_add_comment][en]	=	'Comment added successfully.';
	
	$_SESSION[lang][failed_add_comment][id]	=	'Gagal menambahkan komentar.';
	$_SESSION[lang][failed_add_comment][en]	=	'Failed adding a comment.';
	
	$_SESSION[lang][comment_val][id]	=	'Komentar';
	$_SESSION[lang][comment_val][en]	=	'Comments';
	
	$_SESSION[lang][content_val][id]	=	'Senyawa';
	$_SESSION[lang][content_val][en]	=	'Compound';
	
	$_SESSION[lang][khasiat_val][id]	=	'Khasiat';
	$_SESSION[lang][khasiat_val][en]	=	'Virtue';
	
	$_SESSION[lang][aliases_val][id]	=	'Nama Alias';
	$_SESSION[lang][aliases_val][en]	=	'Aliases Name';
	
	$_SESSION[lang][add_aliases_val][id]	=	'Tambah Nama Alias';
	$_SESSION[lang][add_aliases_val][en]	=	'Add Aliases Name';
	
	$_SESSION[lang][localname_val][id]	=	'Nama Lokal';
	$_SESSION[lang][localname_val][en]	=	'Local Name';
	
	$_SESSION[lang][photos_val][id]	=	'Foto-foto';
	$_SESSION[lang][photos_val][en]	=	'Photos';
	
	$_SESSION[lang][add_photos_val][id]	=	'Upload Foto-foto';
	$_SESSION[lang][add_photos_val][en]	=	'Upload Photos';
	
	$_SESSION[lang][add_localname_val][id]	=	'Tambah Nama Lokal';
	$_SESSION[lang][add_localname_val][en]	=	'Add Local Name';
	
	$_SESSION[lang][date_val][id]	=	'Tanggal';
	$_SESSION[lang][date_val][en]	=	'Date';
	
	$_SESSION[lang][data_not_exist][id]	=	'data tidak ada';
	$_SESSION[lang][data_not_exist][en]	=	'data not exist';
	
	$_SESSION[lang][fill_comment_val][id]	=	'Isi komentar';
	$_SESSION[lang][fill_comment_val][en]	=	'Fill a comment';
	
	$_SESSION[lang][say_comment_val][id]	=	'berkomentar';
	$_SESSION[lang][say_comment_val][en]	=	'comments';
	
	$_SESSION[lang][action_val][id]	=	'Aksi';
	$_SESSION[lang][action_val][en]	=	'Action';
		
	$_SESSION[lang][content_val][id]	= 'Senyawa';
	$_SESSION[lang][content_val][en]	= 'Compound';
	
	$_SESSION[lang][contgroup_val][id]	= 'Group Senyawa';
	$_SESSION[lang][contgroup_val][en]	= 'Compound group';
	
	$_SESSION[lang][ref_val][id]		= 'Referensi';
	$_SESSION[lang][ref_val][en]		= 'Reference';
	
	$_SESSION[lang][name_ref_val][id]		= 'Nama Referensi';
	$_SESSION[lang][name_ref_val][en]		= 'Reference Name';
	
	$_SESSION[lang][add_ref_val][id]		= 'Tambah Referensi';
	$_SESSION[lang][add_ref_val][en]		= 'Add Reference';
	
	$_SESSION[lang][ref_list][id]		= 'Daftar Referensi';
	$_SESSION[lang][ref_list][en]		= 'List of Reference';
	
	$_SESSION[lang][added_by][id]		= 'Ditambahkan oleh';
	$_SESSION[lang][added_by][en]		= 'Added by';
	
	$_SESSION[lang][name_alias_val][id]		=	'Nama Alias';
	$_SESSION[lang][name_alias_val][en]		=	'Aliases Name';
	
	$_SESSION[lang][founder_alias_val][id]	=	'Penemu Nama Alias';
	$_SESSION[lang][founder_alias_val][en]	=	'Founder of Aliases Name';
	
	$_SESSION[lang][varietas_alias_val][id]	=	'Varietas Nama Alias';
	$_SESSION[lang][varietas_alias_val][en]	=	'Varietas of Aliases Name';

	$_SESSION[lang][localname_val][id]		= 'Nama Lokal';
	$_SESSION[lang][localname_val][en]		= 'Local Name';
	
	$_SESSION[lang][failed_upload][id]		= '<br>Gagal meng-upload file.<br><br>';
	$_SESSION[lang][failed_upload][en]		= 'Failed uploading file.';
	
	$_SESSION[lang][success_upload][id]		= '<br>Sukses meng-upload file.<br><br>';
	$_SESSION[lang][success_upload][en]		= 'Success uploading file.';
	
	$_SESSION[lang][success_adding_data][id]		= "Sukses menambahkan semua data ke database.";
	$_SESSION[lang][success_adding_data][en]		= "Success adding all data to database.";
	
	$_SESSION[lang][failed_adding_data][id]		= "Gagal menambahkan semua data ke database.";
	$_SESSION[lang][failed_adding_data][en]		= "Failed adding all data to database.";
	
	$_SESSION[lang][baris_data_val][id]	=	"Banyak baris data";
	$_SESSION[lang][baris_data_val][en]	=	"Number of rows data ";
	
	$_SESSION[lang][adding_spesies_val][id]	=	"Tambah Data Spesies";
	$_SESSION[lang][adding_spesies_val][en]	=	"Add Species Data";
	
	$_SESSION[lang][adding_senyawa_val][id]	=	"Tambah Data Senyawa";
	$_SESSION[lang][adding_senyawa_val][en]	=	"Add Compound Data";
	
	$_SESSION[lang][spesies_val][id] = "Spesies";
	$_SESSION[lang][spesies_val][en] = "Species";
	
	$_SESSION[lang][senyawa_val][id] = "Senyawa";
	$_SESSION[lang][senyawa_val][en] = "Compound";
	
	$_SESSION[lang][success_update_pass][id] = "Sukses mengupdate password.";
	$_SESSION[lang][success_update_pass][en] = "Success updating password.";
	
	$_SESSION[lang][failed_update_pass][id]	= "Gagal mengupdate password.";
	$_SESSION[lang][failed_update_pass][en]	= "Failed updating password.";
	
	$_SESSION[lang][newpass_not_same][id] = "<br>Update password gagal.<br> New password tidak cocok dengan Re-Type New Password.<br><br>";
	$_SESSION[lang][newpass_not_same][en] = "<br>Failed updating password.<br> New password not same with that Re-Type.<br><br>";
	
	$_SESSION[lang][wrong_old_pass][id] = "<br>Failed updating password. Wrong <i>Old password</i>.<br><br>";
	$_SESSION[lang][wrong_old_pass][en] = "<br>Update password gagal. <i>Old password</i> salah.<br><br>";
	
	$_SESSION[lang][failed_upload_foto][id] = "<br>Gagal meng-upload photo. <span style=font-size:10px;color:red;>Ukuran maksimum file yang diperbolehkan adalah 250kb.</span><br><br>";
	$_SESSION[lang][failed_upload_foto][en] = "<br>Failed uploading photo. <span style=font-size:10px;color:red;>Maximum file size is 250kb.</span><br><br>";
	
	$_SESSION[lang][failed_upload_cv][id] = "<br>Gagal meng-upload cv. <span style=font-size:10px;color:red;>Ukuran maksimum file yang diperbolehkan adalah 250kb.</span><br><br>";
	$_SESSION[lang][failed_upload_cv][en] = "<br>Failed uploading cv. <span style=font-size:10px;color:red;>Maximum file size is 250kb.</span><br><br>";
	
	$_SESSION[lang][cv_note][id] = "<span style=font-size:10px;color:red;>mohon segera meng-upload CV anda</span>";
	$_SESSION[lang][cv_note][en] = "<span style=font-size:10px;color:red;>please upload your CV immediatelly</span>";
	
	$_SESSION[lang][success_update_profile][id] = "<br>Update profile sukses.<br><br>";
	$_SESSION[lang][success_update_profile][en] = "<br>Success updating profile.<br><br>";
	
	$_SESSION[lang][failed_update_profile][id] = "<br>Update profile gagal.<br><br>";
	$_SESSION[lang][failed_update_profile][en] = "<br>Failed updating profile.<br><br>";
	
	$_SESSION[lang][field_oldpass][id]	=	'Password Lama';
	$_SESSION[lang][field_oldpass][en]	=	'Old Password';
	
	$_SESSION[lang][field_newpass][id]	=	'Password Baru';
	$_SESSION[lang][field_newpass][en]	=	'New Password';
	
	$_SESSION[lang][field_retypenewpass][id]	=	'Re-type Password Baru';
	$_SESSION[lang][field_retypenewpass][en]	=	'Re-type New Password';
	
	$_SESSION[lang][field_verified][id]	=	'Terverifikasi oleh';
	$_SESSION[lang][field_verified][en]	=	'Verified by';
	
	$_SESSION[lang][field_notverified][id]	=	'Belum Terverifikasi';
	$_SESSION[lang][field_notverified][en]	=	'Not Verified';
	
	$_SESSION[lang][penemu_val][id] = "Penemu";
	$_SESSION[lang][penemu_val][en] = "Founder";
	
	$_SESSION[lang][search_cat][id] = "Kategori Pencarian";
	$_SESSION[lang][search_cat][en] = "Search Category";
	
	$_SESSION[lang][search_key][id] = "Kunci Pencarian";
	$_SESSION[lang][search_key][en] = "Search Key";
	
	$_SESSION[lang][search_result][id] = "Hasil Pencarian";
	$_SESSION[lang][search_result][en] = "Search Results";
	
	$_SESSION[lang][field_add_user][id] = "Tambah User";
	$_SESSION[lang][field_add_user][en] = "Add User";
	
	$_SESSION[lang][field_list_user][id] = "Daftar User";
	$_SESSION[lang][field_list_user][en] = "List of User";
	
	$_SESSION[lang][success_act_user][id]	= "User berhasil di-aktivasi.<br>";
	$_SESSION[lang][success_act_user][en]	= "User activated successfully.<br>";
	$_SESSION[lang][failed_act_user][id]	= "User gagal di-aktivasi.<br>";
	$_SESSION[lang][failed_act_user][en]	= "Failed activating user.<br>";
	
	$_SESSION[lang][success_deact_user][id]	= "User berhasil di-deaktivasi.<br>";
	$_SESSION[lang][success_deact_user][en]	= "User deactivated successfully.<br>";
	$_SESSION[lang][failed_deact_user][id]	= "User gagal di-deaktivasi.<br>";
	$_SESSION[lang][failed_deact_user][en]	= "Failed deactivating user.<br>";
	
	$_SESSION[lang][invalid_image_type][id] = "Gagal menambahkan spesies ke database. File foto yang diupload harus berupa file image (JPG,PNG,GIF,dll).<br>";
	$_SESSION[lang][invalid_image_type][en] = "Failed inserting species to database. Image file must be in JPG,PNG or GIF format.<br>";
	
	$_SESSION[lang][success_assign][id] = "Sukses meng-assign konten senyawa ke spesies.<br>";
	$_SESSION[lang][success_assign][en] = "Compound(s) assigned to species successfully.<br>";
	
	$_SESSION[lang][failed_assign][id] = "Gagal meng-assign konten senyawa ke spesies.<br>";
	$_SESSION[lang][failed_assign][en] = "Compound(s) assigned to species successfully.<br>";
	
	$_SESSION[lang][search_not_found][id] = "Data dengan pencarian tersebut tidak ditemukan.<br>";
	$_SESSION[lang][search_not_found][en] = "Data with that search criteria not found in database.";
	
	$_SESSION[lang][notif_add_before][id] = "bila belum ada, tambahkan dulu pada";
	$_SESSION[lang][notif_add_before][en] = "if there is not yet exist, add data on";
	
	$_SESSION[lang][pilih_val][id] = "Pilih";
	$_SESSION[lang][pilih_val][en] = "Choose";
	
	$_SESSION[lang][klik_val][id] = "Klik di sini.";
	$_SESSION[lang][klik_val][en] = "Click Here.";
	
	$_SESSION[lang][assignment_val][id] = "Assign Senyawa ke Spesies";
	$_SESSION[lang][assignment_val][en] = "Assign Compound(s) to Species";
	
	$_SESSION[lang][ctrl_click_notif][id] = "CTRL + Click untuk memilih lebih dari 1 Senyawa.";
	$_SESSION[lang][ctrl_click_notif][en] = "CTRL + Click to multiple select of Compound(s).";
	
	$_SESSION[lang][success_update][id] = "Data sukses diupdate.";
	$_SESSION[lang][success_update][en] = "Data updated successfully.";
	
	$_SESSION[lang][failed_update][id] = "Data gagal diupdate.";
	$_SESSION[lang][failed_update][en] = "Failed updating data.";
	
	$_SESSION[lang][notif_spe_id][id] = "ID Spesies yang valid adalah K**** (* adalah angka 0-9).";
	$_SESSION[lang][notif_spe_id][en] = "The Valie Species ID id K****. (* is any number 0-9.).";
	
	$_SESSION[lang][mol1_failed][id] = "Entri gagal. File MOL1 gagal diupload.";
	$_SESSION[lang][mol1_failed][en] = "MOL1 file failed to be uploaded.";
		
	$_SESSION[lang][mol2_failed][id] = "File MOL2 gagal diupload.";
	$_SESSION[lang][mol2_failed][en] = "MOL2 file failed to be uploaded.";
		
	$_SESSION[lang][mol1_invalid][id] = "File MOL1 tidak valid.";
	$_SESSION[lang][mol1_invalid][en] = "Invalid MOL1 file.";
		
	$_SESSION[lang][mol2_invalid][id] = "File MOL2 tidak valid.";
	$_SESSION[lang][mol2_invalid][en] = "Invalid MOL2 file.";
		
	$_SESSION[lang][download_file_mol][id] = "Download file MOL";
	$_SESSION[lang][download_file_mol][en] = "Download file MOL";
	
	$_SESSION[lang][vir_type_val][id] = 'Tipe Khasiat';
	$_SESSION[lang][vir_type_val][en] = 'Virtue Type';	
	
	$_SESSION[lang][herbal_part_val][id] = 'Bagian Tumbuhan';	
	$_SESSION[lang][herbal_part_val][en] = 'Herbal Part';	
	
	$_SESSION[lang][vir_value_val][id] = 'Khasiat';
	$_SESSION[lang][vir_value_val][en] = 'Virtue';
	
	$_SESSION[lang][vir_value_en_val][id] = 'Khasiat (Inggris)';
	$_SESSION[lang][vir_value_en_val][en] = 'Virtue (English)';
	
	$_SESSION[lang][vir_value_latin_val][id] = 'Khasiat (Latin)';
	$_SESSION[lang][vir_value_latin_val][en] = 'Virtue (Latin)';

	$_SESSION[lang][aboutus_val][id] = "Tentang Kami";
	$_SESSION[lang][aboutus_val][en] = "About Us";

?>
