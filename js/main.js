
/**
 *
 *  Main JavaScript
 *
 *  @package gleesik_scripts
 *
 **/

 // IIFE - Immediately Invoked Function Expression
(function($, window, document) {

  // The $ is now locally scoped

  // Listen for the jQuery ready event on the document
  $(function() {

    // The DOM is ready!

    // Global Variables
    var $window = $(window);

    /**
     *  Page Loader
     **/
    $('.page-loader').addClass('load-complete');

    /**
     *  Scroll Event
     **/
    $window.scroll(function() {

      // Scroll Variables
      var $scrollTop = $window.scrollTop();

      /**
       *  Go to Top Button
       **/
      var $go_top = $('.go-to-top-button');

      if ( $scrollTop > 600 ) {
        $go_top.addClass('active');
      } else {
        $go_top.removeClass('active');
      }

    });

    /**
     *  Header Carousel Setup
     **/
    var $headerCarousel = $("#header-carousel");

    if ($headerCarousel.length) {
      $headerCarousel.owlCarousel({

          navigation : false,
          slideSpeed : 600,
          paginationSpeed : 600,
          autoPlay: 5000,
          stopOnHover: false,
          singleItem: true,
          pagination: true,
          mouseDrag: false,
          touchDrag: false

      });
    }

    /**
     *  Testimonials Carousel Setup
     **/
    var $testimonialsCarousel = $("#testimonials-carousel");

    $testimonialsCarousel.owlCarousel({

        navigation : false,
        slideSpeed : 300,
        paginationSpeed : 400,
        autoPlay: 6000,
        stopOnHover: true,
        singleItem: true

    });

    window.bindHorizontalStepNavigation($testimonialsCarousel[0], {
      onNext: function() {
        $testimonialsCarousel.trigger('owl.next');
      },
      onPrev: function() {
        $testimonialsCarousel.trigger('owl.prev');
      }
    });

    /**
     *  Smooth Scrolling for Links
     **/
    $('a[href*="#"]:not([href="#"])').on('click', function() {
      if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
       var target = $(this.hash);
       target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
       if (target.length) {
        $('html, body').scrollTop(target.offset().top);
        return false;
       }
      }
    });

  });

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
