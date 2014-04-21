$(function() {
  var History = window.History;

  $.ajaxSetup({
    timeout: 3000,
    async: true,
    cache: false,
    dataType: 'json',
    type: 'GET'
  });

  $(document).ajaxStart(function() {
    $('#loading').modal('show');
  });
  
  $(document).ajaxComplete(function() {
    $('#loading').modal('hide');
  });


  var $content = $('#content');

  var stateCounter = 0;

  var loadUrl = function(url) {
    $.ajax({
      url: url,
      success: function(data) { 
        if (url !== location.href) {
          History.pushState({
            counter: stateCounter
          }, data.title, url);
        }

        $content.html(data.html);
        processContent($content);
      },
      error: function(xhr, status, error) {
        alert(status + ', ' + error);
      }
    });    
  }


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
  };

  processContent($content);

});
