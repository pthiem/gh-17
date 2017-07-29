//////////////////////////////////////////////////////////////////////
//		Search T+1 - Profile
//////////////////////////////////////////////////////////////////////


// Start function
$(function() {
	console.log('start')
	submit_onclick()
})


// serialize data function in a nicer object way so can be json nicely.
function objectifyForm(formArray) {
  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}




// Returns a json data for the region, measure (as per the API)
function getData(region, measure, callback) {
    $.ajax({
        url: '/api/data', // url where to submit the request
        type : "POST", // type of action POST || GET
        dataType : 'json', // data type
        contentType: 'application/json', 
        data : JSON.stringify({region:region, measure:measure}), // post data || get data
        success : function(data) {
            // you can see the result from the console
            // tab of the developer tools
            //console.log("ajax data", data)
            callback(region, measure, data)
        },
        error: function(xhr, resp, text) {
            console.log(xhr, resp, text);
        }
    })	
}

// This is called after the form changes
// Will redraw the charts 
function submit_onclick() 
{
	
	var region = "";
	$('#form-region option:selected').each(function(index, brand) {
		region = $(this).val();
	});
	
	var measures = []
	$('#form-measure  option:selected').each(function(index, brand){
		measures.push($(this).val());;
	});

	if (region != "") {
		measures.forEach(function(measure) {
			updateChart(region, measure)
		})
	}
	
	// remove any charts that are no longer selected
	$("#container .graph").each(function(i, c) { 
		var chart = $(c).highcharts()
		console.log('Consider Remove', chart.options.measure, measures)
		if ($.inArray(chart.options.measure, measures) == -1) {
			$(c).remove()
		} 
	})	
	
	
	return false
}

function updateChart(region, measure) 
{
	console.log("updateChart", region, measure)
	// get the data for the measure, then update it
	getData(region, measure, drawChartWithData)
}

// Callback to the ajax get data function
function drawChartWithData(region, measure, data) 
{
	// find chart for measure
	
	var chart = null
	$("#container .graph").each(function(i, c) { 
		if (measure == $(c).highcharts().options.measure) {
			chart = $(c).highcharts()
		} 
	})	
	
	if (chart) {
		// update the chart
		chart.xAxis[0].setCategories(data.years);
		chart.series[0].update({
		    data: data.values
		}, true);		
		chart.series[1].update({
		    data: data.errors
		}, true); //true to redraw		
	}
	
	// insert the chart
	if (!chart) {
		div = $("<div class='graph'></div>"); 
		$("#container").append(div)
		
		Highcharts.chart(div[0], {
		    chart: {
		        zoomType: 'xy'
		    },
		    legend: {
		    	enabled: false
		    },
		    credits: {
		    	enabled: false
		    },
		    title: {
		        text: measure
		    },
		    xAxis: [{
		        categories: data.years,
		        title: {
		            text: null
		        }		        
		    }],
		    yAxis: [{ // Primary yAxis
		        title: {
		            text: null
		        }
		    }],
		    tooltip: {
		        shared: true
		    },
		    series: [{
		        name: measure,
		        type: 'column',
		        yAxis: 0,
		        data: data.values,
//		        tooltip: {
//		            pointFormat: '<span style="font-weight: bold; color: {series.color}">{series.name}</span>: <b>{point.y:.1f} mm</b> '
//		        }
		    }, {
		        name: measure + ' error',
		        type: 'errorbar',
		        yAxis: 0,
		        data: data.errors,
		        tooltip: {
		            pointFormat: '(error range: {point.low}-{point.high})<br/>'
		        }
		    }],
		    region: region,
		    measure: measure
		});	
	}
	
}


function removeChart(feature, measure) {
	
	// find chart for measure
	
	// remove it
	
}


