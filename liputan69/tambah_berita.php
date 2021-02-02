<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">

    <title>Tulis Berita Baru</title>
  </head>
  <body>
	<?php include('header.php');?>
	<div class="jumbotron jumbotron-fluid">
    <div class="container">
	<?php
	// Check If form submitted, insert form data into users table.
	if(isset($_POST['Submit'])) {
		$judul_berita = $_POST['judul_berita'];
		$waktu_penulisan = $_POST['waktu_penulisan'];
        $isi_berita = $_POST['isi_berita'];
		$id_kategori = $_POST['kategori'];
		$gambar = $_FILES['gambar']['name'];

		move_uploaded_file($_FILES['gambar']['tmp_name'],"./images/".$gambar);
			
		// include database connection file
		$conn=mysqli_connect("localhost","root","","blog_berita");
		$result = mysqli_query($conn, "INSERT INTO konten(judul_berita,waktu_penulisan,id_kategori,isi_berita,gambar) VALUES('$judul_berita','$waktu_penulisan','$id_kategori','$isi_berita','$gambar')");
		echo '
		<h6>Berita baru berhasil ditambahkan. '.$gambar.' <a href="index.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'"><span class="badge badge-secondary">Lihat Berita</span></a></h6> ';
	}
	?>
	<h1 class="display-4 text-center rounded-top">Tulis Berita</h1>
    <li class="list-group-item active" aria-current="true"> </li>
	<div class="list-group-item">
	<div class="ml-3 mr-3 mt-5 mb-5">
	<?php echo'<form action="tambah_berita.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" method="post" enctype="multipart/form-data" name="form1">'; ?>
  		<div class="form-group">
    		<label>Judul Berita</label>
    		<input type="text" name="judul_berita" class="form-control" placeholder="Masukkan judul berita">
  		</div>
		<div class="form-group">
    		<label>Waktu Penulisan </label>
    		<input type="text" name="waktu_penulisan" class="form-control" placeholder="YYYY-MM-DD">
  		</div>
		<div class="form-group">
    		<label>Isi Berita</label>
    		<textarea type="text" name="isi_berita" class="form-control" rows="10"></textarea>
  		</div>
		<div class="form-group">
    		<label>Kategori Berita</label><br/>
    		<input type='radio' name='kategori' value='2001' class='ml-1'> Politics </input>
            <input type='radio' name='kategori' value='2002' class='ml-3'> Sport </input>
            <input type='radio' name='kategori' value='2003' class='ml-3'> Health </input>
            <input type='radio' name='kategori' value='2004' class='ml-3'> Tech </input>
  		</div>
		<div class="form-group">
    		<label>Upload Gambar </label><br/>
    		<input type="file" name="gambar">
  		</div>
		<input class="btn btn-primary" type="submit" name="Submit" value="Submit">
	</form>
	</div></div></div></div>

	<?php include('footer.php'); ?>

    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>

  </body>
</html>