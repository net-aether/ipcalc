/**
 * (c) 2021-2025 Aethernet
 * Licensed under the MIT License
 */

const answers = Array("subnet", "net-adr", "broadcast-adr", "first-adr", "last-adr", "adr-count");
const Qgerman = Array(
    "Subnetzmaske in 'dotted decimal':",
    "Netzwerkadresse in 'dotted decimal':",
    "Broadcastadresse in 'dotted decimal':",
    "Erste m\u00F6gliche Hostadresse in 'dotted decimal':",
    "Letze m\u00F6gliche Hostadresse in 'dotted decimal':",
    "Anzahl der m\u00F6glichen Hostadressen:"
);
const Qenglish = Array(
    "Subnetmask in dotted decimal:",
    "Network adress in dotted decimal:",
    "Broadcast adress in dotted decimal:",
    "First possible host adress in dotted decimal:",
    "Last possible host adress in dotted decimal:",
    "Amount of possible host adresses:"
);
let ip = () => document.getElementById("IP").value;
let subnetBits = () => document.getElementById("MASK").value;
window.addEventListener("load", () => {
        generate();

        // load the flags
        gerFlag = document.getElementById("flag-german");
        engFlag = document.getElementById("flag-english");
        // add listeners
        gerFlag.addEventListener("click", german);
        engFlag.addEventListener("click", english);

        english();
    }
);

// Language
let gerFlag, engFlag;

let german = () => {
    gerFlag.classList.add("active");
    engFlag.classList.remove("active");

    for (let i = 0; i < 6; i++) document.getElementById("Q" + answers[i]).innerText = Qgerman[i];
    document.getElementById("check").innerText = "Pr\u00FCfen";
    document.getElementById("solution").innerText = "L\u00F6sung";
    document.getElementById("reset").innerText = "neue IP";
}

let english = () => {
    engFlag.classList.add("active");
    gerFlag.classList.remove("active");

    for (let i = 0; i < 6; i++) document.getElementById("Q" + answers[i]).innerText = Qenglish[i];
    document.getElementById("check").innerText = "check";
    document.getElementById("solution").innerText = "solution";
    document.getElementById("reset").innerText = "new IP";
}
// "Frontend"

function fixIP() {
    if ((parseInt(document.getElementById("MASK").value) < 0 || 
            parseInt(document.getElementById("MASK").value) > 30) ||
            !document.getElementById("MASK").value.match(/^\d+$/g))
        document.getElementById("MASK").value = generateSubnetBits();

    if (!document.getElementById("IP").value.match(/^[0-2]?\d{1,2}\.[0-2]?\d{1,2}\.[0-2]?\d{1,2}\.[0-2]?\d{1,2}$/g)) {
        document.getElementById("IP").value = generateIp();
    }
}

function generate() {
    document.getElementById("IP").value = generateIp();
    document.getElementById("MASK").value = generateSubnetBits();
    
    clearClasses(true);
}

function showSolution() {
    fixIP();
    clearClasses(false);
    const ipBytes = ipToBytes(ip());

    // subnet mask
    let subnetMaskCalc = 0;
    for (let i = 31; i > 31 - subnetBits() && i >= 0; i--)
        subnetMaskCalc |= 1 << i;
    document.getElementById("subnet").value = ipFromBytes(subnetMaskCalc);
    
    // netAddr
    let netAddrCalc = 0;
    for (let i = 31; i > 31 - subnetBits() && i >= 0; i--)
        netAddrCalc |= ipBytes & 1 << i;
    document.getElementById("net-adr").value = ipFromBytes(netAddrCalc);

    // bcAddr
    let bcAddrCalc = netAddrCalc;
    for (let i = 0; i <= 31 - subnetBits(); i++)
        bcAddrCalc |= 1 << i;
    document.getElementById("broadcast-adr").value = ipFromBytes(bcAddrCalc);

    // calculate firstHost
    let firstHostCalc = netAddrCalc + 1;
    document.getElementById("first-adr").value = ipFromBytes(firstHostCalc);
    
    // calculate lastHost
    let lastHostCalc = bcAddrCalc - 1;
    document.getElementById("last-adr").value = ipFromBytes(lastHostCalc);

    // calculate hostAmount
    // let hostAmountCalc = ((2 << 31 - subnetBits()) - 2) >>> 0
    document.getElementById("adr-count").value = (((2 << 31 - subnetBits()) - 2) >>> 0).toString();
}

function clearClasses(clearValue) {
    answers.forEach(e => {
        let answer = document.getElementById(e);
        answer.classList.remove("right");
        answer.classList.remove("wrong");
        if (clearValue) answer.value = "";
    });
}

function generateIp() {
    return ipFromBytes(Math.floor(Math.random() * 0xFFFFFFFF));
}

function generateSubnetBits() {
    return Math.floor(Math.random() * 30);
}

