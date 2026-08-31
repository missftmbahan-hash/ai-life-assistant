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

      const aiResponse = await env.AI.run(
        "@cf/zai-org/glm-4.7-flash",
        {
          messages: [
            {
              role: "system",
              content:
                "You are AI Life Assistant. Answer in Persian when the user speaks Persian."
            },
            {
              role: "user",
              content: userText
            }
          ]
        }
      );

      const reply =
        aiResponse?.response ||
        aiResponse?.result?.response ||
        aiResponse?.choices?.[0]?.message?.content ||
        "پاسخ دریافت شد، اما متن پاسخ پیدا نشد.";

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
      console.error("WORKER ERROR:", error);

      return new Response(
        "Worker Error: " + String(error),
        { status: 500 }
      );
    }
  }
};
