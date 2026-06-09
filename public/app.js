// ===============================
// Aura Calculator — FULL FIXED VERSION
// ===============================

const PRECEDENCE = {
    '+': 1, '-': 1,
    '*': 2, '/': 2,
    '^': 3,
    'u-': 4, 'u+': 4,
    'sin': 5, 'cos': 5, 'tan': 5, 'log': 5, 'ln': 5, 'sqrt': 5,
    '!': 6, '%': 6
};

const ASSOCIATIVITY = {
    '+': 'L', '-': 'L',
    '*': 'L', '/': 'L',
    '^': 'R',
    'u-': 'R', 'u+': 'R'
};

// ---------------- TOKENIZER ----------------
function tokenize(str) {
    const tokens = [];
    let i = 0;

    while (i < str.length) {
        let ch = str[i];

        if (/\s/.test(ch)) { i++; continue; }

        // Numbers
        if (/[0-9.]/.test(ch)) {
            let numStr = '';
            let hasDecimal = false;
            while (i < str.length && /[0-9.]/.test(str[i])) {
                if (str[i] === '.') {
                    if (hasDecimal) break;
                    hasDecimal = true;
                }
                numStr += str[i++];
            }
            tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
            continue;
        }

        // Identifiers / constants / functions
        if (/[a-zA-Zπ]/.test(ch)) {
            let name = '';
            while (i < str.length && /[a-zA-Zπ]/.test(str[i])) name += str[i++];

            if (name === 'pi' || name === 'π') {
                tokens.push({ type: 'NUMBER', value: Math.PI });
            } else if (name === 'e') {
                tokens.push({ type: 'NUMBER', value: Math.E });
            } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(name)) {
                tokens.push({ type: 'FUNCTION', value: name });
            } else {
                throw new Error('Unknown keyword: ' + name);
            }
            continue;
        }

        // Operators & brackets
        if (['+', '-', '*', '/', '^', '(', ')', '!', '%', '÷', '×', '−'].includes(ch)) {
            if (ch === '÷') ch = '/';
            if (ch === '×') ch = '*';
            if (ch === '−') ch = '-';
            tokens.push({ type: 'OPERATOR', value: ch });
            i++;
            continue;
        }

        throw new Error('Invalid char: ' + ch);
    }

    return tokens;
}

// ---------------- UNARY LABELLING ----------------
function labelUnary(tokens) {
    const result = [];

    for (let i = 0; i < tokens.length; i++) {
        let tok = tokens[i];

        if (tok.type === 'OPERATOR' && (tok.value === '-' || tok.value === '+')) {
            const prev = i > 0 ? tokens[i - 1] : null;
            const isUnary =
                !prev ||
                (prev.type === 'OPERATOR' && prev.value !== ')') ||
                prev.type === 'FUNCTION' ||
                prev.type === 'UNARY_OPERATOR';

            if (isUnary) {
                tok = { type: 'UNARY_OPERATOR', value: tok.value === '-' ? 'u-' : 'u+' };
            }
        }

        result.push(tok);
    }

    return result;
}

// ---------------- INFIX → POSTFIX (Shunting-Yard) ----------------
function infixToPostfix(tokens) {
    const output = [];
    const stack = [];

    for (const token of tokens) {
        if (token.type === 'NUMBER') {
            output.push(token);

        } else if (token.type === 'FUNCTION') {
            stack.push(token);

        } else if (token.type === 'UNARY_OPERATOR') {
            // Right-associative, high precedence
            while (stack.length) {
                const top = stack[stack.length - 1];
                if (top.value === '(') break;
                const p1 = PRECEDENCE[token.value];
                const p2 = PRECEDENCE[top.value] || 0;
                if (p2 > p1) output.push(stack.pop());
                else break;
            }
            stack.push(token);

        } else if (token.type === 'OPERATOR' && token.value === '(') {
            stack.push(token);

        } else if (token.type === 'OPERATOR' && token.value === ')') {
            while (stack.length && stack[stack.length - 1].value !== '(') {
                output.push(stack.pop());
            }
            stack.pop(); // discard '('
            // If a function is on top, pop it too
            if (stack.length && stack[stack.length - 1].type === 'FUNCTION') {
                output.push(stack.pop());
            }

        } else {
            // Regular binary operator
            while (stack.length) {
                const top = stack[stack.length - 1];
                if (!top || top.value === '(') break;

                const p1 = PRECEDENCE[token.value] || 0;
                const p2 = PRECEDENCE[top.value] || 0;
                const assoc = ASSOCIATIVITY[token.value] || 'L';

                if ((assoc === 'L' && p1 <= p2) || (assoc === 'R' && p1 < p2)) {
                    output.push(stack.pop());
                } else {
                    break;
                }
            }
            stack.push(token);
        }
    }

    while (stack.length) output.push(stack.pop());

    return output;
}

