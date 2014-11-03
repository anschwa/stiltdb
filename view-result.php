<?php

//Retrieve form data.
if (isset($_GET['result_id'])){
    $id = htmlentities($_GET['result_id']);
}

try {
    $conn = new PDO('mysql:host=localhost;dbname=stiltdb', 'stilt', 'stilt');
    $stmt = $conn->prepare('SELECT * FROM main_data WHERE id = :id');
    $stmt->execute(array('id' => $id));

    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);


    if (count($result)) {
        $result_array = $result[0];
        echo json_encode($result_array);

    } else {
        echo json_encode("No rows returned.");
    }

} catch(PDOException $e) {
    echo json_encode('ERROR: ' . $e->getMessage());
}

?>