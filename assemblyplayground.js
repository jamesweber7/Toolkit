
/*----------  DOM  ----------*/

let assemblyMagicSet = Wom.createMagicSet('assembly');
const assemblyWand = assemblyMagicSet.wand;
document.body.append(assemblyWand);
const assemblyMagicBox = assemblyMagicSet.magicbox;
document.body.append(assemblyMagicBox);
Wom.openMagicBox(assemblyMagicBox);

const assemblyVisualizer = Wom.createTo(assemblyMagicBox, 'std-inout', 'assembly-visualizer');

Wom.createStyleBody('table tr *', `
    padding: 0 10px;
    display: inline-table;
    width: auto;
`);

const visualizerOutput = Wom.createTo(assemblyVisualizer, 'output', 'visualizer-output');

Wom.createStyleBody('#assembly-visualizer input', `
    display: inline-block;
    width: auto;
    margin: 0 20px;
`);

const truthTableGateInput = Wom.createTo(assemblyVisualizer, 'input', 'truth-table-equation');
const truthTableNumInputs = Wom.createTo(assemblyVisualizer, 'input', 'truth-table-num-inputs');

assemblyVisualizer.onkeydown = (e) => {
    if (e.key === 'Enter') {
        try {
            createTruthTable();
        } catch (err) {
            console.error(err);
        }
    }
}

function createTruthTable() {

    visualizerOutput.innerText = '';

    const funct = getGateFunct(truthTableGateInput.value);
    const outputs = getGateOutputs(truthTableGateInput.value);

    const gateFunc = (bits) => {
        return {
            bits: bits,
            result: funct(bits)
        };
    };
    const numInputs = truthTableNumInputs.value;

    const truthTable = Wom.createTo(visualizerOutput, 'table');

    const testcases = [];
    LogicGate.testGate(
        gateFunc,
        numInputs,
        (result) => {
            testcases.push(result);
        }
    );

    let row = Wom.createTo(truthTable, 'tr');
    for (let i = 0; i < numInputs; i++) {
        const el = Wom.createTo(row, 'th');
        el.innerText = StringReader.getAlphabeticString(i);
    }
    const el = Wom.createTo(row, 'th');
    el.innerText = truthTableGateInput.value.replaceAll('LogicGate.', '');

    testcases.forEach(test => {
        const row = Wom.createTo(truthTable, 'tr');
        test.bits.forEach(bit => {
            const el = Wom.createTo(row, 'td');
            el.innerText = bit;
        });
        const el = Wom.createTo(row, 'td');
        el.innerText = test.result;
    });

    function getGateFunct(funct) {
        if (funct.includes('and')) {
            return () => {
                return LogicGate.and(...arguments);
            }
        }
        if (funct.includes('or')) {
            return () => {
                return LogicGate.or(...arguments);
            }
        }
        if (funct.includes('nand')) {
            return () => {
                return LogicGate.nand(...arguments);
            }
        }
        if (funct.includes('nor')) {
            return () => {
                return LogicGate.nor(...arguments);
            }
        }
        if (funct.includes('xor')) {
            return () => {
                return LogicGate.xor(...arguments);
            }
        }
        if (funct.includes('not')) {
            return () => {
                return LogicGate.not(...arguments);
            }
        }
        if (funct.includes('xand')) {
            return () => {
                return LogicGate.xand(...arguments);
            }
        }
        if (funct.includes('xnor')) {
            return () => {
                return LogicGate.xnor(...arguments);
            }
        }
    }

    function getGateOutputs(funct) {
        if (funct.includes('and')) {
            return 1;
        }
        if (funct.includes('or')) {
            return 1;
        }
        if (funct.includes('nand')) {
            return 1;
        }
        if (funct.includes('nor')) {
            return 1;
        }
        if (funct.includes('xor')) {
            return 1;
        }
        if (funct.includes('not')) {
            return 1;
        }
        if (funct.includes('xand')) {
            return 1;
        }
        if (funct.includes('xnor')) {
            return 1;
        }
        if (funct.toLowerCase().includes('adder')) {
            return 2;
        }
    }

}