
// for state machines, I decided to go OO

class ClockTriggeredGate {
    constructor() {
        this._clk = '0';
    }
    // rising edge trigger
    isClockPulse(clk, pClk=this._clk) {
        if (LogicGate.bitToBool(
            LogicGate.and(
                LogicGate.not(pClk),
                clk
            )
        )) {
            return true;
        }
    }
    updateClockPulse(clk) {
        this._clk = clk;
    }
}

class ClockExclusiveGate extends ClockTriggeredGate {
    write(input) {
        if (!Array.isArray(input)) {
            input = [...arguments];
        }
        const clk = input.pop();
        const wires = input;
        if (this.isClockPulse(clk)) {
            this.updateWires(...wires)
        }
        this.updateClockPulse(clk);
    }
}

/*=============================================
=                  Flip Flops                 =
=============================================*/

class D_FlipFlop extends ClockTriggeredGate {

    constructor(numBits=1) {
        super();
        this.q = LogicGate.empty(numBits);
        this.notq = LogicGate.not(this.q);
    }

    write(d, clk) {
        // on clk pulse
        if (this.isClockPulse(clk)) {
            this.q = d;
            this.notq = LogicGate.not(this.q);
        }
        this.updateClockPulse(clk);
    }

}

// D Flip Flop with async set & clr
class D_FlipFlopAsync extends D_FlipFlop {

    write(d, set, clr, clk) {
        // set
        if (LogicGate.bitToBool(set)) {
            this.q = '1';
            this.notq = '0';
            this.updateClockPulse();
        }
        // clr
        if (LogicGate.bitToBool(clr)) {
            this.q = '0';
            this.notq = '1';
            this.updateClockPulse(clk);
            return;
        }
        super.write(d, clk);
    }

}

class S_R_FlipFlop extends ClockTriggeredGate {
    constructor() {
        super();
        this.q = '0';
        this.notq = '1';
    }

    write(s, r, clk) {
        // on clk pulse
        if (this.isClockPulse(clk)) {
            if (LogicGate.bitToBool(
                LogicGate.and(s, r)
            )) {
                throw "s and r can't both be high";
            }

            // Q⁺ = S+QR'
            this.q = LogicGate.or(
                s,
                LogicGate.and(
                    this.q,
                    LogicGate.not(r)
                )
            );
            this.notq = LogicGate.not(this.q);
        }
        this.updateClockPulse(clk);
    }
}

class J_K_FlipFlop extends ClockTriggeredGate {
    constructor() {
        super();
        this.q = '0';
        this.notq = '1';
    }
    write(j, k, clk) {
        // on clk pulse
        if (this.isClockPulse(clk)) {
            // Q⁺ = Q'J + QK'
            this.q = LogicGate.or(
                LogicGate.and(
                    this.notq,
                    j
                ),
                LogicGate.and(
                    this.q,
                    LogicGate.not(k)
                )
            );
            this.notq = LogicGate.not(this.q);
        }
        this.updateClockPulse(clk);
    }
}

/*=====  End of Flip Flops  ======*/

class FourBitRegister {
    constructor() {
        this.q = '0000';
        this._dFlipFlops = new Array(4);
        for (let i = 0; i < this._dFlipFlops.length; i++) {
            this._dFlipFlops[i] = new D_FlipFlopAsync();
        }
    }
    write(d, enable, reset, clk) {
        const fourBitMux = LogicGate.mux([this.q, d], enable);
        let qPlus = '';
        for (let i = 0; i < 4; i++) {
            const dFlipFlop = this._dFlipFlops[i];
            const set = '0';
            dFlipFlop.write(fourBitMux[i], set, reset, clk);
            qPlus += dFlipFlop.q;
        }
        this.q = qPlus;
    }
}

class Ram extends ClockTriggeredGate {

    constructor(data) {
        super();
        this._data = data;
    }

    setData(data) {
        this._data = data;
    }

    static randomized(regLength, numRegisters) {
        const data = new Array(numRegisters);
        for (let i = 0; i < data.length; i++) {
            data[i] = LogicGate.bitstringToPrecision(
                LogicGate.toBitString(
                    Wath.randomInt(0, 2**regLength - 1)
                ),
                regLength
            );
        }
        return new this(data);
    }

