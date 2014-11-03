<?php

if (isset($_GET['feed_name'], $_GET['feed_comment'])){
    $name = htmlentities($_GET['feed_name']);
    $comment = htmlentities($_GET['feed_comment']);
    $time = date('Y-m-d h:i A'); // set timestamp
    /*
    $address = 'feedback@stiltdb.com';
    $subject = 'StiltDB Feedback';
    $message = 'From: ' . $name . '\r\n' . $comment;
    
    // email feedback
    mail($address, $subject, $message);
    */


    // add feedback to json file, then view on stiltdb

    $feedback_array = array("name" => $name, "comment" => $comment, 'time' => $time);

    $file = 'feedback.json';

    $data = json_decode(file_get_contents($file), true);

    // Add feedback to json file
    $data[] = $feedback_array;
    
    // ensures most recent is first.
    $data_reverse = array_reverse($data);

    $json = json_encode($data_reverse);

    file_put_contents($file, $json);

    // Send back new feedback
    echo $json;
}

?>