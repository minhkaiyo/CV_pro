const SEED_SUBJECTS = [
    {
        id: 'ky-thuat-vi-xu-ly',
        name: 'Microprocessors',
        description: 'Comprehensive study of computer architecture, the 8086 instruction set, and Assembly programming.',
        icon: 'fa-microchip',
        color: '#2563eb',
        topics: [
            {
                id: 'cau-truc-assembly-8086',
                title: '8086 Assembly Program Structure',
                content: `## 📋 Overview

A standard 8086 Assembly program consists of 4 main sections:

### 1. Memory Model Declaration
\`\`\`assembly
.model small
\`\`\`
- **small**: Uses 1 segment for code (64KB) and 1 segment for data (64KB).
- Other options: \`tiny\`, \`medium\`, \`compact\`, \`large\`, \`huge\`.

### 2. Stack Declaration
\`\`\`assembly
.stack 100h
\`\`\`
- Allocates **256 bytes** (100h) for the stack.
- Stack is used to temporarily store data and return addresses during function calls.

### 3. Data Declaration (.data)
\`\`\`assembly
.data
    msg DB 'Hello World$'    ; String ending with $
    num DW 1234h             ; 16-bit variable (Word)
    arr DB 10 DUP(0)         ; Array of 10 elements, initialized to 0
\`\`\`
**Data types:**
| Keyword | Size | Meaning |
|---------|-----------|---------|
| DB | 1 byte | Define Byte |
| DW | 2 bytes | Define Word |
| DD | 4 bytes | Define Doubleword |

### 4. Code Section (.code)
\`\`\`assembly
.code
main proc
    mov ax, @data     ; Load the address of data segment
    mov ds, ax        ; Move it to DS register

    ; ... program logic ...

    mov ah, 4Ch       ; Function to exit program
    int 21h           ; Call DOS interrupt
main endp
end main
\`\`\`

### 5. Important DOS Interrupts (INT 21h)
| AH | Function | Parameters |
|----|-----------|---------|
| 01h | Input a character | AL = input character |
| 02h | Print a character | DL = character to print |
| 09h | Print a string | DX = address of the string (must end with $) |
| 0Ah | Input a string | DX = buffer address |
| 4Ch | Exit program | AL = error code |`
            },
            {
                id: 'lenh-in-chuoi-int21h',
                title: 'String Output and INT 21h Interrupts',
                content: `## 🖨️ Printing Strings to the Screen

### Basic Syntax
\`\`\`assembly
mov ah, 09h      ; Select function 09h: Print string
lea dx, msg      ; LEA = Load Effective Address
int 21h          ; Call DOS interrupt
\`\`\`

### Detailed Line-by-Line Explanation

**Line 1: \`mov ah, 09h\`**
- The **AH** register contains the function number to call.
- **09h** = prints a character string to the console screen.
- Convention: AH must always be set before calling INT 21h.

**Line 2: \`lea dx, msg\`**
- **LEA** (Load Effective Address) loads the **address** of the \`msg\` variable into DX.
- Equivalent to: \`mov dx, OFFSET msg\`.
- DX must point to the first byte of the string.

**Line 3: \`int 21h\`**
- **INT** (Interrupt) calls software interrupt number 21h (DOS interrupt).
- DOS reads AH to determine which function to execute.
- It then reads DX to find where the string is in memory.
- Prints each character until it encounters the **$** character.

### ⚠️ Critical Notes
1. The string **MUST** end with the \`$\` character (ASCII code 24h).
2. The \`$\` character itself is **NOT** printed to the screen.
3. If you forget the \`$\`, the program will print garbage until it happens to find a 24h byte in memory.

### Complete Example
\`\`\`assembly
.model small
.stack 100h
.data
    msg DB 'Hello, Assembly!', 0Dh, 0Ah, '$'
    ;        String content  | CR | LF | End
    ; 0Dh = Carriage Return (move cursor to start of line)
    ; 0Ah = Line Feed (move cursor down to next line)
.code
main proc
    mov ax, @data
    mov ds, ax

    mov ah, 09h
    lea dx, msg
    int 21h

    mov ah, 4Ch
    int 21h
main endp
end main
\`\`\``
            },
            {
                id: 'thuat-toan-dao-chuoi',
                title: 'String Reversing Algorithm',
                content: `## 🔄 Reversing a String Using a Stack

### 1. Algorithmic Idea
Utilize the **LIFO (Last In First Out)** mechanism of the stack:
1. Read each character of the source string → **PUSH** it onto the Stack.
2. **POP** each character out → they will naturally come out in reverse order.

> Example: PUSH "ABC" into Stack → POP gives "CBA".

### 2. Key Registers
| Register | Function |
|-----------|-----------|
| **SI** (Source Index) | Points to the source string (original string) |
| **DI** (Destination Index) | Points to the destination memory (reversed string) |
| **CX** (Counter) | Counts characters / controls loop iterations |
| **AL** | Temporarily stores the character being processed |

### 3. Detailed Sample Code
\`\`\`assembly
; ====== STEP 1: PUSH each character onto Stack ======
    lea si, original_string    ; SI points to start of string
    mov cx, length             ; CX = number of characters

push_loop:
    mov al, [si]               ; Read 1 character at SI position
    push ax                    ; Push onto Stack (note: push is 16-bit)
    inc si                     ; Advance SI to the next character
    loop push_loop             ; CX--, repeat if CX≠0

; ====== STEP 2: POP out → reversed string ======
    lea di, reversed_string    ; DI points to destination
    mov cx, length             ; Reset CX

pop_loop:
    pop ax                     ; Pop character from Stack
    mov [di], al               ; Write to destination
    inc di                     ; Advance DI to the next position
    loop pop_loop              ; Repeat until done
\`\`\`

### 4. Step-by-Step Visualization
Let the original string be **"HELLO"**:

**PUSH Step (entering Stack):**
\`\`\`
Push 'H' → Stack: [H]
Push 'E' → Stack: [H, E]
Push 'L' → Stack: [H, E, L]
Push 'L' → Stack: [H, E, L, L]
Push 'O' → Stack: [H, E, L, L, O]  ← top of Stack
\`\`\`

**POP Step (retrieving):**
\`\`\`
Pop → 'O'   Reversed: "O"
Pop → 'L'   Reversed: "OL"
Pop → 'L'   Reversed: "OLL"
Pop → 'E'   Reversed: "OLLE"
Pop → 'H'   Reversed: "OLLEH"  ✅
\`\`\`
`
            }
        ]
    },
    {
        id: 'dien-tu-tuong-tu-1',
        name: 'Analog Electronics 1',
        description: 'Overview of BJT Transistors and analysis of amplifier configurations: Common Emitter (CE), Common Base (CB), Common Collector (CC).',
        icon: 'fa-bolt',
        color: '#f59e0b',
        topics: [
            {
                id: 'tong-quan-3-mach-bjt',
                title: 'Overview of 3 BJT Amplifier Configurations: CE, CB, CC',
                content: `## ⚡ Transistor Amplifier Configurations
A Bipolar Junction Transistor (BJT) has 3 terminals: **B** (Base), **C** (Collector), and **E** (Emitter). Depending on which terminal is used as the **common ground** for both input and output signals, we have 3 amplifier configurations:

![Amplifier Configurations](/bjt-amplifiers.png)

1. **Common Emitter (CE):** Emitter is connected to AC ground. Input is at B, output at C.
2. **Common Base (CB):** Base is connected to AC ground. Input is at E, output at C.
3. **Common Collector (CC):** Collector is connected to Vcc (acting as AC ground). Input is at B, output at E.

### 📊 Comparative Analysis

| Feature | Common Emitter (CE) | Common Base (CB) | Common Collector (CC) |
| :--- | :--- | :--- | :--- |
| **Input Signal** | Base | Emitter | Base |
| **Output Signal** | Collector | Collector | Emitter |
| **Phase Shift** | **Inverted (180°)** | Non-inverted (0°) | Non-inverted (0°) |
| **Voltage Gain ($A_v$)** | High | High | Approximately 1 ($< 1$) |
| **Current Gain ($A_i$)** | High ($≈ \beta$) | Approximately 1 ($< 1$) | High ($≈ \beta$) |
| **Input Impedance ($R_{in}$)** | Medium (a few kΩ) | Very Low (< 100Ω) | Very High (tens of kΩ) |
| **Output Impedance ($R_{out}$)**| Medium - High | Very High | Very Low |
| **Application** | Audio & general voltage amplification | High-frequency RF amplification | Buffer stage, current gain |

The **CE configuration** is the most widely used in practice because it provides both voltage and current gain, resulting in the highest overall power gain.`
            },
            {
                id: 'chi-tiet-mach-ec',
                title: 'Common Emitter (CE) Amplifiers',
                content: `## 🔌 Common Emitter (CE) Amplifiers

The Common Emitter configuration is widely used because it yields the highest power gain among all BJT amplifiers.

### 1. Core Operating Principle:
- **Concept:** A small AC input signal ($v_{in}$) applied to the Base induces variations in the Base current ($i_b$). This controls a much larger Collector current ($i_c = \beta \cdot i_b$), which flows through the load resistor $R_C$ to produce a significantly larger voltage swing at the output.
- **Phase Inversion:** This is a key characteristic of the CE amplifier. When the input signal rises, the output voltage falls. The phase difference between $V_{in}$ and $V_{out}$ is exactly **180 degrees**.

### 2. Main Parameters:
1. **Input Impedance ($R_{in}$):** The impedance seen looking into the Base (depends on bias resistors and BJT's $r_\pi$). It is **medium** (typically a few $k\Omega$).
2. **Output Impedance ($R_{out}$):** Dominated by the Collector resistor $R_C$. It is **medium to high** (around a few $10 k\Omega$).
3. **Gain:** Delivers good voltage gain ($A_v$) and current gain ($A_i$), leading to a **very high overall power gain**.

### 3. Limitation - The Miller Effect:
The parasitic capacitance $C_{bc}$ between the Base and Collector terminals in a CE configuration is effectively multiplied by ($1 + A_v$). This significantly increases the input capacitance, lowering the high-frequency cutoff (bandwidth) of the amplifier. Therefore, it is less suitable for high-frequency RF systems.`
            },
            {
                id: 'chi-tiet-mach-bc-c',
                title: 'Common Base (CB) and Common Collector (CC) Amplifiers',
                content: `## 📡 Common Base (CB) Amplifiers
- The Base terminal is held at AC ground.
- **Key Characteristic:** Non-inverting configuration. ($V_{out}$ is in-phase with $V_{in}$).
- **Frequency Response:** Because the Base is grounded, the collector-base capacitance $C_{bc}$ is shielded, eliminating the Miller effect seen in CE amplifiers. Consequently, CB amplifiers are outstandingly suited for **high-frequency (RF / Radio Frequency)** and antenna systems.
- **Impedance:** Very low input impedance, very high output impedance. Useful for impedance matching (low-impedance source to high-impedance load).

---

## 🛡️ Common Collector (CC - Emitter Follower) Amplifiers
- The output signal is taken from the Emitter terminal.
- Known as the **Emitter Follower** because the output voltage at the Emitter ($V_e$) closely "follows" the input voltage at the Base ($V_b - 0.7V$).
- **No Voltage Gain** ($A_v \approx 1$).
- **Key Characteristic:** Output is in-phase with the input.

### Excellent Applications as a "Buffer":
- **VERY HIGH** Input Impedance $\Rightarrow$ Does not load down or attenuate weak source signals or sensors from previous stages.
- **VERY LOW** Output Impedance $\Rightarrow$ Capable of supplying robust current to drive heavy loads (e.g., speakers, power stages).`
            }
        ]
    }
];

async function seedInitialData() {
    console.log('🌱 Initializing initial academic data...');

    for (const subject of SEED_SUBJECTS) {
        const { topics, ...subjectData } = subject;
        subjectData.createdAt = new Date().toISOString();
        subjectData.topicCount = topics.length;

        try {
            // 1. Save subject
            await db.collection('subjects').doc(subject.id).set(subjectData);

            // 2. Save topics to subcollection
            for (const topic of topics) {
                const topicData = {
                    title: topic.title,
                    content: topic.content,
                    createdAt: new Date().toISOString()
                };
                await db.collection('subjects').doc(subject.id)
                        .collection('topics').doc(topic.id).set(topicData);
            }
            console.log('✅ Created subject: ' + subject.name);
        } catch (error) {
            console.error('❌ Error creating ' + subject.name + ':', error);
        }
    }
    showToast('Knowledge database initialized successfully!', 'success');
}
