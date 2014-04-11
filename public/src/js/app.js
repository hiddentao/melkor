$(function() {
  $('a[role=delete]').click(function(e) {
    return confirm('Are you sure you want to delete this?');
  });
});
