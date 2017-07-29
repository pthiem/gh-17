//////////////////////////////////////////////////////////////////////
//		Success 
//////////////////////////////////////////////////////////////////////


// Start function
$(function() {
	console.log('start')
    $('input, select').change(function()
	{
		submit_onclick()
	});
	init_charts()
	submit_onclick()
})


//serialize data function in a nicer object way so can be json nicely.
function objectifyForm(formArray) {
	var returnArray = {};
	for (var i = 0; i < formArray.length; i++){
		returnArray[formArray[i]['name']] = formArray[i]['value'];
	}
	return returnArray;
}


function submit_onclick() {
 $.ajax({
     url: '/api/success', // url where to submit the request
     type : "POST", // type of action POST || GET
     dataType : 'json', // data type
     contentType: 'application/json', 
     data : JSON.stringify(objectifyForm($('#pred-form').serializeArray())), // post data || get data
     success : function(result) {
         // you can see the result from the console
         // tab of the developer tools
         console.log("ajax result", result);
         $('#myChartA').fadeIn()
     	 myChartA.data.datasets[0].data = [result, 1-result]
     	 myChartA.update()
     },
     error: function(xhr, resp, text) {
         console.log(xhr, resp, text);
     }
 })	
	
	return false;
}


function init_charts() {
	// Centre text plugin
	chartDoughnutTextPlugin = {
	  beforeDraw: function(chart) {
	    var width = chart.chart.width,
	        height = chart.chart.height,
	        ctx = chart.chart.ctx;
	
	    ctx.restore();
	    var fontSize = (height / 114).toFixed(2);
	    ctx.font = fontSize + "em Montserrat, Helvetica Neue, Helvetica, Arial, sans-serif";
	    ctx.textBaseline = "middle";
	
	    var text = (chart.data.datasets[0].data[0] * 100).toPrecision(2) + '%'
	        textX = Math.round((width - ctx.measureText(text).width) / 2),
	        textY = height / 2 + 20;
	
	    ctx.fillText(text, textX, textY);
	    ctx.save();
	  }
	};		

	// Create chart
	var ctx = document.getElementById("myChartA").getContext('2d');
	myChartA = new Chart(ctx, {
	    type: 'pie',
	    plugins: [chartDoughnutTextPlugin],
	    data: {
	        labels: ["Red", "Blue"],
	        datasets: [{
	            //label: '',
	            data: [0, 0, 0],
	            backgroundColor: [
	                'rgba(255, 153, 255, 0.2)',
	                'rgba(54, 162, 235, 0)',
	            ],
	            borderColor: [
	                'rgba(255, 153, 255, 1)',
	                'rgba(54, 162, 235, 0)',
	            ],
	            borderWidth: 1
	        }]
	    },
	    options: {
	    	cutoutPercentage: '50',
	        legend: {
	            display: false
	        },
	        title: {
	            display: true,
	            fontSize: 25,
	            fontFamily: "Montserrat, Helvetica Neue, Helvetica, Arial, sans-serif",
	            text: 'Chance of Success'
	        }
	    }
	});

}