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

	$sql = "SELECT gambar FROM konten WHERE id_konten=$id";
	$result = mysqli_query($conn,$sql);
	$row = mysqli_fetch_array($result);
	echo'
		<form method="post" action="edit_gambar.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'">
		<div class="form-group">
    		<label>Upload Gambar </label><br/>
    		<input type="file" name="gambar" id="gambar">
  		</div>
        <input class="btn btn-primary" type="submit" name="update" value="update">
		</form>';
	?>

	<?php 
		if(isset($_POST['update'])){
			$gambar = $_FILES['gambar']['name'];

			move_uploaded_file($_FILES['gambar']['tmp_name'],"./images/".$gambar);
		
			// update user data
		    $result = mysqli_query($conn,"UPDATE konten SET gambar='$gambar' WHERE id_konten=$id");
			
		    // Redirect to homepage to display updated user in list
			echo '$gambar';
		}
	?>
	</div>
	</div>
	</body>
</html>