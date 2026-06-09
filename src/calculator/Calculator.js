class Calculator {

    add(a, b) {
        return a + b;
    }

    subtract(a, b) {
        return a - b;
    }

    multiply(a, b) {
        return a * b;
    }

    divide(a, b) {
        if (b === 0) {
            throw new Error("Division by Zero");
        }
        return a / b;
    }

    power(a, b) {
        return Math.pow(a, b);
    }

    sqrt(a) {
        if (a < 0) {
            throw new Error("Invalid Input");
        }
        return Math.sqrt(a);
    }

    sin(angle) {
        return Math.sin(angle * Math.PI / 180);
    }

    cos(angle) {
        return Math.cos(angle * Math.PI / 180);
    }

    tan(angle) {
        return Math.tan(angle * Math.PI / 180);
    }

    factorial(n) {
        if (n < 0) {
            throw new Error("Invalid Input");
        }

        if (n === 0 || n === 1) {
            return 1;
        }

        let result = 1;

        for (let i = 2; i <= n; i++) {
            result *= i;
        }

        return result;
    }
}

module.exports = Calculator;