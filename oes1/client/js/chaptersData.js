/**
 * CodeQuest Chapter-Wise Learning Content
 * 6 Subjects x 5 Chapters = 30 Comprehensive Chapters
 * Real learning content, code examples, explanations, summaries, and practice questions.
 */

const CHAPTERS_DATA = {
    // =========================================================================
    // JAVA
    // =========================================================================
    "java": [
        {
            chapterNumber: 1,
            title: "Java Basics",
            estimatedTime: 15,
            difficulty: "Beginner",
            intro: "Welcome to Java! In this chapter, you will learn the origin of Java, how its programs run, and how to write your very first program.",
            paragraphs: [
                "Java is a high-level, class-based, object-oriented programming language designed by James Gosling at Sun Microsystems in 1995. One of Java's most famous taglines is 'Write Once, Run Anywhere' (WORA). This means that Java code compiled on a Windows machine can run directly on Linux, macOS, or any device with a compatible runtime environment.",
                "The secret behind Java's cross-platform portability is the Java Virtual Machine (JVM). When you write Java code in a text file with a `.java` extension, the Java Compiler (`javac`) translates it into an intermediate format known as Bytecode (stored in `.class` files). The JVM then interprets and runs this bytecode on the local machine.",
                "Java is a strongly typed language. This means every variable you declare must have a defined data type, such as `int` for integers, `double` for decimal numbers, `char` for single characters, and `boolean` for true or false values. Strong typing prevents many common programming bugs before your application ever runs.",
                "Every application in Java begins execution at a special entry method: `public static void main(String[] args)`. Without this method, the JVM will not know where to start running your code. In addition, Java requires that all code must be placed inside a class.",
                "Java provides automatic memory management through a background process known as the Garbage Collector. Unlike languages like C or C++, you do not need to manually free memory when you are done using objects. This reduces memory leaks and makes software development safer."
            ],
            importantPoints: [
                "Java source code (.java) compiles into platform-independent Bytecode (.class).",
                "The Java Virtual Machine (JVM) executes bytecode on any operating system.",
                "Every Java program must contain at least one class and a main() method to run.",
                "Java has primitive data types (int, float, double, char, boolean) and reference types (Strings, Arrays, Objects).",
                "Memory is automatically cleared by Java's Garbage Collector."
            ],
            codeExample: `public class Main {\n    public static void main(String[] args) {\n        // Declare primitive variables\n        int age = 20;\n        double score = 95.5;\n        boolean isStudent = true;\n        char grade = 'A';\n        String name = "Alex";\n\n        System.out.println("Student Name: " + name);\n        System.out.println("Age: " + age + ", Grade: " + grade);\n        System.out.println("Current Score: " + score);\n        System.out.println("Enrolled: " + isStudent);\n    }\n}`,
            codeExplanation: [
                "`public class Main`: Defines a class named Main. The file must be saved as `Main.java`.",
                "`public static void main(String[] args)`: The main entry point where program execution begins.",
                "`int age = 20;`: Stores a whole number in a 32-bit integer variable.",
                "`System.out.println(...)`: Prints text to the terminal and moves to a new line."
            ],
            summary: "Java is a platform-independent language powered by the JVM. It requires a main() method to execute, enforces strong data typing, and automatically manages system memory.",
            practiceQuestions: [
                {
                    question: "What does the Java compiler produce from source code?",
                    options: ["Machine binary code (.exe)", "Bytecode (.class)", "Assembly language (.asm)", "Plain text"],
                    correctAnswer: 1,
                    explanation: "Java compiler translates source code into platform-independent bytecode saved in .class files."
                },
                {
                    question: "Which component actually runs Java bytecode on a machine?",
                    options: ["JDK", "JVM", "JRE compiler", "Operating system kernel"],
                    correctAnswer: 1,
                    explanation: "The Java Virtual Machine (JVM) interprets and executes the bytecode on the target machine."
                },
                {
                    question: "What is the entry point of every standalone Java program?",
                    options: ["public void start()", "public static void main(String[] args)", "void init()", "class Main()"],
                    correctAnswer: 1,
                    explanation: "Java programs always begin executing inside the public static void main(String[] args) method."
                },
                {
                    question: "Which of the following is NOT a primitive data type in Java?",
                    options: ["int", "boolean", "String", "double"],
                    correctAnswer: 2,
                    explanation: "String is a class (reference type) in Java, while int, boolean, and double are primitive types."
                },
                {
                    question: "What feature in Java automatically reclaims unused memory?",
                    options: ["Memory Deallocator", "Garbage Collector", "Memory Pointer", "Auto-Free"],
                    correctAnswer: 1,
                    explanation: "The Garbage Collector runs in the background and automatically frees memory occupied by unreferenced objects."
                }
            ]
        },
        {
            chapterNumber: 2,
            title: "Java Control Flow",
            estimatedTime: 18,
            difficulty: "Beginner",
            intro: "Control flow statements allow your Java program to make decisions, repeat blocks of code, and execute different logic based on conditions.",
            paragraphs: [
                "Programs rarely run in a straight, uninterrupted line from top to bottom. In real-world software, applications must make decisions—for example, verifying if a user's password is correct or displaying an error message if an input is invalid. This is accomplished using conditional statements such as `if`, `else if`, and `else`.",
                "When you have many possible discrete values to check against a single variable, Java offers the `switch` statement. A switch statement tests a variable against multiple `case` labels. Modern Java even supports pattern matching and arrow syntax in switch expressions, making code clean and concise.",
                "Loops are used when you need to execute a block of code multiple times. Java provides three main loops: `for`, `while`, and `do-while`. The `for` loop is ideal when you know in advance how many times you want to iterate, such as counting from 1 to 10.",
                "The `while` loop checks a condition first and continues repeating its block as long as the condition evaluates to `true`. In contrast, the `do-while` loop executes its block at least once before checking the condition at the end, which is very helpful for menu-driven programs.",
                "Java also includes jump statements: `break` and `continue`. The `break` statement immediately terminates the loop or switch block. The `continue` statement skips the rest of the current iteration and jumps directly to the next cycle of the loop."
            ],
            importantPoints: [
                "if-else checks boolean conditions to branch program logic.",
                "switch statements are cleaner than long chains of if-else when comparing a single variable.",
                "for loops are best for counted repetitions; while loops are best for condition-based repetitions.",
                "do-while loops will always execute their code at least once.",
                "break exits a loop completely; continue jumps to the next iteration."
            ],
            codeExample: `public class ControlFlowDemo {\n    public static void main(String[] args) {\n        int marks = 85;\n\n        // Conditional branching\n        if (marks >= 90) {\n            System.out.println("Grade: A+");\n        } else if (marks >= 80) {\n            System.out.println("Grade: A");\n        } else {\n            System.out.println("Grade: B or below");\n        }\n\n        // For loop demonstration\n        System.out.println("Counting even numbers:");\n        for (int i = 2; i <= 6; i += 2) {\n            System.out.println("Number: " + i);\n        }\n    }\n}`,
            codeExplanation: [
                "`if (marks >= 90)`: Evaluates whether marks is at least 90. Since marks is 85, this is false.",
                "`else if (marks >= 80)`: Evaluates true, so 'Grade: A' is printed and the remaining else block is skipped.",
                "`for (int i = 2; i <= 6; i += 2)`: Starts `i` at 2, checks if `i <= 6`, runs the body, and increments `i` by 2 after each iteration."
            ],
            summary: "Control flow enables decision making via if-else and switch, and repetitive tasks via for, while, and do-while loops. Jump statements like break and continue alter loop execution.",
            practiceQuestions: [
                {
                    question: "Which loop is guaranteed to execute at least one time?",
                    options: ["for loop", "while loop", "do-while loop", "enhanced for loop"],
                    correctAnswer: 2,
                    explanation: "A do-while loop evaluates its condition at the bottom, guaranteeing that the loop body runs at least once."
                },
                {
                    question: "What does the 'continue' keyword do inside a loop?",
                    options: ["Exits the entire program", "Stops the loop completely", "Skips to the next iteration of the loop", "Restarts the loop from the beginning"],
                    correctAnswer: 2,
                    explanation: "The continue statement immediately stops the current iteration and advances directly to the next iteration."
                },
                {
                    question: "What will happen in a switch statement if a matching case does not have a 'break' statement?",
                    options: ["It throws a compiler error", "Execution falls through to subsequent cases", "The program terminates", "It repeats the switch statement"],
                    correctAnswer: 1,
                    explanation: "Without a break statement, execution will 'fall through' into the next case statements regardless of their conditions."
                },
                {
                    question: "What is the output of: for(int i=0; i<3; i++) { if(i==1) break; } when printing i after the loop?",
                    options: ["0", "1", "2", "i is out of scope if declared in the loop header"],
                    correctAnswer: 3,
                    explanation: "A variable declared in the for loop header (int i = 0) has block scope and cannot be accessed outside the loop."
                },
                {
                    question: "Which logical operator represents 'AND' in Java?",
                    options: ["&", "&&", "AND", "||"],
                    correctAnswer: 1,
                    explanation: "&& is the short-circuit logical AND operator in Java."
                }
            ]
        },
        {
            chapterNumber: 3,
            title: "Java OOP (Object-Oriented Programming)",
            estimatedTime: 22,
            difficulty: "Intermediate",
            intro: "Object-Oriented Programming is the heart of Java. In this chapter, you will master classes, objects, and the 4 pillars of OOP: Encapsulation, Inheritance, Polymorphism, and Abstraction.",
            paragraphs: [
                "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects', which contain both data (attributes or fields) and code (methods or functions). A class is a blueprint or template from which individual objects are created.",
                "The first pillar of OOP is Encapsulation. Encapsulation means bundling fields and methods inside a single class and restricting direct access to internal state using private variables. Public getter and setter methods are used to inspect and modify data safely, ensuring data validation.",
                "The second pillar is Inheritance. Inheritance allows a new class (subclass or child class) to inherit fields and methods from an existing class (superclass or parent class) using the `extends` keyword. This promotes code reuse and creates natural hierarchical relationships.",
                "The third pillar is Polymorphism, meaning 'many forms'. In Java, polymorphism happens at compile time through method overloading (same method name, different parameters) and at runtime through method overriding (subclass provides its own implementation of a parent class method marked with `@Override`).",
                "The fourth pillar is Abstraction. Abstraction hides internal implementation details and shows only the essential features to the user. In Java, abstraction is achieved using abstract classes and interfaces (`interface` keyword)."
            ],
            importantPoints: [
                "Class is a blueprint; an Object is an instance of a class created with the `new` keyword.",
                "Encapsulation protects object state using private variables and public getters/setters.",
                "Inheritance enables code reuse using the `extends` keyword.",
                "Polymorphism allows methods to perform different actions based on the object calling them.",
                "Abstraction hides complex implementation using abstract classes and interfaces."
            ],
            codeExample: `// Parent class\nclass Animal {\n    protected String name;\n    public Animal(String name) { this.name = name; }\n    public void makeSound() { System.out.println("Some sound"); }\n}\n\n// Subclass demonstrating Inheritance and Polymorphism\nclass Dog extends Animal {\n    public Dog(String name) { super(name); }\n    @Override\n    public void makeSound() {\n        System.out.println(name + " says: Woof! Woof!");\n    }\n}\n\npublic class OOPDemo {\n    public static void main(String[] args) {\n        Animal myDog = new Dog("Buddy");\n        myDog.makeSound(); // Runtime polymorphism\n    }\n}`,
            codeExplanation: [
                "`class Dog extends Animal`: Dog inherits all accessible properties and methods from Animal.",
                "`super(name)`: Invokes the constructor of the parent class Animal.",
                "`@Override public void makeSound()`: Overrides the parent method with a specific implementation for Dog.",
                "`Animal myDog = new Dog(\"Buddy\")`: Demonstrates runtime polymorphism where a superclass reference points to a subclass instance."
            ],
            summary: "OOP organizes software into modular, reusable objects. The four pillars—Encapsulation, Inheritance, Polymorphism, and Abstraction—provide a solid architecture for building scalable applications.",
            practiceQuestions: [
                {
                    question: "Which keyword is used to inherit a class in Java?",
                    options: ["implements", "extends", "inherits", "super"],
                    correctAnswer: 1,
                    explanation: "The 'extends' keyword is used to inherit properties and methods from a superclass."
                },
                {
                    question: "What is method overloading in Java?",
                    options: [
                        "Methods in parent and child class with identical parameters",
                        "Methods in the same class with the same name but different parameter lists",
                        "Methods that never return any value",
                        "Methods that override an interface"
                    ],
                    correctAnswer: 1,
                    explanation: "Method overloading happens when multiple methods in the same class share the same name but have different parameter types or counts."
                },
                {
                    question: "Which access modifier provides the highest level of restriction?",
                    options: ["public", "protected", "default", "private"],
                    correctAnswer: 3,
                    explanation: "The 'private' modifier restricts access strictly to the class where the member is declared."
                },
                {
                    question: "Can an abstract class in Java be directly instantiated with 'new'?",
                    options: ["Yes, always", "No, it cannot be instantiated directly", "Only if it has no abstract methods", "Only inside a static block"],
                    correctAnswer: 1,
                    explanation: "Abstract classes cannot be directly instantiated with the 'new' keyword; they must be extended by subclasses."
                },
                {
                    question: "What does the 'this' keyword refer to in Java?",
                    options: ["The parent class", "The current class object instance", "The static method", "The JVM runtime"],
                    correctAnswer: 1,
                    explanation: "'this' is a reference variable in Java that refers to the current class object instance."
                }
            ]
        },
        {
            chapterNumber: 4,
            title: "Java Arrays and Strings",
            estimatedTime: 18,
            difficulty: "Intermediate",
            intro: "Learn how to store sequences of data using Arrays and manipulate textual data effectively with Java's immutable Strings, StringBuilder, and StringBuffer.",
            paragraphs: [
                "An array in Java is a container object that holds a fixed number of values of a single type. The length of an array is established when the array is created and cannot be changed afterward. Array elements are indexed starting at 0, meaning an array of length 5 has indices from 0 to 4.",
                "You can access or modify array elements using square brackets, like `numbers[0] = 10`. To know the size of an array, Java provides the `.length` property. Arrays can also be multi-dimensional, such as 2D arrays useful for grids, matrices, and board games.",
                "In Java, `String` is an object that represents a sequence of characters. The most important characteristic of Java strings is that they are immutable. Once a `String` object is created in memory, its value cannot be changed. Any method that seems to modify a string actually creates a brand-new string in the String Pool.",
                "Because strings are immutable, performing repeated string concatenation in loops using the `+` operator can consume significant memory and slow down performance. To solve this, Java provides mutable companion classes: `StringBuilder` and `StringBuffer`.",
                "`StringBuilder` is fast and efficient for single-threaded string manipulations, while `StringBuffer` is thread-safe and synchronized for multi-threaded applications. Java also provides rich built-in string methods such as `.length()`, `.substring()`, `.toUpperCase()`, `.indexOf()`, and `.replace()`."
            ],
            importantPoints: [
                "Arrays have a fixed size; size cannot be altered after initialization.",
                "Array indexing is zero-based (0 to array.length - 1).",
                "Strings in Java are immutable; modifications create new objects in memory.",
                "Use `equals()` to compare string contents, not `==` (which compares memory references).",
                "Use `StringBuilder` for high-performance string concatenation in loops."
            ],
            codeExample: `public class ArraysStringsDemo {\n    public static void main(String[] args) {\n        // Array demonstration\n        int[] numbers = {10, 20, 30, 40, 50};\n        System.out.println("First element: " + numbers[0]);\n        System.out.println("Array length: " + numbers.length);\n\n        // String demonstration\n        String greeting = "Hello, CodeQuest!";\n        System.out.println("Uppercase: " + greeting.toUpperCase());\n\n        // StringBuilder for efficient concatenation\n        StringBuilder sb = new StringBuilder("Java");\n        sb.append(" is").append(" awesome!");\n        System.out.println("StringBuilder result: " + sb.toString());\n    }\n}`,
            codeExplanation: [
                "`int[] numbers = {10, 20, 30, 40, 50}`: Initializes an integer array of size 5.",
                "`numbers.length`: Returns the total number of slots in the array.",
                "`greeting.toUpperCase()`: Generates a new string with all uppercase letters.",
                "`sb.append(...)`: Modifies the internal character buffer without creating new string objects."
            ],
            summary: "Arrays store fixed-size homogeneous data indexed from zero. Strings are immutable text objects, and StringBuilder provides mutable, high-performance string building.",
            practiceQuestions: [
                {
                    question: "What is the index of the last element in an array of size 10?",
                    options: ["10", "9", "0", "11"],
                    correctAnswer: 1,
                    explanation: "Java arrays are zero-indexed, so an array of size 10 has elements indexed from 0 to 9."
                },
                {
                    question: "Why are Java Strings called immutable?",
                    options: [
                        "They cannot be passed to methods",
                        "Their value cannot be changed once created",
                        "They only hold numerical characters",
                        "They can only be declared inside classes"
                    ],
                    correctAnswer: 1,
                    explanation: "Immutability means that once a String object is created in memory, its contents can never be modified."
                },
                {
                    question: "Which method should you use to check if two strings have identical text?",
                    options: ["s1 == s2", "s1.equals(s2)", "s1.compare(s2)", "s1.sameAs(s2)"],
                    correctAnswer: 1,
                    explanation: "The equals() method compares the actual text characters, whereas '==' compares whether both variables point to the exact same memory address."
                },
                {
                    question: "Which class is recommended for efficient string concatenation in a single-threaded program?",
                    options: ["String", "StringBuffer", "StringBuilder", "CharArray"],
                    correctAnswer: 2,
                    explanation: "StringBuilder is non-synchronized and faster than StringBuffer, making it ideal for single-threaded string modifications."
                },
                {
                    question: "What exception is thrown if you try to access an invalid index like numbers[10] on an array of length 5?",
                    options: ["NullPointerException", "ArrayIndexOutOfBoundsException", "IllegalArgumentException", "IndexMismatchException"],
                    correctAnswer: 1,
                    explanation: "Java throws an ArrayIndexOutOfBoundsException whenever you attempt to access an index smaller than 0 or greater than/equal to array.length."
                }
            ]
        },
        {
            chapterNumber: 5,
            title: "Advanced Java",
            estimatedTime: 25,
            difficulty: "Advanced",
            intro: "Take your Java skills to the professional level by exploring Exception Handling, the Java Collections Framework, Generics, and Lambda Expressions.",
            paragraphs: [
                "In enterprise software development, handling runtime errors gracefully is crucial. Java provides a robust Exception Handling mechanism using `try`, `catch`, `finally`, and `throw`. Checked exceptions must be caught or declared, while unchecked runtime exceptions (like `NullPointerException`) occur due to logic flaws.",
                "The `finally` block is guaranteed to execute whether an exception was thrown or not. It is typically used for cleanup tasks such as closing open database connections, network sockets, or file streams. Modern Java also features `try-with-resources`, which automatically closes resources that implement `AutoCloseable`.",
                "The Java Collections Framework (JCF) provides ready-to-use data structures and algorithms. Instead of building arrays by hand, you can use `ArrayList` for dynamic lists, `HashSet` for unique items, `LinkedList` for fast insertions, and `HashMap` for storing key-value pairs with fast lookups.",
                "Generics allow classes, interfaces, and methods to operate on objects of various types while providing compile-time type safety. For example, `List<String>` ensures that only strings can be stored in the list, preventing runtime `ClassCastException` errors.",
                "Java 8 introduced functional programming concepts through Lambda Expressions and the Stream API. Lambdas allow you to write concise anonymous functions, and Streams make filtering, mapping, and aggregating collection data remarkably expressive and readable."
            ],
            importantPoints: [
                "Use try-catch-finally or try-with-resources to handle errors and clean up resources safely.",
                "Collections Framework provides List (ArrayList), Set (HashSet), and Map (HashMap).",
                "Generics (<T>) provide compile-time type safety and eliminate manual casting.",
                "Lambda expressions (`(a, b) -> a + b`) allow passing code as data.",
                "The Stream API enables clean, functional-style operations on collections."
            ],
            codeExample: `import java.util.*;\n\npublic class AdvancedJavaDemo {\n    public static void main(String[] args) {\n        // Collections and Generics\n        Map<String, Integer> studentScores = new HashMap<>();\n        studentScores.put("Alice", 92);\n        studentScores.put("Bob", 88);\n        studentScores.put("Charlie", 95);\n\n        // Stream API & Lambda to filter high scorers\n        studentScores.entrySet().stream()\n            .filter(entry -> entry.getValue() >= 90)\n            .forEach(entry -> System.out.println("Top Student: " + entry.getKey() + " (" + entry.getValue() + ")"));\n\n        // Exception Handling\n        try {\n            int result = 100 / 0;\n        } catch (ArithmeticException e) {\n            System.out.println("Handled safely: Cannot divide by zero!");\n        }\n    }\n}`,
            codeExplanation: [
                "`Map<String, Integer> studentScores = new HashMap<>()`: Creates a key-value map mapping student names to scores.",
                "`.filter(entry -> entry.getValue() >= 90)`: Uses a lambda predicate to keep only entries with scores of 90 or higher.",
                "`try { ... } catch (ArithmeticException e)`: Catches division by zero error without crashing the program."
            ],
            summary: "Advanced Java focuses on resilient exception handling, flexible data storage via the Collections Framework, type-safe Generics, and modern functional programming with Lambdas and Streams.",
            practiceQuestions: [
                {
                    question: "Which block is always executed regardless of whether an exception occurred?",
                    options: ["try", "catch", "finally", "throw"],
                    correctAnswer: 2,
                    explanation: "The finally block always runs after try and catch blocks, making it ideal for closing connections and freeing resources."
                },
                {
                    question: "Which collection class stores key-value pairs without maintaining key order?",
                    options: ["ArrayList", "HashSet", "HashMap", "TreeMap"],
                    correctAnswer: 2,
                    explanation: "HashMap stores data as key-value pairs using hashing, providing fast lookups without a guaranteed iteration order."
                },
                {
                    question: "What is the primary benefit of Java Generics?",
                    options: [
                        "Increases runtime execution speed",
                        "Provides compile-time type checking to prevent ClassCastException",
                        "Enables multiple inheritance of classes",
                        "Eliminates the need for classes"
                    ],
                    correctAnswer: 1,
                    explanation: "Generics allow developers to specify allowed types at compile time, eliminating manual casting and preventing runtime type errors."
                },
                {
                    question: "Which Java version introduced Lambda Expressions and the Stream API?",
                    options: ["Java 5", "Java 6", "Java 8", "Java 11"],
                    correctAnswer: 2,
                    explanation: "Java 8 (released in 2014) introduced Lambda Expressions, Streams, Functional Interfaces, and the java.time API."
                },
                {
                    question: "Which collection interface does NOT allow duplicate elements?",
                    options: ["List", "Set", "Queue", "ArrayList"],
                    correctAnswer: 1,
                    explanation: "The Set interface (and implementations like HashSet and TreeSet) models the mathematical set and forbids duplicates."
                }
            ]
        }
    ],

    // =========================================================================
    // C++
    // =========================================================================
    "cpp": [
        {
            chapterNumber: 1,
            title: "C++ Basics",
            estimatedTime: 15,
            difficulty: "Beginner",
            intro: "Welcome to C++! Discover how C++ gives you low-level control with high-level programming power, its compilation process, and basic syntax.",
            paragraphs: [
                "C++ is a general-purpose, high-performance programming language developed by Bjarne Stroustrup at Bell Labs starting in 1979 as an extension of the C language. Originally nicknamed 'C with Classes', it was created to add object-oriented features, type checking, and modularity to the raw speed and direct hardware control of C.",
                "Unlike interpreted languages or virtual-machine languages, C++ compiles directly into native machine code. When you run `g++ main.cpp -o main`, the compiler translates your code directly into binary instructions executed by your computer's CPU. This is why C++ powers game engines, operating systems, browsers, and embedded systems.",
                "Every C++ program starts executing in the `main()` function, which returns an integer (usually `0` indicating successful completion). Output is written using `std::cout` (character output) and input is captured with `std::cin` (character input), both available in the `<iostream>` header.",
                "C++ is a strongly and statically typed language. It provides built-in primitive types including `int`, `float`, `double`, `char`, and `bool`. You can declare constant values using the `const` keyword or compile-time constants using `constexpr`.",
                "Namespaces in C++ prevent naming conflicts across large projects and libraries. Standard library features reside inside the `std` namespace, accessed either with the scope resolution operator (`std::cout`) or by bringing symbols into scope with `using namespace std;`."
            ],
            importantPoints: [
                "C++ compiles directly to native CPU machine code for maximum performance.",
                "The `<iostream>` library provides `std::cin` and `std::cout` for I/O operations.",
                "Program execution strictly begins in the `int main()` function.",
                "Variables are statically typed and must be declared before use.",
                "Namespaces group identifiers to prevent naming collisions."
            ],
            codeExample: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Declare and initialize variables\n    int age = 21;\n    double gpa = 3.85;\n    string hero = "Coder";\n    bool isActive = true;\n\n    cout << "Welcome to C++ Mastery!" << endl;\n    cout << "Hero: " << hero << " | Age: " << age << endl;\n    cout << "GPA: " << gpa << " | Active: " << boolalpha << isActive << endl;\n\n    return 0;\n}`,
            codeExplanation: [
                "`#include <iostream>`: Preprocessor directive that includes input/output stream declarations.",
                "`using namespace std;`: Allows referencing standard library components without typing `std::` prefix every time.",
                "`cout << ... << endl;`: Streams text to the console; `endl` inserts a newline and flushes the buffer.",
                "`return 0;`: Returns status code 0 to the operating system, signaling successful execution."
            ],
            summary: "C++ combines low-level memory efficiency with high-level expressiveness, compiling directly to native machine instructions starting from int main().",
            practiceQuestions: [
                {
                    question: "Who created the C++ programming language?",
                    options: ["Dennis Ritchie", "Bjarne Stroustrup", "James Gosling", "Guido van Rossum"],
                    correctAnswer: 1,
                    explanation: "Bjarne Stroustrup created C++ at Bell Labs in 1979 as an extension of the C programming language."
                },
                {
                    question: "Which header file is required to use std::cout and std::cin?",
                    options: ["<stdio.h>", "<iostream>", "<stdlib.h>", "<string>"],
                    correctAnswer: 1,
                    explanation: "The <iostream> header file provides definitions for standard input and output streams in C++."
                },
                {
                    question: "What does the insertion operator '<<' do when used with cout?",
                    options: ["Bitwise shifts left only", "Sends data to the output stream", "Takes user input", "Compares two numbers"],
                    correctAnswer: 1,
                    explanation: "In C++ stream operations, '<<' is overloaded as the stream insertion operator, sending data to cout."
                },
                {
                    question: "What is the return type of the main() function in standard C++?",
                    options: ["void", "int", "float", "bool"],
                    correctAnswer: 1,
                    explanation: "Standard C++ requires main() to return an integer ('int') to report process exit status to the operating system."
                },
                {
                    question: "What is the purpose of a namespace in C++?",
                    options: ["To speed up compilation", "To prevent naming conflicts between different libraries", "To allocate dynamic memory", "To replace classes"],
                    correctAnswer: 1,
                    explanation: "Namespaces group symbols and functions under a unique name, preventing naming collisions across modules and third-party libraries."
                }
            ]
        },
        {
            chapterNumber: 2,
            title: "C++ Control Statements",
            estimatedTime: 18,
            difficulty: "Beginner",
            intro: "Master decision-making and looping structures in C++, including if-else, switch, for loops, while loops, and range-based loops.",
            paragraphs: [
                "Control statements in C++ determine the flow of execution based on relational and logical expressions. Relational operators like `==`, `!=`, `<`, `>`, `<=`, and `>=` return boolean values that guide execution pathways.",
                "The `if-else` statement is the most common conditional structure. When multiple conditions must be evaluated in sequence, `else if` ladders allow you to test conditions until one matches, with an optional trailing `else` as a fallback.",
                "The `switch` statement evaluates an integral or enumeration expression and matches it against `case` constants. Each case should typically conclude with a `break` statement to prevent execution from continuing into subsequent cases.",
                "C++ supports standard repetition loops: `for`, `while`, and `do-while`. Since C++11, C++ also features the modern 'range-based for loop' (`for (auto item : collection)`), which makes iterating over arrays and containers clean and readable.",
                "Ternary operator `condition ? value_if_true : value_if_false` provides a compact way to perform simple conditional assignments in a single line."
            ],
            importantPoints: [
                "Use `if-else` for complex boolean logic and range checks.",
                "Use `switch` for clean branching on integer or char constants.",
                "Range-based for loops (`for (auto x : arr)`) simplify container iteration.",
                "`break` exits loops/switch; `continue` skips to the next loop iteration.",
                "Ensure while loops update loop variables to prevent infinite loops."
            ],
            codeExample: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 88;\n\n    // Ternary operator\n    string result = (score >= 50) ? "Passed" : "Failed";\n    cout << "Status: " << result << endl;\n\n    // Switch statement\n    char tier = 'B';\n    switch (tier) {\n        case 'A': cout << "Excellent Tier!" << endl; break;\n        case 'B': cout << "Great Tier!" << endl; break;\n        default:  cout << "Standard Tier" << endl; break;\n    }\n\n    // Range-based for loop\n    int primes[] = {2, 3, 5, 7, 11};\n    cout << "Prime numbers: ";\n    for (int p : primes) {\n        cout << p << " ";\n    }\n    cout << endl;\n    return 0;\n}`,
            codeExplanation: [
                "`(score >= 50) ? \"Passed\" : \"Failed\"`: Evaluates score; returns 'Passed' if true.",
                "`switch(tier)`: Matches character 'B' and executes the corresponding case block.",
                "`for (int p : primes)`: Range-based loop that automatically iterates over each element in the array."
            ],
            summary: "C++ control statements provide flexible branching through if-else, switch, ternary operators, and multiple loop types including modern range-based iteration.",
            practiceQuestions: [
                {
                    question: "Which of the following expressions is a valid ternary operator in C++?",
                    options: ["if x then y else z", "x ? y : z", "x : y ? z", "x ?? y : z"],
                    correctAnswer: 1,
                    explanation: "The ternary operator syntax in C++ is: condition ? value_if_true : value_if_false."
                },
                {
                    question: "What is the key benefit of a range-based for loop introduced in C++11?",
                    options: [
                        "It eliminates the need for manual index management",
                        "It runs on multiple CPU cores automatically",
                        "It only works with pointer arrays",
                        "It cannot be interrupted with break"
                    ],
                    correctAnswer: 0,
                    explanation: "Range-based for loops eliminate off-by-one errors and the need to manually track index bounds."
                },
                {
                    question: "What happens if all cases in a switch statement fail and there is no default case?",
                    options: [
                        "The program crashes",
                        "Execution continues after the switch block without error",
                        "A compiler error is raised",
                        "The first case is executed by default"
                    ],
                    correctAnswer: 1,
                    explanation: "If no case matches and no default block exists, execution simply continues past the switch block."
                },
                {
                    question: "Which keyword skips the current iteration and begins the next loop cycle?",
                    options: ["pass", "skip", "continue", "break"],
                    correctAnswer: 2,
                    explanation: "The 'continue' statement immediately jumps to the next cycle of the enclosing loop."
                },
                {
                    question: "Which condition tests if variable x is between 10 and 20 inclusive?",
                    options: ["10 <= x <= 20", "x >= 10 && x <= 20", "x >= 10 || x <= 20", "x in (10, 20)"],
                    correctAnswer: 1,
                    explanation: "In C++, chaining comparisons like 10 <= x <= 20 does not work as expected; you must use logical AND: x >= 10 && x <= 20."
                }
            ]
        },
        {
            chapterNumber: 3,
            title: "C++ Functions and Pointers",
            estimatedTime: 22,
            difficulty: "Intermediate",
            intro: "Unlock the true power of C++! Understand modular functions, pass-by-value vs pass-by-reference, memory addresses, and raw pointers.",
            paragraphs: [
                "Functions allow you to break complex programs into small, modular, reusable blocks of code. A C++ function definition specifies a return type, a function name, and optional parameters. If a function does not return any value, its return type is `void`.",
                "In C++, function arguments can be passed in three ways: pass-by-value (creates a copy of the argument), pass-by-reference using `&` (shares the original variable with zero copying), and pass-by-pointer using `*` (passes the memory address of the variable).",
                "Every variable in your computer's memory resides at a unique hexadecimal address. You can discover the memory address of any variable using the address-of operator `&` (e.g., `&myVar`).",
                "A pointer is a variable that stores the memory address of another variable. You declare a pointer with an asterisk: `int* ptr = &myVar;`. To read or modify the value stored at that address, you dereference the pointer using the `*` operator (e.g., `*ptr = 50;`).",
                "Pointers enable dynamic memory allocation using `new` and `delete`. However, unmanaged pointers can lead to memory leaks or dangling pointers. Modern C++ heavily encourages references and smart pointers (`std::unique_ptr`, `std::shared_ptr`) for safe memory management."
            ],
            importantPoints: [
                "Pass-by-reference (`void foo(int& x)`) allows modifying caller variables without copying overhead.",
                "The `&` operator retrieves memory addresses; the `*` operator dereferences pointers to access values.",
                "Pointers can be assigned `nullptr` when not pointing to valid memory.",
                "Dynamic memory allocated with `new` must always be released with `delete` to prevent memory leaks.",
                "Smart pointers in `<memory>` automate memory management using RAII."
            ],
            codeExample: `#include <iostream>\nusing namespace std;\n\n// Function using pass-by-reference\nvoid swapValues(int& a, int& b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}\n\nint main() {\n    int x = 10, y = 20;\n    cout << "Before swap: x=" << x << ", y=" << y << endl;\n    swapValues(x, y);\n    cout << "After swap:  x=" << x << ", y=" << y << endl;\n\n    // Pointer demonstration\n    int value = 100;\n    int* ptr = &value;\n    cout << "Memory address: " << ptr << endl;\n    cout << "Dereferenced value: " << *ptr << endl;\n\n    *ptr = 250; // Modify original via pointer\n    cout << "Updated original value: " << value << endl;\n    return 0;\n}`,
            codeExplanation: [
                "`void swapValues(int& a, int& b)`: Uses reference parameters to swap the actual variables in the caller's scope.",
                "`int* ptr = &value`: Stores the memory address of `value` inside pointer `ptr`.",
                "`*ptr = 250`: Dereferences `ptr` and writes 250 directly into the memory location of `value`."
            ],
            summary: "Functions modularize code, references allow efficient parameter passing, and pointers directly manipulate memory addresses and dynamically allocated resources.",
            practiceQuestions: [
                {
                    question: "What does the '&' operator return when placed before a variable name?",
                    options: ["The variable's data type", "The variable's memory address", "The value multiplied by 2", "A copy of the variable"],
                    correctAnswer: 1,
                    explanation: "The address-of operator '&' returns the hexadecimal memory address where the variable is stored."
                },
                {
                    question: "What is dereferencing a pointer?",
                    options: [
                        "Deleting the pointer from memory",
                        "Accessing or modifying the value at the address held by the pointer",
                        "Setting the pointer to nullptr",
                        "Converting a pointer to an integer"
                    ],
                    correctAnswer: 1,
                    explanation: "Dereferencing (using the '*' operator on a pointer) accesses the value stored at the memory address the pointer points to."
                },
                {
                    question: "What is the recommended null pointer constant in modern C++?",
                    options: ["NULL", "0", "nullptr", "void"],
                    correctAnswer: 2,
                    explanation: "C++11 introduced 'nullptr' as a type-safe null pointer literal, replacing ambiguous NULL and 0."
                },
                {
                    question: "What problem occurs if memory allocated with 'new' is never deleted?",
                    options: ["Stack overflow", "Memory leak", "Segmentation fault", "Deadlock"],
                    correctAnswer: 1,
                    explanation: "Failing to free dynamically allocated heap memory with 'delete' leads to memory leaks, slowly consuming system RAM."
                },
                {
                    question: "What is the benefit of passing large objects by const reference (const MyClass& obj)?",
                    options: [
                        "It creates two copies for redundancy",
                        "It avoids expensive copying while preventing accidental modification",
                        "It converts the object into a primitive type",
                        "It makes the function run in background threads"
                    ],
                    correctAnswer: 1,
                    explanation: "Passing by const reference avoids copying overhead while ensuring the function cannot alter the caller's object."
                }
            ]
        },
        {
            chapterNumber: 4,
            title: "C++ OOP (Object-Oriented Programming)",
            estimatedTime: 22,
            difficulty: "Intermediate",
            intro: "Learn how C++ models real-world problems through Classes, Constructors, Destructors, Encapsulation, Inheritance, and Virtual Functions.",
            paragraphs: [
                "C++ is a multi-paradigm language with comprehensive support for Object-Oriented Programming. A class in C++ is a user-defined data type that binds data members (variables) and member functions (methods) into a cohesive unit.",
                "Access specifiers in C++ control visibility: `public` members can be accessed from anywhere, `private` members can only be accessed within the class itself, and `protected` members can be accessed by the class and its derived subclasses.",
                "A constructor is a special member function with the same name as the class that runs automatically when an object is instantiated. C++ also features Destructors (prefixed with `~`), which run automatically when an object goes out of scope, making resource cleanup automatic.",
                "Inheritance in C++ allows a derived class to inherit from one or more base classes (C++ supports multiple inheritance). You can specify public, protected, or private inheritance depending on how base members should be exposed.",
                "To achieve runtime polymorphism in C++, member functions in the base class must be declared with the `virtual` keyword. When a function is virtual, C++ uses an internal virtual table (vtable) to ensure the most derived version of the method executes at runtime."
            ],
            importantPoints: [
                "Classes encapsulate data with `private`, `protected`, and `public` access levels.",
                "Constructors initialize objects; destructors (`~ClassName()`) clean up resources.",
                "C++ supports single, multiple, and multi-level inheritance.",
                "Virtual functions enable runtime polymorphism through dynamic dispatch (vtables).",
                "Pure virtual functions (`virtual void func() = 0;`) create abstract base classes."
            ],
            codeExample: `#include <iostream>\nusing namespace std;\n\nclass Shape {\npublic:\n    virtual void draw() const {\n        cout << "Drawing a generic shape." << endl;\n    }\n    virtual ~Shape() {} // Virtual destructor for safe cleanup\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() const override {\n        cout << "Drawing a glowing neon Circle!" << endl;\n    }\n};\n\nint main() {\n    Shape* shapePtr = new Circle();\n    shapePtr->draw(); // Calls Circle's draw() via virtual dispatch\n    delete shapePtr;\n    return 0;\n}`,
            codeExplanation: [
                "`virtual void draw() const`: Marks the method as virtual so derived classes can override it dynamically.",
                "`class Circle : public Shape`: Publicly inherits Shape.",
                "`void draw() const override`: Overrides the base method; `override` keyword catches signature mistakes at compile time.",
                "`Shape* shapePtr = new Circle()`: Demonstrates polymorphic pointer usage."
            ],
            summary: "C++ OOP uses classes, constructors, and destructors for resource management. Virtual functions enable dynamic polymorphism, and access specifiers enforce clean encapsulation.",
            practiceQuestions: [
                {
                    question: "Which keyword enables runtime polymorphism for member functions in C++?",
                    options: ["override", "virtual", "dynamic", "polymorphic"],
                    correctAnswer: 1,
                    explanation: "The 'virtual' keyword instructs the compiler to use dynamic dispatch through a virtual table (vtable)."
                },
                {
                    question: "What is the name of a member function that executes when an object is destroyed?",
                    options: ["Finalizer", "Destructor", "Deleter", "Cleanup"],
                    correctAnswer: 1,
                    explanation: "A destructor (named with a tilde prefix: ~ClassName) runs automatically when an object's lifecycle ends."
                },
                {
                    question: "By default, what is the access level of members in a C++ 'class' if not specified?",
                    options: ["public", "private", "protected", "global"],
                    correctAnswer: 1,
                    explanation: "In C++, members of a class are private by default (unlike struct, where members are public by default)."
                },
                {
                    question: "What makes a C++ class an abstract class?",
                    options: [
                        "It has at least one pure virtual function (= 0)",
                        "It contains no data members",
                        "It is declared with the keyword 'abstract'",
                        "It has private constructors"
                    ],
                    correctAnswer: 0,
                    explanation: "A class containing at least one pure virtual function (e.g. virtual void func() = 0;) is an abstract class and cannot be instantiated."
                },
                {
                    question: "Does C++ allow a class to inherit from more than one base class?",
                    options: ["No, only single inheritance is supported", "Yes, through multiple inheritance", "Only if both base classes are structs", "Only in C++20"],
                    correctAnswer: 1,
                    explanation: "Yes, C++ supports multiple inheritance, allowing a derived class to inherit from two or more base classes."
                }
            ]
        },
        {
            chapterNumber: 5,
            title: "C++ STL (Standard Template Library)",
            estimatedTime: 25,
            difficulty: "Advanced",
            intro: "Harness the true power of competitive programming and software engineering in C++ using the Standard Template Library (STL).",
            paragraphs: [
                "The Standard Template Library (STL) is a powerful collection of generic C++ class and function templates. It is built upon four fundamental pillars: Containers (data structures), Algorithms (processing logic), Iterators (traversal bridges), and Functors/Lambdas.",
                "Sequence containers store data in linear order. `std::vector` is a dynamic array that automatically resizes when elements are added and provides amortized O(1) random access. `std::deque` allows fast insertions at both ends, and `std::list` is a doubly linked list.",
                "Associative containers store sorted data with logarithmic lookup time. `std::set` stores unique sorted elements, and `std::map` stores sorted key-value pairs backed by Red-Black Self-Balancing Trees. For constant-time average lookups, C++ provides unordered containers (`std::unordered_map`, `std::unordered_set`) backed by Hash Tables.",
                "Iterators act like smart pointers that allow algorithms to traverse any container uniformly. Common iterator methods include `.begin()`, `.end()`, `.rbegin()`, and `.rend()`.",
                "The `<algorithm>` header provides dozens of battle-tested algorithms, such as `std::sort`, `std::binary_search`, `std::reverse`, `std::min_element`, and `std::accumulate`. Combining STL containers with algorithms enables you to write clean, lightning-fast code with minimal effort."
            ],
            importantPoints: [
                "`std::vector` is the default go-to container for dynamic sequences.",
                "`std::map` is ordered (O(log N)); `std::unordered_map` is hashed (O(1) average).",
                "`std::sort` runs in O(N log N) using Introsort (QuickSort + HeapSort + InsertionSort).",
                "Iterators provide a uniform interface for traversing diverse container types.",
                "Always prefer STL containers over raw arrays for safety, functionality, and speed."
            ],
            codeExample: `#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    // Vector container\n    vector<int> scores = {85, 92, 78, 99, 88};\n    scores.push_back(95); // Dynamic append\n\n    // STL algorithm\n    sort(scores.begin(), scores.end());\n    cout << "Sorted scores: ";\n    for (int s : scores) cout << s << " ";\n    cout << endl;\n\n    // Unordered map (Hash table)\n    unordered_map<string, int> inventory;\n    inventory["potions"] = 5;\n    inventory["shields"] = 2;\n    cout << "Potions in stock: " << inventory["potions"] << endl;\n    return 0;\n}`,
            codeExplanation: [
                "`vector<int> scores`: Creates a dynamic array of integers.",
                "`scores.push_back(95)`: Appends 95 to the end of the vector, resizing memory automatically.",
                "`sort(scores.begin(), scores.end())`: Sorts elements in ascending order in O(N log N) time.",
                "`unordered_map<string, int> inventory`: Creates a hash map for O(1) average key-value lookups."
            ],
            summary: "The C++ STL provides battle-tested containers (vector, map, set), iterators, and algorithms (sort, search) that maximize development speed and runtime efficiency.",
            practiceQuestions: [
                {
                    question: "What is the average time complexity to access an element by index in std::vector?",
                    options: ["O(N)", "O(log N)", "O(1)", "O(N^2)"],
                    correctAnswer: 2,
                    explanation: "Like arrays, std::vector stores elements contiguously in memory, giving O(1) constant time random access."
                },
                {
                    question: "Which STL container stores elements as unique, automatically sorted keys?",
                    options: ["std::vector", "std::set", "std::unordered_set", "std::list"],
                    correctAnswer: 1,
                    explanation: "std::set stores unique keys ordered by a comparison function (usually implemented as a Red-Black Tree)."
                },
                {
                    question: "What is the underlying data structure of std::unordered_map?",
                    options: ["Binary Search Tree", "Hash Table", "Doubly Linked List", "Min-Heap"],
                    correctAnswer: 1,
                    explanation: "std::unordered_map uses a Hash Table with buckets to deliver average O(1) search, insert, and delete complexity."
                },
                {
                    question: "Which header file must be included to use std::sort and std::binary_search?",
                    options: ["<vector>", "<algorithm>", "<cmath>", "<utility>"],
                    correctAnswer: 1,
                    explanation: "The <algorithm> header provides standard algorithms including sort, binary_search, reverse, and min/max."
                },
                {
                    question: "What does the .end() iterator of an STL container point to?",
                    options: [
                        "The last valid element",
                        "The position one past the last element",
                        "The first element",
                        "A null pointer"
                    ],
                    correctAnswer: 1,
                    explanation: "In STL conventions, end() points to the element following the last element (half-open range [begin, end))."
                }
            ]
        }
    ],

    // =========================================================================
    // PYTHON
    // =========================================================================
    "python": [
        {
            chapterNumber: 1,
            title: "Python Basics",
            estimatedTime: 15,
            difficulty: "Beginner",
            intro: "Welcome to Python! Renowned for its clean, human-readable syntax, Python is the world's most popular language for beginners, data science, and web development.",
            paragraphs: [
                "Python was conceived in the late 1980s by Guido van Rossum in the Netherlands and released in 1991. It was designed with a key design philosophy: code readability matters. Python uses clear English keywords and enforces indentation rather than curly braces `{}` to define code blocks.",
                "Python is an interpreted, dynamically typed language. 'Interpreted' means code is executed line by line by the Python interpreter without requiring a prior compilation step. 'Dynamically typed' means you do not need to state whether a variable is an integer or string—Python infers types at runtime.",
                "To display output on the screen, Python provides the simple `print()` function. To collect user input from the console, Python provides the `input()` function, which captures responses as strings.",
                "Comments in Python begin with the `#` symbol for single lines, or triple quotes (`'''` or `\"\"\"`) for multi-line docstrings. Writing informative comments and docstrings is considered a standard best practice in the Python community.",
                "Python includes automatic memory management with reference counting and a generational garbage collector, allowing you to focus entirely on problem solving rather than hardware management."
            ],
            importantPoints: [
                "Clean syntax: Indentation (4 spaces) defines code blocks instead of braces.",
                "Dynamically typed: Variable types are inferred automatically at runtime.",
                "Interpreted: Executes code line by line, allowing rapid prototyping.",
                "Use `print()` for console output and `input()` for reading user input.",
                "Massive standard library and package ecosystem (PyPI) accessible via `pip`."
            ],
            codeExample: `# Simple Python introduction\nname = "Python Explorer"\nage = 24\nskill_level = 9.8\nis_coder = True\n\nprint(f"Hello, {name}!")\nprint(f"Age: {age} | Skill: {skill_level} | Active: {is_coder}")\n\n# Dynamic type reassignment\nx = 100\nprint("x is an integer:", type(x))\nx = "Now I am a string!"\nprint("x is now:", type(x))`,
            codeExplanation: [
                "`name = \"Python Explorer\"`: Creates a string variable without specifying a type.",
                "`f\"Hello, {name}!\"`: An f-string (formatted string literal) that cleanly interpolates variables inside text.",
                "`type(x)`: Built-in function that inspects the runtime data type of any variable."
            ],
            summary: "Python emphasizes clean, readable code with significant whitespace indentation, dynamic typing, and immediate execution via an interactive interpreter.",
            practiceQuestions: [
                {
                    question: "Who created the Python programming language?",
                    options: ["Guido van Rossum", "Brendan Eich", "James Gosling", "Tim Berners-Lee"],
                    correctAnswer: 0,
                    explanation: "Guido van Rossum developed Python and released it in 1991."
                },
                {
                    question: "How are code blocks (like inside an if statement or loop) defined in Python?",
                    options: ["Curly braces { }", "Indentation (whitespace)", "Square brackets [ ]", "Begin...End keywords"],
                    correctAnswer: 1,
                    explanation: "Python enforces whitespace indentation (standard is 4 spaces) to define code blocks."
                },
                {
                    question: "What is the output of type(42.5) in Python?",
                    options: ["<class 'int'>", "<class 'float'>", "<class 'decimal'>", "<class 'double'>"],
                    correctAnswer: 1,
                    explanation: "Numbers with decimal points are represented by the float class in Python."
                },
                {
                    question: "Which prefix is used to create formatted f-strings in Python 3.6+?",
                    options: ["s\"...\"", "f\"...\"", "format\"...\"", "@\"...\""],
                    correctAnswer: 1,
                    explanation: "Prefixing a string with 'f' or 'F' creates an f-string allowing variable interpolation with {variable}."
                },
                {
                    question: "What symbol denotes a single-line comment in Python?",
                    options: ["//", "/*", "#", "--"],
                    correctAnswer: 2,
                    explanation: "The hash symbol (#) marks the start of a single-line comment in Python."
                }
            ]
        },
        {
            chapterNumber: 2,
            title: "Python Data Types",
            estimatedTime: 18,
            difficulty: "Beginner",
            intro: "Master Python's rich built-in data structures: Lists, Tuples, Sets, and Dictionaries, and understand mutability vs immutability.",
            paragraphs: [
                "Python provides four powerful, built-in collection data types: Lists, Tuples, Sets, and Dictionaries. Choosing the right data type makes your code cleaner, faster, and more memory-efficient.",
                "A `list` is an ordered, mutable collection defined with square brackets `[]`. You can add elements with `.append()`, remove items with `.remove()`, and slice sub-lists with syntax like `my_list[1:4]`. Lists can contain mixed data types and permit duplicate values.",
                "A `tuple` is an ordered, immutable collection defined with parentheses `()`. Because tuples cannot be altered after creation, they are faster than lists and protect constants from accidental modification. Tuples are frequently used to return multiple values from functions.",
                "A `set` is an unordered collection of unique elements defined with curly braces `{}`. Sets automatically eliminate duplicates and offer high-speed membership testing (`item in my_set`) and mathematical operations like union, intersection, and difference.",
                "A `dictionary` (`dict`) is an unordered (ordered by insertion since Python 3.7) collection of key-value pairs defined with `{key: value}`. Keys must be unique and immutable (such as strings or numbers), while values can be any Python object."
            ],
            importantPoints: [
                "List: Ordered, mutable, allows duplicates (`[1, 2, 3]`).",
                "Tuple: Ordered, immutable, allows duplicates (`(1, 2, 3)`).",
                "Set: Unordered, mutable, strictly unique elements (`{1, 2, 3}`).",
                "Dictionary: Key-Value pairs with fast hash-based lookups (`{'name': 'Bob'}`).",
                "Use list comprehensions (`[x*2 for x in nums]`) for concise list transformations."
            ],
            codeExample: `# Collections in Python\nfruits = ["apple", "banana", "cherry"]\nfruits.append("orange")\nprint("List:", fruits)\n\n# Tuple (immutable)\ncoords = (10, 20)\nprint("Tuple coords:", coords[0], coords[1])\n\n# Set (unique)\nunique_ids = {101, 102, 101, 103}\nprint("Set (no duplicates):", unique_ids)\n\n# Dictionary (key-value)\nhero = {"name": "Nova", "level": 50, "role": "Mage"}\nprint("Hero Name:", hero["name"])\n\n# List Comprehension\nsquares = [x**2 for x in range(1, 6)]\nprint("Squares:", squares)`,
            codeExplanation: [
                "`fruits.append(\"orange\")`: Dynamically adds a new element to the end of the list.",
                "`unique_ids = {101, 102, 101, 103}`: The duplicate 101 is automatically removed by the set.",
                "`hero[\"name\"]`: Accesses the value mapped to key 'name' in O(1) average time.",
                "`[x**2 for x in range(1, 6)]`: Generates squares of numbers 1 to 5 using list comprehension."
            ],
            summary: "Python provides versatile collections: mutable Lists, immutable Tuples, unique Sets, and key-value Dictionaries, enhanced by powerful list comprehensions.",
            practiceQuestions: [
                {
                    question: "Which of the following data types in Python is IMMUTABLE?",
                    options: ["list", "dict", "set", "tuple"],
                    correctAnswer: 3,
                    explanation: "Tuples cannot be modified, resized, or reassigned after creation, making them immutable."
                },
                {
                    question: "What will be the result of len({1, 2, 2, 3, 3, 3})?",
                    options: ["6", "3", "1", "TypeError"],
                    correctAnswer: 1,
                    explanation: "Sets only store unique elements. The duplicates are stripped, leaving {1, 2, 3}, which has length 3."
                },
                {
                    question: "How do you access the value associated with key 'age' in dict d = {'age': 25}?",
                    options: ["d.age", "d['age']", "d(age)", "d[0]"],
                    correctAnswer: 1,
                    explanation: "Dictionary values are retrieved using bracket notation with the key: d['age']."
                },
                {
                    question: "What is the output of [x for x in range(4)]?",
                    options: ["[0, 1, 2, 3]", "[1, 2, 3, 4]", "[0, 1, 2, 3, 4]", "[1, 2, 3]"],
                    correctAnswer: 0,
                    explanation: "range(4) yields integers from 0 up to, but not including, 4: [0, 1, 2, 3]."
                },
                {
                    question: "Which method adds an element to the end of a Python list?",
                    options: ["push()", "insert()", "append()", "add()"],
                    correctAnswer: 2,
                    explanation: "The append() method adds an item to the end of an existing list."
                }
            ]
        },
        {
            chapterNumber: 3,
            title: "Python Functions",
            estimatedTime: 18,
            difficulty: "Intermediate",
            intro: "Learn how to write modular, reusable code using Python functions, default arguments, *args, **kwargs, and anonymous lambda expressions.",
            paragraphs: [
                "Functions are self-contained blocks of code that execute only when called. In Python, you define a function using the `def` keyword, followed by the function name, parentheses for parameters, and a colon `:`. The function body must be indented.",
                "Functions can accept arguments and return values using the `return` statement. If a Python function reaches the end of its body without an explicit return statement, it implicitly returns `None`.",
                "Python supports default argument values. If a caller does not provide an argument, the default value is used. However, you should avoid using mutable objects (like empty lists `[]`) as default arguments because they persist across function calls.",
                "When you do not know in advance how many arguments might be passed to a function, Python offers `*args` (which collects extra positional arguments into a tuple) and `**kwargs` (which collects extra keyword arguments into a dictionary).",
                "Python also supports anonymous one-line functions called Lambda functions, declared using the `lambda` keyword. Lambdas are frequently used with higher-order functions like `map()`, `filter()`, and `sorted()`."
            ],
            importantPoints: [
                "Define functions using `def function_name(parameters):`.",
                "Return results with `return`; functions without a return statement return `None`.",
                "Default arguments allow optional parameters (`def greet(name=\"Guest\"):`).",
                "`*args` handles variable positional arguments; `**kwargs` handles variable keyword arguments.",
                "Lambda functions (`lambda x: x * 2`) are lightweight anonymous expressions."
            ],
            codeExample: `# Function with default parameter\ndef calculate_total(price, tax_rate=0.05):\n    return price + (price * tax_rate)\n\n# Variable arguments (*args and **kwargs)\ndef print_player_stats(name, *scores, **details):\n    avg = sum(scores) / len(scores) if scores else 0\n    print(f"Player: {name} | Average Score: {avg:.1f}")\n    for key, val in details.items():\n        print(f"  {key.capitalize()}: {val}")\n\n# Lambda function\ndouble = lambda x: x * 2\n\nprint("Total:", calculate_total(100))\nprint_player_stats("Kira", 90, 85, 95, guild="Shadow", rank="Master")\nprint("Lambda double of 7:", double(7))`,
            codeExplanation: [
                "`def calculate_total(price, tax_rate=0.05)`: Defines `tax_rate` with a default of 5%.",
                "`*scores`: Collects 90, 85, 95 into a tuple named `scores`.",
                "`**details`: Collects guild=\"Shadow\", rank=\"Master\" into a dictionary named `details`.",
                "`lambda x: x * 2`: Anonymous function that doubles its input."
            ],
            summary: "Functions organize code into reusable components. Python supports positional, keyword, and default parameters, flexible *args and **kwargs, and concise lambda expressions.",
            practiceQuestions: [
                {
                    question: "Which keyword is used to define a function in Python?",
                    options: ["function", "def", "func", "define"],
                    correctAnswer: 1,
                    explanation: "In Python, functions are defined using the 'def' keyword."
                },
                {
                    question: "What does a Python function return by default if no return statement is executed?",
                    options: ["0", "False", "None", "undefined"],
                    correctAnswer: 2,
                    explanation: "If a function does not encounter an explicit return statement, it returns the special value None."
                },
                {
                    question: "What data type is *args inside a function?",
                    options: ["List", "Tuple", "Dictionary", "Set"],
                    correctAnswer: 1,
                    explanation: "*args packs arbitrary positional arguments into a tuple."
                },
                {
                    question: "What data type is **kwargs inside a function?",
                    options: ["List", "Tuple", "Dictionary", "String"],
                    correctAnswer: 2,
                    explanation: "**kwargs packs arbitrary keyword arguments into a dictionary."
                },
                {
                    question: "What will lambda a, b: a + b evaluate to when called with (3, 4)?",
                    options: ["7", "12", "34", "Error"],
                    correctAnswer: 0,
                    explanation: "The lambda adds arguments a and b, so 3 + 4 returns 7."
                }
            ]
        },
        {
            chapterNumber: 4,
            title: "Python OOP (Object-Oriented Programming)",
            estimatedTime: 22,
            difficulty: "Intermediate",
            intro: "Understand how Python models objects using classes, constructors, methods, inheritance, and special dunder (magic) methods.",
            paragraphs: [
                "Everything in Python is an object—from simple integers and strings to complex functions and modules. You can create your own custom object types by defining classes using the `class` keyword.",
                "When you create a new instance of a class, Python automatically calls the `__init__()` method, commonly referred to as the constructor. The first parameter of every instance method in a Python class must be `self`, which represents the specific instance being operated on.",
                "Encapsulation in Python is handled by convention rather than strict keywords. A single leading underscore (e.g., `_protected_var`) signals that a variable is intended for internal use, while a double leading underscore (e.g., `__private_var`) triggers name mangling to prevent accidental overwriting in subclasses.",
                "Inheritance allows a child class to inherit attributes and methods from a parent class by specifying the parent class inside parentheses: `class Child(Parent):`. You can call parent methods using the `super()` function.",
                "Python supports special 'dunder' (double underscore) methods, such as `__str__()` for human-readable string representation, `__len__()` to customize the behavior of `len()`, and `__eq__()` for custom equality comparisons."
            ],
            importantPoints: [
                "Classes are templates; instances are created by calling the class name.",
                "`__init__(self, ...)` initializes instance variables upon creation.",
                "`self` explicitly refers to the current object instance.",
                "Inheritance uses `class Subclass(Superclass):`; call parent methods with `super()`.",
                "Dunder methods (like `__str__` and `__repr__`) customize built-in Python behaviors."
            ],
            codeExample: `class Character:\n    def __init__(self, name, health):\n        self.name = name\n        self.health = health\n\n    def take_damage(self, amount):\n        self.health = max(0, self.health - amount)\n        print(f"{self.name} took {amount} damage! Health: {self.health}")\n\n    def __str__(self):\n        return f"Character({self.name}, HP: {self.health})"\n\n# Inheritance\nclass Wizard(Character):\n    def __init__(self, name, health, mana):\n        super().__init__(name, health)\n        self.mana = mana\n\n    def cast_spell(self):\n        print(f"{self.name} casts Fireball using {self.mana} mana!")\n\nhero = Wizard("Gandalf", 100, 50)\nprint(hero)\nhero.take_damage(20)\nhero.cast_spell()`,
            codeExplanation: [
                "`def __init__(self, name, health)`: Constructor initializing name and health for every new Character.",
                "`def __str__(self)`: Dunder method called when `print(hero)` is executed.",
                "`class Wizard(Character)`: Wizard inherits all functionality from Character.",
                "`super().__init__(name, health)`: Calls the parent class constructor to set up base fields."
            ],
            summary: "Python OOP uses classes, self-referencing methods, and __init__ constructors. It supports inheritance via super() and operator customization via dunder methods.",
            practiceQuestions: [
                {
                    question: "What is the purpose of the 'self' parameter in Python class methods?",
                    options: [
                        "It refers to the current instance of the class",
                        "It imports standard libraries",
                        "It makes the method private",
                        "It defines a global variable"
                    ],
                    correctAnswer: 0,
                    explanation: "'self' represents the specific object instance calling the method, allowing access to its attributes."
                },
                {
                    question: "Which method acts as the constructor in a Python class?",
                    options: ["__create__()", "__init__()", "__new__()", "__construct__()"],
                    correctAnswer: 1,
                    explanation: "The __init__() method initializes a newly created object's state."
                },
                {
                    question: "How does a subclass call a method from its parent class in Python?",
                    options: ["parent.method()", "super().method()", "base.method()", "this.method()"],
                    correctAnswer: 1,
                    explanation: "super() returns a proxy object that delegates method calls to the parent/superclass."
                },
                {
                    question: "Which dunder method is called when an object is passed to str() or print()?",
                    options: ["__print__()", "__display__()", "__str__()", "__show__()"],
                    correctAnswer: 2,
                    explanation: "__str__() returns an informal, readable string representation of an object."
                },
                {
                    question: "What convention is used in Python to indicate an attribute is private / internal?",
                    options: ["private keyword", "Leading underscore (e.g. _name or __name)", "ALL_CAPS", "Trailing dollar sign ($)"],
                    correctAnswer: 1,
                    explanation: "A leading underscore (_var or __var) is the Python standard convention for internal or private attributes."
                }
            ]
        },
        {
            chapterNumber: 5,
            title: "Advanced Python",
            estimatedTime: 25,
            difficulty: "Advanced",
            intro: "Elevate your Python mastery with Decorators, Generators, Context Managers, and asynchronous programming with asyncio.",
            paragraphs: [
                "Python includes advanced metaprogramming features that allow you to modify or extend the behavior of functions and classes cleanly. A prime example is Decorators. A decorator is a function that takes another function as an argument, adds functionality, and returns a modified function without altering the original source code.",
                "Decorators are applied using the elegant `@decorator_name` syntax above function definitions. They are widely used in frameworks like Flask and FastAPI for route handling, authentication, and logging execution times.",
                "Generators are special functions that allow you to declare a function that behaves like an iterator. Instead of returning all values at once and consuming vast amounts of memory, a generator uses the `yield` keyword to produce values lazily, one at a time on demand.",
                "Context Managers handle the safe setup and teardown of resources using the `with` statement. The most common example is reading files: `with open('file.txt') as f:`. Even if an unhandled exception occurs inside the block, Python guarantees that the file will be closed safely.",
                "Modern Python supports asynchronous programming through the `asyncio` library and the `async` and `await` syntax. Asynchronous code allows single-threaded programs to handle thousands of concurrent I/O operations (such as API calls or database queries) efficiently without blocking."
            ],
            importantPoints: [
                "Decorators (`@decorator`) wrap and enhance function behavior without altering code.",
                "Generators use `yield` to stream large datasets lazily with O(1) memory footprint.",
                "Context managers (`with` statement) guarantee safe acquisition and release of resources.",
                "`async` / `await` enables high-performance concurrent I/O without multi-threading overhead.",
                "List/Dict/Set comprehensions and generator expressions streamline data processing."
            ],
            codeExample: `import time\n\n# Custom Decorator\ndef timer_decorator(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f"{func.__name__} executed in {time.time() - start:.4f}s")\n        return result\n    return wrapper\n\n# Generator for memory-efficient iteration\ndef count_up_to(max_val):\n    count = 1\n    while count <= max_val:\n        yield count\n        count += 1\n\n@timer_decorator\ndef process_numbers():\n    total = sum(count_up_to(100000))\n    print("Sum total:", total)\n\nprocess_numbers()`,
            codeExplanation: [
                "`def timer_decorator(func)`: Higher-order function that measures execution duration.",
                "`@timer_decorator`: Decorates `process_numbers` with timing logic automatically.",
                "`yield count`: Pauses function execution and produces `count` without loading all 100,000 numbers in memory."
            ],
            summary: "Advanced Python empowers developers with decorators for modular behavior extension, generators for memory-efficient streaming, and context managers for bulletproof resource cleanup.",
            practiceQuestions: [
                {
                    question: "What keyword turns a normal Python function into a generator?",
                    options: ["return", "yield", "generator", "stream"],
                    correctAnswer: 1,
                    explanation: "Using 'yield' instead of 'return' turns a function into a generator that produces values lazily."
                },
                {
                    question: "What is the primary purpose of the 'with' statement in Python?",
                    options: [
                        "To create loops",
                        "To manage resources safely using context managers",
                        "To import modules conditionally",
                        "To speed up execution"
                    ],
                    correctAnswer: 1,
                    explanation: "The 'with' statement ensures proper acquisition and automatic release of resources like files and network connections."
                },
                {
                    question: "What syntax is used to apply a decorator called 'log_action' to a function?",
                    options: ["@log_action", "#log_action", "decorator(log_action)", "apply log_action"],
                    correctAnswer: 0,
                    explanation: "Decorators are applied by placing '@decorator_name' on the line directly preceding the target function."
                },
                {
                    question: "What is the memory advantage of a generator over a large list?",
                    options: [
                        "Generators compress data into zip format",
                        "Generators compute values on the fly one by one, using constant O(1) memory",
                        "Generators store values on the hard drive",
                        "Generators use 64-bit integers only"
                    ],
                    correctAnswer: 1,
                    explanation: "Generators evaluate lazily, producing one item at a time so memory consumption remains minimal regardless of dataset size."
                },
                {
                    question: "Which keywords are used for asynchronous coroutines in modern Python?",
                    options: ["thread / wait", "async / await", "concurrent / yield", "future / promise"],
                    correctAnswer: 1,
                    explanation: "Python 3.5+ uses 'async def' to define coroutines and 'await' to pause execution on asynchronous tasks."
                }
            ]
        }
    ],

    // =========================================================================
    // JAVASCRIPT
    // =========================================================================
    "javascript": [
        {
            chapterNumber: 1,
            title: "JavaScript Basics",
            estimatedTime: 15,
            difficulty: "Beginner",
            intro: "Welcome to JavaScript! Discover the language of the web, how browsers execute scripts, basic syntax, and data types.",
            paragraphs: [
                "JavaScript is a lightweight, interpreted, just-in-time compiled programming language with first-class functions. Created in 1995 by Brendan Eich in just 10 days for the Netscape browser, JavaScript has evolved into the cornerstone of modern interactive web development, powering everything from browser UIs to backend servers via Node.js.",
                "JavaScript is dynamically typed and weakly typed. Variables do not need explicit type declarations, and types can be coerced automatically during operations. The primary primitive types include `number`, `string`, `boolean`, `null`, `undefined`, `symbol`, and `bigint`.",
                "Modern JavaScript (ES6 and beyond) introduced `let` and `const` for variable declarations, replacing the older, function-scoped `var`. `const` is used for values that should not be reassigned, while `let` is used for variables that change over time. Both have block scope.",
                "JavaScript code can run directly in any web browser's Developer Console or via modern runtime environments like Node.js and Deno. Output is logged using `console.log()`.",
                "JavaScript supports arithmetic operators (`+`, `-`, `*`, `/`, `%`), assignment operators, and strict equality operators (`===` and `!==`). Always prefer strict equality `===` over loose equality `==` to prevent unexpected type coercion bugs."
            ],
            importantPoints: [
                "JavaScript runs natively in all web browsers and on servers via Node.js.",
                "Always use `const` by default; use `let` only when reassignment is required.",
                "Avoid `var` due to hoisting and lack of block scope.",
                "Use `===` (strict equality) instead of `==` (loose equality with type coercion).",
                "`undefined` means declared but not assigned; `null` is an intentional empty value."
            ],
            codeExample: `// Modern variable declarations\nconst appName = "CodeQuest";\nlet userLevel = 1;\nconst isOnline = true;\n\nconsole.log(\`Welcome to \${appName}!\`);\nconsole.log("Current Level:", userLevel);\n\n// Strict vs loose equality\nconsole.log(5 == "5");   // true (loose coercion)\nconsole.log(5 === "5");  // false (strict type check)\n\nuserLevel += 1;\nconsole.log("Level Up! New Level:", userLevel);`,
            codeExplanation: [
                "`const appName`: Declares an immutable reference that cannot be reassigned.",
                "`let userLevel`: Declares a block-scoped mutable variable.",
                "`\`Welcome to \${appName}!\``: ES6 template literal enabling easy variable interpolation.",
                "`5 === \"5\"`: Strict equality compares both value and type, correctly evaluating to false."
            ],
            summary: "JavaScript is the universal scripting language of the web. Modern ES6+ standards provide let/const block scoping, template literals, and strict equality.",
            practiceQuestions: [
                {
                    question: "Who created JavaScript in 1995?",
                    options: ["Brendan Eich", "James Gosling", "Bjarne Stroustrup", "Guido van Rossum"],
                    correctAnswer: 0,
                    explanation: "Brendan Eich created JavaScript at Netscape in 1995."
                },
                {
                    question: "What is the key difference between 'let' and 'const'?",
                    options: [
                        "'let' has global scope, 'const' has local scope",
                        "'let' variables can be reassigned, while 'const' variables cannot",
                        "'const' is only used for numbers",
                        "'let' is deprecated in modern JavaScript"
                    ],
                    correctAnswer: 1,
                    explanation: "'let' allows reassignment, while 'const' creates a read-only reference that cannot be reassigned."
                },
                {
                    question: "What will 3 === '3' evaluate to in JavaScript?",
                    options: ["true", "false", "undefined", "TypeError"],
                    correctAnswer: 1,
                    explanation: "Strict equality (===) checks both value and type. Because number !== string, it evaluates to false."
                },
                {
                    question: "What is the data type of a variable that has been declared but not assigned a value?",
                    options: ["null", "undefined", "void", "NaN"],
                    correctAnswer: 1,
                    explanation: "A declared variable without an initial assigned value automatically holds 'undefined'."
                },
                {
                    question: "Which method outputs debugging messages to the browser console?",
                    options: ["print()", "console.log()", "document.write()", "terminal.write()"],
                    correctAnswer: 1,
                    explanation: "console.log() writes informational and debugging messages directly into the browser developer tools console."
                }
            ]
        },
        {
            chapterNumber: 2,
            title: "JavaScript Variables and Loops",
            estimatedTime: 18,
            difficulty: "Beginner",
            intro: "Control execution pathways in JavaScript using if-else conditionals, switch statements, and loop structures including for, while, and for...of.",
            paragraphs: [
                "Control flow statements empower your JavaScript applications to respond dynamically to user input, network events, and changing data. The standard `if`, `else if`, and `else` statements evaluate truthy and falsy expressions.",
                "In JavaScript, certain values are inherently 'falsy': `false`, `0`, `\"\"` (empty string), `null`, `undefined`, and `NaN`. All other values—including non-empty strings, numbers, empty arrays `[]`, and empty objects `{}`—are 'truthy'.",
                "When comparing a single value against numerous possibilities, the `switch` statement organizes your logic cleanly. Always remember to add a `break` statement to each case block to avoid unintentional fall-through.",
                "Loops automate repetitive operations. JavaScript offers classic `for` loops, `while` loops, and `do...while` loops. For iterating over collections, modern JavaScript features `for...of` (for arrays, strings, maps) and `for...in` (for object keys).",
                "Arrays in JavaScript also come with powerful built-in iterative methods such as `.forEach()`, `.map()`, `.filter()`, and `.reduce()`, allowing clean and declarative functional-style coding."
            ],
            importantPoints: [
                "Understand truthy and falsy values to avoid conditional bugs.",
                "Use `for...of` to iterate over array elements directly.",
                "Use `for...in` to iterate over enumerable keys of an object.",
                "Modern array methods (`.map()`, `.filter()`) often replace traditional for loops.",
                "Ternary operator `condition ? a : b` simplifies conditional assignments."
            ],
            codeExample: `// Conditionals and Truthiness\nconst username = "HeroCoder";\nif (username) {\n    console.log(\`User logged in as \${username}\`);\n}\n\n// For...of loop over an array\nconst powers = ["Fireball", "Teleport", "Shield"];\nconsole.log("Available powers:");\nfor (const power of powers) {\n    console.log(" - " + power);\n}\n\n// Functional array iteration with map and filter\nconst scores = [45, 88, 92, 60, 75];\nconst passingScores = scores.filter(s => s >= 70);\nconsole.log("Passing Scores:", passingScores);`,
            codeExplanation: [
                "`if (username)`: Evaluates truthiness; non-empty string is truthy, so the block executes.",
                "`for (const power of powers)`: Iterates directly over each value in the `powers` array.",
                "`scores.filter(s => s >= 70)`: Returns a brand-new array containing only scores 70 or above."
            ],
            summary: "JavaScript provides if-else branching, switch statements, and diverse looping constructs including for...of and functional array helpers like filter and map.",
            practiceQuestions: [
                {
                    question: "Which of the following is considered FALSY in JavaScript?",
                    options: ["[] (empty array)", "{} (empty object)", "0 (zero)", "\"false\" (string)"],
                    correctAnswer: 2,
                    explanation: "0, \"\", null, undefined, NaN, and false are falsy. Empty arrays and objects are truthy."
                },
                {
                    question: "Which loop is best suited for directly iterating through elements of an Array?",
                    options: ["for...in", "for...of", "while...do", "loop...each"],
                    correctAnswer: 1,
                    explanation: "for...of iterates directly over the values of iterable objects like Arrays and Strings."
                },
                {
                    question: "What does Array.prototype.filter() return?",
                    options: [
                        "A boolean indicating if any element passed the test",
                        "A new array with all elements that passed the test",
                        "The index of the first matching element",
                        "The total sum of elements"
                    ],
                    correctAnswer: 1,
                    explanation: ".filter() creates a new array containing all elements that return true for the provided testing function."
                },
                {
                    question: "What is the output of Boolean(\"\")?",
                    options: ["true", "false", "undefined", "NaN"],
                    correctAnswer: 1,
                    explanation: "An empty string \"\" is a falsy value in JavaScript, so Boolean(\"\") evaluates to false."
                },
                {
                    question: "What statement terminates the execution of a switch or loop immediately?",
                    options: ["stop", "return", "break", "halt"],
                    correctAnswer: 2,
                    explanation: "The 'break' statement terminates the enclosing loop or switch block immediately."
                }
            ]
        },
        {
            chapterNumber: 3,
            title: "JavaScript Functions and Objects",
            estimatedTime: 20,
            difficulty: "Intermediate",
            intro: "Deep dive into first-class functions, arrow functions, object literals, destructuring, and the 'this' keyword in JavaScript.",
            paragraphs: [
                "In JavaScript, functions are first-class citizens. This means functions can be stored in variables, passed as arguments to other functions (callbacks), and returned from functions just like any other data type.",
                "ES6 introduced Arrow Functions (`const add = (a, b) => a + b;`). Arrow functions provide a compact syntax and do not bind their own `this`, `arguments`, or `super` keywords; instead, they inherit `this` lexically from their surrounding scope.",
                "Objects in JavaScript are collections of key-value pairs. You can define objects easily using Object Literal syntax `{ key: value }`. Object properties can hold primitive values, arrays, or other functions (known as methods).",
                "Destructuring assignment is an ES6 feature that makes unpacking values from arrays or properties from objects concise and readable: `const { name, age } = user;` extracts both properties in a single line.",
                "The Spread operator (`...`) allows you to quickly clone or merge objects and arrays: `const updated = { ...user, role: 'Admin' };` creates a shallow copy with updated fields without mutating the original object."
            ],
            importantPoints: [
                "Functions are first-class objects in JavaScript.",
                "Arrow functions (`() => {}`) have lexical `this` binding.",
                "Object destructuring (`const { a, b } = obj`) unpacks properties cleanly.",
                "Spread operator (`...`) clones and merges arrays and objects immutably.",
                "Higher-order functions take or return functions (e.g. callbacks)."
            ],
            codeExample: `// Arrow function\nconst createPlayer = (name, role = "Warrior") => ({\n    name,\n    role,\n    level: 1,\n    introduce() {\n        return \`I am \${this.name}, level \${this.level} \${this.role}.\`;\n    }\n});\n\nconst player1 = createPlayer("Aria", "Ranger");\nconsole.log(player1.introduce());\n\n// Object destructuring & Spread\nconst { name, role } = player1;\nconsole.log(\`Hero: \${name} | Class: \${role}\`);\n\nconst leveledUpPlayer = { ...player1, level: 2 };\nconsole.log("Leveled Up:", leveledUpPlayer.introduce());`,
            codeExplanation: [
                "`const createPlayer = ... => ({ ... })`: Arrow function returning an object literal directly using wrapped parentheses.",
                "`introduce() { ... }`: Concise ES6 method shorthand on an object.",
                "`const { name, role } = player1`: Destructures name and role out of player1.",
                "`{ ...player1, level: 2 }`: Clones all properties of player1 and overrides level to 2."
            ],
            summary: "JavaScript treats functions as first-class citizens. Arrow functions provide lexical scoping, while destructuring and spread operators simplify object operations.",
            practiceQuestions: [
                {
                    question: "How do arrow functions handle the 'this' keyword?",
                    options: [
                        "They bind 'this' to the global window object",
                        "They inherit 'this' lexically from the enclosing scope",
                        "They cannot access 'this' at all",
                        "They bind 'this' to the calling HTML element"
                    ],
                    correctAnswer: 1,
                    explanation: "Arrow functions do not define their own 'this'; they inherit 'this' lexically from their enclosing parent context."
                },
                {
                    question: "What is the output of const { x } = { x: 10, y: 20 }?",
                    options: ["x is 10", "x is { x: 10 }", "x is undefined", "SyntaxError"],
                    correctAnswer: 0,
                    explanation: "Object destructuring extracts the property named 'x' from the right-hand object, assigning 10 to variable x."
                },
                {
                    question: "What does the spread operator (...) do when copying an object: const copy = { ...orig }?",
                    options: [
                        "Creates a deep recursive copy",
                        "Creates a shallow copy of the object's enumerable properties",
                        "Deletes the original object",
                        "Freezes the object from further edits"
                    ],
                    correctAnswer: 1,
                    explanation: "The spread operator performs a shallow copy of the object's top-level properties."
                },
                {
                    question: "What is a higher-order function in JavaScript?",
                    options: [
                        "A function with more than 10 lines of code",
                        "A function that accepts another function as an argument or returns a function",
                        "A function that runs faster than normal functions",
                        "A function that requires root permissions"
                    ],
                    correctAnswer: 1,
                    explanation: "A higher-order function is any function that operates on other functions by taking them as parameters or returning them."
                },
                {
                    question: "Which of the following creates a valid JavaScript object literal?",
                    options: ["const obj = (key: 'val')", "const obj = { key: 'val' }", "const obj = [ key: 'val' ]", "const obj = <key: 'val'>"],
                    correctAnswer: 1,
                    explanation: "Object literals are defined using curly braces with key: value pairs separated by commas."
                }
            ]
        },
        {
            chapterNumber: 4,
            title: "JavaScript DOM Manipulation",
            estimatedTime: 20,
            difficulty: "Intermediate",
            intro: "Bring web pages to life! Learn how JavaScript interacts with HTML via the Document Object Model (DOM), selects elements, and handles user events.",
            paragraphs: [
                "The Document Object Model (DOM) is an object-oriented tree representation of an HTML document created by the web browser. Every HTML tag, attribute, and text snippet becomes a node in this tree that JavaScript can inspect, alter, add, or delete in real time.",
                "To select elements from the DOM, modern JavaScript relies primarily on `document.querySelector()` (which selects the first element matching a CSS selector) and `document.querySelectorAll()` (which returns a NodeList of all matching elements).",
                "Once you have selected an element, you can change its textual content using `.textContent`, update its HTML using `.innerHTML`, modify inline styles via `.style`, and add or remove CSS classes using the powerful `.classList` API (`classList.add()`, `classList.remove()`, `classList.toggle()`).",
                "Web pages respond to user actions through Events. An event can be a mouse click, keypress, form submission, scroll, or window resize. You listen for events using `.addEventListener('event_type', callbackFunction)`.",
                "Event Delegation is a vital performance technique where a single event listener is attached to a parent container to manage events from current and future child elements using event bubbling and `event.target`."
            ],
            importantPoints: [
                "The DOM represents the HTML structure as a live, modifiable object tree.",
                "Use `querySelector` and `querySelectorAll` for CSS-based element selection.",
                "Use `.classList.add/remove/toggle` rather than direct inline styling whenever possible.",
                "Attach user interactions using `element.addEventListener('click', handler)`.",
                "Use `event.preventDefault()` to stop default browser behaviors like form submits."
            ],
            codeExample: `// Selecting DOM elements\nconst button = document.querySelector('#questBtn');\nconst statusText = document.querySelector('.status-text');\n\n// Adding an interactive event listener\nif (button) {\n    button.addEventListener('click', (event) => {\n        event.preventDefault();\n        \n        // Toggle class & text\n        button.classList.toggle('active');\n        statusText.textContent = button.classList.contains('active') \n            ? "⚔️ Quest in progress!" \n            : "Quest paused.";\n            \n        console.log("Button clicked!");\n    });\n}`,
            codeExplanation: [
                "`document.querySelector('#questBtn')`: Selects the element with id 'questBtn'.",
                "`button.addEventListener('click', ...)`: Listens for user click events.",
                "`event.preventDefault()`: Prevents default browser actions (such as following links or refreshing forms).",
                "`button.classList.toggle('active')`: Adds 'active' class if missing; removes it if present."
            ],
            summary: "The DOM tree bridges HTML with JavaScript. Selecting elements via querySelector, updating classes, and attaching event listeners enables dynamic, interactive user experiences.",
            practiceQuestions: [
                {
                    question: "Which method selects the first element in the document matching a CSS selector?",
                    options: ["document.getElement()", "document.querySelector()", "document.selectFirst()", "document.find()"],
                    correctAnswer: 1,
                    explanation: "document.querySelector() returns the first Element within the document that matches the specified selector."
                },
                {
                    question: "What is the safest property to update the plain text inside an HTML element without parsing HTML tags?",
                    options: ["innerHTML", "textContent", "value", "outerHTML"],
                    correctAnswer: 1,
                    explanation: "textContent sets plain text safely, preventing Cross-Site Scripting (XSS) risks associated with innerHTML."
                },
                {
                    question: "How do you add a CSS class named 'completed' to an element?",
                    options: ["element.class += 'completed'", "element.classList.add('completed')", "element.addClass('completed')", "element.style.class = 'completed'"],
                    correctAnswer: 1,
                    explanation: "The classList.add() method cleanly adds one or more class names to an element."
                },
                {
                    question: "What does event.preventDefault() do inside an event listener?",
                    options: [
                        "Stops the event from bubbling up to parent elements",
                        "Prevents the default browser action associated with the event",
                        "Deletes the element from the DOM",
                        "Pauses script execution"
                    ],
                    correctAnswer: 1,
                    explanation: "event.preventDefault() stops the default browser behavior (e.g. submitting a form or navigating an anchor link)."
                },
                {
                    question: "What is the correct way to listen for a click event on a button in JavaScript?",
                    options: [
                        "button.onClick = handler",
                        "button.addEventListener('click', handler)",
                        "button.listen('click', handler)",
                        "button.attachEvent('click', handler)"
                    ],
                    correctAnswer: 1,
                    explanation: "addEventListener('click', handler) is the standard modern API for registering event listeners."
                }
            ]
        },
        {
            chapterNumber: 5,
            title: "Async JavaScript",
            estimatedTime: 22,
            difficulty: "Advanced",
            intro: "Master the asynchronous nature of JavaScript: the Event Loop, Callbacks, Promises, and modern async/await for network APIs.",
            paragraphs: [
                "JavaScript is single-threaded, meaning it has one call stack and can only execute one command at a time. However, web applications need to fetch data from servers, read files, and wait for timers without freezing the entire browser user interface. This is achieved through the JavaScript Event Loop and Asynchronous Programming.",
                "Historically, asynchronous operations were handled using Callback functions. However, nesting multiple callbacks inside one another led to messy, unreadable code known as 'Callback Hell'.",
                "To resolve callback issues, ES6 introduced Promises. A `Promise` represents the eventual completion (fulfillment) or failure (rejection) of an asynchronous operation. Promises can be chained cleanly using `.then()`, `.catch()`, and `.finally()`.",
                "ES2017 introduced `async` and `await`, which provide clean syntactic sugar built on top of Promises. Placing `async` before a function guarantees it returns a promise, and `await` pauses execution until that promise resolves, allowing you to write asynchronous code that looks and reads like synchronous code.",
                "The modern standard for making network requests in browsers is the `fetch()` API. Combined with `async/await` and `try/catch`, it allows fetching JSON data from backend servers smoothly and handling errors reliably."
            ],
            importantPoints: [
                "JavaScript is single-threaded; asynchronous concurrency is coordinated by the Event Loop.",
                "Promises have three states: Pending, Fulfilled, and Rejected.",
                "`async/await` provides clean, readable syntax for consuming Promises.",
                "Always wrap `await` calls in `try/catch` blocks for resilient error handling.",
                "Use `Promise.all()` to execute multiple independent asynchronous operations concurrently."
            ],
            codeExample: `// Fetching data with async/await and try-catch\nasync function loadUserProfile(userId) {\n    try {\n        console.log("Fetching user profile...");\n        const response = await fetch(\`https://api.example.com/users/\${userId}\`);\n        \n        if (!response.ok) {\n            throw new Error(\`HTTP error! status: \${response.status}\`);\n        }\n        \n        const user = await response.json();\n        console.log("Profile loaded:", user.name);\n        return user;\n    } catch (error) {\n        console.error("Failed to load profile:", error.message);\n    } finally {\n        console.log("Fetch attempt completed.");\n    }\n}`,
            codeExplanation: [
                "`async function loadUserProfile`: Declares an asynchronous function returning a Promise.",
                "`const response = await fetch(...)`: Pauses execution until the HTTP network request completes.",
                "`if (!response.ok)`: Checks if the HTTP status code is in the 200-299 success range.",
                "`const user = await response.json()`: Parses the JSON payload asynchronously."
            ],
            summary: "Asynchronous JavaScript relies on the Event Loop to handle non-blocking operations. Promises and async/await provide clean patterns for network requests and delayed tasks.",
            practiceQuestions: [
                {
                    question: "What are the three possible states of a JavaScript Promise?",
                    options: [
                        "Start, Process, End",
                        "Pending, Fulfilled, Rejected",
                        "Active, Inactive, Complete",
                        "Open, Closed, Error"
                    ],
                    correctAnswer: 1,
                    explanation: "A Promise starts in the 'pending' state and transitions to either 'fulfilled' (resolved) or 'rejected' (failed)."
                },
                {
                    question: "What must you place before a function declaration to use the 'await' keyword inside it?",
                    options: ["defer", "async", "promise", "thread"],
                    correctAnswer: 1,
                    explanation: "The 'await' keyword can only be used inside functions declared with the 'async' keyword (or top-level modules)."
                },
                {
                    question: "What method allows running multiple promises concurrently and waits until all have resolved?",
                    options: ["Promise.race()", "Promise.all()", "Promise.any()", "Promise.wait()"],
                    correctAnswer: 1,
                    explanation: "Promise.all() takes an iterable of promises and resolves when all input promises have resolved."
                },
                {
                    question: "How should you handle errors when using async/await syntax?",
                    options: ["Using .catch() only", "Using try/catch blocks", "Errors are ignored automatically", "Using on_error handlers"],
                    correctAnswer: 1,
                    explanation: "Standard try...catch blocks cleanly capture rejections and errors thrown within async/await functions."
                },
                {
                    question: "What component coordinates asynchronous callbacks and the call stack in JavaScript engines?",
                    options: ["Garbage Collector", "Event Loop", "JIT Compiler", "Babel Transpiler"],
                    correctAnswer: 1,
                    explanation: "The Event Loop monitors the call stack and task queues, pushing ready callbacks onto the stack when it is empty."
                }
            ]
        }
    ],

    // =========================================================================
    // DATA STRUCTURES
    // =========================================================================
    "data-structures": [
        {
            chapterNumber: 1,
            title: "Data Structures Introduction",
            estimatedTime: 15,
            difficulty: "Beginner",
            intro: "Welcome to Data Structures! Learn why organizing data efficiently in memory is the foundation of computer science and high-performance algorithms.",
            paragraphs: [
                "A data structure is a specialized format for organizing, processing, retrieving, and storing data in computer memory. Just as a library organizes books by category and an address book arranges contacts alphabetically, computer software requires tailored data structures to solve specific problems efficiently.",
                "Data structures are broadly divided into two categories: Linear and Non-Linear. In Linear data structures, elements are arranged sequentially (e.g., Arrays, Linked Lists, Stacks, Queues). In Non-Linear data structures, elements are arranged hierarchically or interconnectedly (e.g., Trees, Graphs).",
                "Data structures are also categorized as Static or Dynamic. Static data structures (like standard arrays) have a fixed memory size allocated at compile time. Dynamic data structures (like Linked Lists and Trees) can grow or shrink in size during program execution as elements are inserted or deleted.",
                "To choose the best data structure, software engineers evaluate time complexity and space complexity using Big-O notation. Different data structures offer distinct trade-offs: some allow instantaneous lookups but slow insertions, while others offer rapid insertions at the expense of search speed.",
                "Mastering fundamental data structures is essential not only for passing technical coding interviews at top tech companies, but also for writing performant, scalable production software."
            ],
            importantPoints: [
                "Data structures organize data in memory for efficient access and modification.",
                "Linear structures: Sequential order (Arrays, Linked Lists, Stacks, Queues).",
                "Non-Linear structures: Hierarchical or networked (Trees, Graphs).",
                "Static vs Dynamic: Fixed memory size vs adaptable memory allocation.",
                "Selecting the right data structure depends on the balance of reads vs writes."
            ],
            codeExample: `// Conceptual comparison of Static Array vs Dynamic List\n// In memory: Arrays are contiguous; Dynamic structures use pointer links\n\nclass SimpleArrayDemo {\n    constructor() {\n        this.data = [10, 20, 30, 40]; // Contiguous memory simulation\n    }\n    \n    // O(1) Access by index\n    get(index) {\n        return this.data[index];\n    }\n    \n    // O(N) Search by value\n    search(value) {\n        for (let i = 0; i < this.data.length; i++) {\n            if (this.data[i] === value) return i;\n        }\n        return -1;\n    }\n}\n\nconst arr = new SimpleArrayDemo();\nconsole.log("Element at index 2:", arr.get(2));\nconsole.log("Index of value 30:", arr.search(30));`,
            codeExplanation: [
                "`this.data = [10, 20, 30, 40]`: Simulates a fixed sequence stored in contiguous memory.",
                "`get(index)`: Demonstrates instant O(1) direct access by memory index calculation.",
                "`search(value)`: Demonstrates linear search O(N), requiring scanning elements one by one."
            ],
            summary: "Data structures provide organized memory layouts. Categorized into linear, non-linear, static, and dynamic, they dictate the algorithmic performance of software.",
            practiceQuestions: [
                {
                    question: "Which of the following is a LINEAR data structure?",
                    options: ["Binary Tree", "Graph", "Queue", "Trie"],
                    correctAnswer: 2,
                    explanation: "A Queue is a linear data structure where elements are arranged in a sequential first-in, first-out order."
                },
                {
                    question: "What is the primary characteristic of a dynamic data structure?",
                    options: [
                        "Its size can expand and shrink at runtime",
                        "It can only store numbers",
                        "Its elements are always sorted automatically",
                        "It requires no computer memory"
                    ],
                    correctAnswer: 0,
                    explanation: "Dynamic data structures can allocate or deallocate memory during program execution to grow or shrink as needed."
                },
                {
                    question: "Which operation on an array has O(1) constant time complexity?",
                    options: ["Searching for an unsorted element", "Accessing an element by index", "Inserting at the beginning", "Deleting an element by value"],
                    correctAnswer: 1,
                    explanation: "Because array elements are stored contiguously, the memory address of any index can be computed instantly in O(1) time."
                },
                {
                    question: "Which of the following is a NON-LINEAR data structure?",
                    options: ["Array", "Linked List", "Tree", "Stack"],
                    correctAnswer: 2,
                    explanation: "Trees are non-linear, hierarchical data structures where nodes are connected via parent-child relationships."
                },
                {
                    question: "What notation is universally used to evaluate algorithm time and space complexity?",
                    options: ["Greek-Sigma Notation", "Big-O Notation", "Binary Matrix Notation", "Lambda Calculus"],
                    correctAnswer: 1,
                    explanation: "Big-O notation describes the upper bound limiting behavior of an algorithm as the input size grows."
                }
            ]
        },
        {
            chapterNumber: 2,
            title: "Arrays and Linked Lists",
            estimatedTime: 20,
            difficulty: "Intermediate",
            intro: "Compare the two foundational linear building blocks of computer science: contiguous Arrays and pointer-connected Linked Lists.",
            paragraphs: [
                "Arrays store elements in contiguous (unbroken) memory locations. Because memory addresses can be calculated directly using `base_address + index * element_size`, reading an element at any index takes O(1) constant time. However, inserting or deleting elements at the beginning or middle requires shifting subsequent elements, taking O(N) time.",
                "A Linked List is a linear data structure where elements (called Nodes) are not stored in contiguous memory. Instead, each Node consists of two parts: the data payload, and a pointer (or reference) containing the memory address of the next Node in the sequence.",
                "Because linked lists are connected via pointers, inserting or deleting a node at the head of the list takes instantaneous O(1) time—no elements need to be shifted. You simply point the new node to the old head and update the head pointer.",
                "The trade-off of linked lists is that they do not support random access. To find the 5th element, you cannot jump directly to it; you must start at the `head` and traverse node by node through 4 pointers, making access O(N).",
                "Linked lists exist in several variations: Singly Linked Lists (nodes point only forward), Doubly Linked Lists (nodes point both forward to `next` and backward to `prev`), and Circular Linked Lists (the last node points back to the first node)."
            ],
            importantPoints: [
                "Array: Contiguous memory, O(1) instant index access, O(N) insertions/deletions.",
                "Linked List: Non-contiguous memory, O(1) head insertions, O(N) sequential access.",
                "Singly Linked List: Each node holds data and a `next` pointer.",
                "Doubly Linked List: Each node holds data, a `next` pointer, and a `prev` pointer.",
                "Linked lists require extra memory per element to store node pointers."
            ],
            codeExample: `// Implementation of a Singly Linked List Node\nclass Node {\n    constructor(data) {\n        this.data = data;\n        this.next = null;\n    }\n}\n\nclass LinkedList {\n    constructor() {\n        this.head = null;\n    }\n    \n    // O(1) Insertion at head\n    insertAtHead(data) {\n        const newNode = new Node(data);\n        newNode.next = this.head;\n        this.head = newNode;\n    }\n    \n    // Print list elements\n    printList() {\n        let curr = this.head;\n        let output = [];\n        while (curr !== null) {\n            output.push(curr.data);\n            curr = curr.next;\n        }\n        console.log("Linked List:", output.join(" -> "));\n    }\n}\n\nconst list = new LinkedList();\nlist.insertAtHead(30);\nlist.insertAtHead(20);\nlist.insertAtHead(10);\nlist.printList(); // 10 -> 20 -> 30`,
            codeExplanation: [
                "`class Node`: Represents a node with data and a pointer (`next`).",
                "`newNode.next = this.head`: Points the new node to the current start of the list.",
                "`this.head = newNode`: Updates the list head to become the new node in O(1) time.",
                "`while (curr !== null)`: Traverses sequentially from head to tail."
            ],
            summary: "Arrays excel at rapid random index lookups due to contiguous memory, while Linked Lists excel at fast insertions and deletions without element shifting.",
            practiceQuestions: [
                {
                    question: "What is the time complexity to insert a new node at the beginning of a Singly Linked List?",
                    options: ["O(1)", "O(N)", "O(log N)", "O(N^2)"],
                    correctAnswer: 0,
                    explanation: "Inserting at the head requires simply pointing the new node to the current head and updating the head pointer, taking O(1) constant time."
                },
                {
                    question: "Why does accessing an element by index in a Linked List take O(N) time?",
                    options: [
                        "Because nodes are stored contiguously",
                        "Because you must traverse nodes one by one from the head",
                        "Because linked lists are circular by default",
                        "Because linked lists use binary search"
                    ],
                    correctAnswer: 1,
                    explanation: "Nodes are scattered across memory; to find the N-th element you must follow pointers starting from the head node."
                },
                {
                    question: "What additional information does a node in a Doubly Linked List store compared to a Singly Linked List?",
                    options: ["A pointer to the parent tree", "A pointer to the previous node (prev)", "An array of children", "A hash key"],
                    correctAnswer: 1,
                    explanation: "Doubly linked list nodes store pointers to both the next node and the previous node."
                },
                {
                    question: "What is the main drawback of Linked Lists compared to Arrays?",
                    options: [
                        "They cannot store numbers",
                        "Extra memory overhead for pointer storage and no random access",
                        "They have a fixed size",
                        "They cannot be deleted"
                    ],
                    correctAnswer: 1,
                    explanation: "Every node in a linked list requires extra memory bytes to store pointers, and you cannot jump to indices directly."
                },
                {
                    question: "What does the 'next' pointer of the tail node point to in a standard Singly Linked List?",
                    options: ["The head node", "null / nullptr", "itself", "undefined memory"],
                    correctAnswer: 1,
                    explanation: "In a standard singly linked list, the final (tail) node's next pointer points to null, marking the end of the list."
                }
            ]
        },
        {
            chapterNumber: 3,
            title: "Stacks and Queues",
            estimatedTime: 20,
            difficulty: "Intermediate",
            intro: "Explore two essential abstract data types: the LIFO (Last-In, First-Out) Stack and the FIFO (First-In, First-Out) Queue.",
            paragraphs: [
                "A Stack is a linear data structure that follows the LIFO principle: Last-In, First-Out. Think of a stack of dinner plates in a cafeteria: the last plate placed on top is always the first plate picked up. You can only add or remove items from the very top of the stack.",
                "The core operations of a stack are `push` (add an item to the top), `pop` (remove and return the top item), and `peek` (inspect the top item without removing it). All three operations execute in instantaneous O(1) constant time. Stacks power browser back/forward history, undo buttons in text editors, and call stacks during function execution.",
                "A Queue is a linear data structure that follows the FIFO principle: First-In, First-Out. Think of a line of people waiting to buy movie tickets: the first person to join the queue is the first person served. Items enter at the rear (enqueue) and exit from the front (dequeue).",
                "The core operations of a queue are `enqueue` (add an item to the back), `dequeue` (remove an item from the front), and `front/peek` (view the front item). Queues are widely used in printer print-spoolers, CPU task scheduling, and Breadth-First Search (BFS) graph algorithms.",
                "A specialized variation is the Priority Queue, where each element has an assigned priority. Elements with higher priority are dequeued ahead of elements with lower priority, commonly implemented using Binary Heaps."
            ],
            importantPoints: [
                "Stack is LIFO: Last-In, First-Out (push, pop, peek).",
                "Queue is FIFO: First-In, First-Out (enqueue, dequeue, front).",
                "All primary Stack and Queue operations execute in O(1) constant time.",
                "Stacks manage function call recursion and undo/redo operations.",
                "Queues manage asynchronous buffers, print jobs, and BFS graph traversals."
            ],
            codeExample: `// Stack implementation (LIFO)\nclass Stack {\n    constructor() {\n        this.items = [];\n    }\n    push(val) { this.items.push(val); }\n    pop() { return this.items.pop(); }\n    peek() { return this.items[this.items.length - 1]; }\n    isEmpty() { return this.items.length === 0; }\n}\n\n// Queue implementation (FIFO)\nclass Queue {\n    constructor() {\n        this.items = [];\n    }\n    enqueue(val) { this.items.push(val); }\n    dequeue() { return this.items.shift(); }\n    front() { return this.items[0]; }\n}\n\nconst stack = new Stack();\nstack.push("Page 1");\nstack.push("Page 2");\nconsole.log("Stack Pop (LIFO):", stack.pop()); // Page 2\n\nconst queue = new Queue();\nqueue.enqueue("Customer 1");\nqueue.enqueue("Customer 2");\nconsole.log("Queue Dequeue (FIFO):", queue.dequeue()); // Customer 1`,
            codeExplanation: [
                "`stack.push(\"Page 2\")`: Adds 'Page 2' on top of the stack.",
                "`stack.pop()`: Removes and returns 'Page 2' first, demonstrating Last-In, First-Out.",
                "`queue.enqueue(\"Customer 1\")`: Appends 'Customer 1' to the queue.",
                "`queue.dequeue()`: Serves 'Customer 1' first, demonstrating First-In, First-Out."
            ],
            summary: "Stacks (LIFO) and Queues (FIFO) provide restricted, high-speed O(1) insertion and removal patterns essential for parsing, scheduling, and graph traversals.",
            practiceQuestions: [
                {
                    question: "What principle governs the behavior of a Stack?",
                    options: ["FIFO (First-In, First-Out)", "LIFO (Last-In, First-Out)", "Priority Sorting", "Random Access"],
                    correctAnswer: 1,
                    explanation: "Stacks follow LIFO (Last-In, First-Out), where the most recently added item is the first one removed."
                },
                {
                    question: "What principle governs the behavior of a Queue?",
                    options: ["LIFO (Last-In, First-Out)", "FIFO (First-In, First-Out)", "Binary Order", "Reverse Order"],
                    correctAnswer: 1,
                    explanation: "Queues follow FIFO (First-In, First-Out), where the earliest added element is served first."
                },
                {
                    question: "Which data structure is used by compilers to manage nested function calls?",
                    options: ["Call Stack", "Process Queue", "Binary Tree", "Hash Set"],
                    correctAnswer: 0,
                    explanation: "The runtime system uses the Call Stack to track active function calls, local variables, and return addresses."
                },
                {
                    question: "What is the time complexity of pushing an element onto a stack?",
                    options: ["O(1)", "O(N)", "O(log N)", "O(N^2)"],
                    correctAnswer: 0,
                    explanation: "Pushing an element onto the top of a stack takes O(1) constant time."
                },
                {
                    question: "Which graph traversal algorithm fundamentally relies on a Queue?",
                    options: ["Depth-First Search (DFS)", "Breadth-First Search (BFS)", "Kruskal's Algorithm", "Binary Search"],
                    correctAnswer: 1,
                    explanation: "Breadth-First Search (BFS) uses a queue to visit neighbor vertices level by level."
                }
            ]
        },
        {
            chapterNumber: 4,
            title: "Trees",
            estimatedTime: 25,
            difficulty: "Advanced",
            intro: "Explore hierarchical data structures: Binary Trees, Binary Search Trees (BST), AVL balance, and tree traversals (In-order, Pre-order, Post-order).",
            paragraphs: [
                "A Tree is a non-linear, hierarchical data structure composed of nodes connected by edges. The top-most node is called the `Root`. Nodes without any children are called `Leaves`. Unlike arrays and lists, trees naturally represent organizational charts, file systems, and XML/HTML document structures.",
                "A Binary Tree is a tree where each node has at most two children, referred to as the `left child` and the `right child`. Binary trees form the foundation for more specialized trees used across databases, search engines, and compression algorithms.",
                "A Binary Search Tree (BST) is a binary tree with a strict ordering property: for every node, all values in its left subtree are strictly smaller than the node's value, and all values in its right subtree are strictly greater. This property allows search, insertion, and deletion to run in O(log N) time on average.",
                "Tree traversal is the process of visiting every node in the tree exactly once. Depth-First Traversals include: `In-Order` (Left, Root, Right—which visits BST nodes in sorted ascending order!), `Pre-Order` (Root, Left, Right—useful for cloning trees), and `Post-Order` (Left, Right, Root—useful for deleting trees).",
                "If elements are inserted into a BST in already-sorted order, the tree can degenerate into an unbalanced linked-list with O(N) worst-case search time. Self-balancing trees, like AVL Trees and Red-Black Trees, automatically perform rotations during insertion to maintain O(log N) guaranteed depth."
            ],
            importantPoints: [
                "Trees are hierarchical structures containing a Root, internal nodes, and Leaves.",
                "Binary Tree nodes have at most 2 children (left and right).",
                "Binary Search Tree (BST) property: left < root < right.",
                "In-order traversal of a BST outputs elements in sorted ascending order.",
                "Self-balancing trees (AVL, Red-Black) guarantee O(log N) operations."
            ],
            codeExample: `class TreeNode {\n    constructor(val) {\n        this.val = val;\n        this.left = null;\n        this.right = null;\n    }\n}\n\nclass BST {\n    constructor() {\n        this.root = null;\n    }\n    insert(val) {\n        const newNode = new TreeNode(val);\n        if (!this.root) { this.root = newNode; return; }\n        let curr = this.root;\n        while (true) {\n            if (val < curr.val) {\n                if (!curr.left) { curr.left = newNode; break; }\n                curr = curr.left;\n            } else {\n                if (!curr.right) { curr.right = newNode; break; }\n                curr = curr.right;\n            }\n        }\n    }\n    // In-Order Traversal (Sorted)\n    inOrder(node, result = []) {\n        if (node) {\n            this.inOrder(node.left, result);\n            result.push(node.val);\n            this.inOrder(node.right, result);\n        }\n        return result;\n    }\n}\n\nconst bst = new BST();\n[50, 30, 70, 20, 40].forEach(n => bst.insert(n));\nconsole.log("In-order sorted output:", bst.inOrder(bst.root));`,
            codeExplanation: [
                "`class TreeNode`: Encapsulates value, left child reference, and right child reference.",
                "`if (val < curr.val)`: Enforces the BST rule by guiding smaller values to the left.",
                "`inOrder(node.left); result.push(node.val); inOrder(node.right);`: Traverses left subtree, visits root, traverses right subtree."
            ],
            summary: "Trees model hierarchical relationships. Binary Search Trees enable fast O(log N) searches through ordered left/right subtrees, and in-order traversal yields sorted sequences.",
            practiceQuestions: [
                {
                    question: "What is the maximum number of children a node can have in a Binary Tree?",
                    options: ["1", "2", "3", "Unlimited"],
                    correctAnswer: 1,
                    explanation: "By definition, each node in a binary tree can have at most 2 child nodes (left and right)."
                },
                {
                    question: "What is the result of an In-Order traversal on a Binary Search Tree (BST)?",
                    options: ["Nodes in reverse order", "Nodes in sorted ascending order", "Nodes grouped by depth", "Randomized order"],
                    correctAnswer: 1,
                    explanation: "In-order traversal (Left, Root, Right) on a valid BST always visits values in non-decreasing sorted order."
                },
                {
                    question: "What is the average time complexity of searching a value in a balanced BST?",
                    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
                    correctAnswer: 1,
                    explanation: "Each comparison in a balanced BST cuts the remaining search space in half, yielding O(log N) time."
                },
                {
                    question: "What is a node with zero children called?",
                    options: ["Root", "Branch", "Leaf", "Stem"],
                    correctAnswer: 2,
                    explanation: "A leaf node is an endpoint node in a tree hierarchy that has no child nodes."
                },
                {
                    question: "What type of tree automatically balances itself during insertions and deletions?",
                    options: ["Degenerate Tree", "AVL Tree", "Ternary Tree", "Unsorted Tree"],
                    correctAnswer: 1,
                    explanation: "AVL trees (and Red-Black trees) perform balancing rotations to maintain O(log N) height."
                }
            ]
        },
        {
            chapterNumber: 5,
            title: "Graphs",
            estimatedTime: 25,
            difficulty: "Advanced",
            intro: "Master the most versatile non-linear data structure: Graphs, representations (Adjacency Matrix vs List), and traversal algorithms (BFS and DFS).",
            paragraphs: [
                "A Graph is a versatile non-linear data structure consisting of a finite set of vertices (or nodes) and a collection of edges that connect pairs of vertices: $G = (V, E)$. Graphs can model social networks (users and friendships), road maps (cities and highways), internet networks, and dependency trees.",
                "Graphs can be Directed (edges have a designated one-way direction, like a Twitter follower) or Undirected (edges represent mutual two-way connections, like Facebook friends). Edges can also be Weighted (representing distances, costs, or bandwidth).",
                "The two primary ways to represent graphs in computer memory are: Adjacency Matrix (a 2D array of size $V \\times V$, where cell `[i][j]` indicates whether an edge exists between node $i$ and node $j$) and Adjacency List (an array or map of lists where each vertex stores a list of its direct neighbors).",
                "Adjacency Lists are typically preferred for sparse graphs because they consume only $O(V + E)$ memory, whereas an Adjacency Matrix consumes $O(V^2)$ memory regardless of how few edges exist.",
                "The two foundational graph traversal algorithms are Breadth-First Search (BFS) and Depth-First Search (DFS). BFS uses a Queue to explore neighbors level-by-level (finding the shortest path on unweighted graphs), while DFS uses a Stack (or recursion) to explore deeply along each path before backtracking."
            ],
            importantPoints: [
                "Graph $G = (V, E)$ consists of Vertices and connecting Edges.",
                "Can be Directed vs Undirected, and Weighted vs Unweighted.",
                "Adjacency List is memory-efficient ($O(V+E)$) for sparse real-world graphs.",
                "Breadth-First Search (BFS) uses a Queue to find shortest paths in unweighted graphs.",
                "Depth-First Search (DFS) uses a Stack/Recursion for cycle detection and pathfinding."
            ],
            codeExample: `// Graph representation using an Adjacency List\nclass Graph {\n    constructor() {\n        this.adjList = new Map();\n    }\n    addVertex(v) {\n        if (!this.adjList.has(v)) this.adjList.set(v, []);\n    }\n    addEdge(v1, v2) {\n        this.adjList.get(v1).push(v2);\n        this.adjList.get(v2).push(v1); // Undirected\n    }\n    // Breadth-First Search (BFS)\n    bfs(startNode) {\n        const visited = new Set([startNode]);\n        const queue = [startNode];\n        const result = [];\n        while (queue.length > 0) {\n            const curr = queue.shift();\n            result.push(curr);\n            for (const neighbor of this.adjList.get(curr)) {\n                if (!visited.has(neighbor)) {\n                    visited.add(neighbor);\n                    queue.push(neighbor);\n                }\n            }\n        }\n        return result;\n    }\n}\n\nconst g = new Graph();\n["A", "B", "C", "D"].forEach(v => g.addVertex(v));\ng.addEdge("A", "B"); g.addEdge("A", "C"); g.addEdge("B", "D");\nconsole.log("BFS traversal from A:", g.bfs("A").join(" -> "));`,
            codeExplanation: [
                "`this.adjList = new Map()`: Maps each vertex to an array of its connected neighbors.",
                "`addEdge(v1, v2)`: Pushes v2 to v1's list and vice-versa for an undirected graph.",
                "`bfs(startNode)`: Uses a queue and a visited Set to explore nodes layer by layer."
            ],
            summary: "Graphs represent complex networks through vertices and edges. Adjacency lists optimize memory, while BFS and DFS algorithms traverse and analyze connectivity.",
            practiceQuestions: [
                {
                    question: "What is the space complexity of an Adjacency Matrix representation for a graph with V vertices?",
                    options: ["O(V)", "O(V + E)", "O(V^2)", "O(E^2)"],
                    correctAnswer: 2,
                    explanation: "An adjacency matrix is a 2D array of size V by V, requiring O(V^2) space regardless of the number of edges."
                },
                {
                    question: "Which algorithm finds the shortest path between two nodes in an UNWEIGHTED graph?",
                    options: ["Depth-First Search (DFS)", "Breadth-First Search (BFS)", "Binary Search", "QuickSort"],
                    correctAnswer: 1,
                    explanation: "Because BFS explores vertices outward level-by-level, the first time it reaches a destination is guaranteed to be the shortest path in unweighted graphs."
                },
                {
                    question: "What data structure is used to implement Breadth-First Search (BFS)?",
                    options: ["Stack", "Queue", "Heap", "Tree"],
                    correctAnswer: 1,
                    explanation: "BFS relies on a FIFO Queue to manage the frontier of vertices to explore."
                },
                {
                    question: "Why is a 'visited' set or array necessary during graph traversal?",
                    options: [
                        "To count vertices",
                        "To prevent infinite loops caused by cycles in the graph",
                        "To sort the edges alphabetically",
                        "To allocate GPU memory"
                    ],
                    correctAnswer: 1,
                    explanation: "Unlike trees, graphs can contain cycles. Tracking visited nodes prevents revisiting the same node infinitely."
                },
                {
                    question: "What is a graph called where edges have an associated cost or distance?",
                    options: ["Directed Graph", "Weighted Graph", "Bipartite Graph", "Complete Graph"],
                    correctAnswer: 1,
                    explanation: "A weighted graph assigns numerical weights (cost, time, distance) to each edge connecting vertices."
                }
            ]
        }
    ],

    // =========================================================================
    // ALGORITHMS
    // =========================================================================
    "algorithms": [
        {
            chapterNumber: 1,
            title: "Algorithms Basics & Big-O",
            estimatedTime: 15,
            difficulty: "Beginner",
            intro: "Welcome to Algorithms! Understand what constitutes an algorithm, how to analyze computational efficiency, and how to read Big-O notation.",
            paragraphs: [
                "An algorithm is an unambiguous, step-by-step sequence of instructions designed to perform a specific task or solve a particular computational problem. A valid algorithm must accept zero or more inputs, produce at least one output, terminate after a finite number of steps, and be completely feasible.",
                "In computer science, we do not measure algorithm efficiency in seconds or milliseconds, because execution speed varies wildly depending on CPU clock rate, RAM speed, background tasks, and operating system. Instead, we measure the rate of growth of operations as the size of input $N$ scales to infinity.",
                "Big-O notation describes the worst-case upper bound of an algorithm's time or space complexity. Common complexities from fastest to slowest include: $O(1)$ Constant Time, $O(\\log N)$ Logarithmic Time, $O(N)$ Linear Time, $O(N \\log N)$ Linearithmic Time, $O(N^2)$ Quadratic Time, and $O(2^N)$ Exponential Time.",
                "Space complexity evaluates how much additional working memory an algorithm requires relative to the input size. An algorithm that sorts an array in-place without copying data uses $O(1)$ auxiliary space.",
                "Understanding algorithmic complexity allows you to predict whether your software will run smoothly when handling millions of database rows or whether it will slow down and crash the server."
            ],
            importantPoints: [
                "An algorithm is a finite, step-by-step procedure to solve a problem.",
                "Big-O measures how runtime or memory scales as input size $N$ increases.",
                "Speed rankings: $O(1) < O(\\log N) < O(N) < O(N \\log N) < O(N^2) < O(2^N)$.",
                "Time complexity estimates CPU operations; space complexity estimates RAM consumption.",
                "Always design algorithms focusing on worst-case and average-case performance."
            ],
            codeExample: `// Demonstrating Big-O complexities\n\n// 1. O(1) Constant Time\nfunction getFirstElement(arr) {\n    return arr[0]; // Instant, regardless of array size\n}\n\n// 2. O(N) Linear Time\nfunction findMax(arr) {\n    let max = arr[0];\n    for (let i = 1; i < arr.length; i++) {\n        if (arr[i] > max) max = arr[i]; // Scans N elements\n    }\n    return max;\n}\n\n// 3. O(N^2) Quadratic Time\nfunction printAllPairs(arr) {\n    for (let i = 0; i < arr.length; i++) {\n        for (let j = 0; j < arr.length; j++) {\n            console.log(arr[i], arr[j]); // N * N operations\n        }\n    }\n}`,
            codeExplanation: [
                "`getFirstElement`: Accesses element 0 in one single operation: O(1).",
                "`findMax`: Loops over $N$ items sequentially, performing $N$ comparisons: O(N).",
                "`printAllPairs`: Features nested loops of size $N$, executing $N \\times N = N^2$ operations: O(N^2)."
            ],
            summary: "Algorithms provide step-by-step solutions to computational challenges. Big-O notation objectively quantifies time and memory efficiency as inputs scale.",
            practiceQuestions: [
                {
                    question: "Which of the following Big-O complexities represents the fastest runtime for large inputs?",
                    options: ["O(N^2)", "O(N)", "O(log N)", "O(1)"],
                    correctAnswer: 3,
                    explanation: "O(1) constant time is the fastest possible complexity because it takes the same amount of time regardless of input size."
                },
                {
                    question: "What is the time complexity of two nested loops each running from 0 to N?",
                    options: ["O(2N)", "O(N)", "O(N^2)", "O(N log N)"],
                    correctAnswer: 2,
                    explanation: "For each of the N iterations of the outer loop, the inner loop runs N times, resulting in N * N = O(N^2) operations."
                },
                {
                    question: "What does Big-O notation specifically describe?",
                    options: [
                        "The exact number of milliseconds code takes to run",
                        "The upper bound (worst-case) growth rate of an algorithm",
                        "The size of the source code file",
                        "The number of functions declared"
                    ],
                    correctAnswer: 1,
                    explanation: "Big-O provides a mathematical upper bound describing how resource usage scales in the worst-case scenario."
                },
                {
                    question: "If an algorithm cuts the problem size in half on every step, what is its time complexity?",
                    options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
                    correctAnswer: 1,
                    explanation: "Algorithms that divide the problem space in half each step (like Binary Search) exhibit O(log N) logarithmic time."
                },
                {
                    question: "What is space complexity?",
                    options: [
                        "The size of the monitor screen needed to view code",
                        "The amount of extra working memory an algorithm uses relative to input size",
                        "The amount of hard drive storage required to install the compiler",
                        "The number of blank lines in a program"
                    ],
                    correctAnswer: 1,
                    explanation: "Space complexity measures the additional memory (RAM) consumed by an algorithm during execution."
                }
            ]
        },
        {
            chapterNumber: 2,
            title: "Searching Algorithms",
            estimatedTime: 18,
            difficulty: "Beginner",
            intro: "Learn how computers search data: Linear Search across unsorted lists versus the lightning-fast Binary Search on sorted data.",
            paragraphs: [
                "Searching is one of the most fundamental operations in software. Whether finding a contact on a phone, locating a user record in a database, or looking up a word in a dictionary, searching algorithms locate target data quickly.",
                "Linear Search is the simplest search algorithm. It starts at the first element and compares each item sequentially with the target value until a match is found or the end of the collection is reached. Because it checks elements one by one, its time complexity is $O(N)$.",
                "The advantage of Linear Search is that it works on completely unsorted collections. However, for a database of 1 billion items, a linear search could take up to 1 billion operations in the worst case, making it impractical for large datasets.",
                "Binary Search is a dramatically faster algorithm that works strictly on sorted arrays. It follows a divide-and-conquer strategy: compare the target with the middle element. If the target equals the middle, the search is complete. If the target is smaller, repeat the search on the left half; if larger, repeat on the right half.",
                "Because Binary Search eliminates half of the remaining elements with every single comparison, its time complexity is $O(\\log N)$. On a sorted dataset of 1,000,000,000 items, Binary Search finds any target in at most 30 comparisons!"
            ],
            importantPoints: [
                "Linear Search: Works on unsorted data, time complexity is $O(N)$.",
                "Binary Search: Requires sorted data, time complexity is $O(\\log N)$.",
                "Binary Search divides the remaining search window in half at every iteration.",
                "Pointers `low`, `mid`, and `high` track the active search boundaries.",
                "Calculate mid using `low + Math.floor((high - low) / 2)` to avoid integer overflow."
            ],
            codeExample: `// Binary Search implementation\nfunction binarySearch(arr, target) {\n    let low = 0;\n    let high = arr.length - 1;\n\n    while (low <= high) {\n        const mid = Math.floor(low + (high - low) / 2);\n        \n        if (arr[mid] === target) {\n            return mid; // Target found at index mid\n        } else if (arr[mid] < target) {\n            low = mid + 1; // Discard left half\n        } else {\n            high = mid - 1; // Discard right half\n        }\n    }\n    return -1; // Target not found\n}\n\nconst sortedNumbers = [12, 24, 35, 47, 59, 68, 77, 89, 94];\nconsole.log("Index of 59:", binarySearch(sortedNumbers, 59)); // 4\nconsole.log("Index of 99:", binarySearch(sortedNumbers, 99)); // -1`,
            codeExplanation: [
                "`let low = 0, high = arr.length - 1`: Initializes boundaries to cover the entire array.",
                "`const mid = Math.floor(low + (high - low) / 2)`: Computes the midpoint safely.",
                "`arr[mid] < target`: If target is greater, shifts `low` pointer past `mid` to examine right half.",
                "`return -1`: Returns -1 if the search interval collapses without finding the target."
            ],
            summary: "Linear search scans unsorted data in O(N) time. Binary search leverages sorted data to pinpoint values in O(log N) time by halving search boundaries.",
            practiceQuestions: [
                {
                    question: "What is the prerequisite condition before performing Binary Search on an array?",
                    options: ["The array must contain only positive integers", "The array must be sorted", "The array must have an even length", "The array must be dynamic"],
                    correctAnswer: 1,
                    explanation: "Binary Search requires the elements to be sorted in order to determine whether to search the left or right half."
                },
                {
                    question: "What is the worst-case time complexity of Binary Search on an array of size N?",
                    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
                    correctAnswer: 1,
                    explanation: "Binary Search halves the search space on each step, yielding O(log N) logarithmic complexity."
                },
                {
                    question: "At most how many comparisons does Binary Search take to find an item in a sorted array of 1,024 elements?",
                    options: ["1024", "512", "10", "1"],
                    correctAnswer: 2,
                    explanation: "log2(1024) = 10. Binary Search will take at most 10 comparisons to locate any element."
                },
                {
                    question: "When is Linear Search preferable over Binary Search?",
                    options: [
                        "When the array is very large and sorted",
                        "When the dataset is small and completely unsorted",
                        "When finding items in a binary search tree",
                        "Linear search is never used"
                    ],
                    correctAnswer: 1,
                    explanation: "Linear Search is practical for small, unsorted arrays where sorting first would add unnecessary overhead."
                },
                {
                    question: "What does Binary Search return if the target value does not exist in the array?",
                    options: ["0", "null", "-1 (by convention)", "TypeError"],
                    correctAnswer: 2,
                    explanation: "By convention in programming, search algorithms return -1 to signal that the target index was not found."
                }
            ]
        },
        {
            chapterNumber: 3,
            title: "Sorting Algorithms",
            estimatedTime: 22,
            difficulty: "Intermediate",
            intro: "Explore how computers organize chaotic data using Bubble Sort, Insertion Sort, Merge Sort, and QuickSort.",
            paragraphs: [
                "Sorting algorithms arrange elements of a list in a systematic order—most commonly in numerical or lexicographical (alphabetical) order. Efficient sorting is vital for optimizing search operations, database queries, and graphic rendering.",
                "Simple sorting algorithms like Bubble Sort and Insertion Sort have an intuitive mechanism. Bubble Sort repeatedly swaps adjacent out-of-order elements, causing larger values to 'bubble up' to the end. Insertion Sort builds a sorted array one element at a time, like sorting playing cards in your hand. Both have $O(N^2)$ average and worst-case time complexity.",
                "For large datasets, advanced Divide-and-Conquer sorting algorithms are required. Merge Sort divides the array into two halves, recursively sorts both halves, and then merges the sorted halves together in linear time. Merge Sort guarantees a time complexity of $O(N \\log N)$ in all cases.",
                "QuickSort selects a 'pivot' element and partitions the array so that all elements smaller than the pivot are placed to its left, and all elements larger are placed to its right. It then recursively sorts the sub-partitions. QuickSort runs in $O(N \\log N)$ average time and is preferred in practice due to exceptional cache locality.",
                "Sorting algorithms are also evaluated on Stability (whether equal keys retain their relative original order) and Space In-Place (whether sorting requires extra auxiliary memory)."
            ],
            importantPoints: [
                "Basic sorts (Bubble, Insertion, Selection) run in $O(N^2)$ time.",
                "Merge Sort guarantees $O(N \\log N)$ time but requires $O(N)$ extra space.",
                "QuickSort runs in $O(N \\log N)$ average time and sorts in-place ($O(\\log N)$ space).",
                "Stability preserves the relative order of duplicate elements.",
                "Modern programming languages use hybrid sorts like Timsort (MergeSort + InsertionSort)."
            ],
            codeExample: `// Merge Sort Implementation (O(N log N))\nfunction mergeSort(arr) {\n    if (arr.length <= 1) return arr;\n    const mid = Math.floor(arr.length / 2);\n    const left = mergeSort(arr.slice(0, mid));\n    const right = mergeSort(arr.slice(mid));\n    return merge(left, right);\n}\n\nfunction merge(left, right) {\n    let result = [], i = 0, j = 0;\n    while (i < left.length && j < right.length) {\n        if (left[i] <= right[j]) result.push(left[i++]);\n        else result.push(right[j++]);\n    }\n    return result.concat(left.slice(i)).concat(right.slice(j));\n}\n\nconst unsorted = [64, 34, 25, 12, 22, 11, 90];\nconsole.log("Sorted with MergeSort:", mergeSort(unsorted));`,
            codeExplanation: [
                "`if (arr.length <= 1) return arr`: Base case returning when sub-array has 0 or 1 element.",
                "`const mid = Math.floor(arr.length / 2)`: Splits array into equal halves.",
                "`merge(left, right)`: Combines two sorted sub-arrays into a single merged sorted array in O(N) time."
            ],
            summary: "Sorting organizes data into order. Basic sorts take O(N^2) time, while divide-and-conquer algorithms like Merge Sort and QuickSort achieve optimal O(N log N) performance.",
            practiceQuestions: [
                {
                    question: "What is the worst-case time complexity of Merge Sort?",
                    options: ["O(N)", "O(N log N)", "O(N^2)", "O(log N)"],
                    correctAnswer: 1,
                    explanation: "Merge Sort guarantees O(N log N) time complexity in all cases (best, average, and worst)."
                },
                {
                    question: "What strategy is used by Merge Sort and QuickSort?",
                    options: ["Greedy approach", "Divide and Conquer", "Dynamic Programming", "Backtracking"],
                    correctAnswer: 1,
                    explanation: "Both algorithms use Divide and Conquer: breaking the problem into sub-problems, solving them recursively, and combining results."
                },
                {
                    question: "What is the worst-case time complexity of QuickSort if an unlucky pivot is chosen every time?",
                    options: ["O(N log N)", "O(N^2)", "O(log N)", "O(1)"],
                    correctAnswer: 1,
                    explanation: "If the smallest or largest element is picked as the pivot repeatedly, QuickSort degrades to O(N^2) time."
                },
                {
                    question: "Which sorting algorithm resembles sorting a hand of playing cards one by one?",
                    options: ["Selection Sort", "Insertion Sort", "Heap Sort", "QuickSort"],
                    correctAnswer: 1,
                    explanation: "Insertion Sort inserts each element into its proper position among previously sorted elements, like sorting cards."
                },
                {
                    question: "What does it mean if a sorting algorithm is 'Stable'?",
                    options: [
                        "It never crashes",
                        "Equal elements maintain their original relative order",
                        "It uses zero memory",
                        "It runs on multiple threads"
                    ],
                    correctAnswer: 1,
                    explanation: "A stable sort preserves the original relative order of records that have equal keys."
                }
            ]
        },
        {
            chapterNumber: 4,
            title: "Recursion",
            estimatedTime: 20,
            difficulty: "Intermediate",
            intro: "Understand the elegance of Recursion: solving problems by having a function call itself with smaller sub-problems until reaching a base case.",
            paragraphs: [
                "Recursion is a programming technique where a function calls itself directly or indirectly to solve a smaller instance of the same problem. Rather than solving a massive problem all at once, recursion breaks it down into self-similar sub-problems.",
                "Every recursive function must contain two essential components: the Base Case and the Recursive Step. The Base Case is the terminating condition that stops recursion without making further recursive calls. Without a base case, the function will call itself infinitely until the call stack runs out of memory, triggering a 'Stack Overflow' error.",
                "The Recursive Step is where the function performs a small piece of work and invokes itself on a reduced sub-problem that moves progressively closer to the base case.",
                "Behind the scenes, every recursive call creates a new stack frame on the Call Stack storing local variables, parameters, and the return address. When the base case is reached, the stack frames unwind in reverse order, returning results back up the chain.",
                "Classic examples of recursion include mathematical factorials ($N! = N \\times (N-1)!$), the Fibonacci sequence, binary tree traversals, the Tower of Hanoi, and directory file-tree searching."
            ],
            importantPoints: [
                "Recursion requires a Base Case to terminate and prevent infinite loops.",
                "The Recursive Case must reduce the problem size toward the base case.",
                "Every recursive call consumes stack memory in the Call Stack.",
                "Failing to terminate causes a `StackOverflowError`.",
                "Recursion is natural and elegant for trees, graphs, and divide-and-conquer problems."
            ],
            codeExample: `// 1. Factorial calculation using recursion\nfunction factorial(n) {\n    // Base Case\n    if (n <= 1) return 1;\n    \n    // Recursive Case: n! = n * (n - 1)!\n    return n * factorial(n - 1);\n}\n\n// 2. Sum of array elements using recursion\nfunction sumArray(arr) {\n    if (arr.length === 0) return 0; // Base case\n    return arr[0] + sumArray(arr.slice(1)); // Recursive case\n}\n\nconsole.log("5! =", factorial(5)); // 5 * 4 * 3 * 2 * 1 = 120\nconsole.log("Sum of [10, 20, 30]:", sumArray([10, 20, 30])); // 60`,
            codeExplanation: [
                "`if (n <= 1) return 1`: Base case that stops recursion when `n` reaches 1 or 0.",
                "`return n * factorial(n - 1)`: Multiplies `n` by the result of `factorial(n - 1)`.",
                "For `factorial(3)`: Stack pushes 3 * f(2), 2 * f(1), returns 1, evaluates 2 * 1 = 2, evaluates 3 * 2 = 6."
            ],
            summary: "Recursion solves problems by dividing them into smaller instances of themselves. A robust base case guarantees termination and prevents stack overflow errors.",
            practiceQuestions: [
                {
                    question: "What critical component prevents a recursive function from calling itself infinitely?",
                    options: ["A while loop", "A Base Case", "A break statement", "A global variable"],
                    correctAnswer: 1,
                    explanation: "A base case provides the condition under which the function terminates without calling itself again."
                },
                {
                    question: "What error occurs if a recursive function never reaches its base case?",
                    options: ["OutOfMemoryError (Heap)", "Stack Overflow Error", "SyntaxError", "DivisionByZero"],
                    correctAnswer: 1,
                    explanation: "Infinite recursive calls fill up the execution call stack until a Stack Overflow error is thrown."
                },
                {
                    question: "What is the value of factorial(0) by standard mathematical and algorithmic definition?",
                    options: ["0", "1", "undefined", "Infinity"],
                    correctAnswer: 1,
                    explanation: "By definition, 0! = 1."
                },
                {
                    question: "Which of the following problems is most naturally solved using recursion?",
                    options: ["Printing numbers 1 to 5", "Traversing all nodes in a binary tree", "Adding two integers", "Checking if an integer is even"],
                    correctAnswer: 1,
                    explanation: "Because trees are inherently recursive data structures (each child node is the root of a subtree), recursion is the natural tool for tree traversal."
                },
                {
                    question: "What is Tail Call Optimization (TCO)?",
                    options: [
                        "An algorithm that sorts strings by their tail",
                        "A compiler optimization where a recursive call in the tail position reuses the current stack frame",
                        "Deleting the base case to save time",
                        "A multithreading feature"
                    ],
                    correctAnswer: 1,
                    explanation: "TCO allows compilers to optimize tail-recursive functions so they run in O(1) stack space without risk of stack overflow."
                }
            ]
        },
        {
            chapterNumber: 5,
            title: "Dynamic Programming",
            estimatedTime: 25,
            difficulty: "Advanced",
            intro: "Master Dynamic Programming (DP): the pinnacle of algorithmic optimization. Learn Memoization (Top-Down) and Tabulation (Bottom-Up).",
            paragraphs: [
                "Dynamic Programming (DP) is a powerful algorithmic technique used to solve complex optimization problems by breaking them down into simpler sub-problems, solving each sub-problem just once, and storing their solutions to avoid redundant computations.",
                "A problem can be solved with Dynamic Programming if it exhibits two key properties: Overlapping Subproblems (the same smaller problems are solved repeatedly) and Optimal Substructure (an optimal solution to the overall problem can be constructed from optimal solutions to its subproblems).",
                "Consider calculating the $N$-th Fibonacci number recursively: $fib(5) = fib(4) + fib(3)$. A naive recursive solution recalculates $fib(2)$ and $fib(3)$ multiple times, causing an exponential $O(2^N)$ time complexity. With DP, we compute each value once, slashing the runtime to linear $O(N)$!",
                "There are two approaches to DP: Memoization (Top-Down) and Tabulation (Bottom-Up). Memoization starts with the high-level problem and uses recursion combined with a lookup table (cache) to store computed answers. Tabulation starts from the base cases and iteratively fills an array from bottom to top.",
                "Dynamic Programming powers landmark computer science solutions including Dijkstra's Shortest Path, the 0/1 Knapsack Problem, Longest Common Subsequence (used in Git diffs), and DNA sequence alignment in bioinformatics."
            ],
            importantPoints: [
                "Applies to problems with Overlapping Subproblems and Optimal Substructure.",
                "Avoids duplicate work by caching sub-problem results in memory.",
                "Top-Down (Memoization): Recursion + Cache.",
                "Bottom-Up (Tabulation): Iterative array-filling starting from base cases.",
                "Turns exponential $O(2^N)$ algorithms into blazing-fast polynomial $O(N)$ or $O(N^2)$ solutions."
            ],
            codeExample: `// Calculating Fibonacci using Dynamic Programming\n\n// Approach 1: Memoization (Top-Down) -> O(N) Time\nfunction fibMemo(n, memo = {}) {\n    if (n <= 1) return n;\n    if (n in memo) return memo[n];\n    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);\n    return memo[n];\n}\n\n// Approach 2: Tabulation (Bottom-Up) -> O(N) Time, O(1) Space\nfunction fibTab(n) {\n    if (n <= 1) return n;\n    let prev2 = 0, prev1 = 1;\n    for (let i = 2; i <= n; i++) {\n        let current = prev1 + prev2;\n        prev2 = prev1;\n        prev1 = current;\n    }\n    return prev1;\n}\n\nconsole.log("Fibonacci(50) with Memoization:", fibMemo(50));\nconsole.log("Fibonacci(50) with Tabulation:", fibTab(50));`,
            codeExplanation: [
                "`if (n in memo) return memo[n]`: If the result for `n` was already calculated, return it instantly in O(1) time.",
                "`memo[n] = ...`: Caches the result before returning it.",
                "`fibTab`: Iterates from base cases 0 and 1 up to N using two variables, achieving O(N) time and O(1) space."
            ],
            summary: "Dynamic Programming eliminates redundant computation by storing sub-problem solutions. Through Memoization (Top-Down) and Tabulation (Bottom-Up), exponential problems become polynomial.",
            practiceQuestions: [
                {
                    question: "What two properties must a problem have to be eligible for Dynamic Programming?",
                    options: [
                        "Sorting and Binary Search",
                        "Overlapping Subproblems and Optimal Substructure",
                        "Large Inputs and Random Pointers",
                        "Recursion and Multithreading"
                    ],
                    correctAnswer: 1,
                    explanation: "Dynamic programming applies when sub-problems repeat (overlapping) and optimal sub-problem solutions form the optimal total solution."
                },
                {
                    question: "What is Memoization in Dynamic Programming?",
                    options: [
                        "Writing code from memory without looking at notes",
                        "A top-down recursive approach that caches sub-problem results in a lookup table",
                        "Converting code into assembly language",
                        "Deleting variables to free RAM"
                    ],
                    correctAnswer: 1,
                    explanation: "Memoization is a top-down strategy where recursive calls check a cache (memo) before computing, returning stored answers instantly."
                },
                {
                    question: "What is the time complexity of finding the N-th Fibonacci number with naive recursion vs Dynamic Programming?",
                    options: ["O(N) naive vs O(1) DP", "O(2^N) naive vs O(N) DP", "O(N^2) naive vs O(log N) DP", "O(N!) naive vs O(N^2) DP"],
                    correctAnswer: 1,
                    explanation: "Naive recursion takes exponential O(2^N) time due to duplicate subtrees, while DP computes each subproblem once in linear O(N) time."
                },
                {
                    question: "Which famous algorithm uses dynamic programming to find shortest paths in weighted graphs?",
                    options: ["Bubble Sort", "Dijkstra / Bellman-Ford Algorithm", "Binary Search", "Breadth-First Search"],
                    correctAnswer: 1,
                    explanation: "Shortest path algorithms like Bellman-Ford and Floyd-Warshall rely on dynamic programming principles."
                },
                {
                    question: "What is the Tabulation approach in Dynamic Programming?",
                    options: [
                        "A bottom-up iterative approach that solves base sub-problems first and builds up answers in a table",
                        "Using tabs instead of spaces for indentation",
                        "Storing data in a relational SQL table only",
                        "Running binary search on arrays"
                    ],
                    correctAnswer: 0,
                    explanation: "Tabulation builds solutions iteratively from the smallest base cases up to the desired target value."
                }
            ]
        }
    ]
};

