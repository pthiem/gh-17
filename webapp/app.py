from flask import Flask, jsonify
from flask import abort
from flask import request
from flask import make_response
from flask import Flask,redirect
from statsmodels.base.model import Results
import pandas as pd 

app = Flask(__name__, static_url_path='/static')

# TODO: Load data from csv file 

df_data = pd.DataFrame() # TODO

@app.route('/')
def start():
    return redirect("/static/index.html", code=302)


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


# Call with 
#   curl -i -H "Content-Type: application/json" -X POST -d '{"region":"2114","measure":"70-74 years"}' http://localhost:5000/api/data
@app.route('/api/data', methods=['POST'])
def predict():
    if not request.get_json():
        abort(400)
    region = request.get_json()["region"]
    measure = request.get_json()["measure"]

    #  TODO get Results
    results = {
        'region': region,
        'measures': measure,
        'years': [2011, 2016, 2021],
        'values': [100, 110, 120],
        'low': [None, None, 110],
        'high': [None, None, 130]
    }

    return jsonify(results), 201


if __name__ == '__main__':
    app.run(debug=True)

