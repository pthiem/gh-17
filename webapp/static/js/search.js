//////////////////////////////////////////////////////////////////////
//		Search 
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
function getData(measure, callback) {
    $.ajax({
        url: '/api/search', // url where to submit the request
        type : "POST", // type of action POST || GET
        dataType : 'json', // data type
        contentType: 'application/json', 
        data : JSON.stringify({measure:measure}), // post data || get data
        success : function(data) {
            // you can see the result from the console
            // tab of the developer tools
            //console.log("ajax data", data)
            callback(measure, data)
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
	
	var measure = "";
	$('#form-measure option:selected').each(function(index, brand) {
		measure = $(this).val();
	});
	
	updateTable(measure)
	
	
	return false
}

function updateTable(measure) 
{
	// get the data for the measure, then update it
	getData(measure, drawTableWithData)
}

// Callback to the ajax get data function
function drawTableWithData(measure, data) 
{
    var table = $('#searchTable').DataTable();
    table.clear()
    table.rows.add(data.data)
    table.draw()
}

$(function() {
    $('#searchTable').DataTable( {
        columns: [
            {title: 'Region' },
            {title: 'Average growth rate %' }
        ],
        order: [
            [1,'desc']
        ],
	columnDefs:  [
	{
		"targets": 0,
		"render": function ( data, type, row ) {
		    return '<a href="/static/profile.html?region='+data+'">'+data+'</a>';
		},
	}
	]
    });
})
