const Calculator = require('../src/calculator/Calculator');

describe('Calculator Tests', () => {

    const calc = new Calculator();

    test('Addition', () => {
        expect(calc.add(5,3)).toBe(8);
    });

    test('Subtraction', () => {
        expect(calc.subtract(10,4)).toBe(6);
    });

    test('Multiplication', () => {
        expect(calc.multiply(5,5)).toBe(25);
    });

    test('Division', () => {
        expect(calc.divide(20,5)).toBe(4);
    });

    test('Division By Zero', () => {
        expect(() => {
        calc.divide(10, 0);
    }).toThrow("Division by Zero");

    });

    test('Negative Numbers', () => {
        expect(calc.add(-5, 3)).toBe(-2);
 
    });

    test('Zero Values', () => {
        expect(calc.add(0, 0)).toBe(0);

    });

    test('Large Numbers', () => {
        expect(calc.add(999999, 1))
        .toBe(1000000);

    });

    test('Power Function', () => {
        expect(calc.power(2, 3)).toBe(8);
    });

    test('Square Root', () => {
        expect(calc.sqrt(25)).toBe(5);
    });

    test('Sine Function', () => {
        expect(calc.sin(30)).toBeCloseTo(0.5);
    });
    test('Cosine Function', () => {
        expect(calc.cos(60)).toBeCloseTo(0.5);
    });

    test('Factorial', () => {
        expect(calc.factorial(5)).toBe(120);
    });

    test('Factorial Zero', () => {
        expect(calc.factorial(0)).toBe(1);
    });

    test('Negative Square Root', () => {
        expect(() => calc.sqrt(-1)).toThrow("Invalid Input");
    });

    test('Tangent Function', () => {
        expect(calc.tan(45)).toBeCloseTo(1);
    });

    test('Power Zero', () => {
        expect(calc.power(5, 0)).toBe(1);
    });

    test('Factorial Negative', () => {
        expect(() => calc.factorial(-5))
        .toThrow("Invalid Input");
    });

});

