jQuery(function($) {
  $(document).ready(function() {
    $('.main-navigation').stickUp({});
  });
});
$(function() {
  $.scrollIt({
    topOffset: -70,
    easing: 'ease-in-out'
  });
});

if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        document.location.href = '/admin/';
      });
    }
  });
}