// ---------------- FACTORIAL HELPER ----------------
function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial requires non-negative integer');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let k = 2; k <= n; k++) result *= k;
    return result;
}

// ---------------- POSTFIX EVALUATION ----------------
function evaluatePostfix(postfix) {
    const stack = [];

    for (const token of postfix) {
        if (token.type === 'NUMBER') {
            stack.push(token.value);

        } else if (token.type === 'UNARY_OPERATOR') {
            const a = stack.pop();
            if (token.value === 'u-') stack.push(-a);
            else stack.push(+a);

        } else if (token.type === 'FUNCTION') {
            const a = stack.pop();
            switch (token.value) {
                case 'sin':  stack.push(Math.sin(a * Math.PI / 180)); break; // degree mode
                case 'cos':  stack.push(Math.cos(a * Math.PI / 180)); break;
                case 'tan':  stack.push(Math.tan(a * Math.PI / 180)); break;
                case 'log':  stack.push(Math.log10(a)); break;
                case 'ln':   stack.push(Math.log(a)); break;
                case 'sqrt': stack.push(Math.sqrt(a)); break;
                default: throw new Error('Unknown function: ' + token.value);
            }

        } else if (token.type === 'OPERATOR') {
            if (token.value === '!') {
                const a = stack.pop();
                stack.push(factorial(a));
            } else if (token.value === '%') {
                const a = stack.pop();
                stack.push(a / 100);
            } else {
                const b = stack.pop();
                const a = stack.pop();
                switch (token.value) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/':
                        if (b === 0) throw new Error('Division by zero');
                        stack.push(a / b);
                        break;
                    case '^': stack.push(Math.pow(a, b)); break;
                    default: throw new Error('Unknown operator: ' + token.value);
                }
            }
        }
    }

    if (stack.length !== 1) throw new Error('Invalid expression');
    return stack[0];
}

// ---------------- MAIN EVALUATE ----------------
function evaluate(expr) {
    const tokens = labelUnary(tokenize(expr));
    const postfix = infixToPostfix(tokens);
    return evaluatePostfix(postfix);
}

// ===============================
// FORMAT RESULT
// ===============================
function formatResult(value) {
    if (!isFinite(value)) return value > 0 ? 'Infinity' : '-Infinity';
    if (isNaN(value)) return 'NaN';
    // Trim floating point noise
    const str = parseFloat(value.toPrecision(12)).toString();
    return str;
}

