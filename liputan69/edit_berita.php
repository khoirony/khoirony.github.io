<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">
    

    <title>Edit Berita</title>
  </head>
  <body>
	<?php include('header.php');?>
	<div class="jumbotron jumbotron-fluid">
    <div class="container">
	
	<?php
	$id = $_GET['id'];
	$conn=mysqli_connect("localhost","root","","blog_berita");

	$sql = "SELECT * FROM konten WHERE id_konten=$id";
	$result = mysqli_query($conn,$sql);
	$row = mysqli_fetch_array($result);
	echo'
	<h1 class="display-4 text-center rounded-top">Edit Berita</h1>
    <li class="list-group-item active" aria-current="true"> </li>
	<div class="list-group-item">
	<div class="ml-3 mr-3 mt-5 mb-5">
	
	<form name="update_user" method="post" action="edit_berita.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'">
		<div class="form-group">
    		<label>Judul Berita</label>
			<input type="text" name="judul_berita" class="form-control" value="'.$row['judul_berita'].'">
		</div>
		<div class="form-group">
    		<label>Waktu Penulisan</label>
			<input type="text" class="form-control" name="waktu_penulisan" value="'.$row['waktu_penulisan'].'">
		</div>
		<div class="form-group">
    	<label>Isi Berita</label>
		<textarea type="text" class="form-control" name="isi_berita" rows="10">'.$row['isi_berita'].'</textarea>
		</div>';
	?>
        <div class="form-group">
    		<label>Kategori Berita</label><br/>
    		<input type="radio" name="kategori" value="2001" class="ml-1"> Politics </input>
           	<input type="radio" name="kategori" value="2002" class="ml-3"> Sport </input>
           	<input type="radio" name="kategori" value="2003" class="ml-3"> Health </input>
           	<input type="radio" name="kategori" value="2004" class="ml-3"> Tech </input>
		</div>
		<div class="form-group">
    		<label>Upload Gambar </label><br/>
    		<input type="file" name="gambar">
  		</div>
        <input class="btn btn-primary" type="submit" name="update" value="update">
		</form>
	</div></div>

	<?php 
		if(isset($_POST['update'])){
	    	$judul_berita = $_POST['judul_berita'];
		    $waktu_penulisan = $_POST['waktu_penulisan'];
	        $isi_berita = $_POST['isi_berita'];
			$id_kategori = $_POST['kategori'];
			$gambar = $_FILES['gambar']['name'];

			move_uploaded_file($_FILES['gambar']['tmp_name'],"./images/".$gambar);
		
			// update user data
		    $result = mysqli_query($conn,"UPDATE konten SET judul_berita='$judul_berita',waktu_penulisan='$waktu_penulisan',isi_berita='$isi_berita',gambar='$gambar',id_kategori='$id_kategori' WHERE id_konten=$id");
			
		    // Redirect to homepage to display updated user in list
			//header('Location:admin.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'');
			echo'.$gambar.';
		}
	?>
	</div>
	</div>

	<?php include('footer.php'); ?>
    
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>

  </body>
</html>