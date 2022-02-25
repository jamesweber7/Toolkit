

/*=============================================
=                 MIPS                        =
=============================================*/

const mips = new Mips();

// set register values
mips._registerMemory._data[0] = '11111111111111111111111111111111'  // $0
mips._registerMemory._data[1] = '00000000000000000000000000000001'  // $1 = 1
mips._registerMemory._data[2] = '00000000000000000000000000000011'  // $2 = 3

// ADD INSTRUCTION
// $0 = $1 + $2
let opcode = '000000';       // 0     
let rs = '00001';            // $1
let rt = '00010';            // $2
let rd = '00000';            // $0
let shamt = '00000';         // n/a / 0
let funct = '100000'         // 0x20

const instruction = opcode + rs + rt + rd + shamt + funct;
// give instructions
const instructions = [
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    instruction,
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000',
    '11111100000000000000000000000000'
];
mips.setInstructions(instructions);
for (let i = 0; i < 9; i++) {
    mips.write('0');
    mips.write('1');
    mips.write('0');
    console.log('_______CYCLE_'+i+'_OVER_______');
}


/*=====  End of MIPS  ======*/





/*----------  Brainless  ----------*/


const brainless = new BrainlessCPU();
let dataIn, invert, arith, pass, loadAcc, accToDb, reset, write, read;

// testBrainless();
// testBrainless2();
// testBrainless3();

function sendInstruction() {
    brainless.executeInstruction(dataIn, addrBus, invert, arith, pass, loadAcc, accToDb, reset, read, write);
}

// TIME: 1 CLK Pulses
// R[rt] = imm
function li(rt, imm) {

    dataIn = imm;
    addrBus = rt;

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '1';
    loadAcc = '0';
    accToDb = '0';
    reset = '0';
    write = '1';
    read = '0';

    sendInstruction();
}

// TIME: 2 CLK Pulses
// R[rt] = R[rs]
function move(rt, rs) {

    // R[rs] to acc 
    // 4 BITS
    dataIn = '0000';
    addrBus = rs;

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '1';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '1';

    sendInstruction();

    // write to R[rt]
    // R[rt] = R[rs]
    addrBus = rt;

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '1';
    reset = '0';
    write = '1';
    read = '0';

    sendInstruction();
}

// TIME: 3 CLK Pulses
// R[rd] = R[rs] + R[rt]
function add(rd, rs, rt) {

    // load R[rs] to acc

    // 4 BITS
    dataIn = '0000';
    addrBus = rs;

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '1';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '1';

    sendInstruction();

    // R[rs] + R[rt] to acc

    // 4 BITS
    dataIn = '0000';
    addrBus = rt;

    // 1 BIT
    invert = '0';
    arith = '1';
    pass = '0';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '1';

    sendInstruction();

    // R[rd] = R[rs] + R[rt]
    // write R[rs] + R[rt] to R[rd]

    // 4 BITS
    dataIn = '0000';
    addrBus = rd;

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '1';
    reset = '0';
    write = '1';
    read = '0';

    sendInstruction();
}

// R[rd] = R[rt] + imm
function addi(rd, rt, imm) {

    // load R[rt] to acc

    // 4 BITS
    dataIn = imm;
    addrBus = rt;

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '1';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '1';

    sendInstruction();

    // imm + R[rt] to acc

    // 4 BITS
    dataIn = imm;
    addrBus = rt;

    // 1 BIT
    invert = '0';
    arith = '1';
    pass = '0';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '0';

    sendInstruction();

    // R[rd] = R[rs] + R[rt]
    // write R[rs] + R[rt] to R[rd]

    // 4 BITS
    dataIn = '0000';
    addrBus = rd;

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '1';
    reset = '0';
    write = '1';
    read = '0';

    sendInstruction();
}

// R[rd] = R[rt] - imm
function sub(rd, rt, rs) {

}

function resetBrainless() {
    // 4 BITS
    dataIn = '0000';
    addrBus = '0000';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '0';
    reset = '1';
    write = '0';
    read = '0';
}

function printData() {
    console.log(brainless._programRam._data);
}

function printBrainless() {
    console.log(brainless);
}

function printState() {
    console.log(brainless.aluOut, brainless.accum, brainless.dataBus, brainless._programRam.dataOut);
}



/*=============================================
=                  TESTS                      =
=============================================*/

function testBrainless3() {
    printData();
    printState();

    li('0010', '1111');           // li       $02  15       # $02 = 15

    move('0001', '0011');         // move     $01 $03       # $01 = $03

    add('1000', '0100', '0101');  // add      $08 $04 $05   # $08 = $04 + $05

    addi('1001', '1000', '0001')  // addi     $09 $08   1   # $10 = $08 + 1

    printData();
    printState();
}


