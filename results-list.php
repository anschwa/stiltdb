<?php

//Retrieve form data.
if (isset($_GET['type'])){
    $type = htmlentities($_GET['type']);
}

$result_array = array();

try {
    $conn = new PDO('mysql:host=localhost;dbname=stiltdb', 'stilt', 'stilt');
    $stmt = $conn->prepare('SELECT * FROM main_data WHERE type = :type');
    $stmt->execute(array('type' => $type));

    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($result)) {
        foreach($result as $row){
            $new_result = array('id' => '', 'title' => '', 'time' => '');
            // Return only the cols we actually need.
            //array_push($new_result, $row['id'], $row['title'], $row['time']);
            $new_result['id'] = $row['id'];
            $new_result['title'] = $row['title'];
            $new_result['time'] = $row['time'];
            

            array_push($result_array, $new_result);
        }
        echo json_encode($result_array);

    } else {
        echo json_encode("No rows returned.");
    }

} catch(PDOException $e) {
    echo json_encode('ERROR: ' . $e->getMessage());
}

?>