<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">
    
    <title>Login Admin</title>
  </head>
  <body>
	<?php include('header.php'); ?>
	<div class="jumbotron jumbotron-fluid">
  	<div class="container">
	<div class="list-group-item mr-5 ml-7" style="margin-left: 3rem; margin-right: 3rem;">
	<br/><br/>
	<h1 align="center"> Login Admin </h1>
	<form name="login" action="./admin.php" method="GET">
	<div class="form-group ml-5 mr-5">
	    <label>Username</label>
	    <input type="text" class="form-control" name="userName">
	</div>
	<div class="form-group ml-5 mr-5">
	    <label>Password</label>
	    <input type="password" class="form-control" name="passWord">
	</div>
	<div class="form-group form-check ml-5 mr-5">
	    <input type="checkbox" class="form-check-input" id="exampleCheck1">
	    <label class="form-check-label" for="exampleCheck1">Ingatkan Saya</label>
	</div>
	<button type="submit" class="btn btn-primary ml-5 mr-5 mb-5">Login</button>
	</form>
	</div>
	</div>
	</div>

	<?php include('footer.php'); ?>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>

  </body>
</html>