function testBrainless2() {

    let brainless = new BrainlessCPU();

    let dataIn, invert, arith, pass, loadAcc, accToDb, reset, write, read;

    function resetOpcode() {
        // 4 BITS
        dataIn = '0000';
        addrBus = '0000';

        // 1 BIT
        invert = '0';
        arith = '0';
        pass = '0';
        loadAcc = '0';
        accToDb = '0';
        reset = '1';
        write = '0';
        read = '0';
    }

    function printData() {
        console.log(brainless._programRam._data);
    }

    function printBrainless() {
        console.log(brainless);
    }

    function printState() {
        console.log(brainless.aluOut, brainless.accum, brainless.dataBus, brainless._programRam.dataOut);
    }

    function sendInstruction() {
        brainless.executeInstruction(dataIn, addrBus, invert, arith, pass, loadAcc, accToDb, reset, read, write);
    }

    printBrainless();
    printData();
    printState();

    // READ:

    // DESCRIPTION:
    // read ram @ index 0
    console.log(`read ram addr[0] (${brainless._programRam._data[0]})`);

    // 4 BITS
    dataIn = '0000';
    addrBus = '0000';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '0';
    reset = '0';
    clk = '1';
    write = '0';
    read = '1';

    sendInstruction();
    printState();
    console.log(`read: (${brainless.dataBus})`);

    // DESCRIPTION:
    // read ram @ index 3 (0011)
    console.log(`read ram addr[3] (${brainless._programRam._data[3]})`);

    // 4 BITS
    dataIn = '0000';
    addrBus = '0011';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '1';

    sendInstruction();
    printState();
    console.log(`read: (${brainless.dataBus})`);


    resetOpcode();

    sendInstruction();
    printState();


    // WRITE:

    console.log('write 1111 to ram addr[3]');

    // DESCRIPTION:
    // write 1111 to ram @ index 3 (0011)

    // 4 BITS
    dataIn = '1111';
    addrBus = '0011';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '0';
    reset = '0';
    write = '1';
    read = '0';

    sendInstruction();
    printState();

    console.log(`written ram addr[3]: ${brainless._programRam._data[3]}`);

    // reset
    resetOpcode();
    sendInstruction();
    printState();

    // ADD OPERATION:
    // 3 (0011) + ram[5] (0101)
    console.log("3 (0011) + ram addr[5] (0101):");
    console.log(`0011 + ${brainless._programRam._data[5]} = ${LogicGate.add('0011', brainless._programRam._data[5])}`);

    // DESCRIPTION:
    // load ram[5] to acc

    // 4 BITS
    dataIn = '0011';
    addrBus = '0101';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '1';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '1';

    sendInstruction();
    printState();


    // DESCRIPTION:
    // add dataIn to ram[5] (acc)

    // 4 BITS
    dataIn = '0011';
    addrBus = '0101';

    // 1 BIT
    invert = '0';
    arith = '1';
    pass = '0';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '0';

    sendInstruction();
    printState();

    // DESCRIPTION:
    // move sum (acc) to db

    // 4 BITS
    dataIn = '0011';
    addrBus = '0101';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '1';
    reset = '0';
    write = '0';
    read = '0';

    sendInstruction();
    printState();
    console.log(`sum: ${brainless.dataBus}`);

    // RESET

    resetOpcode();

    sendInstruction();
    printState();


    // SUB OPERATION:
    // 15 (1111) - ram[1]
    console.log("15 (1111) - ram addr[1]:");
    console.log(`1111 - ${brainless._programRam._data[1]} = ${LogicGate.sub('1111', brainless._programRam._data[1])}`);

    // DESCRIPTION:
    // load 1111 to acc

    // 4 BITS
    dataIn = '1111';
    addrBus = '0001';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '1';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '0';

    sendInstruction();
    printState();

    sendInstruction();
    printState();

    // DESCRIPTION:
    // sub dataIn (acc) - ram[1]

    // 4 BITS
    dataIn = '1111';
    addrBus = '0001';

    // 1 BIT
    invert = '1';
    arith = '1';
    pass = '0';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    write = '0';
    read = '1';

    sendInstruction();
    printState();

    // DESCRIPTION:
    // move sum (acc) to db

    // 4 BITS
    dataIn = '1111';
    addrBus = '0001';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '1';
    reset = '0';
    write = '0';
    read = '0';

    sendInstruction();
    printState();

    console.log(`diff: ${brainless.dataBus}`);

    // reset
    resetOpcode();

    sendInstruction();
    printState();


}

