require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkResumes() {
    console.log('Fetching resumes...');
    const { data, error } = await supabase.from('resumes').select('id, user_id, created_at, generated_resume_text').order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} resumes.`);
    data.forEach((r, i) => {
        const textLen = r.generated_resume_text ? r.generated_resume_text.length : 0;
        console.log(`[${i}] ID: ${r.id} | Date: ${r.created_at} | Text Length: ${textLen}`);
        if (textLen < 100) {
            console.log(`  Content: "${r.generated_resume_text}"`);
        }
    });
}

checkResumes();
