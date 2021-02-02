<html>
    <head>
        <script src="https://kit.fontawesome.com/c12c059ff2.js" crossorigin="anonymous"></script>
    </head>
        <?php
    	    error_reporting(0);
    	    $conn=mysqli_connect("localhost","root","","blog_berita");
	        $userName=$_GET['userName'];
	        $passWord=$_GET['passWord'];
	        $qry=mysqli_query( $conn,"SELECT * FROM userpassword WHERE
	        userName='$userName' AND passWord='$passWord' ");
	        $jumlahBaris= mysqli_num_rows($qry);
	        $arrayHasil=mysqli_fetch_array($qry);

	        if($jumlahBaris > 0 ){
		        session_start();
		        $_SESSION[uName] = $arrayHasil[userName];
		        $_SESSION[pWord] = $arrayHasil[passWord];
                $_SESSION[lUser] = $arrayHasil[levelUser];
                echo'
                <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
                <div class="container">
                <a class="navbar-brand font-weight-bold" href="index.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'">Liputan 69</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNavDropdown">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item active ml-2">
                        <a class="nav-link" href="index.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'">Home <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item active ml-2">
                        <a class="nav-link" href="index.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'#Politics">Politic</a>
                    </li>
                    <li class="nav-item active ml-2">
                        <a class="nav-link" href="index.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'#Sport">Sport</a>
                    </li>
                        <li class="nav-item active ml-2">
                        <a class="nav-link" href="index.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'#Tech">Tech</a>
                    </li>
                    <li class="nav-item active ml-2">
                       <a class="nav-link" href="index.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'#Health">Health</a>
                    </li>
                    <li class="nav-item dropdown ml-4">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-users"></i> '.$arrayHasil[userName].'
                        </a>
                        <div class="dropdown-menu bg-dark mt-2 border-0 rounded-0" aria-labelledby="navbarDropdownMenuLink">
                            <a class="dropdown-item text-white" href="admin.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'">Update Berita</a>
                            <a class="dropdown-item text-white" href="tambah_berita.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'">Tambah Berita</a>
                            <a class="dropdown-item text-white" href="index.php">Logout</a>
                        </div>
                    </li>
                </ul>
                </div>
                </div>
                </nav>';
            }else{
    		    echo'
                <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
                <div class="container">
                <a class="navbar-brand font-weight-bold" href="index.php">Liputan 69</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNavDropdown">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item active ml-2">
                        <a class="nav-link" href="index.php">Home <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item active ml-2">
                        <a class="nav-link" href="index.php#Politics">Politic</a>
                    </li>
                    <li class="nav-item active ml-2">
                        <a class="nav-link" href="index.php#Sport">Sport</a>
                    </li>
                        <li class="nav-item active ml-2">
                        <a class="nav-link" href="index.php#Tech">Tech</a>
                    </li>
                    <li class="nav-item active ml-2">
                        <a class="nav-link" href="index.php#Health">Health</a>
                    </li>
                    <li class="nav-item ml-4">
                        <a class="nav-link" href="login.php">Login</a>
                    </li>
                </ul>
                </div>
                </div>
                </nav>';
	        }
	    ?>        
</html>