import fetch from 'node-fetch';

async function runTest() {
    console.log('1. Signing up a raw user');
    const signupRes = await fetch('http://localhost:3001/auth/signup/raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'sessiontest@example.com',
            documentNumber: '11122233344',
            name: 'Session Tester'
        })
    });
    console.log('Signup Res:', await signupRes.text());

    // We have a mock user. Usually raw uses 'AuthenticateRequestDto' to login if password set, or we can use admin to force password.
    // Wait, let's just create a normal PF to test password login easily.
    console.log('\n1.5 Signing up normal PF user');
    const pfSignup = await fetch('http://localhost:3001/auth/signup/pf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'pf_test@example.com',
            password: 'StrongPassword123!',
            documentNumber: '55566677788',
            pfInfo: {
                nome: 'PF Tester',
                telefone: '31999999999',
                dataDeNascimento: '1990-01-01',
                cepNumber: '30000000',
                estado: 'MG',
                cidade: 'Belo Horizonte',
                bairro: 'Centro',
                rua: 'Rua A',
                numero: '123'
            }
        })
    });
    console.log('PF Signup:', await pfSignup.text());

    console.log('\n2. Logging in');
    const loginRes = await fetch('http://localhost:3001/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'pf_test@example.com',
            password: 'StrongPassword123!'
        })
    });

    const loginData = await loginRes.json();
    const token = loginData.access_token;
    console.log('Token received:', token ? 'Yes' : 'No');

    if (!token) return;

    console.log('\n3. Simulating activity (calling a protected route like /users/info)');
    // Await 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    const activeRes = await fetch('http://localhost:3001/users/info', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('User Info Status:', activeRes.status);

    console.log('\n4. Logging out');
    await new Promise(r => setTimeout(r, 1000));

    const logoutRes = await fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Logout Status:', logoutRes.status);

    console.log('\n5. Trying to access /users/info again (Should be unauthorized)');
    const checkRes = await fetch('http://localhost:3001/users/info', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Final Info Status:', checkRes.status, await checkRes.text());
}

runTest();
