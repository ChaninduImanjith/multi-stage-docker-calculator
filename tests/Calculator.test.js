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

});

