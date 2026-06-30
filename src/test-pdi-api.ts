import axios from 'axios';

async function main() {
  const email = 'rodrigo.teste.pf@example.com';
  const password = 'Teste@123';

  console.log('1. Logging in...');
  try {
    const loginRes = await axios.post('http://localhost:3001/auth/login', {
      email,
      password,
    });

    const token = loginRes.data.access_token;
    console.log('Login successful! Access token obtained.');

    console.log('2. Attempting to create a PDI...');
    const pdiPayload = {
      title: 'Desenvolvimento NestJS',
      goals: 'Ser um especialista NestJS e React',
      skills: 'TypeScript, NestJS, React, Prisma',
      previousEducation: 'Engenharia de Software',
      dailyTime: '2 horas'
    };

    const pdiRes = await axios.post('http://localhost:3001/pdi', pdiPayload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('PDI successfully created!');
    console.log('PDI Response:', JSON.stringify(pdiRes.data, null, 2));
  } catch (err: any) {
    console.error('Error occurred:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);
    }
    process.exit(1);
  }
}

main();
