import $ from "jquery";
import 'slick-carousel'
import range_slider from './range-slider'

$(document).ready(function(){


    //////// HEADER
    $(document).on('click', '#menu-catalog .btn-catalog', function(){
        const $ct = $('#menu-catalog .catalog');
        $ct.toggleClass('hidden')
        $('body').toggleClass('overflow-hidden')
        setTimeout(function(){
            if ($ct.hasClass('opacity-0')){
                $ct.removeClass('opacity-0')
                $ct.addClass('opacity-100')
            }else{
                $ct.removeClass('opacity-100')
                $ct.addClass('opacity-0')

                $('#menu-catalog .list li').each(function(){$(this).removeClass('active')});
                $('#menu-catalog .list li a').each(function(){$(this).removeClass('clicked')});
                $('#menu-catalog .products .overflow-hidden').remove()
                $('#menu-catalog .products .main').removeClass('hidden');
            }
        },1)
    })
    $(document).on('click', '#menu-catalog .list .drop-list > a', function(e){
        if (!$(this).hasClass('clicked')){
            e.preventDefault();
            const $this = $(this);
            $('#menu-catalog .list li').each(function(){
                if ($this.parent('li').parents('li')[0] !== $(this)[0]){
                    $(this).removeClass('active')
                    $(this).children('a').removeClass('clicked')
                }
            });
            const pr = $(this)
                .addClass('clicked')
                .parent('li')
                .addClass('active')
                .children('.list-product')
                .html();

            $('#menu-catalog .products .overflow-hidden').remove()
            if (pr && pr.length){
                $('#menu-catalog .products .main')
                    .addClass('hidden')
                    .after(pr);
            }else{
                $('#menu-catalog .products .main').removeClass('hidden');
            }
        }
    })


    /////// MOBILE CATALOG MENU
    $(document).on('click', '#mobile-bottom-bar button', function(e){
        $('body').toggleClass($(this).attr('data-id'))
    })
    $(document).on('click', '#mobile-menu .close', function(e){
        $('body').removeClass('mobile-menu-active')
        $('#mobile-menu nav .sub').each(function(){$(this).removeClass('active')});
    })
    $(document).on('click', '#mobile-menu nav ul li > button', function(e){
        $(this).next('.sub').addClass('active')
    })
    $(document).on('click', '#mobile-menu nav .sub > button', function(e){
        $(this).parent('.sub').removeClass('active')
    })


    //////// HOME Page
    $('.intro .slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        dots: true,
    });

    $('.products-slider .slider').each(function(){
        const $this = $(this);
        const show = 4;
        $this.slick({
            infinite: false,
            autoplay: true,
            autoplaySpeed: 4000,
            slidesToShow: show,
            slidesToScroll: 1,
            prevArrow: $this.parents('.products-slider').find('.navs .prev'),
            nextArrow: $this.parents('.products-slider').find('.navs .next'),
            dots: true,
            dotsClass: 'd-none',
            customPaging: function (slider, i) {
                $this.parents('.products-slider').find('.navs .all').html(slider.slideCount - show + 1);
            },
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2,
                    }
                },
            ]
        }).on('afterChange', function(event, slick, currentSlide) {
            $this.parents('.products-slider').find('.navs .current').html(currentSlide+1);
        });
    })

    $('.blog-slider .slider').each(function(){
        const $this = $(this);
        $this.slick({
            infinite: false,
            slidesToShow: 3,
            slidesToScroll: 1,
            prevArrow: $this.parents('.blog-slider').find('.navs .prev'),
            nextArrow: $this.parents('.blog-slider').find('.navs .next'),

            dots: true,
            dotsClass: 'd-none',
            customPaging: function (slider, i) {
                $this.parents('.blog-slider').find('.navs .all').html(slider.slideCount-3+1);
            },
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 1,
                    }
                },
            ]
        }).on('afterChange', function(event, slick, currentSlide) {
            $this.parents('.blog-slider').find('.navs .current').html(currentSlide+1);
        });
    })

    $('.products-desktop-vertical-slider .slider').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        prevArrow: $('.products-desktop-vertical-slider').find('.navs .prev'),
        nextArrow: $('.products-desktop-vertical-slider').find('.navs .next'),
        dots: false,
        autoplay: true,
        autoplaySpeed: 4000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    infinite: false,
                    vertical: false,
                    verticalSwiping: false,
                    autoplay: false,
                    slidesToShow: 1,
                }
            },
        ]
    });


    //////// PRODUCT-LIST Page
    $(document).on('click', '#products-sort-dropdown button', function(){
        $(this).parent('#products-sort-dropdown').toggleClass('active');
    })
    $(document).on('click', '#filters .filters-header button', function(){
        if ($(this).hasClass('open'))
            $(this).parents('#filters').addClass('active');
        else
            $(this).parents('#filters').removeClass('active');

        if ($('body').hasClass('filters-active'))
            $('body').removeClass('filters-active');
    })
    $(document).on('click', '#filters .filters-main .block .top', function(){
        $(this).parent('.block').toggleClass('opened');
    })

    if ($('.price_slider_main').length) {
        const ps_min = Number($('#price_slider .min').html().replaceAll(' ', ''));
        const ps_max = Number($('#price_slider .max').html().replaceAll(' ', ''))
        new range_slider(
            {
                selector : '.price_slider_main',
                uni  : '"',
                min  : ps_min,
                max  : ps_max,
                left_scrubber_pos : ps_min,
                right_scrubber_pos : ps_max,
                round_by : 1000,
                rounded : true,
                thousand_separator : ' ',

                // // Event during initialization
                // release : function(e)
                // {
                //   // custom function for this event
                //   console.log("Event happened, this object contains: \n\n { \n min : "+ e.min + ",\nmax : " + e.max + "\n}");
                // }
            });
    }

    $(document).on('click', '.filters-open-in-mobile', function(e){
        $('body').addClass('filters-active');
    })
    $(document).on('click', '.filters-close-in-mobile', function(e){
        $('body').removeClass('filters-active');
    })


    ///////// ACCOUNT Page
    $(document).on('click', '.tab-item .tab-content .order-history-item > button', function(){
        $(this).parent('.order-history-item').toggleClass('active');
    })


    // PRODUCT Page
    if ($('.product-image-scroll-height').length && $(window).width() >= 1024)
        $('.product-image-scroll').height($('.product-image-scroll-height').height() + ($('.product-image-scroll-height').height() * 0.042));

})



