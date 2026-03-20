import { detectLanguage } from '../utils/languageDetect'

describe('detectLanguage', () => {
  test('detects Python', () => {
    const code = `def hello():
    print("Hello World")
    
class MyClass:
    pass`
    expect(detectLanguage(code)).toBe('Python')
  })

  test('detects JavaScript', () => {
    const code = `function hello() {
    const name = "World";
    return name;
}
const greet = () => console.log("hi");`
    expect(detectLanguage(code)).toBe('JavaScript')
  })

  test('detects TypeScript', () => {
    const code = `interface User {
    name: string;
    age: number;
}
type Status = 'active' | 'inactive';`
    expect(detectLanguage(code)).toBe('TypeScript')
  })

  test('detects Go', () => {
    const code = `package main

import "fmt"

func main() {
    fmt.Println("Hello")
}`
    expect(detectLanguage(code)).toBe('Go')
  })

  test('detects Rust', () => {
    const code = `fn main() {
    let mut x = 5;
    println!("{}", x);
}`
    expect(detectLanguage(code)).toBe('Rust')
  })

  test('detects Java', () => {
    const code = `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}`
    expect(detectLanguage(code)).toBe('Java')
  })

  test('returns null for insufficient matches', () => {
    expect(detectLanguage('abc')).toBe(null)
  })

  test('handles empty input', () => {
    expect(detectLanguage('')).toBe(null)
    expect(detectLanguage(null)).toBe(null)
  })
})