    static empty(regLength, numRegisters) {
        const data = new Array(numRegisters);
        for (let i = 0; i < data.length; i++) {
            data[i] = LogicGate.empty(regLength);
        }
        return new this(data);
    }
}

// RAM with only one read address
class SingleReadRam extends Ram {
    constructor(data) {
        super(data);
        this._addr = 0;
        this.dataOut = this._data[this._addr];
    }

    write(addr, dataIn, write, clk) {
        // addr updated async
        this._addr = addr;
        if (this.isClockPulse(clk)) {
            if (LogicGate.bitToBool(write)) {
                this._data[
                    LogicGate.bitstringToDecimal(this._addr)
                ] = dataIn;
            }
        }
        this.dataOut = LogicGate.mux(this._data, this._addr);
        this.updateClockPulse(clk);
    }

    read(addr) {
        this._addr = addr;
        this.dataOut = this._data[
            LogicGate.bitstringToDecimal(
                LogicGate.mux(this._data, this._addr)
            )
        ];
    }

    static setData(data) {
        this._data = data;
        this.addr = 0;
        this.dataOut = this._data[this.addr];
    }

}

class MipsDataRam extends SingleReadRam {
    write(addr, dataIn, read, write, clk) {
        this._addr = addr;
        if (this.isClockPulse(clk)) {
            if (LogicGate.bitToBool(write)) {
                this._data[
                    LogicGate.bitstringToDecimal(this._addr)
                ] = dataIn;
            }
        }
        if (LogicGate.bitToBool(read)) {
            this.dataOut = LogicGate.bitstringToDecimal(
                LogicGate.mux(this._data, this._addr)
            )
        }
        this.updateClockPulse(clk);
    }
}

class MipsRegisterRam extends Ram {
    constructor(data) {
        super(data);
        this._addr1 = LogicGate.empty(5);
        this.readData1 = LogicGate.mux(this._data, this._addr1);
        this._addr2 = LogicGate.empty(5);
        this.readData2 = LogicGate.mux(this._data, this._addr2);
    }

    write(readReg1, readReg2, writeReg, writeData, regWrite, clk) {
        // write updated first, then read
        if (this.isClockPulse(clk)) {
            if (LogicGate.bitToBool(regWrite)) {
                this._data[
                    LogicGate.bitstringToDecimal(writeReg)
                ] = writeData;
            }
        }
        // read data updated async
        this._addr1 = readReg1;
        this.readData1 = LogicGate.mux(this._data, this._addr1);
        this._addr2 = readReg2;
        this.readData2 = LogicGate.mux(this._data, this._addr2);
        this.updateClockPulse(clk);
    }

    read(readReg1, readReg2) {
        this._addr1 = readReg1;
        this.readData1 = LogicGate.mux(this._data, this._addr1);
        this._addr2 = readReg2;
        this.readData2 = LogicGate.mux(this._data, this._addr2);
    }

    static setData(data) {
        this._data = data;
        this.addr1 = LogicGate.empty(5);
        this.readData1 = LogicGate.mux(this._data, this._addr1);
        this.addr2 = LogicGate.empty(5);
        this.readData2 = LogicGate.mux(this._data, this._addr2);
    }

    static randomized(regLength, numRegisters) {
        const data = new Array(numRegisters);
        for (let i = 0; i < data.length; i++) {
            data[i] = LogicGate.bitstringToPrecision(
                LogicGate.toBitString(
                    Wath.randomInt(0, 2**regLength - 1)
                ),
                regLength
            );
        }
        return new this(data);
    }

    static empty(regLength, numRegisters) {
        const data = new Array(numRegisters);
        for (let i = 0; i < data.length; i++) {
            data[i] = LogicGate.empty(regLength);
        }
        return new this(data);
    }
}

// let brainless = new BrainlessCPU();
// console.log(brainless.aluOut, brainless.accum, brainless.dataBus);

// let dataIn, dataBus, invert, arith, pass, loadAcc, accToDb, reset, clk, write, read;

// dataIn = '0';
// dataBus = '0';
// invert = '0';
// arith = '0';
// pass = '0';
// loadAcc = '0';
// accToDb = '0';
// reset = '0';
// clk = '0';
// write = '0';
// read = '0';