function checkAndGetAnswers() {
    fixIP();
    let flags = checkAnswers(
        ip(),
        subnetBits(),
        document.getElementById("subnet").value,
        document.getElementById("net-adr").value,
        document.getElementById("broadcast-adr").value,
        document.getElementById("first-adr").value,
        document.getElementById("last-adr").value,
        document.getElementById("adr-count").value
    );

    clearClasses(false);

    for (let i = 0; i < answers.length; i++) {
        let answer = document.getElementById(answers[i]);
        if ((flags >>> i) & 1 == 1) answer.classList.add("wrong");
        else answer.classList.add("right");
    }
}

// Internal

function checkAnswers(/* task: */ ip, subnetBits, /* user input: */ subnetMask, netAddr, bcAddr, firstHost, lastHost, hostAmount) {
    const ipBytes = ipToBytes(ip);
    /*
     * flag >>> 0 & 1 == 1 -> subnetMask wrong
     * flag >>> 1 & 1 == 1 -> netAddr wrong
     * flag >>> 2 & 1 == 1 -> bcAddr wrong
     * flag >>> 3 & 1 == 1 -> firstHost wrong
     * flag >>> 4 & 1 == 1 -> lastHost wrong
     * flag >>> 5 & 1 == 1 -> hostAmount wrong
     */
    let flag = 0;

    // calculate subnetMask
    let subnetMaskCalc = 0;
    for (let i = 31; i > 31 - subnetBits && i >= 0; i--)
        subnetMaskCalc |= 1 << i;
    try {
        if (ipFromBytes(subnetMaskCalc) !== subnetMask.toString())
            flag |= 1 << 0;
    } catch (error) { flag |= 1 << 0; }

    // calculate netAddr
    let netAddrCalc = 0;
    for (let i = 31; i > 31 - subnetBits && i >= 0; i--)
        netAddrCalc |= ipBytes & 1 << i;
    try {
        if (ipFromBytes(netAddrCalc) !== netAddr.toString())
            flag |= 1 << 1;
    } catch (error) { flag |= 1 << 1; }

    // calculate bcAddr
    let bcAddrCalc = netAddrCalc;
    for (let i = 0; i <= 31 - subnetBits; i++)
        bcAddrCalc |= 1 << i;
    try {
        if (ipFromBytes(bcAddrCalc) !== bcAddr.toString())
            flag |= 1 << 2;
    } catch (error) { flag |= 1 << 2; }

    // calculate firstHost
    let firstHostCalc = netAddrCalc + 1;
    try {
        if (ipFromBytes(firstHostCalc) !== firstHost.toString())
            flag |= 1 << 3;
    } catch (error) { flag |= 1 << 3; }
    
    // calculate lastHost
    let lastHostCalc = bcAddrCalc - 1;
    try {
        if (ipFromBytes(lastHostCalc) !== lastHost.toString())
            flag |= 1 << 4;
    } catch (error) { flag |= 1 << 4; }

    // calculate hostAmount
    let hostAmountCalc = ((2 << 31 - subnetBits) - 2) >>> 0;
    // let hostAmountCalc = (lastHostCalc >>> 0 - netAddrCalc >>> 0) >>> 0;
    try {
        if ((hostAmountCalc >>> 0).toString() !== hostAmount.toString())
            flag |= 1 << 5;
    } catch (error) { flag |= 1 << 5; }
        
    return flag;
}

function ipToBytes(ip) {
    ip = ip.toString().split(".");
    if (ip.length != 4)
        return 0;
    return  (parseInt(ip[0]) > 0xFF ? 0xFF : parseInt(ip[0])) << 24 |
            (parseInt(ip[1]) > 0xFF ? 0xFF : parseInt(ip[1])) << 16 |
            (parseInt(ip[2]) > 0xFF ? 0xFF : parseInt(ip[2])) <<  8 |
            (parseInt(ip[3]) > 0xFF ? 0xFF : parseInt(ip[3]));
}

function ipFromBytes(bytes) {
    return  (bytes >>> 24 & 0xFF).toString() + "." + 
            (bytes >>> 16 & 0xFF).toString() + "." + 
            (bytes >>>  8 & 0xFF).toString() + "." + 
            (bytes        & 0xFF).toString();
}

// You dirty little cheater
let sequence = 0;
document.addEventListener('keypress', e => {
    switch (e.code) {
        case "KeyC":
            if (sequence == 0) sequence++;
            else sequence = 0;
            break;
        case "KeyH":
            if (sequence == 1) sequence++;
            else sequence = 0;
            break;
        case "KeyE":
            if (sequence == 2) sequence++;
            else sequence = 0;
            break;
        case "KeyA":
            if (sequence == 3) sequence++;
            else sequence = 0;
            break;
        case "KeyT":
            if (sequence == 4) sequence++;
            else sequence = 0;
            break;
        case "Enter":
            if (sequence == 5) {
                document.getElementById("IP").value = "192.168.0.0";
                document.getElementById("MASK").value = 24;
                alert("You dirty little cheater! ;>");
                
                clearClasses(true);
            }
            sequence = 0;
            break;
        default:
            sequence = 0;
            break;
    }
});
