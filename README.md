# VersaGrid

A versatile, dynamic grid layout plugin for jQuery with a focus on cohesion and uniformity.

Version: 0.2 (alpha)
Original Author: Nick Schaden
http://nickschaden.com

## Introduction

VersaGrid is a highly configurable and dynamic grid layout plugin. The focus here is taking a bunch of elements within a big container, finding a single calibrated aspect ratio and starting width, and laying them out in very clean rows. The focus is on cohesion, uniformity, and simplicity. 

## Installation

1. Include jQuery and the VersaGrid script in your markup. VersaGrid requires jQuery v1.4.2 or greater.

<pre>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script src="<proper path>/versagrid.js"></script>
</pre>

2. VersaGrid works with three types of elements: a single *container* that holds a bunch of *items*, all of the direct children of the container. Finally, within each item there are *inner elements* that are automatically repositioned as well:

<pre>
<div id="#container">
	<div class="item">
		<img alt="" class="innerelement" src="sample1.jpg"/>
	</div>
	<div class="item">
		<img alt="" class="innerelement" src="sample2.jpg"/>
	</div>
	<div class="item">
		<img alt="" class="innerelement" src="sample3.jpg"/>
	</div>
</div>
</pre>

3. There should be a few basic CSS styling rules added to each major type of element, along with a few simple ones to handle VersaGrid's default styling:

<pre>
#container { position: relative; }
.item { float: left; left: 0; position: relative; top: 0; }
.versaGridContainer .versaGridItem.wide .versaGridInner { width: auto; height: 100%; }
.versaGridContainer .versaGridItem.tall .versaGridInner { width: 100%; height: auto; }
</pre>

4. Run VersaGrid with a simple line of Javascript, ideally to be called on document ready:

<pre>
$(function(){
	$('#container').versaGrid();
});
</pre>

## How VersaGrid works

1. The plugin starts by cycling through all the items within the container, measuring and storing their width and height. 

2. From that, averages are made to determine a proper single aspect ratio and a "base" width/height that works best with the items. For example, say there is a container with 10 images, 7 that are shot in a square 1x1 aspect ratio, 3 in a common 35mm 3x2 aspect ratio. VersaGrid will settle on single aspect ratio that's most common and closer to the average, in this case 1x1. If the first seven images had a width of 100 pixels, the remaining three had a width of 200 pixels, then the base width will be set to 100 pixels.

3. With a single ideal aspect ratio and base width in hand, individual items are given the same width and height to cleanly full the full width of the container, extending the container as tall as necessary to fit all the elements. 

4. The fixed, uniform nature of VersaGrid can cause elements within each item to be naturally cropped a bit, so all inner elements are next centered vertically and horizontally to maximize visibility.

## Optional parameters

Just include optional parameters when invoking VersaGrid. For example:

<pre>
$(function(){
	$('#container').versaGrid({
		basewidth:450,
		forcespan:true,
		idealaspect:1.5
	});
});
</pre>


### basewidth
*Default: not provided*
If this is provided, the normally calculated "base" width is ignored and instead this is set as the base/max width of any element.

### forcespan
*Default: true*
When this boolean is set to true, inner elements of item are automatically stretched/reduced in size to ensure they always cover the edges of each item (note the original aspect ratio is always preserved) giving a cleaner look. However, any sort of auto spanning can cause inner elements to be a bit soft, so this can be set to false; the inner elements will be centered but not resized.

### idealaspect
*Default: not provided*
If this is provided, the normally calculated ideal aspect ratio is ignored, and this becomes the proper aspect ratio. Provide this in the form a single float number: so 1 for 1x1, 1.5 for a 1.5x1 or 3x2 aspect ratio, and so on.

### innerelements
*Default: \**
It's assumed that all elements within a item should be treated as  inner elements, auto centered and resized to maximize their visibility within the boundaries of each item. Yet this only works well for image and video elements; items like text or other specially laid out elements can look strange. Change this jQuery selector from '*' (all elements) to something else in that case, such as 'img' for all images, or '.oneclassname' for a single targeted class.

### smallestbasewidth
*Default: false*
Sometimes inner elements look blurry or otherwise bad when scaled to a size larger than the exact file dimensions. To prevent this from happening, set this boolean option to true. To do so, the base width will be set to the smallest width of all the inner elements measured.

### zoom
*Default: 1*
By default VersaGrid makes its width, height and aspect ratio calculations based on the size of the elements as is when the plugin is initialized. However, sometimes this can result in unintentionally too large or too small items. Setting this number to something other than 1 sets it as a zoom multiplier on the base width. For example, 2 doubles the width of all the items, while 0.5 would half them (and roughly double the number of items that fit on any single row.) For one practical example, perhaps VersaGrid is invoked on a gallery of higher resolution images that when split up only result in one or two per row on a large resolution monitor. The intention in this case it to show or provide many more on screen at once, so setting zoom to 0.5 or lower could make a lot of sense.

## Additional credits

&copy; 2012 Nick Schaden 