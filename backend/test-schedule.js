// Quick test script to check schedule creation
// Run with: node test-schedule.js

const axios = require('axios');

async function testScheduleCreation() {
    try {
        // First, login to get a token
        console.log('1. Attempting to login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@example.com', // Replace with your actual email
            password: 'password123'      // Replace with your actual password
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Try to create a schedule
        console.log('\n2. Attempting to create schedule...');
        const scheduleResponse = await axios.post(
            'http://localhost:5000/api/schedules',
            {
                name: 'Test Schedule',
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '17:00',
                slotDuration: 30
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('✅ Schedule created successfully!');
        console.log('Schedule:', scheduleResponse.data);

    } catch (error) {
        console.error('\n❌ Error occurred:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testScheduleCreation();
