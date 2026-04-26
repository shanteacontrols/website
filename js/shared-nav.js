/**
 * Shared navigation behavior for landing and blog pages.
 */
(function($, window, document) {
  $(function() {
    var $window = $(window);
    var $body = $('body');
    var $nav_menu = $('.navigation-bar');
    var $nav_bar = $('.site-navigation-bar');
    var $nav_menu_link = $('#navMenu ul li a');
    var $toggle_menu_button = $('.navTrigger');

    function normalizePath(path) {
      return path.replace(/^\//, '').replace(/index\.html$/, '');
    }

    var nav_sections = $nav_menu_link.filter(function() {
      return this.hash && $(this.hash).length && normalizePath(location.pathname) == normalizePath(this.pathname);
    }).map(function() {
      return {
        link: this,
        target: $(this.hash)
      };
    }).get();

    function updateCurrentNavItem() {
      if (!nav_sections.length) {
        return;
      }

      var header_offset = $('.site-navigation-bar').outerHeight() || 0;
      var scroll_position = $window.scrollTop() + header_offset + 20;
      var current_link = nav_sections[0].link;

      $.each(nav_sections, function(index, section) {
        if (section.target.offset().top <= scroll_position) {
          current_link = section.link;
        }
      });

      if ($window.scrollTop() + $window.height() >= $(document).height() - 5) {
        current_link = nav_sections[nav_sections.length - 1].link;
      }

      $nav_menu_link.parent().removeClass('current-menu-item');
      $(current_link).parent().addClass('current-menu-item');
    }

    $nav_menu_link.on('click', function() {
      $nav_menu_link.parent().removeClass('current-menu-item');
      $(this).parent().addClass('current-menu-item');

      $nav_menu.removeClass('active');
      $nav_bar.removeClass('menu-open');
      $toggle_menu_button.removeClass('active');
      $body.removeClass('no-scroll');
    });

    $toggle_menu_button.on('click', function() {
      $nav_menu.toggleClass('active');
      $nav_bar.toggleClass('menu-open');
      $body.toggleClass('no-scroll');
      $(this).toggleClass('active');
    });

    $(document).on('keydown', function(event) {
      if (event.key !== 'Escape' && event.key !== 'Esc') {
        return;
      }

      $nav_menu.removeClass('active');
      $nav_bar.removeClass('menu-open');
      $body.removeClass('no-scroll');
      $toggle_menu_button.removeClass('active');
    });

    $window.on('resize', function() {
      $nav_menu.removeClass('active');
      $nav_bar.removeClass('menu-open');
      $body.removeClass('no-scroll');
      $toggle_menu_button.removeClass('active');
    });

    $window.on('scroll', updateCurrentNavItem);
    updateCurrentNavItem();
  });
}(window.jQuery, window, document));
