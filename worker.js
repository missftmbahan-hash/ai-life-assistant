export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("AI Life Assistant is running");
    }

    try {
      const update = await request.json();

      const chatId = update?.message?.chat?.id;
      const userText = update?.message?.text;

      if (!chatId || !userText) {
        return new Response("OK");
      }

      // Send user's message to Z.AI
      const aiResponse = await fetch(
        "https://api.z.ai/api/paas/v4/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.ZAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "glm-5.1",
            messages: [
              {
                role: "system",
                content:
                  "You are AI Life Assistant, a helpful personal AI assistant. Respond in Persian when the user speaks Persian. Be clear, practical and friendly."
              },
              {
                role: "user",
                content: userText
              }
            ],
            stream: false
          })
        }
      );

      const aiData = await aiResponse.json();

      let reply =
        aiData?.choices?.[0]?.message?.content ||
        "متأسفم، نتونستم از هوش مصنوعی پاسخ بگیرم.";

      // Send AI response back to Telegram
      await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply
          })
        }
      );

      return new Response("OK");
    } catch (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }
  }
};
