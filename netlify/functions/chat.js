exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message } = JSON.parse(event.body);
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ reply: "API Key missing." }) };
    }

    const systemPrompt = `You are "Aryan Jr.", the virtual assistant for Aryan Krishan. Born July 12, 2002. MBA at IIT Jodhpur. BSc Psychology. Ultra-marathoner. Founder of 'Not Average'. Keep answers to 1-2 sentences.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://sage-fox-37e7be.netlify.app/",
        "X-Title": "Aryan Jr. Chatbot"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: `Error: ${data.error.message}` })
      };
    }

    const reply = data.choices?.[0]?.message?.content || "No response.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Connection failed." })
    };
  }
};