// brainless.write(dataIn, dataBus, invert, arith, pass, loadAcc, accToDb, reset, read, write, clk);
// console.log(brainless.aluOut, brainless.accum, brainless.dataBus);

class BrainlessCPU {
    constructor() {
        // stored gates:
        this._accumulator = new FourBitRegister();
        // ram with 16 randomly filled 4-bit registers
        this._programRam = SingleReadRam.randomized(4, 16);
        // outputs:
        this.aluOut = '0000';
        this.accum = '0000';
        this.dataBus = '0000';
    }

    executeInstruction(dataIn, addrBus, invert, arith, pass, loadAcc, accToDb, reset, read, write) {
        // no clk pulse
        this.write(dataIn, addrBus, invert, arith, pass, loadAcc, accToDb, reset, read, write, '0');
        // clk pulse
        this.write(dataIn, addrBus, invert, arith, pass, loadAcc, accToDb, reset, read, write, '1');
        // no clk pulse
        this.write(dataIn, addrBus, invert, arith, pass, loadAcc, accToDb, reset, read, write, '0');
    }

    write(dataIn, addrBus, invert, arith, pass, loadAcc, accToDb, reset, read, write, clk) {

        this.readProgramRam(addrBus);

        this.updateMuxesToDataBus(dataIn, accToDb, read);

        this.updateAluOut(invert, arith, pass);

        this.updateAccumulator(loadAcc, reset, clk);

        this.updateMuxesToDataBus(dataIn, accToDb, read);

        this.updateProgramRam(addrBus, write, clk);

    }
    
    /*----------  Update Components  ----------*/
    updateMuxesToDataBus(dataIn, accToDb, read) {
        const dataMux = this.dataMux(dataIn, read);
        const accumMux = this.accumMux(dataMux, accToDb);
        this.dataBus = accumMux;
    }

    updateAccumulator(loadAcc, reset, clk) {
        this._accumulator.write(
            this.aluOut,
            loadAcc,
            reset,
            clk
        );
        this.accum = this._accumulator.q;
    }

    updateAluOut(invert, arith, pass) {
        const alu = this.alu(invert, arith, pass);
        this.aluOut = alu.y;
    }

    updateProgramRam(addrBus, write, clk) {
        this._programRam.write(
            addrBus,
            this.dataBus,
            write,
            clk
        );
    }
    
    /*----------  Components  ----------*/

    readProgramRam(addr) {
        this._programRam.read(addr);
    }
    
    alu(invert, arith, pass) {
        const aluCin = '0';
        return LogicGate.ALU16(
            this.dataBus, 
            this.accum, 
            aluCin, 
            invert,
            arith,
            pass
        );
    }
    

    dataMux(dataIn, read) {
        return LogicGate.mux(
            dataIn,
            this._programRam.dataOut,
            read
        );
    }

    accumMux(dataMux, accToDb) {
        return LogicGate.mux(
            dataMux,
            this.accum,
            accToDb
        );
    }

}

// I think I can use a stateless function, but we'll see
class MipsControl extends ClockTriggeredGate {
    constructor() {
        this.regDst = LogicGate.empty(1);
        this.branch = LogicGate.empty(1);
        this.memRead = LogicGate.empty(1);
        this.memToReg = LogicGate.empty(1);
        this.aluOp = LogicGate.empty(2);    // 2 bits
        this.memWrite = LogicGate.empty(1);
        this.aluSrc = LogicGate.empty(1);
        this.regWrite = LogicGate.empty(1);
    }

    updateWires(opcode) {
        
    }
}

class Mips {
    constructor() {
        // RAM
        // just 64 instructions for now, def gonna do a lot of work on this later
        const numInstructions = 64;
        const dataMemorySize = 64;
        this._instructionMemory = SingleReadRam.empty(32, numInstructions);
        this._dataMemory = SingleReadRam.empty(32, dataMemorySize);
        this._registerMemory = MipsRegisterRam.empty(32, 32);
        // PC
        this._pc = new D_FlipFlop(32);
        // Wires:
        this._writeRegister = LogicGate.empty(32);
        this._writeData = LogicGate.empty(32);

        // pipelines
        this._ifToId = new InstrFetchToInstrDecodePipeline();
        this._idToEx = new InstrDecodeToAluExPipeline();
        this._exToMem = new AluExToMemPipeline();
        this._memToWb = new MemToWriteBackPipeline();
        this._wb = new WriteBack();
    }

