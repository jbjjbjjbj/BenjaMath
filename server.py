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
    resultString = "";
    #Convert from javascript exponent syntax to python syntax
    exponentReplace = request.json["eq"].replace("^", "**")
    expressions = exponentReplace.split("=")
    variable = request.json["variable"]
    #Loop through the list while both keeping the value and the index stored
    for i, expression in enumerate(expressions):
        expressions[i] = parse_expr(expression)
        resultString += latex(expressions[i])
        if(i == 0):
            resultString += "="
    resultString += " \\Longrightarrow " + variable + "=("
    eq = expressions[0] - expressions[1]
    results = solve(eq, Symbol(variable))
    for i, result in enumerate(results):
        resultString += latex(result) + ","
    resultString = resultString[:-1]
    resultString += ")"
    return json.dumps(resultString)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
