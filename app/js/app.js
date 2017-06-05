var YOURAPPNAME = (function () {

    function YOURAPPNAME(doc) {
        var _self = this;

        _self.doc = doc;
        _self.window = window;
        _self.html = _self.doc.querySelector('html');
        _self.body = _self.doc.body;
        _self.location = location;
        _self.hash = location.hash;
        _self.Object = Object;
        _self.scrollWidth = 0;

        _self.bootstrap();
    }

    YOURAPPNAME.prototype.bootstrap = function () {
        var _self = this;

        // Initialize window scollBar width
        _self.scrollWidth = _self.scrollBarWidth();
    };

    // Window load types (loading, dom, full)
    YOURAPPNAME.prototype.appLoad = function (type, callback) {
        var _self = this;

        switch (type) {
            case 'loading':
                if (_self.doc.readyState === 'loading') callback();

                break;
            case 'dom':
                _self.doc.onreadystatechange = function () {
                    if (_self.doc.readyState === 'complete') callback();
                };

                break;
            case 'full':
                _self.window.onload = function (e) {
                    callback(e);
                };

                break;
            default:
                callback();
        }
    };

    // Detect scroll default scrollBar width (return a number)
    YOURAPPNAME.prototype.scrollBarWidth = function () {
        var _self = this,
            outer = _self.doc.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar";

        _self.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;

        outer.style.overflow = "scroll";

        var inner = _self.doc.createElement("div");

        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    };

    YOURAPPNAME.prototype.initSwitcher = function () {
        var _self = this;

        var switchers = _self.doc.querySelectorAll('[data-switcher]');

        if (switchers && switchers.length > 0) {
            for (var i = 0; i < switchers.length; i++) {
                var switcher = switchers[i],
                    switcherOptions = _self.options(switcher.dataset.switcher),
                    switcherElems = switcher.children,
                    switcherTargets = _self.doc.querySelector('[data-switcher-target="' + switcherOptions.target + '"]').children,
                    switchersActive = [];

                for (var y = 0; y < switcherElems.length; y++) {
                    var switcherElem = switcherElems[y],
                        parentNode = switcher.children,
                        switcherTrigger = (switcherElem.children.length) ? switcherElem.children[0] : switcherElem,
                        switcherTarget = switcherTargets[y];


                    if (switcherElem.classList.contains('active')) {
                        for (var z = 0; z < parentNode.length; z++) {
                            parentNode[z].classList.remove('active');
                            switcherTargets[z].classList.remove('active');
                        }
                        switcherElem.classList.add('active');
                        switcherTarget.classList.add('active');
                    } else switchersActive.push(0);

                    switcherTrigger.addEventListener('click', function (elem, target, parent, targets) {
                        return function (e) {

                            e.preventDefault();
                            if (!elem.classList.contains('active')) {
                                for (var z = 0; z < parentNode.length; z++) {
                                    parent[z].classList.remove('active');
                                    targets[z].classList.remove('active');
                                }
                                elem.classList.add('active');
                                target.classList.add('active');
                            }
                        };

                    }(switcherElem, switcherTarget, parentNode, switcherTargets));
                }

                if(switchersActive.length == switcherElems.length) {
                    switcherElems[0].classList.add('active');
                    switcherTargets[0].classList.add('active');
                }
            }
        }
    };

    YOURAPPNAME.prototype.str2json = function (str, notevil) {
        try {
            if (notevil) {
                return JSON.parse(str
                    .replace(/([\$\w]+)\s*:/g, function (_, $1) {
                        return '"' + $1 + '":';
                    })
                    .replace(/'([^']+)'/g, function (_, $1) {
                        return '"' + $1 + '"';
                    })
                );
            } else {
                return (new Function("", "var json = " + str + "; return JSON.parse(JSON.stringify(json));"))();
            }
        } catch (e) {
            return false;
        }
    };

    YOURAPPNAME.prototype.options = function (string) {
        var _self = this;

        if (typeof string != 'string') return string;

        if (string.indexOf(':') != -1 && string.trim().substr(-1) != '}') {
            string = '{' + string + '}';
        }

        var start = (string ? string.indexOf("{") : -1), options = {};

        if (start != -1) {
            try {
                options = _self.str2json(string.substr(start));
            } catch (e) {
            }
        }

        return options;
    };

    YOURAPPNAME.prototype.popups = function (options) {
        var _self = this;

        var defaults = {
            reachElementClass: '.js-popup',
            closePopupClass: '.js-close-popup',
            currentElementClass: '.js-open-popup',
            changePopupClass: '.js-change-popup'
        };

        options = $.extend({}, options, defaults);

        var plugin = {
            reachPopups: $(options.reachElementClass),
            bodyEl: $('body'),
            topPanelEl: $('.top-panel-wrapper'),
            htmlEl: $('html'),
            closePopupEl: $(options.closePopupClass),
            openPopupEl: $(options.currentElementClass),
            changePopupEl: $(options.changePopupClass),
            bodyPos: 0
        };

        plugin.openPopup = function (popupName) {
            plugin.closePopup($('.js-popup.opened').attr('data-popup'));
            var popup = plugin.reachPopups.filter('[data-popup="' + popupName + '"]');
            popup.addClass('opened');
            if (!popup.hasClass('js-small-popup')) {
                plugin.bodyEl.css('overflow-y', 'scroll');
                // plugin.topPanelEl.css('padding-right', scrollSettings.width);
                plugin.htmlEl.addClass('popup-opened');
            }
        };

        plugin.closePopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').removeClass('opened');
            // setTimeout(function () {
                plugin.bodyEl.removeAttr('style');
                plugin.htmlEl.removeClass('popup-opened');
                plugin.topPanelEl.removeAttr('style');
            // }, 500);
        };

        plugin.changePopup = function (closingPopup, openingPopup) {
            plugin.reachPopups.filter('[data-popup="' + closingPopup + '"]').removeClass('opened');
            plugin.reachPopups.filter('[data-popup="' + openingPopup + '"]').addClass('opened');
        };

        plugin.init = function () {
            plugin.bindings();
        };

        plugin.bindings = function () {
            plugin.openPopupEl.on('click', function (e) {
                e.preventDefault();
                var pop = $(this).attr('data-open-popup');
                var popup = plugin.reachPopups.filter('[data-popup="' + pop + '"]');
                if(popup.hasClass('opened'))
                    plugin.closePopup(pop);
                else
                    plugin.openPopup(pop);
            });

            plugin.closePopupEl.on('click', function (e) {
                e.preventDefault();
                var pop;
                if (this.hasAttribute('data-close-popup')) {
                    pop = $(this).attr('data-close-popup');
                } else {
                    pop = $(this).closest(options.reachElementClass).attr('data-popup');
                }

                plugin.closePopup(pop);
            });

            plugin.changePopupEl.on('click', function (e) {
                e.preventDefault();
                var closingPop = $(this).attr('data-closing-popup');
                var openingPop = $(this).attr('data-opening-popup');

                plugin.changePopup(closingPop, openingPop);
            });

            plugin.reachPopups.on('click', function (e) {
                var target = $(e.target);
                var className = options.reachElementClass.replace('.', '');
                if (target.hasClass(className)) {
                    plugin.closePopup($(e.target).attr('data-popup'));
                    e.preventDefault();
                }
            });

            $(document).click(function (e) {
                var target = $(e.target);
                if (
                    !target.hasClass('js-popup')
                    && !target.closest('.js-popup').length > 0
                    && !target.hasClass('js-open-popup')
                    && !target.closest('.js-open-popup').length > 0
                ) {
                    plugin.closePopup($('.js-popup.opened').attr('data-popup'));
                }
            });
        };

        if (options)
            plugin.init();

        return plugin;
    };

    YOURAPPNAME.prototype.checkSelect = function (select) {
        if (select.hasClass('js-select-education')) {
            var str = select.find('option:selected').text();
            if (str !== '') {
                select.closest('.filter__section').find('.filter__inputs').append(
                    '<span class="filter-input__item">' + str +
                    '<input type="checkbox" checked="checked" class="hidden" name="education[' + str + ']" id="education" value="1" />' +
                    '<i class="fri_filter-remove-input"></i>' +
                    '</span>'
                );
            }
        }
    }

    return YOURAPPNAME;

})();

