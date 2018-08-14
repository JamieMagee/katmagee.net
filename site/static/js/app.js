jQuery(function($) {
  $(document).ready(function() {
    $('.main-navigation').stickUp({});
  });
});
$(function() {
  $.scrollIt({
    topOffset: -70, // offste (in px) for fixed top navigation
    easing: 'ease-in-out'
  });
});