    write(clk) {
        this.writeBack(clk);
        this.mem(clk);
        this.execAlu(clk);
        this.instructionDecodeRegRead(clk);
        this.instructionFetch(clk);
    }

    
    /*----------  Pipelines  ----------*/

    writeBack(clk) {
        const pipeline = this._memToWb;
        console.log('GETTIN STUFF IN WB');
        console.log(pipeline);
        console.log(pipeline.aluResult);
        if (pipeline.aluResult === '00000000000000000000000000000100') {
            for (let i = 0; i < 100; i++) {
                console.log('STUFF');
            }
        }
        // note: some diagrams have indexes reversed mux indexes here. Make sure to look at indexes if referencing a diagram.
        const writeData = LogicGate.mux(
            pipeline.aluResult, 
            pipeline.readData, 
            pipeline.memToReg
        );

        this._wb.write(
            pipeline.regDst,
            pipeline.regWrite,
            writeData,
            pipeline.writeReg,
            clk
        );
        console.log('finished wb');
        console.log(this._wb);
        console.log(this._wb.writeData);
    }

    mem(clk) {
        const pipeline = this._exToMem;
        console.log('gettin stuff');
        console.log(pipeline);
        console.log(pipeline.aluResult);
        console.log('IS CLOCK?');
        console.log(clk);
        this._dataMemory.write(
            pipeline.aluResult, 
            pipeline.writeData, 
            pipeline.memWrite, 
            clk
        );
        const readData = this._dataMemory.dataOut;
        this._memToWb.write(
            pipeline.regWrite,
            pipeline.memToReg,
            pipeline.regDst,
            readData,
            pipeline.aluResult,
            pipeline.writeReg,
            clk
        );
        console.log('finished mem');
        console.log(this._memToWb);
    }

    execAlu(clk) {
        console.log('CLOCK PULSE : ', clk);
        if (clk === '1') {
            for (let i = 0; i < 100; i++) {
                console.log('CLOCK PULSE');
            }
        }
        const pipeline = this._idToEx;
        const funct = pipeline.funct;
        const aluOp = pipeline.aluOp;
        const opcode = LogicGate.mipsALUControl(funct, aluOp);
        const a = pipeline.readData1;
        const b = LogicGate.mux(
            pipeline.readData2,
            pipeline.immediate,
            pipeline.aluSrc
        );
        console.log('DOING ALU');
        console.log(a, b, opcode);
        const alu = LogicGate.mipsAlu(a, b, opcode);
        console.log('ALU RESULT:');
        console.log(alu);

        const shiftedImmediate = LogicGate.shiftLeftTwo(pipeline.immediate, '1');
        const pc = LogicGate.addAlu32(shiftedImmediate, pipeline.pc);
        console.log('CLOCK PULSE : ', clk);
        if (clk === '1') {
            for (let i = 0; i < 100; i++) {
                console.log('CLOCK PULSE');
            }
        }
        console.log('WRITING:', pc,
        pipeline.branch,
        alu.zero,
        pipeline.memRead,
        pipeline.memToReg,
        pipeline.memWrite,
        alu.result,
        pipeline.readData2,
        clk);

        const writeReg = LogicGate.mux(
            pipeline.rt,
            pipeline.rd,
            pipeline.regDst
        );

        this._exToMem.write(
            pc,
            pipeline.branch,
            pipeline.regDst,
            pipeline.regWrite,
            alu.zero,
            pipeline.memRead,
            pipeline.memToReg,
            pipeline.memWrite,
            alu.result,
            pipeline.readData2,
            writeReg,
            clk
        );
        console.log('finished alu ex');
        console.log(this._exToMem);
        console.log('ALU RESULT OF THING:');
        console.log(this._exToMem.aluResult);
        console.log(this._exToMem);
    }

