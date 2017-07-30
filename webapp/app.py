from flask import Flask, jsonify
from flask import abort
from flask import request
from flask import make_response
from flask import Flask,redirect
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
    region_growth = np.round(region_growth)
    region_growth = [[float(i),float(j)] for i,j in zip(region_growth.index.tolist(),region_growth.tolist())]

    results = {
        'data': region_growth
    }

    return jsonify(results), 201

## Success stuff at end so no conflicts

###################### Cut and paste from here
import xgboost as xgb
import pandas as pd
def create_startup_success_model():
    import numpy as np
    import pandas as pd
    from sklearn import model_selection, preprocessing
    import xgboost as xgb

    # Load dataset from a csv file
    df_data = pd.read_csv('../data/neisdatagovhack.csv')

    TARGET = 'successful'

    y_train = df_data[TARGET] == 'Y'
    x_train = df_data.drop([TARGET], axis=1)

    usable_cols = [
        'industry_type',
        'state',
        'metro',
        'age_group',
        'gender_cd',
        'sole_parent_ind',
        'neis_allowance_ind',
        'sv_hours_work',
        'sv_staff_lt35h',
        'sv_staff_gt35h']

    x_train = x_train[usable_cols]
    print('x_train.dtypes', x_train.dtypes)

    # can't merge train with test because the kernel run for very long time

    LEs = {}
    for c in x_train.columns:
        if x_train[c].dtype == 'object':
            lbl = preprocessing.LabelEncoder()
            lbl.fit(list(x_train[c].values)) 
            LEs[c] = lbl
            x_train[c] = lbl.transform(list(x_train[c].values))

    dtrain = xgb.DMatrix(x_train, label=y_train)

    xgb_params = {
        'eta': 0.05,
        'max_depth': 5,
        'subsample': 0.7,
        'colsample_bytree': 0.7,
        'objective': 'binary:logistic',
        'silent': 1,
    }
    
    cv_output = xgb.cv(xgb_params, dtrain, num_boost_round=1000, early_stopping_rounds=20,
        verbose_eval=10, show_stdv=False, folds=5)
    cv_output[['test-error-mean','test-error-std','train-error-mean','train-error-std']].plot()
    model = xgb.train(dict(xgb_params, silent=0), dtrain, num_boost_round=len(cv_output))
    return usable_cols, LEs, model

# Train the model
usable_cols, LEs, model = None, None, None


# Predict 
def predict(form_data):
    global usable_cols, LEs, model
    if (not model):
        usable_cols, LEs, model = create_startup_success_model()
    x_train = pd.DataFrame(data=[[form_data[k] for k in usable_cols]], columns=usable_cols)
    x_train['metro'] = pd.to_numeric(x_train['metro'], errors='coerce')
    x_train['sv_hours_work'] = pd.to_numeric(x_train['sv_hours_work'], errors='coerce')
    x_train['sv_staff_lt35h'] = pd.to_numeric(x_train['sv_staff_lt35h'], errors='coerce')
    x_train['sv_staff_gt35h'] = pd.to_numeric(x_train['sv_staff_gt35h'], errors='coerce')
    for c in x_train.columns:
        if (LEs.get(c, None)):
            lbl = LEs[c]
            x_train[c] = lbl.transform(list(x_train[c].values))
    dtrain = xgb.DMatrix(x_train)
    return model.predict(dtrain)[0]

############ End cut and past

# Call with 
#   curl -i -H "Content-Type: application/json" -X POST -d '{"region":"2114","measure":"70-74 years"}' http://localhost:5000/api/data
@app.route('/api/success', methods=['POST'])
def success():
    if not request.get_json():
        abort(400)
    result = float(predict(request.get_json()))
    return jsonify(result), 201


if __name__ == '__main__':
    app.run(debug=True)

