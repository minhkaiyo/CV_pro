const EXERCISES = [
  {
    id: "if_else",
    title: "Basic If-Else Structure",
    cpp: `if (x <= 6)
  cout << "Hoc mau giao";
else if (x >= 7 && x < 11)
  cout << "Hoc tieu hoc";
else if (x >= 11 && x < 18)
  cout << "Hoc Pho Thong";
else if (x >= 18 && x < 60)
  cout << "Lam viec";
else
  cout << "Nghi huu";`,
    desc: "Convert compound branching structure. Assume variable x is stored in AL.",
    asm: `; Assume x is stored in AL
    CMP AL, 6
    JA  CHECK_TIEU_HOC   ; If x > 6, check next condition
    ; Case: Hoc mau giao
    MOV DX, OFFSET msg_maugiao
    JMP DONE

CHECK_TIEU_HOC:
    CMP AL, 11
    JAE CHECK_PHO_THONG  ; If x >= 11
    ; Case: Hoc tieu hoc (7 <= x < 11)
    MOV DX, OFFSET msg_tieuhoc
    JMP DONE

CHECK_PHO_THONG:
    CMP AL, 18
    JAE CHECK_LAM_VIEC   ; If x >= 18
    ; Case: Hoc Pho Thong (11 <= x < 18)
    MOV DX, OFFSET msg_phothong
    JMP DONE

CHECK_LAM_VIEC:
    CMP AL, 60
    JAE CASE_NGHIHUU     ; If x >= 60
    ; Case: Lam viec (18 <= x < 60)
    MOV DX, OFFSET msg_lamviec
    JMP DONE

CASE_NGHIHUU:
    MOV DX, OFFSET msg_nghihuu

DONE:
    MOV AH, 09H
    INT 21H`
  },
  {
    id: "for_loop",
    title: "For Loop",
    cpp: `int sum = 0;
for (int i = 1; i <= 10; i++) {
    sum += i;
}`,
    desc: "Calculate sum from 1 to 10. Use register AX for sum and CX for loop counter i.",
    asm: `    MOV AX, 0    ; sum = 0
    MOV CX, 1    ; i = 1
LAP:
    CMP CX, 10   ; Compare i with 10
    JG  THOAT    ; Exit if i > 10
    ADD AX, CX   ; sum += i
    INC CX       ; i++
    JMP LAP      ; Loop again
THOAT:
    ; Result AX = 55 (37h)`
  },
  {
    id: "while_loop",
    title: "While Loop",
    cpp: `while (x > 0) {
    x = x / 2;
    count++;
}`,
    desc: "Keep dividing x by 2. Assume x is stored in AX and count in CX.",
    asm: `    ; Assume AX = x, CX = count
LAP:
    CMP AX, 0
    JLE DONE     ; Exit if x <= 0
    
    MOV BX, 2
    XOR DX, DX   ; Clear DX before division
    DIV BX       ; AX = AX / 2
    
    INC CX       ; count++
    JMP LAP
DONE:`
  }
];

let currentIdx = 0;

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("exerciseSelect");
    EXERCISES.forEach((ex, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = ex.title;
        select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
        currentIdx = parseInt(e.target.value);
        loadExercise();
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
        currentIdx = (currentIdx + 1) % EXERCISES.length;
        select.value = currentIdx;
        loadExercise();
    });

    document.getElementById("showSolutionBtn").addEventListener("click", () => {
        document.getElementById("solutionOverlay").classList.remove("hidden");
    });

    document.getElementById("hideSolutionBtn").addEventListener("click", () => {
        document.getElementById("solutionOverlay").classList.add("hidden");
    });

    // Sidebar toggle (copy from main script)
    const sidebarToggle = document.getElementById("sidebar-toggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("collapsed");
        });
    }

    loadExercise();
});

function loadExercise() {
    const ex = EXERCISES[currentIdx];
    document.getElementById("cppCode").textContent = ex.cpp;
    document.getElementById("exerciseDesc").textContent = ex.desc;
    document.getElementById("solutionCode").textContent = ex.asm;
    document.getElementById("asmEditor").value = "";
    document.getElementById("solutionOverlay").classList.add("hidden");
}
