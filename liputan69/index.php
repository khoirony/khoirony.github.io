<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
    <link rel="stylesheet" href="/style.css">

    <title>Liputan 69</title>
  </head>
  <body>
    <?php include('header.php'); ?>

    <div class="jumbotron jumbotron-fluid">
    <div class="container">
    <h1 class="display-4">Most Popular news</h1>
    <ul class="list-group" id="new">
        <li class="list-group-item active font-weight-bold" aria-current="true"> </li>
        <?php
        $conn=mysqli_connect("localhost","root","","blog_berita");
        $sql = 'SELECT* FROM konten order by id_konten DESC';
        $query = mysqli_query($conn, $sql);
        $index=0;
        echo '
            <table class="table table-borderless">
            <thead>';
        while ($row = mysqli_fetch_array($query)){
            $index++;
            if($index == 4){
                break; //looping stop saat list berita sudah 4 baris
            }
            echo '
                <tr class="list-group-item">
                <td scope="col"><img src="./images/'.$row['gambar'].' " class="border-0"  style="width: 400px;"></td>
                <td scope="col align-baseline">';
                if($jumlahBaris > 0 ){
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" method="GET"> <span class="h3">'.$row['judul_berita'].'</span></a><br/>';
                }else{
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'" method="GET"> <span class="h3">'.$row['judul_berita'].'</span></a><br/>';
                } 
                echo '
                Ditulis Pada '.$row['waktu_penulisan'].' 
                </td>
                </tr>';
        }
        echo '</thead>
        </table>';
        ?>
    </ul>
    <table class="table table-borderless">
    <tr><th scope="col">
    <ul class="list-group" id="Sport">
        <li class="list-group-item active font-weight-bold" aria-current="true">Sport</li>
        <?php
        $conn=mysqli_connect("localhost","root","","blog_berita");
        $sql = 'SELECT* FROM konten WHERE id_kategori=2002';
        $query = mysqli_query($conn, $sql);
        while ($row = mysqli_fetch_array($query)){
            echo '
            <li class="list-group-item">';
                if($jumlahBaris > 0){
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" method="GET">'.$row['judul_berita'].'</a><br/>';
                }else{
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'" method="GET">'.$row['judul_berita'].'</a><br/>';
                }
                echo '
                <span class="font-weight-light">Ditulis Pada '.$row['waktu_penulisan'].'</span>
            </li>';
        }
        ?>
    </ul>
    <ul class="list-group" id="Health">
        <li class="list-group-item active font-weight-bold" aria-current="true">Health</li>
        <?php
        $conn=mysqli_connect("localhost","root","","blog_berita");
        $sql = 'SELECT* FROM konten WHERE id_kategori=2003';
        $query = mysqli_query($conn, $sql);
        while ($row = mysqli_fetch_array($query)){
            echo '
            <li class="list-group-item">';
                if($jumlahBaris > 0 ){
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" method="GET">'.$row['judul_berita'].'</a><br/>';
                }else{
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'" method="GET">'.$row['judul_berita'].'</a><br/>';
                }
                echo '
                <span class="font-weight-light">Ditulis Pada '.$row['waktu_penulisan'].'</span>
            </li>';
        }
        ?>
    </ul>
    <ul class="list-group" id="Tech">
        <li class="list-group-item active font-weight-bold" aria-current="true">Tech</li>
        <?php
        $conn=mysqli_connect("localhost","root","","blog_berita");
        $sql = 'SELECT* FROM konten WHERE id_kategori=2004';
        $query = mysqli_query($conn, $sql);
        while ($row = mysqli_fetch_array($query)){
            echo '
            <li class="list-group-item">';
                if($jumlahBaris > 0 ){
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" method="GET">'.$row['judul_berita'].'</a><br/>';
                }else{
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'" method="GET">'.$row['judul_berita'].'</a><br/>';
                }
                echo '
                <span class="font-weight-light">Ditulis Pada '.$row['waktu_penulisan'].'</span>
            </li>';
        }
        ?>
    </ul>
    <ul class="list-group">
        <li class="list-group-item active font-weight-bold" aria-current="true" id="Politics">Politics</li>
        <?php
        $conn=mysqli_connect("localhost","root","","blog_berita");
        $sql = 'SELECT* FROM konten WHERE id_kategori=2001';
        $query = mysqli_query($conn, $sql);
        while ($row = mysqli_fetch_array($query)){
            echo '
            <li class="list-group-item">';
                if($jumlahBaris > 0 ){
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'&userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'" method="GET">'.$row['judul_berita'].'</a><br/>';
                }else{
                    echo '
                    <a href="konten.php?id='.$row['id_konten'].'" method="GET">'.$row['judul_berita'].'</a><br/>';
                }
                echo '
                <span class="font-weight-light">Ditulis Pada '.$row['waktu_penulisan'].'</span>
            </li>';
        }
        ?>
    </ul>
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
        echo '</thead>
        </table>';
        ?>
    </ul>
    </th></tr>
    </table>
    </div>
    </div>

    <?php include('footer.php'); ?>

    <!-- Option 1: jQuery and Bootstrap Bundle (includes Popper) -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>

  </body>
</html>
