<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/style.css">
    <?php
	$userName=$_GET['userName'];
	$passWord=$_GET['passWord'];
	$conn=mysqli_connect("localhost","root","","blog_berita");
	$sql = "SELECT * FROM userpassword WHERE userName='$userName' AND passWord='$passWord' ";
	$query = mysqli_query($conn, $sql);
	$admin = mysqli_fetch_array($query);
	session_start();
	$_SESSION['uName'] = $admin['userName'];
	$_SESSION['pWord'] = $admin['passWord'];
	echo"
	<title>$_SESSION[uName]</title> "; 
	?>
  </head>
  <body>
	<?php

	if( strcmp($passWord,$_SESSION['pWord']) == 0){
		include('header.php');
		echo '
    	<div class="jumbotron jumbotron-fluid">
		<div class="container"> ';
    	    $sql = 'SELECT* FROM konten';
    	    $query = mysqli_query($conn, $sql);
			echo '
			<h1 class="display-4 text-center">Menu Admin</h1>
    		<li class="list-group-item active rounded-top" aria-current="true"> </li>
			<table class="table table-borderless">
    	    <thead>';
			
    	    while ($row = mysqli_fetch_array($query)){
    	        echo '
    	            <li class="list-group-item"><a href="konten.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" method="GET"> '.$row['judul_berita'].'</a><br/>
    	            <a href="edit_berita.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" class="btn btn-primary" method="GET">Edit</a> | <a href="hapus_berita.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" class="btn btn-primary" method="GET">Delete</a> </li>
    	            ';
    	    }
			echo '
			</thead>
    	    </table>
		</div>
    	</div>';
	}else{
		echo("Login Gagal");

	}
	?>

	<?php include('footer.php'); ?>
    
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>

  </body>
</html>