    instructionDecodeRegRead(clk) {
        const pipeline = this._ifToId;
        const instruction = LogicGate.split(pipeline.instruction, 6, 5, 5, 5, 5, 6);
        // Control
        const opcode = instruction[0];
        const control = this.control(opcode);

        const rs = instruction[1];
        const rt = instruction[2];
        const rd = instruction[3];
        // Registers
        const readReg1 = rs;
        const readReg2 = rt;
        const writeReg = LogicGate.mux(
            rt,
            rd,
            this._wb.regDst
        );
        const shiftAmt = instruction[4];
        const funct = instruction[5];

        
        const writeData = this._wb.writeData;
        const immediate = LogicGate.split(pipeline.instruction, 16, 16)[1];
        // const regWrite = control.regWrite;
        const regWrite = this._wb.regWrite;

        console.log('UPDATING REGISTERS:');
        console.log(readReg1, readReg2, writeReg, writeData, regWrite, clk);
        // update registers
        this._registerMemory.write(readReg1, readReg2, writeReg, writeData, regWrite, clk);
        console.log('REGISTERS OUTPUT:');
        console.log(this._registerMemory.readData1, this._registerMemory.readData2);
        // signal extend
        const immediate32 = this.signalExtend(immediate);

        // update ID → EX pipeline
        this._idToEx.write(
            pipeline.pc, 
            control.regDst,
            control.branch,
            control.memRead,
            control.memToReg,
            control.memWrite,
            control.aluSrc,
            control.regWrite,
            this._registerMemory.readData1, 
            this._registerMemory.readData2,
            immediate32,
            funct,
            control.aluOp,
            rt,
            rd,
            clk
        );
        console.log('finished instr dec');
        console.log(this._idToEx);
    }

    instructionFetch(clk) {
        // get last pc
        let pcWire = this._pc.q;
        // increment last pc
        // I'm changing to increment by 1 for now
        // 4
        // const pcIncrement = '00000000000000000000000000000100';
        const pcIncrement = '00000000000000000000000000000001';
        pcWire = LogicGate.addAlu32(pcWire, pcIncrement);
        // update pc
        const pcSrc = LogicGate.and(
            this._exToMem.zero,
            this._exToMem.branch
        );
        this._pc.write(
            LogicGate.mux(
                pcWire,             // prev pc + 4
                this._exToMem.pc,   // processed pc (b & j)
                pcSrc               // pc selector from control
            ),
            clk
        );
        // get new pc
        pcWire = this._pc.q;

        // read instruction
        this._instructionMemory.write(pcWire, LogicGate.empty(32), '0', clk);
        const instruction = this._instructionMemory.dataOut;

        // update IF → ID pipeline
        this._ifToId.write(
            pcWire,
            instruction,
            clk
        );
        console.log('finished instr fetch');
        console.log(this._ifToId);
    }

    
    /*----------  Gates  ----------*/
    
    

    control(opcode) {
        let regDst = LogicGate.empty(1);
        let branch = LogicGate.empty(1);
        let memRead = LogicGate.empty(1);
        let memToReg = LogicGate.empty(1);
        let aluOp = LogicGate.empty(2);    // 2 bits
        let memWrite = LogicGate.empty(1);
        let aluSrc = LogicGate.empty(1);
        let regWrite = LogicGate.empty(1);

        // R-format
        if (opcode === '000000') {
            regDst = '1'
            branch = '0'
            memRead = '0';
            memToReg = '0';
            aluOp = '10';
            memWrite = '0';
            aluSrc = '0';
            regWrite = '1';
        }
        // lw
        else if (opcode === '100011') {
            regDst = '0'
            branch = '0'
            memRead = '1';
            memToReg = '1';
            aluOp = '00';
            memWrite = '0';
            aluSrc = '1';
            regWrite = '1';
        }
        // sw
        else if (opcode === '101011') {
            regDst = '1'
            branch = '0'
            memRead = '0';
            memToReg = '0';
            aluOp = '00';
            memWrite = '1';
            aluSrc = '1';
            regWrite = '0';
        }

        return {
            regDst:     regDst,
            branch :    branch,
            memRead :   memRead,
            memToReg :  memToReg,
            aluOp :     aluOp,
            memWrite :  memWrite,
            aluSrc:     aluSrc,
            regWrite :  regWrite
        };
    }

    signalExtend(bitstring16) {
        return LogicGate.merge(
            LogicGate.empty(16),
            bitstring16
        );
    }

    
    /*----------  Helpers  ----------*/
    
    setInstructions(instructions) {
        this._instructionMemory.setData(instructions);
    }

}