var app = new YOURAPPNAME(document);

app.appLoad('loading', function () {
    (function ($) {
        $(function () {
            $('input, select').styler();
        });
    })(jQuery);


});

app.appLoad('dom', function () {
    app.initSwitcher(); // data-switcher="{target: 'anything'}" , data-switcher-target="anything"

    $('.js-destroy-form-styler').styler('destroy');

});

app.appLoad('full', function (e) {

    $('.main-content__banner').owlCarousel({
        items: 1,
        loop: true,
        dots: 0,
        autoplay: true,
        animateOut: 'fadeOut',
        mouseDrag: false
    });

    $('.auth-slider').owlCarousel({
        items: 1,
        loop: true,
        dots: 1,
        nav: true,
        autoplay: 5,
        responsive: {
            0: {
                nav: false
            },
            768: {
                nav: true
            }
        }
    });

    var autoCompleteInput = $('.js-autocomplete-input');

    if (autoCompleteInput.length > 0) {
        autoCompleteInput.each(function () {
            var url = $(this).attr("data-source");

            var $this = $(this);

            $.ajax({
                url: url,
                dataType: "json",
                success: function (data) {
                    $this.autocomplete({
                        source: data,
                        minLength: 1,
                        select: function (event, ui) {
                            $(this).closest('.filter__section').find('.filter__inputs').append(
                                '<span class="filter-input__item">' + ui.item.label +
                                '<input type="checkbox" checked="checked" class="hidden" name="[' + ui.item.label + ']" value="1" />' +
                                '<i class="fri_filter-remove-input"></i>' +
                                '</span>'
                            );
                            $(this).val('');
                            return false;
                        }
                    });
                }
            });

        });
        $(document).on('click', '.filter-input__item .fri_filter-remove-input', function (e) {
            e.preventDefault();
            $(this).closest('.filter-input__item').remove();
        });
    }

    $(document).on('click', '.js-add-filter-select-currency', function (e) {
        e.preventDefault();
        $(this).closest('.filter__section').after(
            '<div class="filter__section mb15">'+
                '<div class="filter__line filter__line_justify-start mb7">'+
                    '<input class="filter__input filter__input_salary text-italic mr5" type="text" placeholder="100.000">'+
                    '<span class="mr5 text-dark-dull-gray">-</span>'+
                    '<input class="filter__input filter__input_salary text-italic" type="text" placeholder="150.000">'+
                '</div>'+
                '<div class="filter__line filter__line_currency filter__line_justify-start">'+
                    '<select class="filter__select-currency text-dull-gray text-italic select select__search">'+
                        '<option>KZT</option>'+
                        '<option>USD</option>'+
                    '</select>'+
                    '<i class="fri_filter-remove-input"></i>'+
                '</div>'+
            '</div>'
        );
        $('.filter select:not(.jq-selectbox)').styler();
        $(document).on('click', '.filter__line_currency .fri_filter-remove-input', function (e) {
            e.preventDefault();
            $(this).closest('.filter__section').remove();
        });
    });
    app.popups();

    $(".js-open-statistic-tables").click(function () {

        var tables = $(this).closest(".statistic__vacancy-grid").next(".statistic-tables");

        if (tables.hasClass("js-hidden")){
            tables.removeClass("js-hidden").slideDown(400);
            $(this).text("Скрыть данные")
        } else {
            tables.addClass("js-hidden").slideUp(400);
            $(this).text("Показать данные")
        }

    })

    $(".js-history-open").click(function () {
        var historyList = $(this).closest(".statistic__report-grid").next(".statistic__report-history-list");

        if (historyList.hasClass("js-hidden")){
            historyList.removeClass("js-hidden").slideDown(250);
        } else {
            historyList.addClass("js-hidden").slideUp(250);
        }
    })

    var wrapper = $( ".file-upload" ),
        inp = wrapper.find( "input" ),
        lbl = wrapper.find( ".js-file-upload__label" );
    var file_api = ( window.File && window.FileReader && window.FileList && window.Blob ) ? true : false;

    inp.change(function(){
        var file_name;
        if( file_api && inp[ 0 ].files[ 0 ] )
            file_name = inp[ 0 ].files[ 0 ].name;
        else
            file_name = inp.val().replace( "C:\\fakepath\\", '' );

        if( ! file_name.length )
            return;

        if( lbl.is( ":visible" ) ){
            lbl.text( file_name );
        }
    }).change();

    $('.js-open-hint-small').focus(function () {
        $('.js-hint-small').addClass('active');
    });

    $('.js-open-hint-small').focusout(function () {
        $('.js-hint-small').removeClass('active');
    });

    function hideHint () {
        $('.js-hint').removeClass('active');
    };

    function showHint () {
        $('.js-hint').addClass('active');
    };

    $('.js-open-hint').hover(
        function () {
            setTimeout(showHint, 500);
        },
        function () {
            setTimeout(hideHint, 1000);
        }
    );

    $('.js-add-employer-vacancy').click(function () {
        var newBlock = $(document).find('.js-employer-vacancy:eq(0)').clone().appendTo(".js-vacancy-form-wrapper"),
            lastBlock = $(document).find('.js-employer-vacancy').last();
        lastBlock.find('.jq-selectbox__select, .jq-selectbox__select-text, .jq-selectbox__dropdown').remove();
        lastBlock.find('.jq-selectbox > .select').unwrap();
        lastBlock.find('.select').styler();
    });

    $('.js-add-vocational-education').click(function () {
        var newBlock = $(document).find('.js-vocational-education:eq(0)').clone().appendTo(".js-vocational-education-wrapper"),
            lastBlock = $(document).find('.js-vocational-education').last();
        lastBlock.find('.jq-selectbox__select, .jq-selectbox__select-text, .jq-selectbox__dropdown').remove();
        lastBlock.find('.jq-selectbox > .select').unwrap();
        lastBlock.find('.select').styler();
    });

    $('.js-add-higher-education').click(function () {
        var newBlock = $(document).find('.js-higher-education:eq(0)').clone().appendTo(".js-higher-education-wrapper"),
            lastBlock = $(document).find('.js-higher-education').last();
        lastBlock.find('.jq-selectbox__select, .jq-selectbox__select-text, .jq-selectbox__dropdown').remove();
        lastBlock.find('.jq-selectbox > .select').unwrap();
        lastBlock.find('.select').styler();
    });

    $('.js-add-additional-education').click(function () {
        var newBlock = $(document).find('.js-higher-education:eq(0)').clone().appendTo(".js-additional-education-wrapper"),
            lastBlock = $(document).find('.js-higher-education').last();
        lastBlock.find('.jq-selectbox__select, .jq-selectbox__select-text, .jq-selectbox__dropdown').remove();
        lastBlock.find('.jq-selectbox > .select').unwrap();
        lastBlock.find('.select').styler();
    });

    $('.js-add-cabinet-applicant-experience').click(function () {
        var newBlock = $(document).find('.js-cabinet-applicant-experience:eq(0)').clone().appendTo(".js-cabinet-applicant-experience-wrapper"),
            lastBlock = $(document).find('.js-cabinet-applicant-experience').last();
        lastBlock.find('.jq-selectbox__select, .jq-selectbox__select-text, .jq-selectbox__dropdown').remove();
        lastBlock.find('.jq-selectbox > .select').unwrap();
        lastBlock.find('.select').styler();
    });

    $('.js-add-cabinet-applicant-portfolio').click(function () {
        var newBlock = $(document).find('.js-cabinet-applicant-portfolio:eq(0)').clone().appendTo(".js-cabinet-applicant-portfolio-wrapper"),
            lastBlock = $(document).find('.js-cabinet-applicant-portfolio').last();
        lastBlock.find('.jq-selectbox__select, .jq-selectbox__select-text, .jq-selectbox__dropdown').remove();
        lastBlock.find('.jq-selectbox > .select').unwrap();
        lastBlock.find('.select').styler();
    });

    $('.js-add-applicant-language').click(function () {
        var newBlock = $(document).find('.js-applicant-language:eq(0)').clone().appendTo(".js-applicant-language-wrapper"),
            lastBlock = $(document).find('.js-applicant-language').last();
        lastBlock.find('.jq-selectbox__select, .jq-selectbox__select-text, .jq-selectbox__dropdown').remove();
        lastBlock.find('.jq-selectbox > .select').unwrap();
        lastBlock.find('.select').styler();
    });

    $('.js-add-computer-skills').click(function () {
        var newBlock = $(document).find('.js-computer-skills:eq(0)').clone().appendTo(".js-computer-skills-wrapper"),
            lastBlock = $(document).find('.js-computer-skills').last();
        lastBlock.find('.jq-selectbox__select, .jq-selectbox__select-text, .jq-selectbox__dropdown').remove();
        lastBlock.find('.jq-selectbox > .select').unwrap();
        lastBlock.find('.select').styler();
    });

});
