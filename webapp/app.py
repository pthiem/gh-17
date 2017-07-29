from flask import Flask, jsonify
from flask import abort
from flask import request
from flask import make_response
from flask import Flask,redirect
from statsmodels.base.model import Results
import pandas as pd 
import ast
import numpy as np

app = Flask(__name__, static_url_path='/static')

# TODO: Load data from csv file 

df_data = pd.read_csv('data.csv',index_col=None) # TODO
df_data = df_data.where((pd.notnull(df_data)), None)

@app.route('/')
def start():
    return redirect("/static/index.html", code=302)


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


# Call with 
#   curl -i -H "Content-Type: application/json" -X POST -d '{"region":"2114","measure":"70-74 years"}' http://localhost:5000/api/data
@app.route('/api/data', methods=['POST'])
def get_data():
    if not request.get_json():
        abort(400)
    region = request.get_json()["region"]
    measure = request.get_json()["measure"]

    df_slice = df_data.loc[(df_data['regions'] == int(region)) & (df_data['measures'] == measure),:]

    #  TODO get Results
    results = {
        'region': df_slice['regions'].tolist(),
        'measures': df_slice['measures'].tolist(),
        'years': df_slice['years'].tolist(),
        'values': df_slice['values'].tolist(),
        'errors': [ast.literal_eval(l) if l else l for l in list(df_slice['errors'].values)]
    }

    return jsonify(results), 201

@app.route('/api/search', methods=['POST'])
def get_data_table():
    if not request.get_json():
        abort(400)
    measure = request.get_json()["measure"]
    
    region_growth = df_data.loc[df_data.loc[:,'measures'] == measure,:].groupby('regions').apply(
        lambda x: (x['values'].values[1] - x['values'].values[0])/
        x['values'].values[0]).sort_values(ascending=False)
    region_growth = region_growth[np.isfinite(region_growth)]*100

    results = {
        'region': region_growth.index.tolist(),
        'average_growth_rate': region_growth.tolist(),
    }

    return jsonify(results), 201

if __name__ == '__main__':
    app.run(debug=True)

