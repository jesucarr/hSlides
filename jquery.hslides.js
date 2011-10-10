/*
* hSlides (1.0) // 2008.02.25 // <http://www.frontendmatters.com/projects/jquery-plugins/hslides/>
* 
* REQUIRES jQuery 1.2.3+ <http://jquery.com/>
* 
* Copyright (c) 2008 TrafficBroker <http://www.trafficbroker.co.uk>
* Licensed under GPL and MIT licenses
* 
* hSlides is an horizontal accordion navigation, sliding the panels around to reveal one of interest. It's very flexible on how to move the panels.
*
* Sample Configuration:
* // this is the minimum configuration needed
* $('#accordion').hSlides({
* 	totalWidth: 730, 
* 	totalHeight: 140, 
* 	minPanelWidth: 87, 
* 	maxPanelWidth: 425
* });
* 
* Config Options:
* // Required configuration
* totalWidth: Total width of the accordion // default: 0
* totalHeight: Total height of the accordion // default: 0
* minPanelWidth: Minimum width of the panel (closed) // default: 0
* maxPanelWidth: Maximum width of the panel (opened) // default: 0
* // Optional configuration
* midPanelWidth: Middle width of the panel (centered) // default: 0
* speed: Speed for the animation // default: 500
* easing: Easing effect for the animation. Other than 'swing' or 'linear' must be provided by plugin // default: 'swing'
* sensitivity: Sensitivity threshold (must be 1 or higher) // default: 3
* interval: Milliseconds for onMouseOver polling interval // default: 100
* timeout: Milliseconds delay before onMouseOut // default: 300
* eventHandler: Event to open panels: click or hover. For the hover option requires hoverIntent plugin <http://cherne.net/brian/resources/jquery.hoverIntent.html> // default: 'click'
* panelSelector: HTML element storing the panels // default: 'li'
* activeClass: CSS class for the active panel // default: none
* panelPositioning: Accordion panelPositioning: top -> first panel on the bottom and next on the top, other value -> first panel on the top and next to the bottom // default: 'top'
* // Callback funtctions. Inside them, we can refer the panel with $(this).
* onEnter: Funtion raised when the panel is activated. // default: none
* onLeave: Funtion raised when the panel is deactivated. // default: none
* 
* We can override the defaults with:
* $.fn.hSlides.defaults.easing = 'easeOutCubic';
* 
* @param  settings  An object with configuration options
* @author    Jesus Carrera <jesus.carrera@frontendmatters.com>
*/
(function($) {
$.fn.hSlides = function(settings) {
	// override default configuration
	settings = $.extend({}, $.fn.hSlides.defaults, settings);
	// for each accordion
  return this.each(function(){
		var wrapper = this;
		var panelLeft = 0;
		var panels = $(settings.panelSelector, wrapper);
		var panelPositioning = 1;
		if (settings.panelPositioning != 'top'){
			panelLeft = ($(settings.panelSelector, wrapper).length - 1) * settings.minPanelWidth;
			panels = $(settings.panelSelector, wrapper).reverse();
			panelPositioning = -1;
		}
		// necessary styles for the wrapper
		$(this).css('position', 'relative').css('overflow', 'hidden').css('width', settings.totalWidth).css('height', settings.totalHeight);
		// set the initial position of the panels
		var zIndex = 0;
		panels.each(function(){
			// necessary styles for the panels
			$(this).css('position', 'absolute').css('left', panelLeft).css('zIndex', zIndex).css('height', settings.totalHeight).css('width', settings.maxPanelWidth);
			zIndex ++;
			// if this panel is the activated by default, set it as active and move the next (to show this one)
			if ($(this).hasClass(settings.activeClass)){
				$.data($(this)[0], 'active', true);
				if (settings.panelPositioning != 'top'){
					panelLeft = ($(settings.panelSelector, wrapper).index(this) + 1) * settings.minPanelWidth - settings.maxPanelWidth;
				}else{
					panelLeft = panelLeft + settings.maxPanelWidth;
				}
			}else{
				// check if we are centering and some panel is active
				// this is why we can't add/remove the active class in the callbacks: positioning the panels if we have one active
				if (settings.midPanelWidth && $(settings.panelSelector, wrapper).hasClass(settings.activeClass) == false){
					panelLeft = panelLeft + settings.midPanelWidth * panelPositioning;
				}else{
					panelLeft = panelLeft + settings.minPanelWidth * panelPositioning;
				}
			}
		});
		// iterates through the panels setting the active and changing the position
		var movePanels = function(){
			// index of the new active panel
			var activeIndex = $(settings.panelSelector, wrapper).index(this);
			// iterate all panels
			panels.each(function(){
				// deactivate if is the active
				if ( $.data($(this)[0], 'active') == true ){
					$.data($(this)[0], 'active', false);
					$(this).removeClass(settings.activeClass).each(settings.onLeave);
				}
				// set position of current panel
				var currentIndex = $(settings.panelSelector, wrapper).index(this);
				panelLeft = settings.minPanelWidth * currentIndex;
				// if the panel is next to the active, we need to add the opened width 
				if ( (currentIndex * panelPositioning) > (activeIndex * panelPositioning)){
					 panelLeft = panelLeft + (settings.maxPanelWidth - settings.minPanelWidth) * panelPositioning;
				}
				// animate
				$(this).animate({left: panelLeft}, settings.speed, settings.easing);
			});
			// activate the new active panel
			$.data($(this)[0], 'active', true);
			$(this).addClass(settings.activeClass).each(settings.onEnter);
		};
		// center the panels if configured
		var centerPanels = function(){
			var panelLeft = 0;
			if (settings.panelPositioning != 'top'){
				panelLeft = ($(settings.panelSelector, wrapper).length - 1) * settings.minPanelWidth;
			}
			panels.each(function(){
				$(this).removeClass(settings.activeClass).animate({left: panelLeft}, settings.speed, settings.easing);
				if ($.data($(this)[0], 'active') == true){
					$.data($(this)[0], 'active', false);
					$(this).each(settings.onLeave);
				}
				panelLeft = panelLeft + settings.midPanelWidth * panelPositioning ;
			});
		};
		// event handling
		if(settings.eventHandler == 'click'){
			$(settings.panelSelector, wrapper).click(movePanels);
		}else{
			var configHoverPanel = {
				sensitivity: settings.sensitivity,
				interval: settings.interval,
				over: movePanels,
				timeout: settings.timeout,
				out: function() {}
			}
			var configHoverWrapper = {
				sensitivity: settings.sensitivity,
				interval: settings.interval,
				over: function() {},
				timeout: settings.timeout,
				out: centerPanels
			}
			$(settings.panelSelector, wrapper).hoverIntent(configHoverPanel);
			if (settings.midPanelWidth != 0){
				$(wrapper).hoverIntent(configHoverWrapper);
			}
		}
	});
};
// invert the order of the jQuery elements
$.fn.reverse = function(){
	return this.pushStack(this.get().reverse(), arguments);
};
// default settings
$.fn.hSlides.defaults = {
	totalWidth: 0, 
	totalHeight: 0,
	minPanelWidth: 0,
	maxPanelWidth: 0,
	midPanelWidth: 0,
	speed: 500,
	easing: 'swing',
	sensitivity: 3,
	interval: 100,
	timeout: 300,
	eventHandler: 'click',
	panelSelector: 'li',
	activeClass: false,
	panelPositioning: 'top',
	onEnter: function() {},
	onLeave: function() {}
};
})(jQuery);