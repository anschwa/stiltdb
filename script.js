$(document).ready(function(){

    ///////////////////////////////////////////////////
    // Detect Browser
    ///////////////////////////////////////////////////

    // Top Seach and Nav
    $('#search_field').click(function(){
        // remove targeted article from url
        location.hash = '';
        $('.nav_li').css('text-decoration', 'none');
        setTimeout(function(){$('#bottom').css('opacity','0');}, 1600);
    });

    $('#search_submit').click(function(){
        // add result to url
        // change to a search results article instead.
        location.hash = 'search_results_wrapper';
    });

    $('.nav_li, #search_submit').click(function(){
        $('#bottom').transition({opacity:1}, 500);
        var which_one = this.id;
        $('.nav_li').css('text-decoration', 'none');
        $('#'+which_one).css('text-decoration', 'underline');
        $('#search_submit').css('text-decoration', 'none');
        
        console.log(which_one);
        
    });

    $('#add_li').click(function(){
        // Reset Submit Form.
        $('#add_id').val('nope');
        $('#add_name').val('');
        $('#add_title').val('');
        $('#add_problem').val('');
        $('#add_solution').val('');
        $('#add_comments').val('');
        $('#add_type_problem').trigger('click');
    });

    ///////////////////////////////////////////////////
    // Add / Submit Form:
    $('#add_type_solution').click(function(){
        $('#add_form_solution').removeClass('hide');
        $('#add_form_solution').transition({scale:1});
        $('#add_submit').val('Submit Solution');
    });
    $('#add_type_problem').click(function(){
        $('#add_form_solution').transition({scale:0}, function(){
            $('#add_form_solution').addClass('hide');
        });
        $('#add_submit').val('Submit Problem');
    });
    //Add images JS
    $('#add_image').click(function(){
        $('#choose_image').trigger('click');
    });
    // List selected images in list
    // Code from "http://davidwalsh.name/multiple-file-upload"
    $('#choose_image').change(function(){
        //get the input and UL list
        var input = document.getElementById("choose_image");
        var ul = document.getElementById("file_list");
        //empty list for now...
        while (ul.hasChildNodes()) {
            ul.removeChild(ul.firstChild);
        }
        //for every file...
        for (var i = 0; i < input.files.length; i++) {
            var li = document.createElement("li");
            li.innerHTML = input.files[i].name;
            ul.appendChild(li);
        }
        if(!ul.hasChildNodes()) {
            var li = document.createElement("li");
            li.innerHTML = 'No Images';
            ul.appendChild(li);
        }
    });

    ////////////////////////////////////////////////
    // View All / View Resolve
    /////////////////////////////////////////////////

});

////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////
// All Ajax Calls Here!
//////////////////////////////////////////////////

// run a search
// Ajax for Search
$('body').on('submit', '#search_form', function(){
    
    // Clear existing list.
    $('#search_results_form .results_list').text('');

    // Begin Ajax
    console.log('sent');
    var data = 'search_string=' + $('#search_field').val();

    $.ajax({
        url: 'search.php',
        type: 'GET',
        data: data,
        dataType: 'json',
        cache: false
    }).done(function(result){
        console.log("AJAX Success");
        console.log(result);
        // Now time to insert this data.
        // Should combine this into getResults some how.
        for(var i=0;i<result.length;i++) {
            var id = result[i]['id'];
            var title = result[i]['title'];
            var time = result[i]['time'];
            // make elements
            var result_li = document.createElement('li');
            var result_id = document.createElement('input');
            var result_title = document.createElement('span');
            var result_time = document.createElement('span');
            var result_edit_span = document.createElement('span');
            var result_edit = document.createElement('span');

            result_title.setAttribute('class', 'result_title');
            result_title.innerHTML = title;
            result_li.appendChild(result_title);

            result_id.setAttribute('type', 'hidden');
            result_id.setAttribute('name', 'result_id');
            result_id.setAttribute('class', 'result_id');
            result_id.setAttribute('value', id);
            result_title.appendChild(result_id);

            result_time.setAttribute('class', 'result_time');
            result_time.innerHTML = time;
            result_li.appendChild(result_time);

            result_edit_span.setAttribute('class', 'result_edit_span');
            result_li.appendChild(result_edit_span);
            result_edit.setAttribute('class', 'result_edit');
            result_edit.innerHTML = 'Edit';
            result_edit_span.appendChild(result_edit);

            $('#search_results_form .results_list').append(result_li);
        }

    }).fail(function(jqXHR, textStatus){
        console.log("AJAX Failure" + " "+textStatus);
    });
    return false; // ensures page is not refreshed.
});

////////////////////////////////////////////////////////////////////////////////

