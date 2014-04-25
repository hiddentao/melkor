$(function() {
  var History = window.History;

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

    // confirm deletions
    $('a[role=delete]', rootElement).click(function(e) {
      return confirm('Are you sure you want to delete this?');
    });

    // AJAX-powered editing
    $('a[role=edit], .pageBody a', rootElement).click(function(e) {
      var $a = $(e.delegateTarget);

      // if the URL is not relative then don't process it via AJAX.
      var anchorUrl = $a.attr('href');
      if (-1 !== anchorUrl.indexOf('://')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

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

    alert('AJAX error: ' + status + ', ' + error);    
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
