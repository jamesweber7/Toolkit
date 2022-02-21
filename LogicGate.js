class LogicGate {

    /*=============================================
    =                   Binary                    =
    =============================================*/

    static testGate(gate, numInputs, resultReturn=console.log) {
        const iterations = 2**numInputs;
        for (let i = 0; i < iterations; i++) {
            const bitstring = this.bitstringsToPrecision(
                this.toBitString(i),
                numInputs
            );
            const bits = this.split(bitstring)
            resultReturn(gate(bits));
        }
    }

    static bitstringToDecimal(bitstring) {
        return Number.parseInt(bitstring, 2);
    }
    
    static toBitString(num) {
        return num.toString(2);
    }

    static toHexString(num) {
        return num.toString(16);
    }

    static bitToBoolean(bit) {
        if (bit === '1') {
            return true;
        }
        if (bit === '0') {
            return false;
        }
        throw 'invalid bit';
    }

    static booleanToBit(bool) {
        return bool ? '1' : '0'
    }

    
    /*----------  primitive logic gates  ----------*/

    static bitAnd(bits) {
        if (!Array.isArray(bits)) {
            bits = [...arguments];
        }
        for (let i = 0; i < bits.length; i++) {
            if (this.bitToBoolean(this.bitNot(bits[i]))) {
                return '0';
            }
        }
        return '1';
    }

    static twoInputAnd(bitstring1, bitstring2) {
        let andstring = '';
        for (let i = 0; i < bitstring1.length; i++) {
            andstring += this.bitAnd(bitstring1[i], bitstring2[i]);
        }
        return andstring;
    }

    static and(bitstrings) {
        if (!Array.isArray(bitstrings)) {
            bitstrings = [...arguments];
        }
        let andstring = bitstrings[0];
        for (let i = 1; i < bitstrings.length; i++) {
            andstring = this.twoInputAnd(andstring, bitstrings[i]);
        }
        return andstring;
    }

    static bitOr(bits) {
        if (!Array.isArray(bits)) {
            bits = [...arguments];
        }
        for (let i = 0; i < bits.length; i++) {
            if (this.bitToBoolean(bits[i])) {
                return '1';
            }
        }
        return '0';
    }

    static twoInputOr(bitstring1, bitstring2) {
        let orstring = '';
        for (let i = 0; i < bitstring1.length; i++) {
            orstring += this.bitOr(bitstring1[i], bitstring2[i]);
        }
        return orstring;
    }

    static or(bitstrings) {
        if (!Array.isArray(bitstrings)) {
            bitstrings = [...arguments];
        }
        let orstring = bitstrings[0];
        for (let i = 1; i < bitstrings.length; i++) {
            orstring = this.twoInputOr(orstring, bitstrings[i]);
        }
        return orstring;
    }

    static bitNot(bit) {
        const bool = !this.bitToBoolean(bit);
        return this.booleanToBit(bool);
    }

    static not(bitstring) {
        let notstring = '';
        for (let i = 0; i < bitstring.length; i++) {
            notstring += this.bitNot(bitstring[i]);
        }
        return notstring;
    }

    static bitNand(bits) {
        if (!Array.isArray(bits)) {
            bits = [...arguments];
        }
        return this.bitNot(this.bitAnd(bits));
    }

    static nand(bitstrings) {
        if (!Array.isArray(bitstrings)) {
            bitstrings = [...arguments];
        }
        return this.not(this.and(bitstrings));
    }

    static bitNor(bits) {
        if (!Array.isArray(bits)) {
            bits = [...arguments];
        }
        return this.bitNot(this.bitOr(bits));
    }

    static nor(bitstrings) {
        if (!Array.isArray(bitstrings)) {
            bitstrings = [...arguments];
        }
        return this.not(this.or(bitstrings));
    }

    static twoInputBitXor(bit1, bit2) {
        return this.bitAnd(
            this.bitOr(bit1, bit2),
            this.bitNot(this.bitAnd(bit1, bit2))
        );
    }

    static bitXor(bits) {
        if (!Array.isArray(bits)) {
            bits = [...arguments];
        }
        let xorBit = bits[0];
        for (let i = 1; i < bits.length; i++) {
            xorBit = this.twoInputBitXor(xorBit, bits[i]);
        }
        return xorBit;
    }

    static twoInputXor(bitstring1, bitstring2) {
        let xorstring = '';
        for (let i = 0; i < bitstring1.length; i++) {
            xorstring += this.twoInputBitXor(bitstring1[i], bitstring2[i]);
        }
        return xorstring;
    }

    static xor(bitstrings) {
        if (!Array.isArray(bitstrings)) {
            bitstrings = [...arguments];
        }
        let xorBitstring = bitstrings[0];
        for (let i = 1; i < bitstrings.length; i++) {
            xorBitstring = this.twoInputXor(xorBitstring, bitstrings[i]);
        }
        return xorBitstring;
    }

    static bitXnor(bits) {
        if (!Array.isArray(bits)) {
            bits = [...arguments];
        }
        return this.bitNot(this.bitXor(bits));
    }

    static xnor(bitstrings) {
        if (!Array.isArray(bitstrings)) {
            bitstrings = [...arguments];
        }
        return this.not(this.xor(bitstrings));
    }

    
    /*----------  derived logic gates  ----------*/
    
    

    static halfAdder(bit1, bit2) {
        return {
            sum: this.bitXor(bit1, bit2),
            cout: this.bitAnd(bit1, bit2)
        };
    }

    static fullAdder(bit1, bit2, cin) {
        return {
            sum: this.bitXor(bit1, bit2, cin),
            cout: this.bitOr(
                this.bitAnd(bit1, bit2),
                this.bitAnd(bit1, cin),
                this.bitAnd(bit2, cin))
        };
    }

    static fourBitAdder(a, b, cin) {
        let y = '';
        let cout3, cout4;
        let cry = cin;
        for (let i = 3; i >= 0; i--) {
            const fullAdder = this.fullAdder(a[i], b[i], cry);
            const sum = fullAdder.sum;
            cry = fullAdder.cout;
            y = sum + y;
            if (i === 1) {
                cout3 = cry;
            }
            if (i === 0) {
                cout4 = cry;
            }
        }
        const overflow = this.xor(cout3, cout4);
        const cout = cout4;
        return {
            y: y,
            overflow: overflow,
            cout: cout
        };
    }

    static standardizeBitStringLengths(bitstrings) {
        if (!Array.isArray(bitstrings)) {
            bitstrings = [...arguments];
        }
        const longestBitstring = Wunctions.getGreatestElement(bitstrings, (bitstring) => {
            return bitstring.length;
        });
        const length = longestBitstring.length;
        for (let i = 0; i < bitstrings.length; i++) {
            bitstrings[i] = this.bitstringsToPrecision(bitstrings[i], length);
        }
        return bitstrings;
    }

    static twoInputAdd(bitstring1, bitstring2) {
        // make sure bitstrings are same length
        const lengthNormalizedBitStrings = this.standardizeBitStringLengths(bitstring1, bitstring2);
        bitstring1 = lengthNormalizedBitStrings[0];
        bitstring2 = lengthNormalizedBitStrings[1];

        const length = bitstring1.length;

        let result = '';
        let cry = '0';
        for (let i = length - 1; i >= 0; i--) {
            const bit1 = bitstring1[i];
            const bit2 = bitstring2[i];
            const adder = this.fullAdder(bit1, bit2, cry);
            result = adder.sum + result;
            cry = adder.cout;
        }
        if (this.bitToBoolean(cry)) {
            result = '1' + result;
        }
        return result;
    }

    static add(bitstrings) {
        if (!Array.isArray(bitstrings)) {
            bitstrings = [...arguments];
        }
        let sum = bitstrings[0];
        for (let i = 1; i < bitstrings.length; i++) {
            sum = this.twoInputAdd(sum, bitstrings[i]);
        }
        return sum;
    }

    static sub() {

    }

    // >
    static gt() {

    }

    // ≥
    static geq() {

    }

    // <
    static lt() {

    }

    // ≤
    static leq() {

    }

    static eq(bitstrings) {
        bitstrings = this.standardizeBitStringLengths(bitstrings);
        let bitstring = bitstrings[0];
        for (let i = 1; i < bitstrings.length; i++) {
            if (bitstrings[i] !== bitstring) {
                return '0';
            }
        }
        return '1';
    }

    static zero(bitstring) {
        return this.eq(bitstring, '0');
    }

    static removeLeadingZeros(bitstring) {
        if (this.zero(bitstring)) {
            return '0';
        }
        return StringReader.substring(bitstring, '1');
    }

    static mux(inputs, selector) {
        const index = this.bitstringToDecimal(selector);
        return inputs[index];
    }

    static demux(enable, selector) {
        const length = 2**selector.length;
        const selected = this.bitstringToDecimal(selector);
        let output = this.bitstringsToPrecision('', length);
        if (this.bitToBoolean(this.not(enable))) {
            return output;
        }        
        output = StringReader.replaceAt(output, '1', selected);
        return output;
    }

    static split(bitstring) {
        return bitstring.split('');
    }

    static merge(bitstrings) {
        if (!Array.isArray(bitstrings)) {
            bitstrings = [...arguments];
        }
        let bitstring = '';
        for (let i = 0; i < bitstrings.length; i++) {
            bitstring += bitstrings[i];
        }
        return bitstring;
    }

    static sll() {

    }

    static srl() {

    }

    static incrementer(a, inc) {
        let cry = inc;
        let y = '';
        for (let i = 3; i >= 0; i--) {
            const halfAdder = this.halfAdder(a[i], cry);
            cry = halfAdder.cout;
            y = halfAdder.sum + y;
        }
        return {
            y: y,
            cry: cry
        };
    }

    static notNeg(a, invert, neg) {
        let xor = '';
        for (let i = 0; i < 4; i++) {
            xor += this.xor(a[i], invert);
        }
        const inc = this.bitAnd(invert, neg);
        return this.incrementer(xor, inc);
    }

    // a, b 16 bits
    static andAdd(a, b, cin, add, pass) {
        const fourBitAdder = this.fourBitAdder(a, b, cin);

        const cout = fourBitAdder.cout;
        const overflow = fourBitAdder.overflow;
        const y = this.mux([
            this.mux([
                    this.and(a, b),
                    fourBitAdder.y
                ],
                add
            ), 
            a
        ], 
        pass);
        return {
            y: y,
            cout: cout,
            overflow: overflow
        };
    }

    // a, b 16 bits
    static alu(a, b, cin, invert, arith, pass) {
        const notNeg = this.notNeg(a, invert, arith);
        return this.andAdd(notNeg.y, b, cin, arith, pass);
    }

    static twoComplement(bitstring) {
        return this.add(this.not(bitstring), '1');
    }

    static bitstringsToPrecision(bitstring, precision) {
        while (bitstring.length < precision) {
            bitstring = '0' + bitstring;
        }
        return bitstring;
    }

    static toIEEE754Float(num) {
        let bitstring = this.toBitString(num);

    }

    static parseIEEE754Float(reg) {

    }
    
    /*=====  End of Binary  ======*/

}