/////// Imitations
$(document).on('click', '.this-is-class-name-for-search-result-imitation', function(){
    $('body').toggleClass('search-active');
})


////// Modal
$(document).on('click', '.modal-open', function(e){
    e.preventDefault();
    const id = $(this).attr('href') ?? $(this).attr('data-id');
    $(id).addClass('active');
    $('body').addClass('overflow-hidden');
})
$(document).on('click', '.modal .shape, .modal .close', function(){
    $(this).parents('.modal').removeClass('active');
    $('body').removeClass('overflow-hidden');
})


////// Global click canceled
$(document).on('click', function(e){
    const el = '#products-sort-dropdown'
    if ($(el).hasClass('active') &&
        $(e.target).parents(el)[0] !== $(el)[0])
        $(el).removeClass('active')
})


////// INPUT File
$('.input-file input[type=file]').on('change', function(element) {
    let text = ''
    if (element.currentTarget.files.length){
        for (let i = 0; i < element.currentTarget.files.length; i++) {
            text += (i !== 0 ? '<br>' : '') + (i+1 + ' - ') + element.currentTarget.files[i].name
        }
        $(this).siblings('.names').removeClass('hidden');
        $(this).siblings('.default').addClass('hidden');
    }else{
        $(this).siblings('.names').addClass('hidden');
        $(this).siblings('.default').removeClass('hidden');
    }
    $(this).prev('.names').html(text)
})


////// ACCORDION
$(document).on('click', '.tab-item .tab-nav', function(){
    $(this).parent('.tab-item').toggleClass('active');
    if ($('.product-image-scroll-height').length && $(window).width() > 1024)
        setTimeout(function(){
            $('.product-image-scroll').height($('.product-image-scroll-height').height());
        },300)
})


////// PRODUCTS SLIDER BOTTOM
$('.footer-products-slider').slick({
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    // arrows: false,
    dots: false,
    autoplay: true,
    autoplaySpeed: 4000,
    prevArrow: $('.footer-products-slider-navs .prev'),
    nextArrow: $('.footer-products-slider-navs .next'),
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                autoplay: false,
            }
        },
    ]
});