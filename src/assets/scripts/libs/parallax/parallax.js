var paralax = function (){
    $('.js-parallax-item').each(function(){

        var img = $(this);
        var px = img.css('transform') === 'none' ? 0 : (img.css('transform').match(/-?[\d\.]+/g)[5]/ img.height()) * 100;
        var px2 = img.css('transform') === 'none' ? 0 : (img.css('transform').match(/-?[\d\.]+/g)[4]/ img.width()) * 100;
        img.data("transform",px);
        img.data("transformX",px2);


        var marginImg = $(document).height()/10;
        var imgParent = img.parent();
        function parallaxImg () {
            var speed = img.data('speed');
            var imgY = imgParent.offset().top;
            var winY = $(window).scrollTop();
            var winH = $(window).height();

            // var parentH = winH;
            var parentH = imgParent.innerHeight();
            // The next pixel to show on screen
            var winBottom = winY + winH;
            // If block is shown on screen
            var imgPercent = 0;
            var visb = 'hidden';
            if (winBottom > imgY - marginImg && winY < imgY + parentH + marginImg) {
                // Porcentage between start showing until disappearing
                imgPercent = ((imgY + (parentH / 2)) - ((winH / 2) + winY)) / ((winH / 2) / speed) * 30;
                visb = 'visible';
            }
           img.css({
                transform: 'translate( ' + 1*( img.data('transformX')) + '%,' + 1*(imgPercent + img.data('transform')) + '%)',
                visibility: visb
            });
        }

        $(document).on({
            scroll: function () {
                parallaxImg();
            },
            read: function () {
                parallaxImg();
            }
        });
        $(window).resize(function () {
            marginImg = $(window).height()/10;
        });
        parallaxImg();
    });
};