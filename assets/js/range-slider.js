// variable_names
// functionNames
// CONSTANT_VARIABLE_NAMES
// $_my_jquery_selected_element
import $ from "jquery";
export default function (params) {
    /* ----- Error handling before initialization -----*/

    // Break out of the initialization if no params specified
    // or params is not a string
    // or params doesnt have a property called element which contains a string
    if (params && typeof params.selector !== "string") {
        // Log the error & break out
        throw "init() needs a selector string or an object which contains a selector string called 'element'";
        return false;
    }

    // Break out of the initialization if no min and max params are specified
    // or params are not numbers
    // or min is not smaller than the max

    if ((!(typeof params.min === "number" && typeof params.max === "number")) || params.min > params.max) {
        // Log the error & break out
        throw "init() needs a min and max in its parameter object, which are both numbers and the min is smaller than the max";
        return false;
    }

    // Initial positions for scrubbers
    if (params.left_scrubber_pos != undefined && (typeof params.left_scrubber_pos !== "number"))
        throw "The value inside left_scrubber_pos is not a number"
    if (params.right_scrubber_pos != undefined && (typeof params.right_scrubber_pos !== "number"))
        throw "The value inside left_scrubber_pos is not a number"

    /*

	<span class="left-label"></span>
	<span class="right-label"></span>
	<div class="slider-bar">
		<div class="left-scrubber scrubber"></div>
		<div class="range"></div>
		<div class="right-scrubber scrubber"></div>
	</div>

	*/

    // Variables declarations
    var that = this,

        // Elements
        $_parent = $(params.selector).empty(),
        $_labels = $('<div />').addClass('labels').appendTo($_parent),
        $_left_label = $('<input />').attr('id', 'left-label').attr('disabled', 'disabled').appendTo($_labels),
        $_right_label = $('<input />').attr('id', 'right-label').attr('disabled', 'disabled').appendTo($_labels),
        $_slider_bar = $('<div />').addClass('slider-bar').appendTo($_parent),
        $_left_scrubber = $('<div />').addClass('left-scrubber scrubber').appendTo($_slider_bar),
        $_right_scrubber = $('<div />').addClass('right-scrubber scrubber').appendTo($_slider_bar),
        $_range_bar = $('<div />').addClass('range').appendTo($_slider_bar),

        // Functions used for calculations
        pxToUnits = function (pixel_pos) {
            var percentage_pos = pixel_pos / ($_slider_bar.width() - (scrubber_width * 2)),
                range_in_units = max - min;

            if (percentage_pos == Infinity)
                percentage_pos = 0;

            return min + (range_in_units * percentage_pos);
        },

        unitsToPx = function (unit_pos) {
            return (unit_pos - min) / (max - min) * ($_slider_bar.width() - (scrubber_width * 2));
        },

        round = function (unit_value) {
            return Math.round(unit_value / round_by) * round_by;
        },

        floor = function (unit_value) {
            return Math.floor(unit_value / round_by) * round_by;
        },

        ceil = function (unit_value) {

            return Math.ceil(unit_value / round_by) * round_by;
        },

        thousandSeparator = function (value) {
            // Thousand separator check
            if (typeof params.thousand_separator !== "string")
            {
                // Warn
                console.warn("thousand_separator needs to be of type String");
                return value;
            }
            else
            {
                // Thanks to: http://darklaunch.com/2013/05/09/javascript-thousands-separator-function
                return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1"+params.thousand_separator);
            }
        },

        // Void functions for visuals stuff
        updateRangeBar = function () {
            // Sets the position and size of the bar between the scrubbers

            if (params.rounded) {
                // Version in the center of the scrubbers
                $_range_bar.css(
                    {
                        left: left_scrubber_pos + scrubber_width - (scrubber_width / 2),
                        width: (right_scrubber_pos - left_scrubber_pos)
                    }
                );
            }
            else {
                // Version between the scrubbers
                $_range_bar.css(
                    {
                        left: left_scrubber_pos + scrubber_width,
                        width: (right_scrubber_pos - left_scrubber_pos - scrubber_width)
                    }
                );
            }
        },

        // Assumed constants
        min = params.min,
        max = params.max,
        scrubber_width = $_left_scrubber.outerWidth() ?? $_left_scrubber.width(),
        unit = typeof params.unit === "string" ? params.unit : "",
        round_by = typeof params.round_by === "number" ? params.round_by : 1,

        // Changing variables
        left_scrubber_pos,
        right_scrubber_pos,
        left_scrubber_hover = false,
        right_scrubber_hover = false,
        dragging_left = false,
        dragging_right = false,
        initial_x_pos_in_scrubber;

    // Correct rounding before init
    min = floor(min);
    max = ceil(max);

    /* ----- Element specific error handling -----*/

    // Scrubber width do not match
    if ($_left_scrubber.width() !== $_right_scrubber.width())
        throw "The left and right scrubbers width's do not match, they must be the same for this to work correctly";

    /* ----- PUBLIC METHODS ----- */

    that.updateMin = function (unit_value) {
        // Force to be a number
        unit_value = parseFloat(unit_value);

        if (unit_value != floor(unit_value))
            console.warn("value is not a devision of the round_by value, " + unit_value + " has been rounded to " + round(unit_value));

        // Make sure a number has been parsed through
        if (!isNaN(unit_value)) {
            // Store the current positions in units
            var left_unit = pxToUnits(left_scrubber_pos),
                right_unit = pxToUnits(right_scrubber_pos);

            // Just in case pxToUnits doesnt work due to min and max being equal
            if(isNaN(left_unit))
                left_unit = min;
            if(isNaN(right_unit))
                right_unit = max;

            // Update the min
            min = floor(unit_value);

            // Update the scrubbers to the new min and max.
            that.updateScrubbers(left_unit, right_unit);
        }
        else {
            console.error("value parsed in is not a number.");
        }
    };

    that.updateMax = function (unit_value) {
        // Force to be a number
        unit_value = parseFloat(unit_value);

        if (unit_value != ceil(unit_value))
            console.warn("value is not a devision of the round_by value, " + unit_value + " has been rounded to " + round(unit_value));

        // Make sure a number has been parsed through
        if (!isNaN(unit_value)) {
            // Store the current positions in units
            var left_unit = pxToUnits(left_scrubber_pos),
                right_unit = pxToUnits(right_scrubber_pos - scrubber_width);

            // Just in case pxToUnits doesnt work due to min and max being equal
            if(isNaN(left_unit))
                left_unit = min;
            if(isNaN(right_unit))
                right_unit = max;

            // Update the max
            max = ceil(unit_value);

            // Update the scrubbers to the new min and max.
            that.updateScrubbers(left_unit, right_unit);
        }
        else {
            console.error("value parsed in is not a number.");
        }
    };

    that.updateRange = function (min_value, max_value) {
        // Force params as numbers
        min_value = parseFloat(min_value);
        max_value = parseFloat(max_value);

        // Make sure a number has been parsed through
        if (!isNaN(min_value) && !isNaN(max_value) && min_value <= max_value) {
            var scrubbers_need_repositioning = max_value <= min || min_value >= max;

            // If the new min value is larger than the current max value,
            // update the min and max in a different order to avoid conflict.
            if (min_value > max) {
                // update min max ranges
                that.updateMax(max_value);
                that.updateMin(min_value);
            } else {
                // update min max ranges
                that.updateMin(min_value);
                that.updateMax(max_value);
            }

            // check if the range doesnt overlap the existing range at all
            if (scrubbers_need_repositioning) {
                // move scrubbers to min and max as no existing scrubber positions will be in this range
                that.updateScrubbers(min_value, max_value);
            }
        }
        else {
            console.error("values parsed in are not numbers or left scrubber value is larger than the right scrubber value.");
        }
    };

    that.updateLeftScrubber = function (unit_value) {
        // Make sure a number has been parsed through
        if (!isNaN(parseFloat(unit_value))) {
            //if (max - min > round_by) {
            // Snap to minimum
            left_scrubber_pos = unitsToPx(unit_value <= min ? min : unit_value);

            // Snap to right scrubber
            left_scrubber_pos = left_scrubber_pos >= right_scrubber_pos - scrubber_width - unitsToPx(min + round_by) ?

                right_scrubber_pos - scrubber_width - unitsToPx(min + round_by) :

                left_scrubber_pos;

            // Make sure it visually does not go minus px
            left_scrubber_pos = left_scrubber_pos > 0 ? left_scrubber_pos : 0;

            // Set its text value to be min and max param
            $_left_label.attr('value',thousandSeparator(round(pxToUnits(left_scrubber_pos))) + unit);
            //$_left_label.text(round(pxToUnits(left_scrubber_pos)) + unit);

            // Set scrubber start position
            $_left_scrubber.css('left', left_scrubber_pos);

            updateRangeBar();
            //}
        }
        else {
            console.error("value parsed in is not a number.");
        }
    };

    that.updateRightScrubber = function (unit_value) {
        // Make sure a number has been parsed through
        if (!isNaN(parseFloat(unit_value))) {
            //if (max - min > round_by) {
            // Snap to the maximum
            right_scrubber_pos = unitsToPx(unit_value >= max ? max : unit_value) + scrubber_width;

            // Snap to left scrubber + round_by
            right_scrubber_pos = right_scrubber_pos <= left_scrubber_pos + scrubber_width + unitsToPx(min + round_by) ?

                left_scrubber_pos + scrubber_width + unitsToPx(min + round_by) :

                right_scrubber_pos;

            // just in case unitsToPx doesnt work due to min being the same as max
            if(isNaN(right_scrubber_pos))
                right_scrubber_pos = $_slider_bar.width() - scrubber_width;

            // Set its text value to be min and max param
            $_right_label.attr('value',thousandSeparator(round(pxToUnits(right_scrubber_pos - scrubber_width))) + unit);
            //$_right_label.text(round(pxToUnits(right_scrubber_pos - scrubber_width)) + unit);

            // Set scrubber start position
            $_right_scrubber.css('left', right_scrubber_pos);

            updateRangeBar();
            //}
        }
        else {
            console.error("value parsed in is not a number.");
        }
    };

    that.updateScrubbers = function (left, right) {

        left = parseFloat(left);
        right = parseFloat(right);

        // Make sure a number has been parsed through
        if (!isNaN(left) && !isNaN(right) && left <= right) {
            left_scrubber_pos = unitsToPx(min);
            right_scrubber_pos = unitsToPx(max);

            // Just incase the min and max are the same
            // unitsToPx will not work... so revert to min and max snapping
            if(isNaN(left_scrubber_pos))
                left_scrubber_pos = 0;
            if(isNaN(right_scrubber_pos))
                right_scrubber_pos = $_slider_bar.width() - scrubber_width;

            that.updateLeftScrubber(left);
            that.updateRightScrubber(right);
        }
        else {
            console.error("values parsed in are not numbers or left scrubber value is larger than the right scrubber value.");
        }
    };

    // Event
    that.release = function (scrubber_values) {
        // Set if defined in parameter, if not do nothing
        if (typeof params.release === "function") {
            params.release(scrubber_values);
        }
    };

    /* ----- MAIN INIT -----*/
    this.updateScrubbers(	typeof params.left_scrubber_pos === "number" ? params.left_scrubber_pos : min,
        typeof params.right_scrubber_pos === "number" ? params.right_scrubber_pos : max);

    /* ----- Events initialization -----*/

    $_left_scrubber.mouseover(

        function () {
            left_scrubber_hover = true;
        }
    );

    $_right_scrubber.mouseover(

        function () {
            right_scrubber_hover = true;
        }
    );

    $_left_scrubber.mouseout(

        function () {
            left_scrubber_hover = false;
        }
    );

    $_right_scrubber.mouseout(

        function () {
            right_scrubber_hover = false;
        }
    );

    // Use
    //document.addEventListener("MSPointerDown", ctrl.handleMSEvents);
    //document.addEventListener("MSPointerMove", ctrl.handleMSEvents);
    //document.addEventListener("MSPointerUp", ctrl.handleMSEvents);

    $_slider_bar.bind(

        'mousedown touchstart',

        function (e) {
            e.preventDefault(); // disable selection

            // Performance purposes
            var mathAbs = Math.abs,

                // Support for touch devices
                clientX = e.clientX ? e.clientX : e.originalEvent.touches[0].pageX,

                // Store the moust position in relation to the parent element (slider bar)
                mouse_position_x_in_slider = (clientX - $_slider_bar.offset().left),

                // Work out the distance from each scrubber
                distance_from_left_scrubber = mathAbs(mouse_position_x_in_slider - left_scrubber_pos),
                distance_from_right_scrubber = mathAbs(mouse_position_x_in_slider - right_scrubber_pos);

            // Reset the drag statuses
            dragging_right = false;
            dragging_left = false;

            // If clicked on left scrubber
            if (left_scrubber_hover) {
                // Store the position of where the mouse was in relation to the scrubber at the time of the click
                initial_x_pos_in_scrubber = mouse_position_x_in_slider - parseFloat($_left_scrubber.css('left'));
                dragging_left = true;
            }

            // If clicked on right scrubber
            else if (right_scrubber_hover) {
                // Store the position of where the mouse was in relation to the scrubber at the time of the click
                initial_x_pos_in_scrubber = mouse_position_x_in_slider - parseFloat($_right_scrubber.css('left'));
                dragging_right = true;
            }

            // If clicked on slider but on no scrubber
            else {
                // Make the position of the scrubber centered to the mouse
                initial_x_pos_in_scrubber = scrubber_width / 2;

                // If nearer the left scrubber
                if (distance_from_left_scrubber < distance_from_right_scrubber) {
                    dragging_left = true;

                    // Move the scrubber
                    that.updateLeftScrubber(pxToUnits(mouse_position_x_in_slider - initial_x_pos_in_scrubber));
                }
                else {
                    dragging_right = true;

                    // Move the scrubber
                    that.updateRightScrubber(pxToUnits(mouse_position_x_in_slider - scrubber_width - initial_x_pos_in_scrubber));
                }
            }
        }
    );

    $(document).bind(

        'mousemove touchmove',

        function (e) {
            // Support for touch devices
            var clientX = e.clientX ? e.clientX : e.originalEvent.touches[0].pageX,

                // Store the moust position in relation to the parent element (slider bar)
                mouse_position_x_in_slider = clientX - $_slider_bar.offset().left;

            // Left scrubber drag
            if (dragging_left) {
                var left_position = mouse_position_x_in_slider - initial_x_pos_in_scrubber;

                that.updateLeftScrubber(pxToUnits(left_position));
            }

            // Right scrubber drag
            if (dragging_right) {
                var right_position = mouse_position_x_in_slider - initial_x_pos_in_scrubber - scrubber_width;

                that.updateRightScrubber(pxToUnits(right_position));
            }

        }
    );

    $(document).bind(

        'mouseup touchend',

        function (e) {
            // Trigger the defined release event if they were dragging
            if (dragging_left || dragging_right)
                that.release(
                    {
                        min: round(pxToUnits(left_scrubber_pos)),
                        max: round(pxToUnits(right_scrubber_pos - scrubber_width))
                    }
                );

            dragging_left = false;
            dragging_right = false;
        }
    );
}

