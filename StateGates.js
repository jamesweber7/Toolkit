
// for logic gates that rely on state, I decided to go OO

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

/*=============================================
=                  Flip Flops                 =
=============================================*/

class D_FlipFlop extends ClockTriggeredGate {

    constructor() {
        super();
        this.q = '0';
        this.notq = '1';
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
        this.dataOut = this._data[
            LogicGate.bitstringToDecimal(this._addr)
        ];
        this.updateClockPulse(clk);
    }

    read(addr) {
        this._addr = addr;
        this.dataOut = this._data[
            LogicGate.bitstringToDecimal(this._addr)
        ];
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
        this._programRam = Ram.randomized(4, 16);
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
        return LogicGate.alu(
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