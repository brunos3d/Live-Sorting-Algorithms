class Sound {
    constructor(context) {
        this.context = context;
    }

    init() {
        this.oscillator = this.context.createOscillator();
        this.gainNode = this.context.createGain();

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
        this.oscillator.type = "sine";
    }

    play(value, time) {
        this.init();

        this.oscillator.frequency.value = value;
        this.gainNode.gain.setValueAtTime(1, this.context.currentTime);

        this.oscillator.start(time);
        this.stop(time);
    }

    stop(time) {
        this.oscillator.stop(time + 1);
    }
}

const canvas = document.getElementById("canvas-board");

const context = canvas.getContext("2d");
const audio_context = new (window.AudioContext || window.webkitAudioContext)();

const width = canvas.width;
const height = canvas.height;

let trail = [];

window.onload = Start;

function timer(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function Swap(index1, index2, time = 50) {
    let temp = trail[index1];
    trail[index1] = trail[index2];
    trail[index2] = temp;

    await timer(time);
    PlaySoundOneShot(index1);
    Repaint(index1);
}

function Start() {
    for (let x = 0; x < width; x++) {
        trail[x] = (x + 1) * (width / height);
    }
    Repaint();
}

async function Reset() {
    for (let x = 0; x < width; x++) {
        trail[x] = (x + 1) * (width / height);

        await timer(15);
        PlaySoundOneShot(x);
        Repaint(x);
    }
}

async function Shuffle() {
    let currentIndex = trail.length;
    let randomIndex;
    let loopIndex = 0;

    while (loopIndex++ < trail.length) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        await Swap(currentIndex, randomIndex, 10);
    }
}

async function BubbleSort() {
    let endIndex = trail.length - 1;
    while (endIndex > 0) {
        let swaps = 0;
        let currentIndex = 0;
        while (currentIndex < endIndex) {
            if (trail[currentIndex] > trail[currentIndex + 1]) {
                await Swap(currentIndex, currentIndex + 1);
                swaps++;
            }
            currentIndex++;
        }
        if (swaps === 0) break;
        endIndex--;
    }
    await Reset();
}

async function SelectionSort() {
    let smallestIndex = 0;
    let currentIndex = 1;
    let beginningIndex = 0;
    while (beginningIndex < trail.length) {
        while (currentIndex < trail.length) {
            if (trail[smallestIndex] > trail[currentIndex]) {
                smallestIndex = currentIndex;
            }
            currentIndex++;
        }
        if (smallestIndex !== beginningIndex) {
            await Swap(smallestIndex, beginningIndex);
        }
        beginningIndex++;
        currentIndex = beginningIndex + 1;
        smallestIndex = beginningIndex;
    }
    await Reset();
}

async function InsertionSort() {
    let beginningIndex = 0;
    let currentIndex = 1;
    while (currentIndex < trail.length) {
        while (currentIndex > 0) {
            currentVal = trail[currentIndex];
            if (currentVal <= trail[currentIndex - 1]) {
                await Swap(currentIndex, currentIndex - 1);
                currentIndex--;
            } else {
                break;
            }
        }
        beginningIndex++;
        currentIndex = beginningIndex + 1;
    }
    await Reset();
}

function PlaySoundOneShot(index) {
    const note = new Sound(audio_context);
    const now = audio_context.currentTime;

    note.play(index * 10, now - 0.9);
}

function Repaint(currentIndex = -1) {
    ClearCanvas();

    for (let x = 0; x < width; x++) {
        const color = currentIndex === x ? "#fff" : LerpColor("#FF6363", "#7863FF", trail[x] / width);
        DrawColumn(x, trail[x], color);
    }
}

function ClearCanvas() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
}

function DrawColumn(coord_x, length, color) {
    context.fillStyle = color;
    context.fillRect(coord_x, height - length, 1, length);
}

function SetPixel(coord_x, coord_y, color) {
    context.fillStyle = color;
    context.fillRect(coord_x, coord_y, 1, 1);
}

function LerpColor(a, b, amount) {
    let ah = +a.replace("#", "0x");
    let ar = ah >> 16,
        ag = (ah >> 8) & 0xff,
        ab = ah & 0xff;
    let bh = +b.replace("#", "0x");
    let br = bh >> 16,
        bg = (bh >> 8) & 0xff,
        bb = bh & 0xff;
    let rr = ar + amount * (br - ar);
    let rg = ag + amount * (bg - ag);
    let rb = ab + amount * (bb - ab);

    return "#" + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1);
}
