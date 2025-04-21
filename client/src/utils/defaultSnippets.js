export const defaultSnippets = {
  javascript: `// Simple JavaScript Hello World program
console.log("Hello World!");

// Function example
function greet(name) {
    return \`Hello, \${name}!\`;
}

// Call the function
console.log(greet("User"));`,

  typescript: `// Simple TypeScript Hello World program
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

// Define a simple interface
interface User {
    name: string;
    age: number;
}

// Create a user object
const user: User = {
    name: "John",
    age: 30
};

console.log(greet(user.name));`,

  python: `# Simple Python Hello World program
def greet(name: str) -> str:
    return f"Hello, {name}!"

# Main program
if __name__ == "__main__":
    print("Hello World!")
    print(greet("User"))`,

  java: `// Simple Java Hello World program
public class Main {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println("Hello World!");
        System.out.println(greet("User"));
    }
}`,

  'c++': `// Simple C++ Hello World program
#include <iostream>
#include <string>
using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << "Hello World!" << endl;
    cout << greet("User") << endl;
    return 0;
}`,

  c: `// Simple C Hello World program
#include <stdio.h>
#include <string.h>

void greet(char* name, char* result) {
    sprintf(result, "Hello, %s!", name);
}

int main() {
    printf("Hello World!\\n");
    
    char greeting[50];
    greet("User", greeting);
    printf("%s\\n", greeting);
    
    return 0;
}`,

  php: `<?php
// Simple PHP Hello World program
function greet($name) {
    return "Hello, " . $name . "!";
}

echo "Hello World!\\n";
echo greet("User");`,

  ruby: `# Simple Ruby Hello World program
def greet(name)
  "Hello, #{name}!"
end

puts "Hello World!"
puts greet("User")`,

  go: `// Simple Go Hello World program
package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    fmt.Println("Hello World!")
    fmt.Println(greet("User"))
}`,

  rust: `// Simple Rust Hello World program
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    println!("Hello World!");
    println!("{}", greet("User"));
}`,

  'c#': `// Simple C# Hello World program
using System;

class Program {
    static string Greet(string name) {
        return $"Hello, {name}!";
    }

    static void Main() {
        Console.WriteLine("Hello World!");
        Console.WriteLine(Greet("User"));
    }
}`
};