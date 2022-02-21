

/*=============================================
=            Variable Declarations            =
=============================================*/

const calculusTestCases = [
    {
        desc: "xᶜ",
        x: new RangedVariable(1.1, 5),
        a: new RangedVariable(0, 4, 0),
        b: new RangedVariable(5, 10, 0),
        c: new RangedVariable(0, 5),
        funct: (x, c) => {
            return x**c;
        },
        integral: (x, c) => {
            return x**(c + 1) / (c + 1);
        },
        derivative: (x, c) => {
            return c * x ** (c - 1);
        }
    },
    {
        desc: "sin(x)",
        x: new RangedVariable(0, 2*Math.PI),
        a: new RangedVariable(-10, 0, 0),
        b: new RangedVariable(1, 10, 0),
        c: new RangedVariable(0, 5),
        funct: (x, c) => {
            return Math.sin(x);
        },
        integral: (x, c) => {
            return -Math.cos(x);
        },
        derivative: (x, c) => {
            return Math.cos(x);
        }
    },
    {
        desc: "cˣ",
        x: new RangedVariable(0, 5),
        a: new RangedVariable(-100, 0),
        b: new RangedVariable(0, 5, 0),
        c: new RangedVariable(1.001, 5),
        funct: (x, c) => {
            return c**x;
        },
        integral: (x, c) => {
            return c**x / Math.log(c);
        },
        derivative: (x, c) => {
            return c**x * Math.log(c);
        }
    },
    {
        desc: "c^sin(x)",
        x: new RangedVariable(0, 2*Math.PI),
        a: new RangedVariable(-10, 0, 0),
        b: new RangedVariable(1, 10, 0),
        c: new RangedVariable(1.001, 5),
        funct: (x, c) => {
            return c**Math.sin(x);
        },
        integral: (x, c) => {
            throw 'do the integral urself nerd';
        },
        derivative: (x, c) => {
            return c**Math.sin(x) * Math.log(c) * Math.cos(x);
        }
    }
];

/*=====  End of Variable Declarations  ======*/






/*=============================================
=                   Content                   =
=============================================*/











/*----------  Tests  ----------*/

function testIntegrals() {
    let testCase = calculusTestCases[0];
    const numIterations = 1;

    let normBiggestError = 0;
    let normTotalError = 0;
    let trapBiggestError = 0;
    let trapTotalError = 0;

    for (let i = 0; i < numIterations; i++) {
        let x = 0, c = 0;
        x = testCase.x.gen();
        c = testCase.c.gen();

        let actual = testCase.integral(x, c);
        console.log(x, c, actual);

        let norm = Wath.integral((x) => {
            return testCase.funct(x, c);
        }, x);
        let normError = Wath.absDifference(norm, actual);
        normTotalError += normError;
        if (normError > normBiggestError) {
            normBiggestError = normError;
        }
        
        let trap = Wath.trapeziumIntegral((x) => {
            return testCase.funct(x, c);
        }, x);
        let trapError = Wath.absDifference(trap, actual);
        trapTotalError += trapError;
        if (trapError > trapBiggestError) {
            trapBiggestError = trapError;
        }

        if (isNaN(normError) || normError > Number.MAX_SAFE_INTEGER) {
            console.log('ERRORS');
            console.log(i);
            console.log(x, c);
            console.log(actual, norm, trap);
            console.log(normError, trapError);
            return;
        }
    }

    console.log('norm total error', normTotalError);
    console.log('norm biggest error', normBiggestError);
    console.log('norm avg error', normTotalError / numIterations);

    console.log('trap total error', trapTotalError);
    console.log('trap biggest error', trapBiggestError);
    console.log('trap avg error', trapTotalError / numIterations);
    
}



function testDerivatives() {
    let testCase = calculusTestCases[3];
    const numIterations = 10000;

    let leftBiggestError = 0;
    let leftTotalError = 0;
    let rightBiggestError = 0;
    let rightTotalError = 0;
    let derivBiggestError = 0;
    let derivTotalError = 0;

    for (let i = 0; i < numIterations; i++) {
        let x = 0, c = 0;
        x = testCase.x.gen();
        c = testCase.c.gen();

        let actual = testCase.derivative(x, c);

        let left = Wath.leftDerivative((x) => {
            return testCase.funct(x, c);
        }, x);
        let leftError = getError(left, actual);
        leftTotalError += leftError;
        if (leftError > leftBiggestError) {
            leftBiggestError = leftError;
        }
        
        let right = Wath.rightDerivative((x) => {
            return testCase.funct(x, c);
        }, x);
        let rightError = getError(right, actual);
        rightTotalError += rightError;
        if (rightError > rightBiggestError) {
            rightBiggestError = rightError;
        }

        let deriv = Wath.derivative((x) => {
            return testCase.funct(x, c);
        }, x);
        let derivError = getError(deriv, actual);
        derivTotalError += derivError;
        if (derivError > derivBiggestError) {
            derivBiggestError = derivError;
        }

        if (isNaN(leftError) || leftError > Number.MAX_SAFE_INTEGER) {
            console.log('ERRORS');
            console.log(i);
            console.log(x, c);
            console.log(actual, left, right, deriv);
            console.log(leftError, rightError, derivError);
            return;
        }
    }

    console.log('left total error', leftTotalError);
    console.log('left biggest error', leftBiggestError);
    console.log('left avg error', leftTotalError / numIterations);

    console.log('right total error', rightTotalError);
    console.log('right biggest error', rightBiggestError);
    console.log('right avg error', rightTotalError / numIterations);

    console.log('deriv total error', derivTotalError);
    console.log('deriv biggest error', derivBiggestError);
    console.log('deriv avg error', derivTotalError / numIterations);
    
}



/*=====  End of Content  ======*/


/*=============================================
=                    Dom                      =
=============================================*/

let calculatorMagicSet = Wom.createMagicSet('calculator');
const calculatorWand = calculatorMagicSet.wand;
document.body.append(calculatorWand);
const calculatorMagicbox = calculatorMagicSet.magicbox;
document.body.append(calculatorMagicbox);


const calculator = Wom.createTo(calculatorMagicbox, 'std-inout', 'calculator');

calculator.append('Calculator');

const calculatorOutput = Wom.createTo(calculator, 'output', 'calculator-output');
const calculatorInput = Wom.createTextarea('calculator-input');
calculator.append(calculatorInput);

calculatorInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        if (e.shiftKey) {
            return;
        }
        e.preventDefault();
        try {
            display(eval(Number.parseFloat(new Function('', `return ${calculatorInput.value};`)())));
        } catch (err) {
            displayError(err);
        }
    }
}


function display(result) {
    calculatorOutput.innerText = result;
}

function displayError(err) {
    calculatorOutput.innerText = '';
    let errEL = Wom.createTo(calculatorOutput, 'err');
    errEL.innerText = 'NaN\n';
    errEL.innerText += err;
}

/*=====  End of Dom  ======*/

