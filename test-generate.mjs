async function test() {
    const data = {
        personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', website: '', title: '' },
        summary: '',
        skills: [{ name: '' }],
        experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
        education: [{ school: '', degree: '', field: '', graduationDate: '' }],
        projects: [],
        certifications: [],
    };

    const res = await fetch('http://localhost:3000/api/generate-resume', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    // We already know we get a 500 Unauthorized if untested with session.
    // Wait, let's just use Groq SDK directly.
}
test();
