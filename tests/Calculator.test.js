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

});

