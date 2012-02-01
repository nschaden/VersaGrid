/*
	VersaGrid
	author: 	nschaden
	web: 		nickschaden.com
	version: 	0.4
 */
(function($) 
{
	$.fn.versaGrid = function(options) 
	{
		// variables
		var defaultOptions = {
			// optional function to be called after versagrid initialization is completely finished
			afterinit: function() {},
			// override base width
			basewidth: null,
			// after versagrid has done its calculations, methods to display data to user
			// valid options are show, none, fadeSlow, fadeFast
			displaymethod: 'show',
			// force inner elements to span width/height of block 
			forcespan: false,
			// override ideal aspect ratio
			idealaspect: null,
			// selector element to determine inner elements within block
			innerelements: '*',
			// position of inner elements within a block (topLeft,topRight,bottomLeft,bottomRight,center)
			positioninner: 'center',
			// also forces base width to be smallest width available to avoid horizontal gaps (only applciable when forcespan is false)
			preventhorizontalgaps: true,
			// increases ideal aspect ratio to prevent any vertical gaps in content
			preventverticalgaps: true,
			// forces the base width to be simply smallest width available (then no item stretches past natural size, only applicable
			// when forcespan is true)
			smallestbasewidth: false,
			// zoom modifier of base width
			zoom: 1
		};
		$.fn.versaGrid.basewidth = 100;
		$.fn.versaGrid.idealaspect = 1;
		$.fn.versaGrid.itemdimensions = [];
		$.fn.versaGrid.options = $.extend({},defaultOptions,options);
		$.fn.versaGrid.previtemsrow = 0;
		$.fn.versaGrid.dimensonscalculated = false;
		// calculate ideal aspect ratio, proper base width
		this.calcWidthRatio = function()
		{
			// gather items
			var grid = this;
	  		var items = grid.children();
	  		if (!items.length) return;
	  		var itemdimensions = [];
	  		var aspectratios = {};
	  		var widths = {};
	  		var totalaspects = 0;
	  		var totalwidths = 0;

	  		// store each item's dimensions
	  		for (var i = 0; i < items.length; i++)
	  		{
	  			var curritem = items.eq(i);
	  			curritem.addClass('versaGridItem');
	  			var w = curritem.outerWidth();
	  			var h = curritem.outerHeight();
	  			// if an item has no calculated width, that implies the item hasn't been loaded yet, so pause, retry init later
	  			if (w < 1)
	  			{
	  				setTimeout(function() { grid.versaGrid(); },200);
	  				return;
	  			}	  					
	  			var a = Math.round((w/h)*10)/10;
	  			itemdimensions.push({width:w,height:h,aspect:a});
	  			// map out aspect ratios
	  			var aspectdata = aspectratios[a];
	  			aspectratios[a] = (typeof aspectdata == 'undefined') ? 1 : aspectdata+1;
	  			totalaspects += a;

	  			// map out widths
	  			var widthdata = widths[w];
	  			widths[w] = (typeof widthdata == 'undefined') ? 1 : widthdata+1;
	  			totalwidths += w;
	  		}
	  		$.fn.versaGrid.dimensonscalculated = true;
	  		var avgaspect = totalaspects/items.length;
	  		var avgwidth = totalwidths/items.length;

	  		// determine ideal aspect ratio, base width
	  		var idealaspect = items[0].aspect;
	  		var basewidth = items[0].width;
	  		if ($.fn.versaGrid.options.idealaspect)
	  			idealaspect = $.fn.versaGrid.options.idealaspect;
	  		if ($.fn.versaGrid.options.basewidth)
	  			basewidth = $.fn.versaGrid.options.basewidth;
	  		for (i = 0; i < 2; i++)
	  		{
	  			var currmap,curravg,ideal;
	  			if (!i && $.fn.versaGrid.options.idealaspect) continue;
	  			if (i && $.fn.versaGrid.options.basewidth) continue;
	  			if (!i)
	  			{
	  				currmap = aspectratios;
	  				curravg = avgaspect;
	  			}
	  			else
	  			{
	  				currmap = widths;
	  				curravg = avgwidth;
	  			}
	  			var closedist = 999999;
	  			ideal = 1;

	  			for (value in currmap)
		  		{
		  			if (i && (($.fn.versaGrid.options.smallestbasewidth && $.fn.versaGrid.options.forcespan) ||
		  					  ($.fn.versaGrid.options.preventhorizontalgaps && !$.fn.versaGrid.options.forcespan)))
		  			{
		  				// for forced smallest base width, just find the smallest value
		  				if (value < closedist)
		  				{
		  					closedist = value;
		  					ideal = value;
		  				}
		  			}
		  			else
		  			{
		  				// if any one aspect ratio is 80% or more of the items, just set it as the ideal
			  			if (currmap[value]/items.length >= 0.8)
			  			{
			  				ideal = value;
			  				break;
			  			}
			  			if (Math.abs(curravg-value) < closedist)
			  			{
			  				closedist = Math.abs(curravg-value);
			  				ideal = value;
			  			}	
		  			}
		  		}

		  		if (!i)
		  			idealaspect = ideal;
		  		else
		  			basewidth = ideal*$.fn.versaGrid.options.zoom;
	  		}
			if (!$.fn.versaGrid.options.forcespan && $.fn.versaGrid.options.preventverticalgaps)
			{
				// take check if current ideal aspect ensures total coverage of height, reduce accordingly to ensure no gaps
				var baseheight = Math.round(basewidth/idealaspect);
				var foundverticalgap = true;
				while (foundverticalgap)
				{
					foundverticalgap = false;
					for (i = 0; i < items.length; i++)
					{
						if (itemdimensions[i].height < baseheight)
						{
							foundverticalgap = true;
							idealaspect = Math.round((parseFloat(idealaspect) + 0.05)*100)/100;
							baseheight = Math.round(basewidth/idealaspect);
							break;
						}
					}	
				}
			}
	  		$.fn.versaGrid.idealaspect = idealaspect;
	  		$.fn.versaGrid.basewidth = basewidth;
	  		$.fn.versaGrid.itemdimensions = itemdimensions;
		};
		// clear modifications on elements from previous versagrid calls
		this.clearExistingGrid = function()
		{
			var items = this.children();
			if (!items.hasClass('versaGridItem')) return;
			var inner = items.find('.versaGridInner');
			items.css({'width':'auto','height':'auto'});
			inner.css({'left':'0','top':'0'}).removeClass('wide').removeClass('tall').removeClass('versaGridInner');	
			$(window).unbind('resize.versaGrid');
		};
		// display versagrid content after resizing and other calculations are finished
		this.display = function()
		{
			var items = this.children();
			if ($.fn.versaGrid.options.displaymethod == 'fadeSlow' || $.fn.versaGrid.options.displaymethod == 'fadeFast')
			{
				var speed = ($.fn.versaGrid.options.displaymethod == 'fadeSlow') ? 800 : 200;
				if (items.css('visibility') == 'hidden')
				{
					items.css({'opacity':0,'visibility':'visible'});
					items.first().fadeTo(speed,1,$.fn.versaGrid.options.afterinit);
					items.not(':first').fadeTo(speed,1);
				}
				else
				{
					items.first().fadeIn(speed,$.fn.versagrid.options.afterinit);
					items.not(':first').fadeIn(speed);
				}
			}
			else if ($.fn.versaGrid.options.displaymethod == 'show')
			{
				if (items.css('visibility') == 'hidden')
					items.css('visibility','visible');
				else
					items.show();
				$.fn.versaGrid.options.afterinit();
			}
			else
				$.fn.versaGrid.options.afterinit();
			
		};
		// position inner elements properly
		this.positionInner = function()
		{
			var items = this.children();
			var idealaspect = $.fn.versaGrid.idealaspect;
			var itemdimensions = $.fn.versaGrid.itemdimensions;
			var containerwidth = this.width();

			for (var i = 0; i < items.length; i++)
	  		{
	  			var curritem = items.eq(i);
	  			var currinner = curritem.find($.fn.versaGrid.options.innerelements);
	  			currinner.addClass('versaGridInner');
	  			if ($.fn.versaGrid.options.positioninner == 'topLeft' || 
	  				$.fn.versaGrid.options.positioninner == 'topRight' || 
	  				$.fn.versaGrid.options.positioninner == 'bottomLeft' || 
	  				$.fn.versaGrid.options.positioninner == 'bottomRight')
	  				currinner.addClass($.fn.versaGrid.options.positioninner);
	  			var widerthanideal = ((itemdimensions[i].width/itemdimensions[i].height) > idealaspect);
	  			var percentageoffset;
	  			if ($.fn.versaGrid.options.forcespan)
	  				curritem.addClass(widerthanideal ? 'wide' : 'tall');
	  			if ($.fn.versaGrid.options.forcespan && $.fn.versaGrid.options.positioninner == 'center')
	  			{
	  				percentageoffset = widerthanideal ? (itemdimensions[i].width/itemdimensions[i].height)/idealaspect : idealaspect/(itemdimensions[i].width/itemdimensions[i].height);
	  				percentageoffset = Math.round((percentageoffset-1)*100)/2;
	  				// for more horizontal items, center horizontally
		  			if (widerthanideal)
		  				currinner.css('left',percentageoffset * -1 + '%');
		  			// vertical items, get their top adjusted
		  			else
		  				currinner.css('top',percentageoffset * -1 + '%');
	  			}
	  		}
		};
		// called on init and when resizing the window, determines proper items per row and column, sets width/height of each accordingly
		this.resizeGrid = function()
		{
			// init core values 
			var items = this.children();
			var idealaspect = $.fn.versaGrid.idealaspect;
			var basewidth = $.fn.versaGrid.basewidth;
			var previtemsrow = $.fn.versaGrid.previtemsrow;

			// determine number items per row, per column based on calced ideals
	  		var items_row = Math.ceil(this.width()/basewidth);
	  		var items_col = Math.ceil(items.length/items_row);
	  		$.fn.versaGrid.previtemsrow = items_row;
	  		
	  		// adjust outer container height
	  		this.height(items_col*(this.width()/items_row/idealaspect));
	  		if (items_row != previtemsrow)
	  		{
	  			// adjust item width, height
	  			items.css(
		  		{
					'width' : 1/items_row*100 + '%',
					'height' : 1/items_col*100 + '%'
			  	});
	  		}

	  		// unfortunately for non spanned item, extra work to center item
	  		if (!$.fn.versaGrid.options.forcespan && $.fn.versaGrid.options.positioninner == 'center')
  			{
  				var inner = items.find($.fn.versaGrid.options.innerelements);
  				var containerwidth = this.width();
  				var itemdimensions = $.fn.versaGrid.itemdimensions;
  				for (var i = 0; i < inner.length; i++)
  				{
  					var currinner = inner.eq(i);
  					percentageleft = itemdimensions[i].width/(containerwidth/items_row);
		  			percentageleft = Math.round((percentageleft-1)*100)/2;
		  			percentagetop = itemdimensions[i].height/((containerwidth/items_row)/idealaspect);
		  			percentagetop = Math.round((percentagetop-1)*100)/2;
		  			currinner.css('left',percentageleft * -1 + '%');
		  			currinner.css('top',percentagetop * -1 + '%');
  				}
  			}
		};

		// constructor begin
		var grid = this;
		grid.addClass('versaGridContainer');
		grid.clearExistingGrid();
		grid.calcWidthRatio();
		if ($.fn.versaGrid.dimensonscalculated)
		{
	  		$(window).bind('resize.versaGrid',function() { grid.resizeGrid(); });
	  		grid.resizeGrid();
	  		grid.positionInner();
	  		grid.display();
	  	}
	  	// constructor end
	};
})(jQuery);