// Add submisson to the database.
$('body').on('submit', '#add_form', function(){
    // Show Progress Bar
    $('#add_submit').addClass('hide');
    $('#add_progress').toggleClass('hide');

    // Get the form data. This serializes the entire form. pritty easy huh!
    var form = new FormData($('#add_form')[0]);

    // Make the ajax call

    console.log('Sent');

    $.ajax({
        url: 'submit.php',
        type: 'POST',
        xhr: function() {
            var myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){
                myXhr.upload.addEventListener('progress',progress, false);
            }
            return myXhr;
        },
        //add beforesend handler to validate or something
        //beforeSend: functionname,
        success: function (result) {
            console.log('Success')
            console.log(result);
        },
        //add error handler for when a error occurs if you want!
        //error: errorfunction,
        data: form,
        dataType: 'json',
        // this is the important stuf you need to overide the usual post behavior
        cache: false,
        contentType: false,
        processData: false

    }).fail(function(jqXHR, textStatus){
        console.log("AJAX Failure" + " "+textStatus);
    });
    return false;

    // Yes outside of the .ready space becouse this is a function not an event listner!
    function progress(e){
        if(e.lengthComputable){
            //this makes a nice fancy progress bar
            $('#add_progress').attr({value:e.loaded,max:e.total});
            // hide progress bar after 1 second
            setTimeout(function(){
                $('#add_submit').toggleClass('hide');
                $('#add_progress').toggleClass('hide');
                $('#add_progress').val('0');
                // 'Close' submit box
                $('#search_field').trigger('click');
            }, 1000);
        }
    }
});

////////////////////////////////////////////////////////////////////////////////

// Generate 'edit' in submit form.
$('body').on('click', '.result_edit', function(){
    // Reset Submit Form.
    $('#add_id').val('nope');
    $('#add_name').val('');
    $('#add_title').val('');
    $('#add_problem').val('');
    $('#add_solution').val('');
    $('#add_comments').val('');

    // Begin Ajax
    console.log('sent');
    // Get the table id of submission
    var data = 'result_id=' + $(this).parent().prev().prev().find('input').val();
    console.log(data);

    $.ajax({
        url: 'view-result.php',
        type: 'GET',
        data: data,
        dataType: 'json',
        cache: false
    }).done(function(result){
        console.log("AJAX Success");
        console.log(result);
        // Now add info into the page.
        var id = result.id;
        var title = result.title;
        var time = result.time;
        var name = result.name;
        var problem = result.problem;
        var solution = result.solution;
        var comments = result.comments;
        // replicate '<br>' apperance with new line.
        var new_problem = '<p>\"Asked By: '+name+'<br>\nOn: '+time+'\"<br><br>\n\n</p>'+_.unescape(problem);

        $('#add_id').val(id);
        $('#add_title').val(title);
        $('#add_problem').val(new_problem);
        $('#add_solution').val(_.unescape(solution));
        $('#add_comments').val(_.unescape(comments));
        $('#add_type_solution').trigger('click');

        // View the Result!
        location.hash = 'add_wrapper';

    }).fail(function(jqXHR, textStatus){
        console.log("AJAX Failure" + " "+textStatus);
    });
    return false; // ensures page is not Refreshed.


});

////////////////////////////////////////////////////////////////////////////////

//  Generate View when list item is clicked
// Use $('body').on() to add eventlistener to static and dynamic content.
$('body').on('click', '.result_title', function(){
    // remove previous images.
    $('#result_images_img_a').text('');
    // Begin Ajax
    console.log('sent');
    // Get the table id of submission
    var data = 'result_id=' + $(this).find('input').val();

    $.ajax({
        url: 'view-result.php',
        type: 'GET',
        data: data,
        dataType: 'json',
        cache: false
    }).done(function(result){
        console.log("AJAX Success");
        console.log(result);
        // Now add info into the page.
        var id = result.id;
        var time = result.time;
        var title = result.title;
        var name = result.name;
        var problem = result.problem;
        var solution = result.solution;
        var comments = result.comments;
        var images = result.images;

        $('#markdown_id').val(id);
        $('.markdown_title').text(title);
        $('.markdown_name').text(name);
        $('.markdown_time').text(time);
        // Use '_.unescape' to include html tags and & symbols.
        $('.markdown_problem_p').html(_.unescape(problem));
        $('.markdown_solution_p').html(_.unescape(solution));
        $('.markdown_comments_p').html(_.unescape(comments));

        // Add images and create array.
        try{
            var images = images.split(',');
            var img_length = images.length;
        }catch(error){
            if (images.length < 1) {
                var img_length = 0;
                console.log(img_length);

            }else{var img_length = 1;}
        }

        for (var i=0;i<img_length;i++){

            var img_a = document.createElement("a");
            var img = document.createElement('img');

            img_a.setAttribute('href', images[i]);
            img_a.setAttribute('data-lightbox', 'result_group');
            img.setAttribute('src', images[i]);

            img_a.appendChild(img);
            $('#result_images_img_a').append(img_a);
        };

        // View the Result!
        location.hash = 'result_wrapper';

    }).fail(function(jqXHR, textStatus){
        console.log("AJAX Failure" + " "+textStatus);
    });
    return false; // ensures page is not Refreshed.

});

