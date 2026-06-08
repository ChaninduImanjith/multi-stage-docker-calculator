/**
 * Aura Calculator - Core Logic and Interface Engine
 */

// Math Evaluation Engine
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

/**
 * Tokenize mathematical expression string
 */
function tokenize(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        let ch = str[i];
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        
        // Parse numbers (including decimals)
        if (/[0-9.]/.test(ch)) {
            let numStr = "";
            let hasDecimal = false;
            while (i < str.length && /[0-9.]/.test(str[i])) {
                if (str[i] === '.') {
                    if (hasDecimal) break; // Invalid duplicate dot
                    hasDecimal = true;
                }
                numStr += str[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
            continue;
        }
        
        // Parse constants and functions
        if (/[a-zA-Z]/.test(ch)) {
            let name = "";
            while (i < str.length && /[a-zA-Z]/.test(str[i])) {
                name += str[i];
                i++;
            }
            if (name === 'pi' || name === 'π') {
                tokens.push({ type: 'NUMBER', value: Math.PI });
            } else if (name === 'e') {
                tokens.push({ type: 'NUMBER', value: Math.E });
            } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(name)) {
                tokens.push({ type: 'FUNCTION', value: name });
            } else {
                throw new Error("Unknown keyword: " + name);
            }
            continue;
        }
        
        // Parse single-character operators
        if (['+', '-', '*', '/', '^', '(', ')', '!', '%', '÷', '×', '−'].includes(ch)) {
            let op = ch;
            // Normalize visual operators to JS operations
            if (op === '÷') op = '/';
            if (op === '×') op = '*';
            if (op === '−') op = '-';
            
            tokens.push({ type: 'OPERATOR', value: op });
            i++;
            continue;
        }
        
        throw new Error("Invalid char: " + ch);
    }
    return tokens;
}

/**
 * Detect and label unary operators (+/-)
 */
function labelUnary(tokens) {
    const result = [];
    for (let i = 0; i < tokens.length; i++) {
        let tok = tokens[i];
        if (tok.type === 'OPERATOR' && (tok.value === '-' || tok.value === '+')) {
            const prev = i > 0 ? tokens[i - 1] : null;
            // Unary if first, or following another operator (excluding postfix like ! or %) or open parenthesis
            const isUnary = !prev || 
                            (prev.type === 'OPERATOR' && prev.value === '(') || 
                            (prev.type === 'OPERATOR' && prev.value !== '!' && prev.value !== '%') ||
                            prev.type === 'FUNCTION';
            
            if (isUnary) {
                tok = { type: 'UNARY_OPERATOR', value: tok.value === '-' ? 'u-' : 'u+' };
            }
        }
        result.push(tok);
    }
    return result;
}

/**
 * Shunting-Yard Algorithm to convert Infix to Postfix (RPN)
 */
function infixToPostfix(tokens) {
    const outputQueue = [];
    const operatorStack = [];
    
    for (const token of tokens) {
        if (token.type === 'NUMBER') {
            outputQueue.push(token);
        } else if (token.type === 'FUNCTION') {
            operatorStack.push(token);
        } else if (token.type === 'OPERATOR' && (token.value === '!' || token.value === '%')) {
            // Postfix operators have high precedence, pop higher operators first
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.type === 'OPERATOR' || top.type === 'UNARY_OPERATOR' || top.type === 'FUNCTION') {
                    if (PRECEDENCE[top.value] >= PRECEDENCE[token.value]) {
                        outputQueue.push(operatorStack.pop());
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            outputQueue.push(token);
        } else if (token.type === 'OPERATOR' && token.value === '(') {
            operatorStack.push(token);
        } else if (token.type === 'OPERATOR' && token.value === ')') {
            let foundParen = false;
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.value === '(') {
                    operatorStack.pop();
                    foundParen = true;
                    break;
                } else {
                    outputQueue.push(operatorStack.pop());
                }
            }
            if (!foundParen) {
                throw new Error("Mismatched parentheses");
            }
            // If function is on top of stack, pop it onto the output queue
            if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
                outputQueue.push(operatorStack.pop());
            }
        } else if (token.type === 'OPERATOR' || token.type === 'UNARY_OPERATOR') {
            const o1 = token.value;
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.type === 'OPERATOR' || top.type === 'UNARY_OPERATOR' || top.type === 'FUNCTION') {
                    const o2 = top.value;
                    const p1 = PRECEDENCE[o1];
                    const p2 = PRECEDENCE[o2];
                    const assoc = ASSOCIATIVITY[o1] || 'L';
                    
                    if ((assoc === 'L' && p1 <= p2) || (assoc === 'R' && p1 < p2)) {
                        outputQueue.push(operatorStack.pop());
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            operatorStack.push(token);
        }
    }
    
    while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.value === '(' || top.value === ')') {
            throw new Error("Mismatched parentheses");
        }
        outputQueue.push(operatorStack.pop());
    }
    
    return outputQueue;
}