function testBrainless() {

    let brainless = new BrainlessCPU();

    let dataIn, invert, arith, pass, loadAcc, accToDb, reset, clk, write, read;

    function resetOpcode() {
        // 4 BITS
        dataIn = '0000';
        addrBus = '0000';

        // 1 BIT
        invert = '0';
        arith = '0';
        pass = '0';
        loadAcc = '0';
        accToDb = '0';
        reset = '1';
        clk = '0';
        write = '0';
        read = '0';
    }

    function printData() {
        console.log(brainless._programRam._data);
    }

    function printBrainless() {
        console.log(brainless);
    }

    function printState() {
        console.log(brainless.aluOut, brainless.accum, brainless.dataBus, brainless._programRam.dataOut);
    }

    function writeToBrainless() {
        brainless.write(dataIn, addrBus, invert, arith, pass, loadAcc, accToDb, reset, read, write, clk);
    }

    printBrainless();
    printData();
    printState();

    // READ:

    // DESCRIPTION:
    // read ram @ index 0
    console.log(`read ram addr[0] (${brainless._programRam._data[0]})`);

    // 4 BITS
    dataIn = '0000';
    addrBus = '0000';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '0';
    reset = '0';
    clk = '1';
    write = '0';
    read = '1';

    writeToBrainless();
    printState();
    console.log(`read: (${brainless.dataBus})`);

    // DESCRIPTION:
    // read ram @ index 3 (0011)
    console.log(`read ram addr[3] (${brainless._programRam._data[3]})`);

    // 4 BITS
    dataIn = '0000';
    addrBus = '0011';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '0';
    reset = '0';
    clk = '1';
    write = '0';
    read = '1';

    writeToBrainless();
    printState();
    console.log(`read: (${brainless.dataBus})`);


    resetOpcode();

    writeToBrainless();
    printState();


    // WRITE:

    console.log('write 1111 to ram addr[3]');

    // DESCRIPTION:
    // write 1111 to ram @ index 3 (0011)

    // 4 BITS
    dataIn = '1111';
    addrBus = '0011';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '0';
    reset = '0';
    clk = '1';
    write = '1';
    read = '0';

    writeToBrainless();
    printState();

    console.log(`written ram addr[3]: ${brainless._programRam._data[3]}`);

    // reset
    resetOpcode();
    writeToBrainless();
    printState();

    // ADD OPERATION:
    // 3 (0011) + ram[5] (0101)
    console.log("3 (0011) + ram addr[5] (0101):");
    console.log(`0011 + ${brainless._programRam._data[5]} = ${LogicGate.add('0011', brainless._programRam._data[5])}`);

    // DESCRIPTION:
    // load ram[5] to acc

    // 4 BITS
    dataIn = '0011';
    addrBus = '0101';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '1';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    clk = '1';
    write = '0';
    read = '1';

    writeToBrainless();
    printState();

    // reset clk

    // 4 BITS
    dataIn = '0011';
    addrBus = '0101';

    // 1 BIT
    invert = '0';
    arith = '1';
    pass = '0';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    clk = '0';
    write = '0';
    read = '0';

    writeToBrainless();
    printState();

    // DESCRIPTION:
    // add dataIn to ram[5] (acc)

    // 4 BITS
    dataIn = '0011';
    addrBus = '0101';

    // 1 BIT
    invert = '0';
    arith = '1';
    pass = '0';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    clk = '1';
    write = '0';
    read = '0';

    writeToBrainless();
    printState();

    // DESCRIPTION:
    // move sum (acc) to db

    // 4 BITS
    dataIn = '0011';
    addrBus = '0101';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '1';
    reset = '0';
    clk = '0';
    write = '0';
    read = '0';

    writeToBrainless();
    printState();
    console.log(`sum: ${brainless.dataBus}`);

    // reset
    resetOpcode();
    writeToBrainless();
    printState();


    // SUB OPERATION:
    // 15 (1111) - ram[1]
    console.log("15 (1111) - ram addr[1]:");
    console.log(`1111 - ${brainless._programRam._data[1]} = ${LogicGate.sub('1111', brainless._programRam._data[1])}`);

    // DESCRIPTION:
    // load 1111 to acc

    // 4 BITS
    dataIn = '1111';
    addrBus = '0001';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '1';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    clk = '1';
    write = '0';
    read = '0';

    writeToBrainless();
    printState();

    // reset clk

    // 4 BITS
    dataIn = '1111';
    addrBus = '0001';

    // 1 BIT
    invert = '1';
    arith = '1';
    pass = '0';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    clk = '0';
    write = '0';
    read = '1';

    writeToBrainless();
    printState();

    // DESCRIPTION:
    // sub dataIn (acc) - ram[1]

    // 4 BITS
    dataIn = '1111';
    addrBus = '0001';

    // 1 BIT
    invert = '1';
    arith = '1';
    pass = '0';
    loadAcc = '1';
    accToDb = '0';
    reset = '0';
    clk = '1';
    write = '0';
    read = '1';

    writeToBrainless();
    printState();

    // DESCRIPTION:
    // move sum (acc) to db

    // 4 BITS
    dataIn = '1111';
    addrBus = '0001';

    // 1 BIT
    invert = '0';
    arith = '0';
    pass = '0';
    loadAcc = '0';
    accToDb = '1';
    reset = '0';
    clk = '0';
    write = '0';
    read = '0';

    writeToBrainless();
    printState();

    console.log(`diff: ${brainless.dataBus}`);

    // reset
    resetOpcode();
    writeToBrainless();
    printState();


}

/*=====  End of TESTS  ======*/








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