// =========================================================================
// HELPER FUNCTIONS & PROGRESS MANAGEMENT (localStorage)
// =========================================================================

const STORAGE_PROGRESS_KEY = 'codequest_chapter_progress';

/**
 * Get all progress from localStorage safely
 */
function getAllChapterProgress() {
    try {
        if (typeof localStorage === 'undefined') return {};
        const stored = localStorage.getItem(STORAGE_PROGRESS_KEY);
        if (!stored) return {};
        const parsed = JSON.parse(stored);
        return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
        console.warn('Error reading chapter progress:', e);
        return {};
    }
}

/**
 * Get completed chapter numbers for a subject as an array of numbers: e.g. [1, 2]
 * Supports both Array storage [1, 2] and Object storage { "1": { completed: true } }
 */
function getCompletedChapters(subject) {
    if (!subject) return [];
    const allProgress = getAllChapterProgress();
    const subjData = allProgress[subject.toLowerCase().trim()];
    if (!subjData) return [];

    if (Array.isArray(subjData)) {
        return subjData.map(n => parseInt(n)).filter(n => !isNaN(n));
    }

    if (typeof subjData === 'object') {
        const completedList = [];
        for (const [key, val] of Object.entries(subjData)) {
            const chNum = parseInt(key);
            if (!isNaN(chNum)) {
                if (val === true || (val && val.completed)) {
                    completedList.push(chNum);
                }
            }
        }
        return completedList.sort((a, b) => a - b);
    }

    return [];
}

