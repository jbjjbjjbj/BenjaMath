#!/usr/bin/env python3

from flask import Flask, render_template, request
from mpmath import *
from sympy import *
from sympy.parsing.sympy_parser import parse_expr
import json

app = Flask(__name__)

@app.route("/")
def hello():
    return render_template('index.html')

@app.route('/solveEq/', methods=['POST'])
def solveEq():
    #Convert from javascript exponent syntax to python syntax
    exponentReplace = request.json["eq"].replace("^", "**")
    expressions = exponentReplace.split("=")
    variable = request.json["variable"]
    #Loop through the list while both keeping the value and the index stored
    for i, expression in enumerate(expressions):
        expressions[i] = parse_expr(expression)
    eq = expressions[0] - expressions[1]
    print(eq)
    results = str(solve(eq, Symbol(variable)))
    print (results)
    #Convert back to javascript exponent syntax
    results = results.replace("**","^")
    return json.dumps(results)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
