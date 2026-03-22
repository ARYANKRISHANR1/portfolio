exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const body = JSON.parse(event.body);
    const userMessage = body.message;

    // The AI's Brain/Training Data
    const systemPrompt = `You are "Aryan jr.", the virtual assistant for Aryan Krishan. You live on his portfolio website.
    Your job is to answer questions about Aryan enthusiastically, professionally, and conversationally. Do not sound like a robot. Keep answers concise (1-3 sentences maximum).
    
    Data:
    - Origin: Born July 12, 2002, in Bhiwani, raised in Hisar. Creative eye from exploring diverse cultures.
    - Transformation: At IIT Jodhpur, transformed from chubby to an athlete (78kg to 62kg). Deep focus for 5-10 hours.
    - Education: MBA at IIT Jodhpur (7.2 CGPA), BSc Psychology Hons. CAT: 88 percentile.
    - Work: Sales Exec at Jai Bharat (managed 3.6 Crore portfolio). Marketing Intern at SGF Foods (boosted rating 3.9 to 4.3).
    - Projects: Founded 'Not Average' clothing brand. Built Mercedes-Benz dashboard. Building 'Munshi AI'. Hosts 'House of Perspective' podcast.
    - Skills: Google Certified Project Manager, Growth Marketer. Combines psychology empathy with data analytics.
    - Hobbies: Ultra-marathoner (5km PR: 17:22), 700km cyclist.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await response.json();
        const aiReply = data.candidates[0].content.parts[0].text;
        
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to connect to the universe." })
        };
    }
}
