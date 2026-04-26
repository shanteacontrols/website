(function ($) {
	"use strict";
	
$('.related-post-list').on('click', '.single-item[data-href]', function(event) {
  if ($(event.target).closest('a').length) return;
  window.location.href = $(this).data('href');
});

$('.related-post-list').on('keydown', '.single-item[data-href]', function(event) {
  if (event.key === 'Enter') {
    window.location.href = $(this).data('href');
  }
});

/* Post-carousel */
$('.related-post-carousel').owlCarousel({
	dots:false,
	nav:false,
	margin:30,
	autoplay:true,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:2
        },
        1000:{
            items:3
        }
    }
});	


  new WOW().init();


}(jQuery));