/**
 * Mark a chapter as completed in localStorage
 */
function markChapterCompleted(subject, chapterNumber, isCompleted = true) {
    if (!subject) return [];
    const subjKey = subject.toLowerCase().trim();
    const num = parseInt(chapterNumber);
    if (isNaN(num)) return getCompletedChapters(subjKey);

    const allProgress = getAllChapterProgress();
    if (!allProgress[subjKey] || typeof allProgress[subjKey] !== 'object' || Array.isArray(allProgress[subjKey])) {
        const existingArray = Array.isArray(allProgress[subjKey]) ? allProgress[subjKey] : [];
        allProgress[subjKey] = {};
        existingArray.forEach(n => {
            allProgress[subjKey][n] = { completed: true, score: 100, completedAt: Date.now() };
        });
    }

    allProgress[subjKey][num] = {
        completed: isCompleted,
        score: isCompleted ? 100 : 0,
        completedAt: isCompleted ? Date.now() : null
    };

    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(allProgress));
        }
    } catch (e) {
        console.error('Error saving chapter progress:', e);
    }
    return getCompletedChapters(subjKey);
}

/**
 * Check if a chapter is completed
 */
function isChapterCompleted(subject, chapterNumber) {
    const num = parseInt(chapterNumber);
    const completed = getCompletedChapters(subject);
    return completed.includes(num);
}

