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

@app.route('/evalfCalc/', methods=['POST'])
def evalfCalc():
    resultString = "";
    #Convert from javascript exponent syntax to python syntax
    inputString = request.json["ex"].replace("^", "**")
    decimals = request.json["decimals"]
    resultString += latex(inputString) + " \\approx"
    #Check if decimals
    if decimals == "x":
        result = parse_expr(inputString).evalf()
    else:
        result = parse_expr(inputString).evalf(decimals)

    #Convert to latex and send back to client
    resultString += latex(result)
    return json.dumps(resultString)



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

@app.route('/simplifyExpression/', methods=['POST'])
def simplifyExpression():
    #Convert from javascript exponent syntax to python syntax
    inputString = request.json["ex"].replace("^", "**")
    ls = latex(parse_expr(inputString, evaluate=False))
    rs = latex(simplify(inputString))
    result = ls + "=" + rs
    return json.dumps(result)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
