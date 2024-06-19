// sends AJAX requests to server and redirects responses accordingly
const sendAjax = (type, action, data, processBool, success) => {
    let contentType = !processBool ? false : 'application/x-www-form-urlencoded; charset=UTF-8';

    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: 'json',
        processData: processBool,
        contentType: contentType,
        success: success,
        error: (xhr) => handleError(xhr.responseJSON.error)
    });
};

// handles error responses from server
const handleError = (message) => $("#errorMessage").text(message);

// redirects the user to pages (window.location)
const redirect = (res) => window.location = res.redirect;