/**
 * Check if a chapter is unlocked (Chapter 1 is always unlocked, others unlocked if previous is completed)
 */
function isChapterUnlocked(subject, chapterNumber) {
    const num = parseInt(chapterNumber);
    if (num <= 1) return true;
    return isChapterCompleted(subject, num - 1);
}

/**
 * Get chapters for a subject with unlock & complete flags
 */
function getChaptersForSubject(subject) {
    const subjKey = (subject || 'java').toLowerCase().trim();
    const list = CHAPTERS_DATA[subjKey] || [];
    return list.map(ch => ({
        ...ch,
        isCompleted: isChapterCompleted(subjKey, ch.chapterNumber),
        isUnlocked: isChapterUnlocked(subjKey, ch.chapterNumber)
    }));
}

/**
 * Get a specific chapter
 */
function getChapterData(subject, chapterNumber) {
    const subjKey = (subject || 'java').toLowerCase().trim();
    const list = CHAPTERS_DATA[subjKey] || [];
    return list.find(ch => ch.chapterNumber === parseInt(chapterNumber)) || null;
}

// Global exposure for browser scripts
if (typeof window !== 'undefined') {
    window.CHAPTERS_DATA = CHAPTERS_DATA;
    window.getChaptersForSubject = getChaptersForSubject;
    window.getChapterData = getChapterData;
    window.getCompletedChapters = getCompletedChapters;
    window.markChapterCompleted = markChapterCompleted;
    window.isChapterCompleted = isChapterCompleted;
    window.isChapterUnlocked = isChapterUnlocked;
}

// Node.js module export if required
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CHAPTERS_DATA,
        getChaptersForSubject,
        getChapterData,
        getCompletedChapters,
        markChapterCompleted,
        isChapterCompleted,
        isChapterUnlocked
    };
}

