// Agency Theme JavaScript

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function(){ 
            $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

})(jQuery); // End of use strict


// serialize data function in a nicer object way so can be json nicely.
function objectifyForm(formArray) {
  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}


function submit_onclick() {
    $.ajax({
        url: '/api/predict', // url where to submit the request
        type : "POST", // type of action POST || GET
        dataType : 'json', // data type
        contentType: 'application/json', 
        data : JSON.stringify(objectifyForm($('#pred-form').serializeArray())), // post data || get data
        success : function(result) {
            // you can see the result from the console
            // tab of the developer tools
            console.log(result);
            $('#myChartA').fadeIn()
        	myChartA.data.datasets[0].data = [result.classification[0], 1-result.classification[0]]
        	myChartA.update()
            $('#myChartB').fadeIn()
        	myChartB.data.datasets[0].data = [result.classification[1], 1-result.classification[1]]
        	myChartB.update()
            $('#myChartC').fadeIn()
        	myChartC.data.datasets[0].data = [result.classification[2], 1-result.classification[2]]
        	myChartC.update()
        },
        error: function(xhr, resp, text) {
            console.log(xhr, resp, text);
        }
    })	
	
	return false;
}