/**
 * Factorial calculation
 */
function factorial(n) {
    if (n < 0) throw new Error("Math Error");
    if (n === 0 || n === 1) return 1;
    if (!Number.isInteger(n)) throw new Error("Integer Only");
    if (n > 170) return Infinity; // Limit to prevent stack issues
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

/**
 * Evaluate Postfix (RPN) Expression
 */
function evaluatePostfix(postfix) {
    const stack = [];
    
    for (const token of postfix) {
        if (token.type === 'NUMBER') {
            stack.push(token.value);
        } else if (token.type === 'UNARY_OPERATOR') {
            if (stack.length < 1) throw new Error("Format Error");
            const val = stack.pop();
            stack.push(token.value === 'u-' ? -val : val);
        } else if (token.type === 'FUNCTION') {
            if (stack.length < 1) throw new Error("Format Error");
            const val = stack.pop();
            switch (token.value) {
                case 'sin':
                    stack.push(Math.sin(val * Math.PI / 180)); // Degrees standard
                    break;
                case 'cos':
                    // Fix exact cos(90) = 0 precision
                    const cosVal = Math.cos(val * Math.PI / 180);
                    stack.push(Math.abs(cosVal) < 1e-15 ? 0 : cosVal);
                    break;
                case 'tan':
                    if (Math.abs((val - 90) % 180) < 1e-9) throw new Error("Math Error");
                    stack.push(Math.tan(val * Math.PI / 180));
                    break;
                case 'log':
                    if (val <= 0) throw new Error("Math Error");
                    stack.push(Math.log10(val));
                    break;
                case 'ln':
                    if (val <= 0) throw new Error("Math Error");
                    stack.push(Math.log(val));
                    break;
                case 'sqrt':
                    if (val < 0) throw new Error("Math Error");
                    stack.push(Math.sqrt(val));
                    break;
                default:
                    throw new Error("Unknown Function");
            }
        } else if (token.type === 'OPERATOR') {
            if (token.value === '!') {
                if (stack.length < 1) throw new Error("Format Error");
                stack.push(factorial(stack.pop()));
                continue;
            }
            if (token.value === '%') {
                if (stack.length < 1) throw new Error("Format Error");
                stack.push(stack.pop() / 100);
                continue;
            }
            
            if (stack.length < 2) throw new Error("Format Error");
            const b = stack.pop();
            const a = stack.pop();
            
            switch (token.value) {
                case '+': stack.push(a + b); break;
                case '-': stack.push(a - b); break;
                case '*': stack.push(a * b); break;
                case '/':
                    if (b === 0) throw new Error("Division by Zero");
                    stack.push(a / b);
                    break;
                case '^': stack.push(Math.pow(a, b)); break;
                default: throw new Error("Unknown Operator");
            }
        }
    }
    
    if (stack.length !== 1) throw new Error("Format Error");
    
    const result = stack[0];
    if (isNaN(result)) throw new Error("Math Error");
    if (!isFinite(result)) throw new Error("Infinity");
    
    // Floating point precision correction
    return parseFloat(result.toPrecision(12));
}

/**
 * Main parser entry point
 */
function evaluate(expressionStr) {
    if (!expressionStr.trim()) return 0;
    
    // Normalize string representation
    let cleanStr = expressionStr
        .replace(/π/g, 'pi')
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/−/g, '-');
        
    const tokens = tokenize(cleanStr);
    const labeledTokens = labelUnary(tokens);
    const postfix = infixToPostfix(labeledTokens);
    return evaluatePostfix(postfix);
}

