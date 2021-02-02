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
      $idk=$_GET['id'];
      $conn=mysqli_connect("localhost","root","","blog_berita");
      $sql= "SELECT * FROM konten WHERE id_konten=$idk";
      $query = mysqli_query($conn,$sql);
      $row = mysqli_fetch_array($query);
      echo'<title>'.$row['judul_berita'].'</title>';
    ?>
  </head>
  <body>
    <?php include('header.php'); ?>
    <div class="jumbotron jumbotron-fluid">
    <div class="container">
    
    <table class="table table-borderless">
      <tr><th scope="col">
      <?php
        $idk=$_GET['id'];
        $conn=mysqli_connect("localhost","root","","blog_berita");
        $sql= "SELECT kn.id_konten,gambar,id_kategori,nama_kategori,judul_berita,isi_berita,waktu_penulisan FROM konten kn JOIN kategori ki USING(id_kategori) WHERE id_konten=$idk";
        $query = mysqli_query($conn,$sql);
        $row = mysqli_fetch_array($query);
        echo '
          <div class="list-group-item">
          <div class="ml-3 mr-3 mt-3 mb-5">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb bg-white ml-5">
              <li class="breadcrumb-item font-weight-normal"><a href="index.php">Home</a></li>
              <li class="breadcrumb-item font-weight-normal"><a href="index.php#'.$row['nama_kategori'].'">'.$row['nama_kategori'].'</a></li>
              <li class="breadcrumb-item active font-weight-normal" aria-current="page">'.$row['judul_berita'].'</li>
            </ol>
          </nav>
          <h1 class="ml-5 mr-5">'.$row['judul_berita'].'</h1>
          <p class="ml-5 text-muted"> <span class="ml-2 font-weight-light">Ditulis pada '.$row['waktu_penulisan'].'</span></p>
          <br/>
          ​<picture class="ml-5">
          <img src="./images/'.$row['gambar'].'" style ="width: 90%">
          ​</picture>
          <br/><br/>
          <p class="ml-5 mr-5 md-5 text-justify font-weight-normal">'.$row['isi_berita'].'</p>
          </div>
          </div>';
      ?>
    
    </th>
    <th scope="col">
      <ul class="list-group">
        <?php
          $conn=mysqli_connect("localhost","root","","blog_berita");
          $sql = 'SELECT* FROM konten';
          $query = mysqli_query($conn, $sql);
          echo '
            <table class="table table-borderless">
            <thead>
            <li class="list-group-item" style="width: 300px;">Rekomendasi</li>';
          while ($row = mysqli_fetch_array($query)){
            echo '
              <li class="list-group-item" style="width: 300px;">';
              if($jumlahBaris > 0 ){
                echo '
                  <a href="konten.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" method="GET">'.$row['judul_berita'].'</a>';
              }else{
                echo '
                  <a href="konten.php?id='.$row['id_konten'].'" method="GET"> '.$row['judul_berita'].'</a>';
              }
              echo '
                </li>';
          }
          echo '
          </thead>
          </table>';
        ?>
      </ul>
    </th></tr>
    </table>
    </div></div>
    
    
    <?php include('footer.php'); ?>
  
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>
  </body>
</html>