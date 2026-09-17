import { prisma } from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';


async function main() {
  console.log('🌱 Seeding Rexam Database with Demo Accounts...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userAdminPassword = await bcrypt.hash('962943', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Seed Primary Super Admin Account
  const mainAdmin = await prisma.user.upsert({
    where: { email: 'poornachandran106@gmail.com' },
    update: {
      password: userAdminPassword,
      name: 'Poornachandran (Super Admin)',
      role: 'SUPER_ADMIN',
      emailVerified: true
    },
    create: {
      email: 'poornachandran106@gmail.com',
      password: userAdminPassword,
      name: 'Poornachandran (Super Admin)',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      phone: '9629430000'
    }
  });
  console.log(`✅ Main Super Admin Account Seeded: ${mainAdmin.email} (Password: 962943, Role: SUPER_ADMIN)`);

  // Seed Demo Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rexam.com' },
    update: {
      password: adminPassword,
      name: 'Demo Admin',
      role: 'ADMIN',
      emailVerified: true
    },
    create: {
      email: 'admin@rexam.com',
      password: adminPassword,
      name: 'Demo Admin',
      role: 'ADMIN',
      emailVerified: true,
      phone: '9999999999'
    }
  });
  console.log(`✅ Admin Account Seeded: ${admin.email} (Password: admin123)`);

  // Seed Student Account
  const student = await prisma.user.upsert({
    where: { email: 'student@rexam.com' },
    update: {
      password: studentPassword,
      name: 'Demo Student',
      role: 'STUDENT'
    },
    create: {
      email: 'student@rexam.com',
      password: studentPassword,
      name: 'Demo Student',
      role: 'STUDENT',
      phone: '8888888888'
    }
  });
  console.log(`✅ Student Account Seeded: ${student.email} (Password: student123)`);

  // Seed Rich Realistic CBT Examinations
  console.log('📝 Seeding Standard Practice & Live Examinations...');

  const exam1 = await prisma.exam.upsert({
    where: { code: 'REX-CS-2026' },
    update: {},
    create: {
      title: 'Computer Science & Software Engineering Assessment',
      code: 'REX-CS-2026',
      description: 'Comprehensive National-level CBT examination covering Data Structures, Algorithms, Operating Systems, Database Systems, and Computer Networks.',
      duration: 30,
      totalMarks: 50,
      passingMarks: 20,
      createdById: admin.id,
      questions: {
        create: [
          {
            text: 'What is the worst-case time complexity of searching for an element in an unsorted Array vs a Balanced Binary Search Tree (AVL Tree)?',
            subject: 'Data Structures',
            topic: 'Tree Data Structures',
            difficulty: 'EASY',
            marks: 5,
            negativeMarks: 1,
            explanation: 'Unsorted array requires O(N) linear search, whereas balanced BST guarantees O(log N) lookup.',
            options: {
              create: [
                { text: 'Array: O(N), AVL Tree: O(log N)', isCorrect: true },
                { text: 'Array: O(1), AVL Tree: O(N)', isCorrect: false },
                { text: 'Array: O(log N), AVL Tree: O(N)', isCorrect: false },
                { text: 'Array: O(N^2), AVL Tree: O(1)', isCorrect: false }
              ]
            }
          },
          {
            text: 'Which React hook is designed to memoize computationally intensive functions across component renders?',
            subject: 'Web Engineering',
            topic: 'React & Frontend',
            difficulty: 'MEDIUM',
            marks: 5,
            negativeMarks: 1,
            explanation: 'useMemo returns a memoized value, preventing expensive calculations on every render unless dependencies change.',
            options: {
              create: [
                { text: 'useCallback', isCorrect: false },
                { text: 'useMemo', isCorrect: true },
                { text: 'useReducer', isCorrect: false },
                { text: 'useRef', isCorrect: false }
              ]
            }
          },
          {
            text: 'In relational database theory, which Normal Form eliminates transitive functional dependencies?',
            subject: 'Database Systems',
            topic: 'Normalization',
            difficulty: 'MEDIUM',
            marks: 5,
            negativeMarks: 1,
            explanation: 'Third Normal Form (3NF) requires 2NF and mandates that no non-prime attribute is transitively dependent on the primary key.',
            options: {
              create: [
                { text: 'First Normal Form (1NF)', isCorrect: false },
                { text: 'Second Normal Form (2NF)', isCorrect: false },
                { text: 'Third Normal Form (3NF)', isCorrect: true },
                { text: 'Boyce-Codd Normal Form (BCNF)', isCorrect: false }
              ]
            }
          },
          {
            text: 'Which transport layer protocol provides reliable, connection-oriented, and byte-stream delivery with congestion control?',
            subject: 'Computer Networks',
            topic: 'Transport Layer',
            difficulty: 'EASY',
            marks: 5,
            negativeMarks: 1,
            explanation: 'TCP (Transmission Control Protocol) establishes a 3-way handshake, sequence numbers, acknowledgements, and flow control.',
            options: {
              create: [
                { text: 'UDP (User Datagram Protocol)', isCorrect: false },
                { text: 'TCP (Transmission Control Protocol)', isCorrect: true },
                { text: 'ICMP (Internet Control Message Protocol)', isCorrect: false },
                { text: 'ARP (Address Resolution Protocol)', isCorrect: false }
              ]
            }
          },
          {
            text: 'In Operating Systems, which condition is NOT one of the Coffman conditions required for a Deadlock to occur?',
            subject: 'Operating Systems',
            topic: 'Process Synchronization & Deadlocks',
            difficulty: 'HARD',
            marks: 5,
            negativeMarks: 1,
            explanation: 'Preemption breaks deadlock. The Coffman conditions are Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.',
            options: {
              create: [
                { text: 'Mutual Exclusion', isCorrect: false },
                { text: 'Hold and Wait', isCorrect: false },
                { text: 'Voluntary Resource Preemption', isCorrect: true },
                { text: 'Circular Wait', isCorrect: false }
              ]
            }
          },
          {
            text: 'What HTTP status code is sent when an authenticated user attempts to access a resource they lack sufficient authorization permissions for?',
            subject: 'Web Engineering',
            topic: 'Security & HTTP Standards',
            difficulty: 'EASY',
            marks: 5,
            negativeMarks: 1,
            explanation: '401 is Unauthorized (unauthenticated), while 403 Forbidden indicates the server understood the identity but refuses authorization.',
            options: {
              create: [
                { text: '401 Unauthorized', isCorrect: false },
                { text: '403 Forbidden', isCorrect: true },
                { text: '404 Not Found', isCorrect: false },
                { text: '405 Method Not Allowed', isCorrect: false }
              ]
            }
          },
          {
            text: 'What is the average time complexity of QuickSort with a random pivot selection?',
            subject: 'Algorithms',
            topic: 'Sorting & Divide and Conquer',
            difficulty: 'MEDIUM',
            marks: 5,
            negativeMarks: 1,
            explanation: 'QuickSort exhibits O(N log N) expected average time complexity when pivots partition the input fairly.',
            options: {
              create: [
                { text: 'O(N)', isCorrect: false },
                { text: 'O(N log N)', isCorrect: true },
                { text: 'O(N^2)', isCorrect: false },
                { text: 'O(log N)', isCorrect: false }
              ]
            }
          },
          {
            text: 'Which data structure is fundamentally used for Breadth-First Search (BFS) graph traversal?',
            subject: 'Data Structures',
            topic: 'Graph Algorithms',
            difficulty: 'EASY',
            marks: 5,
            negativeMarks: 1,
            explanation: 'BFS uses a FIFO Queue to visit all adjacent vertices level by level.',
            options: {
              create: [
                { text: 'Stack (LIFO)', isCorrect: false },
                { text: 'Queue (FIFO)', isCorrect: true },
                { text: 'Priority Queue', isCorrect: false },
                { text: 'Binary Heap', isCorrect: false }
              ]
            }
          },
          {
            text: 'In modern Node.js event-driven architecture, what library powers the cross-platform asynchronous I/O event loop?',
            subject: 'Backend Architecture',
            topic: 'Node.js Internals',
            difficulty: 'HARD',
            marks: 5,
            negativeMarks: 1,
            explanation: 'libuv is the multi-platform C library that provides asynchronous event-driven I/O and thread pooling to Node.js.',
            options: {
              create: [
                { text: 'V8 Engine', isCorrect: false },
                { text: 'libuv', isCorrect: true },
                { text: 'OpenSSL', isCorrect: false },
                { text: 'zlib', isCorrect: false }
              ]
            }
          },
          {
            text: 'Which SQL clause is executed after the GROUP BY clause to filter aggregated records?',
            subject: 'Database Systems',
            topic: 'SQL Querying',
            difficulty: 'EASY',
            marks: 5,
            negativeMarks: 1,
            explanation: 'The HAVING clause filters rows after aggregation (GROUP BY), whereas WHERE filters before grouping.',
            options: {
              create: [
                { text: 'WHERE', isCorrect: false },
                { text: 'HAVING', isCorrect: true },
                { text: 'ORDER BY', isCorrect: false },
                { text: 'LIMIT', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  });
  console.log(`✅ Exam Seeded: ${exam1.title} (${exam1.code})`);

  const exam2 = await prisma.exam.upsert({
    where: { code: 'REX-APT-2026' },
    update: {},
    create: {
      title: 'General Aptitude, Reasoning & Problem Solving',
      code: 'REX-APT-2026',
      description: 'Standard competitive examination test assessing numerical agility, logical deduction, and verbal aptitude.',
      duration: 25,
      totalMarks: 30,
      passingMarks: 12,
      createdById: admin.id,
      questions: {
        create: [
          {
            text: 'If a train traveling at 72 km/h crosses a 200m long platform in 25 seconds, what is the length of the train?',
            subject: 'Quantitative Aptitude',
            topic: 'Speed, Time and Distance',
            difficulty: 'MEDIUM',
            marks: 5,
            negativeMarks: 1,
            explanation: 'Speed = 72 * (5/18) = 20 m/s. Total distance in 25s = 20 * 25 = 500m. Train length = 500 - 200 = 300 meters.',
            options: {
              create: [
                { text: '250 meters', isCorrect: false },
                { text: '300 meters', isCorrect: true },
                { text: '350 meters', isCorrect: false },
                { text: '400 meters', isCorrect: false }
              ]
            }
          },
          {
            text: 'Find the missing term in the sequence: 3, 7, 15, 31, 63, ?',
            subject: 'Logical Reasoning',
            topic: 'Number Series',
            difficulty: 'EASY',
            marks: 5,
            negativeMarks: 1,
            explanation: 'Pattern is (2 * previous) + 1. Next number is (63 * 2) + 1 = 127.',
            options: {
              create: [
                { text: '125', isCorrect: false },
                { text: '127', isCorrect: true },
                { text: '129', isCorrect: false },
                { text: '131', isCorrect: false }
              ]
            }
          },
          {
            text: 'A shopkeeper marks an article 40% above the cost price and allows a discount of 20%. What is his profit percentage?',
            subject: 'Quantitative Aptitude',
            topic: 'Profit and Loss',
            difficulty: 'MEDIUM',
            marks: 5,
            negativeMarks: 1,
            explanation: 'Let CP = 100. MP = 140. SP = 140 * 0.8 = 112. Profit % = 12%.',
            options: {
              create: [
                { text: '10%', isCorrect: false },
                { text: '12%', isCorrect: true },
                { text: '15%', isCorrect: false },
                { text: '20%', isCorrect: false }
              ]
            }
          },
          {
            text: 'Pointing to a photograph, Rohit said, "She is the only daughter of my grandfather\'s only son." How is the person in the photograph related to Rohit?',
            subject: 'Logical Reasoning',
            topic: 'Blood Relations',
            difficulty: 'EASY',
            marks: 5,
            negativeMarks: 1,
            explanation: 'Rohit\'s grandfather\'s only son is Rohit\'s father. The only daughter of Rohit\'s father is Rohit\'s Sister.',
            options: {
              create: [
                { text: 'Mother', isCorrect: false },
                { text: 'Sister', isCorrect: true },
                { text: 'Cousin', isCorrect: false },
                { text: 'Aunt', isCorrect: false }
              ]
            }
          },
          {
            text: 'Choose the antonym for the word: "EPHEMERAL"',
            subject: 'Verbal Ability',
            topic: 'Vocabulary',
            difficulty: 'MEDIUM',
            marks: 5,
            negativeMarks: 1,
            explanation: 'Ephemeral means short-lived or transitory. Its antonym is Permanent or Eternal.',
            options: {
              create: [
                { text: 'Transient', isCorrect: false },
                { text: 'Permanent', isCorrect: true },
                { text: 'Fleeting', isCorrect: false },
                { text: 'Sporadic', isCorrect: false }
              ]
            }
          },
          {
            text: 'A can complete a project in 12 days, and B can complete it in 18 days. If they work together, in how many days will the project be finished?',
            subject: 'Quantitative Aptitude',
            topic: 'Time and Work',
            difficulty: 'MEDIUM',
            marks: 5,
            negativeMarks: 1,
            explanation: 'Combined rate = 1/12 + 1/18 = (3+2)/36 = 5/36. Total days = 36/5 = 7.2 days.',
            options: {
              create: [
                { text: '6.5 days', isCorrect: false },
                { text: '7.2 days', isCorrect: true },
                { text: '8.0 days', isCorrect: false },
                { text: '9.0 days', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  });
  console.log(`✅ Exam Seeded: ${exam2.title} (${exam2.code})`);

  console.log('🎉 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