////////////////////////////////////////////////////////////////////////////////

// Generate Resolve List.
$('body').on('click', '#resolve_li', function(){
    // Clear existing list.
    $('#resolve_form .results_list').text('');

    // get resolve list
    getResults('problem');
});

////////////////////////////////////////////////////////////////////////////////

// View All List
$('body').on('click', '#view_li', function(){
    // Clear existing list.
    $('#view_form .results_list').text('');

    // get resolve list
    getResults('solution');
});

////////////////////////////////////////////////////////////////////////////////

// Refresh feedback

$('body').on('click', '#feed_li', function(){
    // clear old feedback
    $('#feed_list').text('');
    // for some reason feed_wrapper is not appended to the url from the link
    location.hash = 'feed_wrapper';
    
    // Begin Ajax
    console.log('sent');
    // html GET string
    var data = '';
    $.ajax({
        url: 'feedback.json',
        type: 'GET',
        data: data,
        dataType: 'json',
        cache: false
    }).done(function(result){
        console.log("AJAX Success");
        console.log(result);
        // Now do something with result
        displayFeedback(result);
        
    }).fail(function(jqXHR, textStatus){
        console.log("AJAX Failure" + " "+textStatus);
    });
    return false; // ensures page is not refreshed.
});

// Send Feedback via json
$('body').on('click', '#feed_submit', function(){
    // clear current feedback
    $('#feed_list').text('');
    var data = $('#feed_form').serialize();
    // Begin AJAX
    $.ajax({
        url: 'feedback.php',
        type: 'GET',
        data: data,
        dataType: 'json',
        cache: false
    }).done(function(result){
        console.log("AJAX Success");
        console.log(result);
        // Now time to insert this data.
        displayFeedback(result);
        
    }).fail(function(jqXHR, textStatus){
        console.log("AJAX Failure" + " "+textStatus);
    });
    return false; // ensures page is not Refreshed.
});

////////////////////////////////////////////////////////////////////////////////

// Generate a list of submissons in database
function getResults(type){
    // Begin Ajax
    console.log('sent');
    var data = 'type='+type;

    $.ajax({
        url: 'results-list.php',
        type: 'GET',
        data: data,
        dataType: 'json',
        cache: false
    }).done(function(result){
        console.log("AJAX Success");
        console.log(result);
        // Now time to insert this data.
        for (var i=0;i<result.length;i++) {
            var id = result[i]['id'];
            var title = result[i]['title'];
            var time = result[i]['time'];
            // make elements
            var result_li = document.createElement('li');
            var result_id = document.createElement('input');
            var result_title = document.createElement('span');
            var result_time = document.createElement('span');
            var result_edit_span = document.createElement('span');
            var result_edit = document.createElement('span');

            result_title.setAttribute('class', 'result_title');
            result_title.innerHTML = title;
            result_li.appendChild(result_title);

            result_id.setAttribute('type', 'hidden');
            result_id.setAttribute('name', 'result_id');
            result_id.setAttribute('class', 'result_id');
            result_id.setAttribute('value', id);
            result_title.appendChild(result_id);

            result_time.setAttribute('class', 'result_time');
            result_time.innerHTML = time;
            result_li.appendChild(result_time);

            result_edit_span.setAttribute('class', 'result_edit_span');
            result_li.appendChild(result_edit_span);
            result_edit.setAttribute('class', 'result_edit');
            result_edit.innerHTML = 'Edit';
            result_edit_span.appendChild(result_edit);

            if (type === 'problem'){
                $('#resolve_form .results_list').append(result_li);
            }else{
                $('#view_form .results_list').append(result_li);
            }
        }
        
    }).fail(function(jqXHR, textStatus){
        console.log("AJAX Failure" + " "+textStatus);
    });
    return false; // ensures page is not Refreshed.
}

// Function to display feedback

function displayFeedback(result){
    for (var i=0;i<result.length;i++) {
        var name = result[i]['name'] + ':';
        var comment = result[i]['comment'];
        var time = result[i]['time'];
        // make elements
        var result_li = document.createElement('li');
        var result_p = document.createElement('p');
        var result_name = document.createElement('span');
        var result_comment = document.createElement('span');
        var result_time = document.createElement('span');

        result_p.setAttribute('class', 'feed_result');
        result_li.appendChild(result_p);

        result_name.setAttribute('class', 'feed_result_name');
        result_name.innerHTML = name;
        result_p.appendChild(result_name);

        result_comment.setAttribute('class', 'feed_result_comment');
        result_comment.innerHTML = comment;
        result_p.appendChild(result_comment);

        result_time.setAttribute('class', 'result_time');
        result_time.innerHTML = time;
        result_li.appendChild(result_time);

        $('#feed_list').append(result_li);
    }
}

////////////////////////////////////////////////////////////////////////////////
