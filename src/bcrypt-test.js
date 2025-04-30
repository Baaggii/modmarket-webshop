const bcrypt = require('bcrypt');

async function testHashing() {
  const password = 'mySecret123';
  const hashed = await bcrypt.hash(password, 10);

  console.log('Original:', password);
  console.log('Hashed:', hashed);

  const isMatch = await bcrypt.compare('mySecret123', hashed);
  console.log('Password match?', isMatch);
}

testHashing();
