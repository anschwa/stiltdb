<?php

// Return array with each different elements of two arrays.
function array_xor($array_a, $array_b) {
    $union_array = array_merge($array_a, $array_b);
    $intersect_array = array_intersect($array_a, $array_b);
    return array_diff($union_array, $intersect_array);
}

function prepareSearch($string){
    $string = strtolower($string);
    // remove non alphanumeric
    $string = preg_replace("/[^A-Za-z0-9 ]/", '', $string);
    $string_array = explode(" ", $string);
    return($string_array);
}

if (isset($_GET['search_string'])){
    $search = htmlentities($_GET['search_string']);
}

// Match words in search with titles in database.
// Return list of 10 most matched rows.

try {
    $conn = new PDO('mysql:host=localhost;dbname=stiltdb', 'stilt', 'stilt');
    $stmt = $conn->prepare('SELECT * FROM main_data');
    $stmt->execute();

    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);


    $search_rows_array = array();
    if (count($result)) {
        foreach ($result as $row){
            $row_id = $row['id'];
            $row_time = $row['time'];
            $row_name = $row['name'];
            $row_type = $row['type'];
            $row_title = $row['title'];
            $row_problem = $row['problem'];
            $row_solution = $row['solution'];
            $row_images = $row['images'];
            $row_comments = $row['comments'];

            $search_array = prepareSearch($search);
            $title_array = prepareSearch($row_title);
            $diff = array_xor($search_array, $title_array);

            $diff_len = count($diff);

            $diff_array = array(
                'row_diff' => $diff_len,
                'id' => $row_id,
                'time' => $row_time,
                'name' => $row_name,
                'type' => $row_type,
                'title' => $row_title,
                'problem' => $row_problem,
                'solution' => $row_solution,
                'images' => $row_images,
                'comments' => $row_comments
            );

            array_push($search_rows_array, $diff_array);

            unset($title);
        }

    } else {
        echo json_encode("No rows returned.");
    }

} catch(PDOException $e) {
    echo json_encode('ERROR: ' . $e->getMessage());
}

// Sort array by len ascending
sort($search_rows_array);

// Return only the top ten closets matches
$split_search_array = array_slice($search_rows_array, 0, 10);

echo json_encode($split_search_array);

?>