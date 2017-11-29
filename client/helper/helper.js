// function that handles error messages from the server
const handleError = (message) => {
  $("#errorMessage").text(message);
};

const NotFound = (props) => {
  return(
    <div>
      <p>props.message</p>
    </div>
  );
};

const createNotFoundPage = (message) => {
  ReactDOM.render(
    <NotFound message={message} />, document.querySelector("#content")
  );
};

// function that redirects the user on request success
const redirect = (response) => {
  window.location = response.redirect;
};

// function that sends ajax requests to the server
const sendAjax = (type, action, data, success) => {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data, 
    dataType: "json",
    success: success,
    error: function(xhr, status, error){
      var messageObj = JSON.parse(xhr.responseText); 
      handleError(messageObj.error);  
    }
  });
};