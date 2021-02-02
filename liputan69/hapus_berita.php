<?php

include('header.php');

$id = $_GET['id'];
// include database connection file
$conn=mysqli_connect("localhost","root","","blog_berita");
 
// Get id from URL to delete that user
 
// Delete user row from table based on given id
$sql = mysqli_query($conn, "DELETE FROM konten WHERE id_konten=$id");
 
// After delete redirect to Home, so that latest user list will be displayed.
header('Location:admin.php?userName='.$arrayHasil[userName].'&passWord='.$arrayHasil[passWord].'');
?>