// ===============================
// UI CONTROLLER
// ===============================
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM refs ---
    const mainDisplay         = document.getElementById('mainDisplay');
    const exprDisplay         = document.getElementById('exprDisplay');
    const liveIndicator       = document.getElementById('livePreviewIndicator');
    const themeToggle         = document.getElementById('themeToggle');
    const sunIcon             = themeToggle.querySelector('.sun-icon');
    const moonIcon            = themeToggle.querySelector('.moon-icon');
    const scientificToggle    = document.getElementById('scientificToggle');
    const historyToggle       = document.getElementById('historyToggle');
    const historyDrawer       = document.getElementById('historyDrawer');
    const closeHistory        = document.getElementById('closeHistory');
    const historyList         = document.getElementById('historyList');
    const emptyHistoryMsg     = document.getElementById('emptyHistoryMsg');
    const clearHistoryBtn     = document.getElementById('clearHistoryBtn');
    const soundToggle         = document.getElementById('soundToggle');

    // --- State ---
    let currentExpr       = '';
    let isResultDisplayed = false;
    let soundEnabled      = true;
    let scientificOpen    = false;
    let historyOpen       = false;
    let history           = JSON.parse(localStorage.getItem('calcHistory') || '[]');

    // ========================
    // DISPLAY
    // ========================
    function updateDisplay(main, expr, showPreview = false) {
        mainDisplay.textContent = main;
        exprDisplay.textContent = expr;
        // CSS targets .live-preview-active on the container (.input-display-container)
        liveIndicator.parentElement.classList.toggle('live-preview-active', showPreview);
    }

    function triggerLiveEvaluation() {
        if (!currentExpr) {
            updateDisplay('0', '');
            return;
        }

        // Show the current expression in the top (expr) bar
        exprDisplay.textContent = currentExpr;
        mainDisplay.textContent = currentExpr;
        liveIndicator.parentElement.classList.remove('live-preview-active');

        // Don't attempt evaluation when the expression is clearly incomplete:
        // ends with an operator, opening parenthesis, or a function call opener like "sin("
        const incompleteEnd = /[+\-*/^(]$/.test(currentExpr);
        if (incompleteEnd) return;

        try {
            const result = evaluate(currentExpr);
            const formatted = formatResult(result);
            // Only show preview if it differs from raw input (i.e. something was computed)
            if (formatted !== currentExpr) {
                mainDisplay.textContent = formatted;
                // CSS uses .live-preview-active on the container (.input-display-container)
                liveIndicator.parentElement.classList.add('live-preview-active');
            }
        } catch {
            // Still-incomplete expression — just keep showing currentExpr
        }
    }

    // ========================
    // HISTORY
    // ========================
    function saveHistory(expr, result) {
        history.unshift({ expr, result, time: Date.now() });
        if (history.length > 50) history.pop();
        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        if (history.length === 0) {
            emptyHistoryMsg.style.display = 'block';
            historyList.innerHTML = '';
            return;
        }
        emptyHistoryMsg.style.display = 'none';
        historyList.innerHTML = history.map((h, idx) => `
            <li class="history-item" data-idx="${idx}">
                <span class="history-expr">${h.expr}</span>
                <span class="history-result">= ${h.result}</span>
            </li>
        `).join('');

        // Click to reuse
        historyList.querySelectorAll('.history-item').forEach(li => {
            li.addEventListener('click', () => {
                const idx = parseInt(li.dataset.idx);
                currentExpr = history[idx].result.toString();
                isResultDisplayed = true;
                updateDisplay(currentExpr, history[idx].expr + ' =');
                if (historyOpen) toggleHistory();
            });
        });
    }

    // ========================
    // SOUND FEEDBACK
    // ========================
    function playClick() {
        if (!soundEnabled) return;
        try {
            // Create a short beep via Web Audio API
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.06);
        } catch { /* ignore */ }
    }

    // ========================
    // TOGGLES
    // ========================
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
        const isDark = document.body.classList.contains('dark-theme');
        sunIcon.style.display  = isDark ? '' : 'none';
        moonIcon.style.display = isDark ? 'none' : '';
    });

    scientificToggle.addEventListener('click', () => {
        scientificOpen = !scientificOpen;
        // CSS targets .calculator-card.scientific-mode — toggle that class on the card
        document.getElementById('calculatorCard').classList.toggle('scientific-mode', scientificOpen);
        scientificToggle.classList.toggle('active', scientificOpen);
    });

    function toggleHistory() {
        historyOpen = !historyOpen;
        historyDrawer.classList.toggle('open', historyOpen);
    }

    historyToggle.addEventListener('click', () => {
        renderHistory();
        toggleHistory();
    });

    closeHistory.addEventListener('click', toggleHistory);

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        localStorage.removeItem('calcHistory');
        renderHistory();
    });

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.classList.toggle('active', soundEnabled);
        soundToggle.title = soundEnabled ? 'Sound ON' : 'Sound OFF';
    });

    // ========================
    // MAIN KEY HANDLER
    // ========================
    function handleKeyPress(val) {
        playClick();

        // --- Clear ---
        if (val === 'clear') {
            currentExpr = '';
            isResultDisplayed = false;
            updateDisplay('0', '');
            return;
        }

        // --- Backspace ---
        if (val === 'backspace') {
            if (isResultDisplayed) {
                currentExpr = '';
                isResultDisplayed = false;
                updateDisplay('0', '');
                return;
            }
            currentExpr = currentExpr.slice(0, -1);
            if (!currentExpr) updateDisplay('0', '');
            else triggerLiveEvaluation();
            return;
        }

        // --- Equals ---
        if (val === 'equals') {
            if (!currentExpr) return;
            try {
                const result = evaluate(currentExpr);
                const formatted = formatResult(result);
                saveHistory(currentExpr, formatted);
                updateDisplay(formatted, currentExpr + ' =');
                currentExpr = formatted;
                isResultDisplayed = true;
            } catch (err) {
                updateDisplay('Error', currentExpr);
                currentExpr = '';
                isResultDisplayed = false;
            }
            return;
        }

        // --- Negate ---
        if (val === 'negate') {
            if (!currentExpr || currentExpr === '0') return;
            // Wrap entire expression: -(expr)
            if (isResultDisplayed) {
                currentExpr = currentExpr.startsWith('-')
                    ? currentExpr.slice(1)
                    : '-' + currentExpr;
                updateDisplay(currentExpr, '');
                return;
            }
            currentExpr = currentExpr.startsWith('-')
                ? currentExpr.slice(1)
                : '-(' + currentExpr + ')';
            triggerLiveEvaluation();
            return;
        }

        // --- Percent (standalone: divide current number by 100) ---
        if (val === 'percent') {
            if (!currentExpr) return;
            try {
                const result = evaluate(currentExpr) / 100;
                const formatted = formatResult(result);
                updateDisplay(formatted, currentExpr + ' %');
                currentExpr = formatted;
                isResultDisplayed = true;
            } catch {
                updateDisplay('Error', currentExpr);
            }
            return;
        }

        // --- If result was shown and user presses an operator, continue; digit → new expr ---
        if (isResultDisplayed) {
            if (/^[+\-*/^]$/.test(val)) {
                // continue chaining: keep result as left operand
                isResultDisplayed = false;
            } else {
                // Start fresh
                currentExpr = '';
                isResultDisplayed = false;
            }
        }

        currentExpr += val;
        triggerLiveEvaluation();
    }

    // ========================
    // BUTTON CLICK BINDINGS
    // ========================
    document.querySelectorAll('.key').forEach(btn => {
        btn.addEventListener('click', () => {
            handleKeyPress(btn.getAttribute('data-val'));
        });
    });

    // ========================
    // KEYBOARD SUPPORT
    // ========================
    document.addEventListener('keydown', e => {
        if (e.key >= '0' && e.key <= '9') { handleKeyPress(e.key); return; }
        if (e.key === '.') { handleKeyPress('.'); return; }
        if (e.key === '+') { handleKeyPress('+'); return; }
        if (e.key === '-') { handleKeyPress('-'); return; }
        if (e.key === '*') { handleKeyPress('*'); return; }
        if (e.key === '/') { e.preventDefault(); handleKeyPress('/'); return; }
        if (e.key === '^') { handleKeyPress('^'); return; }
        if (e.key === '(') { handleKeyPress('('); return; }
        if (e.key === ')') { handleKeyPress(')'); return; }
        if (e.key === '%') { handleKeyPress('percent'); return; }
        if (e.key === 'Enter' || e.key === '=') { handleKeyPress('equals'); return; }
        if (e.key === 'Backspace') { handleKeyPress('backspace'); return; }
        if (e.key === 'Escape') { handleKeyPress('clear'); return; }
    });

    // ========================
    // INIT
    // ========================
    renderHistory();
    updateDisplay('0', '');
    sunIcon.style.display  = '';
    moonIcon.style.display = 'none';
});