from flask import Flask, jsonify
from flask import abort
from flask import request
from flask import make_response
from flask import Flask,redirect
from statsmodels.base.model import Results
import pandas as pd 
import ast

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


if __name__ == '__main__':
    app.run(debug=True)

