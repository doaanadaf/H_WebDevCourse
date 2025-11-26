document.addEventListener("DOMContentLoaded", () => {
    pageLoaded();
});

let txt1;
let txt2;
let btn;
let lblRes;
let ddlOperation;
let chkAppend;

function pageLoaded() {
    txt1 = document.getElementById('txt1');
    txt2 = document.getElementById('txt2');
    btn = document.getElementById('btnCalc');
    lblRes = document.getElementById('lblRes');
    ddlOperation = document.getElementById('operation');
    chkAppend = document.getElementById('chkAppend');

    // כפתור חישוב
    btn.addEventListener('click', () => {
        Calculate();
    });

    // ולידציה תוך כדי הקלדה
    txt1.addEventListener("input", () => validateNumberInput(txt1));
    txt2.addEventListener("input", () => validateNumberInput(txt2));

    // כפתור btn2 – כמו שהיה, רק עם append ללוג
    const btn2 = document.getElementById("btn2");
    btn2.addEventListener("click", () => {
        print("btn2 clicked: " + btn2.id + " | " + btn2.innerText, true);
    });
}

// בדיקה אם מחרוזת מספרית
function isNumeric(value) {
    return value.trim() !== "" && !isNaN(value);
}

// ולידציה והוספת is-valid / is-invalid
function validateNumberInput(inputElement) {
    const value = inputElement.value;
    const ok = isNumeric(value);

    inputElement.classList.remove("is-valid", "is-invalid");

    if (value.trim() === "") {
        // ריק – בלי מחלקות
        return false;
    }

    if (ok) {
        inputElement.classList.add("is-valid");
    } else {
        inputElement.classList.add("is-invalid");
    }

    return ok;
}

function Calculate() {
    const txt1Text = txt1.value;
    const txt2Text = txt2.value;

    const valid1 = validateNumberInput(txt1);
    const valid2 = validateNumberInput(txt2);

    if (!valid1 || !valid2) {
        print("שגיאה: יש להזין מספרים תקינים בשתי התיבות.", true);
        lblRes.innerText = "";
        return;
    }

    const num1 = parseFloat(txt1Text);
    const num2 = parseFloat(txt2Text);
    const op = ddlOperation.value;

    let res;

    switch (op) {
        case "+":
            res = num1 + num2;
            break;
        case "-":
            res = num1 - num2;
            break;
        case "*":
            res = num1 * num2;
            break;
        case "/":
            if (num2 === 0) {
                print("שגיאה: אי אפשר לחלק באפס.", true);
                lblRes.innerText = "";
                return;
            }
            res = num1 / num2;
            break;
        default:
            print("שגיאה: פעולה לא מוכרת.", true);
            return;
    }

    lblRes.innerText = res;

    // תיעוד התרגיל + התוצאה בלוג
    const logLine = `תרגיל: ${num1} ${op} ${num2} = ${res}`;
    const appendMode = chkAppend ? chkAppend.checked : true;

    print(logLine, appendMode);
}

// פונקציית print החדשה – עם append בוליאני
function print(msg, append = false) {
    const ta = document.getElementById("output");

    if (!ta) {
        console.log(msg);
        return;
    }

    if (append) {
        if (ta.value !== "") {
            ta.value += "\n" + msg;
        } else {
            ta.value = msg;
        }
    } else {
        // מצב לא-append – דריסה של התוכן הקודם
        ta.value = msg;
    }
}

// =============================================
// STEP 1: JS NATIVE TYPES, USEFUL TYPES & OPERATIONS
// =============================================
function demoNative() {
    let out = "=== STEP 1: NATIVE TYPES ===\n";

    // String
    const s = "Hello World";
    out += "\n[String] s = " + s;
    out += "\nLength: " + s.length;
    out += "\nUpper: " + s.toUpperCase();

    // Number
    const n = 42;
    out += "\n\n[Number] n = " + n;

    // Boolean
    const b = true;
    out += "\n\n[Boolean] b = " + b;

    // Date
    const d = new Date();
    out += "\n\n[Date] now = " + d.toISOString();

    // Array
    const arr = [1, 2, 3, 4];
    out += "\n\n[Array] arr = [" + arr.join(", ") + "]";
    out += "\nPush 5 → " + (arr.push(5), arr.join(", "));
    out += "\nMap x2 → " + arr.map(x => x * 2).join(", ");

    // Functions as variables
    const add = function (a, b) { return a + b; };
    out += "\n\n[Function as variable] add(3,4) = " + add(3, 4);

    // Callback
    function calc(a, b, fn) { return fn(a, b); }
    const result = calc(10, 20, (x, y) => x + y);
    out += "\n[Callback] calc(10,20, x+y ) = " + result;

    // הדפסה ללוג במצב append
    print(out, true);
}