class PipelineRegister extends ClockTriggeredGate {
    write(input) {
        if (!Array.isArray(input)) {
            input = [...arguments];
        }
        const clk = input.pop();
        const wires = input;
        if (this.isClockPulse(clk)) {
            this.updateWires(...wires)
        }
        this.updateClockPulse(clk);
    }
}

class InstrFetchToInstrDecodePipeline extends PipelineRegister {
    constructor() {
        super();
        this.pc = LogicGate.empty(32);
        this.instruction = LogicGate.empty(32);
    }
    updateWires(pc, instruction) {
        this.pc = pc;
        this.instruction = instruction;
    }
}

class InstrDecodeToAluExPipeline extends PipelineRegister {
    constructor() {
        super();
        this.pc = LogicGate.empty(32);
        this.regDst = LogicGate.empty(1);
        this.branch = LogicGate.empty(1);
        this.memRead = LogicGate.empty(1);
        this.memToReg = LogicGate.empty(1);
        this.memWrite = LogicGate.empty(1);
        this.aluSrc = LogicGate.empty(1);
        this.regWrite = LogicGate.empty(1);
        this.readData1 = LogicGate.empty(32);
        this.readData2 = LogicGate.empty(32);
        this.immediate = LogicGate.empty(32);
        this.funct = LogicGate.empty(6);
        this.aluOp = LogicGate.empty(2);
        this.rt = LogicGate.empty(5);
        this.rd = LogicGate.empty(5);
    }
    updateWires(pc, regDst, branch, memRead, memToReg, memWrite, aluSrc, regWrite, readData1, readData2, immediate, funct, aluOp, rt, rd) {
        this.pc = pc;
        this.regDst = regDst;
        this.branch = branch;
        this.memRead = memRead;
        this.memToReg = memToReg;
        this.memWrite = memWrite;
        this.aluSrc = aluSrc;
        this.regWrite = regWrite;
        this.readData1 = readData1;
        this.readData2 = readData2;
        this.immediate = immediate;
        this.funct = funct;
        this.aluOp = aluOp;
        this.rt = rt;
        this.rd = rd;
    }
}

class AluExToMemPipeline extends PipelineRegister {
    constructor() {
        super();
        this.pc = LogicGate.empty(32);
        this.regDst = LogicGate.empty(1);
        this.branch = LogicGate.empty(1);
        this.regWrite = LogicGate.empty(1);
        this.zero = LogicGate.empty(1);
        this.memRead = LogicGate.empty(1);
        this.memToReg = LogicGate.empty(1);
        this.memWrite = LogicGate.empty(1);
        this.aluResult = LogicGate.empty(32);
        this.writeData = LogicGate.empty(32);
        this.writeReg = LogicGate.empty(5);
    }
    updateWires(pc, branch, regDst, regWrite, zero, memRead, memToReg, memWrite, aluResult, writeData, writeReg) {
        this.pc = pc;
        this.regDst = regDst;
        this.branch = branch;
        this.regWrite = regWrite;
        this.zero = zero;
        this.memRead = memRead;
        this.memToReg = memToReg;
        this.memWrite = memWrite;
        this.aluResult = aluResult;
        this.writeData = writeData;
        this.writeReg = writeReg;
    }
}

class MemToWriteBackPipeline extends PipelineRegister {
    constructor() {
        super();
        this.regWrite = LogicGate.empty(1);
        this.memToReg = LogicGate.empty(1);
        this.regDst = LogicGate.empty(1);
        this.readData = LogicGate.empty(32);
        this.aluResult = LogicGate.empty(32);
        this.writeReg = LogicGate.empty(5);
    }
    updateWires(regWrite, memToReg, regDst, readData, aluResult, writeReg) {
        this.regWrite = regWrite;
        this.memToReg = memToReg;
        this.regDst = regDst;
        this.readData = readData;
        this.aluResult = aluResult;
        this.writeReg = writeReg;
    }
}

class WriteBack extends PipelineRegister {
    constructor() {
        super();
        this.regDst = LogicGate.empty(1);
        this.regWrite = LogicGate.empty(1);
        this.writeData = LogicGate.empty(32);
        this.writeReg = LogicGate.empty(5);
    }
    updateWires(regDst, regWrite, writeData, writeReg) {
        this.regDst = regDst;
        this.regWrite = regWrite;
        this.writeData = writeData;
        this.writeReg = writeReg;
    }
}

