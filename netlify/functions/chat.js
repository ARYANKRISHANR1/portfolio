exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
         return { statusCode: 500, body: JSON.stringify({ reply: "My brain is missing its key!" }) };
    }

    let userMessage = "";
    try {
        const body = JSON.parse(event.body);
        userMessage = body.message;
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ reply: "I didn't understand that message." }) };
    }

    const systemPrompt = `You are "Aryan jr.", the virtual assistant for Aryan Krishan. Keep answers concise (1-3 sentences).
    Data:
    - Origin: Born July 12, 2002, in Bhiwani, raised in Hisar.
    - Transformation: At IIT Jodhpur, transformed from 78kg to 62kg athlete. 
    - Education: MBA at IIT Jodhpur, BSc Psychology Hons.
    - Work: Sales Exec at Jai Bharat, Marketing Intern at SGF Foods.
    - Projects: Founded 'Not Average' brand, built Mercedes dashboard and 'Munshi AI'.
    - Skills: Google Certified Project Manager, Growth Marketer.
    - Hobbies: Ultra-marathoner (5km PR: 17:22), cyclist.`;

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

        // THIS IS THE MAGIC DIAGNOSTIC FIX!
        // If Google rejects it, Aryan Jr. will tell us exactly why.
        if (data.error) {
            return {
                statusCode: 200, 
                body: JSON.stringify({ reply: `Google Error: ${data.error.message}` })
            };
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
             const aiReply = data.candidates[0].content.parts[0].text;
             return {
                 statusCode: 200,
                 body: JSON.stringify({ reply: aiReply })
             };
        } else {
             return {
                 statusCode: 200,
                 body: JSON.stringify({ reply: "Google sent back strange data: " + JSON.stringify(data) })
             };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ reply: "My connection to Google failed entirely." })
        };
    }
}