// UI Controller Code
document.addEventListener("DOMContentLoaded", () => {
    // DOM Cache
    const mainDisplay = document.getElementById("mainDisplay");
    const exprDisplay = document.getElementById("exprDisplay");
    const displayContainer = document.querySelector(".display-section");
    const scientificToggle = document.getElementById("scientificToggle");
    const historyToggle = document.getElementById("historyToggle");
    const themeToggle = document.getElementById("themeToggle");
    const soundToggle = document.getElementById("soundToggle");
    const calculatorCard = document.getElementById("calculatorCard");
    const historyDrawer = document.getElementById("historyDrawer");
    const closeHistory = document.getElementById("closeHistory");
    const historyList = document.getElementById("historyList");
    const emptyHistoryMsg = document.getElementById("emptyHistoryMsg");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    
    // Theme Icon States
    const sunIcon = document.querySelector(".sun-icon");
    const moonIcon = document.querySelector(".moon-icon");

    // Audio click setup
    let audioCtx = null;
    let soundEnabled = localStorage.getItem("soundEnabled") === "true";
    updateSoundUI();

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playClick() {
        if (!soundEnabled) return;
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.04);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.04);
    }

    function updateSoundUI() {
        if (soundEnabled) {
            soundToggle.classList.add("active");
            soundToggle.querySelector(".volume-waves").style.display = "block";
        } else {
            soundToggle.classList.remove("active");
            soundToggle.querySelector(".volume-waves").style.display = "none";
        }
    }

    // App State
    let currentExpr = "";
    let isResultDisplayed = false;
    let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    
    // Init state
    updateHistoryUI();

    // Check saved mode settings
    if (localStorage.getItem("scientificMode") === "true") {
        calculatorCard.classList.add("scientific-mode");
        scientificToggle.classList.add("active");
    }
    
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        sunIcon.style.display = "none";
        moonIcon.style.display = "block";
    }

    // Toggle Scientific Panel
    scientificToggle.addEventListener("click", () => {
        playClick();
        const active = calculatorCard.classList.toggle("scientific-mode");
        scientificToggle.classList.toggle("active", active);
        localStorage.setItem("scientificMode", active);
    });

    // Toggle History Drawer
    historyToggle.addEventListener("click", () => {
        playClick();
        const open = historyDrawer.classList.toggle("open");
        historyToggle.classList.toggle("active", open);
    });

    closeHistory.addEventListener("click", () => {
        playClick();
        historyDrawer.classList.remove("open");
        historyToggle.classList.remove("active");
    });

    // Toggle Sound
    soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem("soundEnabled", soundEnabled);
        updateSoundUI();
        if (soundEnabled) {
            playClick();
        }
    });

    // Toggle Theme
    themeToggle.addEventListener("click", () => {
        playClick();
        if (document.body.classList.contains("dark-theme")) {
            document.body.classList.replace("dark-theme", "light-theme");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
            localStorage.setItem("theme", "light");
        } else {
            document.body.classList.replace("light-theme", "dark-theme");
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";
            localStorage.setItem("theme", "dark");
        }
    });

    // Clear History
    clearHistoryBtn.addEventListener("click", () => {
        playClick();
        history = [];
        localStorage.setItem("calcHistory", JSON.stringify(history));
        updateHistoryUI();
    });

    // Keypad Clicks
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => {
        key.addEventListener("click", () => {
            playClick();
            handleKeyPress(key.getAttribute("data-val"));
        });
    });

    // Keyboard bindings
    window.addEventListener("keydown", (e) => {
        let key = e.key;
        let button = null;
        
        // Map keyboard keys to data-val codes
        if (key >= '0' && key <= '9') {
            button = document.getElementById("key-" + key);
            handleKeyPress(key);
        } else if (key === '.') {
            button = document.getElementById("key-decimal");
            handleKeyPress(".");
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            let id = key === '+' ? "add" : key === '-' ? "subtract" : key === '*' ? "multiply" : "divide";
            button = document.getElementById("key-" + id);
            handleKeyPress(key);
        } else if (key === 'Enter' || key === '=') {
            button = document.getElementById("key-equals");
            handleKeyPress("equals");
            e.preventDefault();
        } else if (key === 'Backspace') {
            button = document.getElementById("key-backspace");
            handleKeyPress("backspace");
        } else if (key === 'Escape') {
            button = document.getElementById("key-clear");
            handleKeyPress("clear");
        } else if (key === '%') {
            button = document.getElementById("key-percent");
            handleKeyPress("percent");
        } else if (key === '^') {
            button = document.querySelector('[data-val="^"]');
            handleKeyPress("^");
        } else if (key === '(' || key === ')') {
            button = document.querySelector(`[data-val="${key}"]`);
            handleKeyPress(key);
        }

        // Trigger press animation
        if (button) {
            playClick();
            button.classList.add("keyboard-active");
            setTimeout(() => button.classList.remove("keyboard-active"), 120);
        }
    });

    // Main Key Event Processor
    function handleKeyPress(val) {
        if (val === "clear") {
            currentExpr = "";
            isResultDisplayed = false;
            updateDisplay("0", "");
            displayContainer.classList.remove("live-preview-active");
        } 
        else if (val === "backspace") {
            if (isResultDisplayed) {
                currentExpr = "";
                isResultDisplayed = false;
                updateDisplay("0", "");
                displayContainer.classList.remove("live-preview-active");
                return;
            }
            
            // Smart backspace for functions
            const functions = ["sin(", "cos(", "tan(", "log(", "ln(", "sqrt("];
            let deletedFunc = false;
            for (const func of functions) {
                if (currentExpr.endsWith(func)) {
                    currentExpr = currentExpr.slice(0, -func.length);
                    deletedFunc = true;
                    break;
                }
            }
            
            if (!deletedFunc && currentExpr.length > 0) {
                currentExpr = currentExpr.slice(0, -1);
            }
            
            triggerLiveEvaluation();
        } 
        else if (val === "equals") {
            if (!currentExpr) return;
            
            try {
                // Ensure balanced parenthesis before solving
                let openCount = (currentExpr.match(/\(/g) || []).length;
                let closeCount = (currentExpr.match(/\)/g) || []).length;
                let exprToEval = currentExpr;
                while (openCount > closeCount) {
                    exprToEval += ")";
                    closeCount++;
                }

                const result = evaluate(exprToEval);
                
                // Add to history
                const entry = {
                    expr: formatDisplayExpression(exprToEval),
                    result: result.toString()
                };
                history.unshift(entry);
                if (history.length > 50) history.pop(); // Max 50 items
                localStorage.setItem("calcHistory", JSON.stringify(history));
                updateHistoryUI();
                
                // Update UI state
                updateDisplay(result.toString(), formatDisplayExpression(exprToEval) + " =");
                currentExpr = result.toString();
                isResultDisplayed = true;
                displayContainer.classList.remove("live-preview-active");
            } catch (err) {
                updateDisplay(err.message === "Division by Zero" ? "Cannot divide by 0" : "Error", formatDisplayExpression(currentExpr));
                currentExpr = "";
                isResultDisplayed = false;
                displayContainer.classList.remove("live-preview-active");
            }
        } 
        else if (val === "negate") {
            // Toggles sign of the last number block in the expression
            if (isResultDisplayed) {
                currentExpr = (parseFloat(currentExpr) * -1).toString();
                isResultDisplayed = false;
                updateDisplay(formatDisplayExpression(currentExpr), "");
                return;
            }

            // Find trailing digits or decimals to negate
            const match = currentExpr.match(/([0-9.]+|pi|e)$/);
            if (match) {
                const target = match[0];
                const index = currentExpr.lastIndexOf(target);
                
                // Check if it's already negated (preceded by a unary minus inside parentheses)
                if (index >= 3 && currentExpr.slice(index - 3, index) === "(-") {
                    currentExpr = currentExpr.slice(0, index - 3) + target;
                } else if (index >= 2 && currentExpr.slice(index - 2, index) === "(-") {
                    // Just in case of (-target
                    currentExpr = currentExpr.slice(0, index - 2) + target;
                } else {
                    currentExpr = currentExpr.slice(0, index) + `(-${target})`;
                }
            } else {
                // If it ends with something else, we just append minus
                currentExpr += "-";
            }
            triggerLiveEvaluation();
        } 
        else if (val === "percent") {
            if (isResultDisplayed) {
                currentExpr = (parseFloat(currentExpr) / 100).toString();
                isResultDisplayed = false;
                updateDisplay(formatDisplayExpression(currentExpr), "");
                return;
            }
            currentExpr += "%";
            triggerLiveEvaluation();
        } 
        else {
            // Number, Operator, or Function
            if (isResultDisplayed) {
                if (["+", "-", "*", "/", "^"].includes(val)) {
                    isResultDisplayed = false;
                } else {
                    currentExpr = "";
                    isResultDisplayed = false;
                }
            }
            
            // Prevent multiple decimals in a single number block
            if (val === ".") {
                const parts = currentExpr.split(/[^0-9.]/);
                const lastPart = parts[parts.length - 1];
                if (lastPart.includes(".")) return;
            }
            
            currentExpr += val;
            triggerLiveEvaluation();
        }
    }

    // Process Live Preview as users type
    function triggerLiveEvaluation() {
        if (!currentExpr) {
            updateDisplay("0", "");
            displayContainer.classList.remove("live-preview-active");
            return;
        }

        updateDisplay(formatDisplayExpression(currentExpr), "");
        
        // Attempt background compile
        // Only trigger preview if expression contains an operator and is not just a plain number
        const hasOperators = /[+\-*/^!%]|sin|cos|tan|log|ln|sqrt/.test(currentExpr);
        if (hasOperators) {
            try {
                // Auto-close parenthesis for preview convenience
                let openCount = (currentExpr.match(/\(/g) || []).length;
                let closeCount = (currentExpr.match(/\)/g) || []).length;
                let previewExpr = currentExpr;
                while (openCount > closeCount) {
                    previewExpr += ")";
                    closeCount++;
                }
                
                const previewVal = evaluate(previewExpr);
                mainDisplay.innerText = previewVal.toString();
                displayContainer.classList.add("live-preview-active");
            } catch (e) {
                // Keep the current expression showing but don't flag as active preview
                displayContainer.classList.remove("live-preview-active");
            }
        } else {
            displayContainer.classList.remove("live-preview-active");
        }
    }

    // Format math symbols to clean human-readable notation
    function formatDisplayExpression(expr) {
        return expr
            .replace(/\*/g, " × ")
            .replace(/\//g, " ÷ ")
            .replace(/\+/g, " + ")
            .replace(/-/g, " − ")
            .replace(/\^/g, " ^ ")
            .replace(/pi/g, "π")
            .replace(/sin\(/g, "sin(")
            .replace(/cos\(/g, "cos(")
            .replace(/tan\(/g, "tan(")
            .replace(/sqrt\(/g, "√(")
            .replace(/\(-/g, "(-");
    }

    // Refresh displays and scroll to view end
    function updateDisplay(mainText, exprText) {
        mainDisplay.innerText = mainText;
        exprDisplay.innerText = exprText;
        
        // Scroll right to keep current input visible
        mainDisplay.scrollLeft = mainDisplay.scrollWidth;
        exprDisplay.scrollLeft = exprDisplay.scrollWidth;
    }

    // Rebuild History HTML structure
    function updateHistoryUI() {
        historyList.innerHTML = "";
        
        if (history.length === 0) {
            emptyHistoryMsg.style.display = "block";
            clearHistoryBtn.style.display = "none";
            return;
        }
        
        emptyHistoryMsg.style.display = "none";
        clearHistoryBtn.style.display = "block";
        
        history.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "history-item";
            li.innerHTML = `
                <div class="history-item-expr">${item.expr}</div>
                <div class="history-item-result">${item.result}</div>
            `;
            
            // Click history item to load it into active calculator display
            li.addEventListener("click", () => {
                playClick();
                currentExpr = item.result;
                isResultDisplayed = false;
                updateDisplay(formatDisplayExpression(currentExpr), "");
                displayContainer.classList.remove("live-preview-active");
                historyDrawer.classList.remove("open");
                historyToggle.classList.remove("active");
            });
            
            historyList.appendChild(li);
        });
    }
});