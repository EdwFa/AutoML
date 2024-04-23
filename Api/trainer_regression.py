from catboost import CatBoostRegressor
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from lightgbm import LGBMRegressor
from sklearn.inspection import permutation_importance

from sklearn.metrics import (mean_absolute_error, mean_squared_error,
                             mean_absolute_percentage_error, r2_score)
from sklearn.model_selection import (cross_val_score, train_test_split,
                                     GridSearchCV, RandomizedSearchCV)
from scipy.stats import randint, uniform
import numpy as np
from .trainer_classification import permutation_importance

models = {
    'DummyRegression': DummyRegressor,
    'LinearRegression': LinearRegression,
    'CatboostRegression': CatBoostRegressor,
    'LGBMRegressor': LGBMRegressor,
}

default_models = {
    'DummyRegression': DummyRegressor(strategy='mean'),
    'LinearRegression': LinearRegression(),
    'CatboostRegression': CatBoostRegressor(silent=True, depth=10, iterations=172,
                                            l2_leaf_reg=3.1273, learning_rate=0.1046),
    'LGBMRegressor': LGBMRegressor(learning_rate=0.0488, max_depth=10, n_estimators=466,
                                   num_leaves=38, min_child_samples=5),
}

def trainer2(X_train, y_train, X_test, y_test, model_name, labels, **params):
    print(params)
    is_permutate = params.pop('is_permutate', False)
    if 'clear' in params:
        model = default_models[model_name]
    else:
        model = models[model_name]
        model = model(**params)

    model.fit(X_train, y_train)

    if is_permutate:
        features_importants = permutation_importance(model, X_train, y_train, labels)
    else:
        features_importants = None
    print(features_importants)

    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)

    train_mae = mean_absolute_error(y_train, y_pred_train)
    train_rmse = mean_squared_error(y_train, y_pred_train, squared=False)
    train_mape = mean_absolute_percentage_error(y_train, y_pred_train)

    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_rmse = mean_squared_error(y_test, y_pred_test, squared=False)
    test_mape = mean_absolute_percentage_error(y_test, y_pred_test)

    if model_name == 'DummyRegression':
        train_r2 = '-'
        test_r2 = '-'
    else:
        train_r2 = round(r2_score(y_train, y_pred_train), 5)
        test_r2 = round(r2_score(y_test, y_pred_test), 5)

    return (model, round(train_mae, 5), round(train_rmse, 5), round(train_mape, 5), round(test_mae, 5),
            round(test_rmse, 5), round(test_mape, 5), train_r2, test_r2, features_importants)
