<?php
//Retrieve form data.
if (isset($_POST['add_id'], $_POST['add_name'], $_POST['add_type'],
          $_POST['add_title'], $_POST['add_problem'], $_FILES['choose_image'])){

    $time = date('Y-m-d h:i A'); // displays the current time in unix time with miliseconds
    $id = htmlentities($_POST['add_id']);
    $name = htmlentities($_POST['add_name']);
    $type = htmlentities($_POST['add_type']);
    $title = htmlentities($_POST['add_title']);
    $problem = htmlentities($_POST['add_problem']);
    $solution = htmlentities($_POST['add_solution']);
    //$images = htmlentities($_POST['choose_image']); //must use image upload trick instead
    $comments = htmlentities($_POST['add_comments']);
}

////////////////////////////////////////////////////////////////////////////////

// Upload images and send results back to get handled by javascript
$upload_array = array();
$image_array = array();

for ($i = 0; $i < count($_FILES['choose_image']['name']); $i++) {
    // Upload photos to temp location with temp filename

    // Photo upload handlers
    $temp_name = $_FILES['choose_image']['tmp_name'][$i];
    $file_name = uniqid(rand());

    // Find file type and create extension
    $file_type = $_FILES['choose_image']['type'][$i];
    if ($file_type == 'image/jpeg'){
        $extention = '.jpeg';
        $okay = true;
    }else if ($file_type == 'image/jpg'){
        $extention = '.jpg';
        $okay = true;
    }else if ($file_type == 'image/gif'){
        $extention = '.gif';
        $okay = true;
    }else if ($file_type == 'image/png'){
        $extention = '.png';
        $okay = true;
    }else{$okay = false;}


    if ($okay == true){
        // Move from from temp to 'uploads'
        $path = 'uploads/'.$file_name.$extention;

        if (move_uploaded_file($temp_name, $path)){
            $status = 'successful upload';
        }else{
            $status = 'error uploading';
        }
    }else{
        $path = false;
        $status = 'not an image';
    }

    // Push data into result_array
    $error = $_FILES['choose_image']['error'][$i];
    $upload = array(
        'error' => $error,
        'status' => $status,
        'path' => $path);

    // Gather data to send back to user
    array_push($upload_array, $upload);
    array_push($image_array, $path);

}

// Return all image paths as strings
$images = implode(',', $image_array);


// Done with images

////////////////////////////////////////////////////////////////////////////////

// First check if there is an id (editing an existing submision)

if ($id == 'nope'){
    // not an edit.

    // Connect to DATABASE with PDO
    // Add data to TABLE using prepared statements

    try {
        $pdo = new PDO('mysql:host=localhost;dbname=stiltdb', 'stilt', 'stilt');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $pdo->prepare('INSERT INTO main_data(time, name, type, title, problem, solution, images, comments)
                               VALUES(:time, :name, :type, :title, :problem, :solution, :images, :comments)');
        $stmt->execute(array(
            ':time' => $time,
            ':name' => $name,
            ':type' => $type,
            ':title' => $title,
            ':problem' => $problem,
            ':solution' => $solution,
            ':images' => $images,
            ':comments' => $comments
        ));

        //Affected Rows?
        //echo $stmt->rowCount(); // 1

        // save results to send back to ajax
        $result_array = array(
            'time' => $time,
            'name' => $name,
            'type' => $type,
            'title' => $title,
            'problem' => $problem,
            'solution' => $solution,
            'images' => $images,
            'comments' => $comments);

        echo json_encode($result_array);

    } catch(PDOException $e) {
        echo json_encode('Error: ' . $e->getMessage());
    }

}else{
    // is an edit.

    // Connect to DATABASE with PDO
    // Update data to TABLE using prepared statements

    try {
        $pdo = new PDO('mysql:host=localhost;dbname=stiltdb', 'stilt', 'stilt');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $pdo->prepare('UPDATE main_data SET time = :time, name = :name,
                               type = :type, title = :title, problem = :problem,
                               solution = :solution, images = CONCAT(images, :images),
                               comments = :comments WHERE id = :id');

        $stmt->execute(array(
            ':time' => $time,
            ':name' => $name,
            ':type' => $type,
            ':title' => $title,
            ':problem' => $problem,
            ':solution' => $solution,
            ':images' => ',' . $images,
            ':comments' => $comments,
            ':id' => $id
        ));

        //Affected Rows?
        //echo $stmt->rowCount(); // 1

        // save results to send back to ajax
        $result_array = array(
            'time' => $time,
            'name' => $name,
            'type' => $type,
            'title' => $title,
            'problem' => $problem,
            'solution' => $solution,
            'images' => $images,
            'comments' => $comments);
        echo json_encode($result_array);

    } catch(PDOException $e) {
        echo json_encode('Error: ' . $e->getMessage());
    }

}

?>
