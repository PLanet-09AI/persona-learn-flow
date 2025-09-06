// Test the diagram formatting function
import { formatContent } from './contentFormatter';

const testContent = `
# Business Strategy

plaintext
+---------------------------------+
|            Business Strategy      |
+---------------------------------+

|
|

+-------------------+-------------------+
|                                   |
v                                   v
+----------------+ +----------------+
| Competitive    |                  | Corporate      |
| Advantage      |                  | Strategy       |
+----------------+ +----------------+

plaintext

## Competitive Advantage

+-------------------+
| Competitive      |
| Advantage        |
+-------------------+

|           |
v           v

+----------------+ +-----------------+
| Product        | | Process         |
| Differentiation| | Efficiency     |
+----------------+ +-----------------+
`;

console.log('Original content:');
console.log(testContent);

console.log('\n\nFormatted content:');
const formatted = formatContent(testContent, 'visual');
console.log(formatted);
