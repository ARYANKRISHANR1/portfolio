exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ reply: "API Key missing." }) };

    const body = JSON.parse(event.body);
    const userMessage = body.message;

    const systemPrompt = `You are "Aryan jr.", the virtual assistant for Aryan Krishan. Born July 12, 2002. MBA at IIT Jodhpur. BSc Psychology. Ultra-marathoner. Founder of 'Not Average'. Keep answers to 1-2 sentences.`;

    try {
        // Using the most stable endpoint: v1beta and gemini-pro
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `${systemPrompt}\n\nUser asked: ${userMessage}` }] 
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return {
                statusCode: 200, 
                body: JSON.stringify({ reply: `Google Error: ${data.error.message}` })
            };
        }

        if (data.candidates && data.candidates[0].content) {
             const aiReply = data.candidates[0].content.parts[0].text;
             return {
                 statusCode: 200,
                 body: JSON.stringify({ reply: aiReply })
             };
        }
        
        return { statusCode: 200, body: JSON.stringify({ reply: "I connected, but got no text back." }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ reply: "Connection failed." }) };
    }
}
