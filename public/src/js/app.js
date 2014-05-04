$(function() {
  var History = window.History;

  var askUser = function(msg) {
    return (window._testConfirm || window.confirm).call(null, msg);
  }

  $.ajaxSetup({
    timeout: 3000,
    async: true,
    cache: false,
    dataType: 'json',
    type: 'GET'
  });


  var $content = $('#content');

  var stateCounter = 0;


  /**
   * Handle navigating back in history
   */
  History.Adapter.bind(window,'statechange',function(){ 
    var state = History.getState();

    // if this is a manual state change which we've just performed in loadUrl()
    // then there's no need to do anything
    if (state.data && state.data.counter === stateCounter) {
      return;
    } else {
      // inc. the counter
      stateCounter++;
      // load the content
      loadUrl(state.url);
    }
  });


  /**
   * Process links and forms under the given element, enabling AJAX where 
   * possible.
   */
  var processContent = function(rootElement) {

    // AJAX-powered navigation and actions
    $('a[role=edit], a[role=delete], .pageBody a', rootElement).click(function(e) {      
      var $a = $(e.delegateTarget);

      // if the URL is not relative then don't process it via AJAX.
      var anchorUrl = $a.attr('href');
      if (-1 !== anchorUrl.indexOf('://')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // confirm deletions
      if ('delete' === $a.attr('role')) {
        if (!askUser('Are you sure you want to delete this?')) {
          return;
        }
      }

      loadUrl(anchorUrl);
    });

    // forms
    $('form', rootElement).ajaxForm({
      beforeSubmit: showProgressMsg,
      success: handleAjaxSuccess(),
      error: handleAjaxError
    });
  };



  /**
   * Get AJAX error handler
   */
  var handleAjaxError = function(xhr, status, error) {
    hideProgressMsg();

    if (xhr.responseJSON) {      
      $content.html(xhr.responseJSON.html);
      processContent($content);
    } else {
      alert('AJAX error: ' + status + ', ' + error);    
    }

    $content.trigger('melkorAjaxError', [error]);
  };


  /** Get AJAX success handler */
  var handleAjaxSuccess = function(url) {
    return function(data, status, xhr) {
      hideProgressMsg();

      var finalURL = xhr.getResponseHeader('TM-finalURL') || url || location.href;

      if (finalURL !== location.href) {
        History.pushState({
          counter: stateCounter
        }, data.title, finalURL);
      }

      $content.html(data.html);
      processContent($content);      

      $content.trigger('melkorAjaxSuccess', [url]);
    }
  }


  /**
   * Load URL via AJAX
   */
  var loadUrl = function(url) {
    showProgressMsg();

    $.ajax({
      url: url,
      success: handleAjaxSuccess(url),
      error: handleAjaxError
    });    
  }


  var showProgressMsg = function() {
    $('#loading').modal('show');
  };
  

  var hideProgressMsg = function() {
    $('#loading').modal('hide');
  };



  processContent($content);
});
