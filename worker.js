export default {
  async fetch(request, env) {

    // تست باز بودن Worker
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

      // درخواست به Z.ai
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
                  "You are AI Life Assistant. Answer in Persian when the user speaks Persian."
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

      const rawResponse = await aiResponse.text();

      let reply;

      // اگر Z.ai خطا داد
      if (!aiResponse.ok) {
        reply =
          "Z.ai Error\n" +
          "Status: " +
          aiResponse.status +
          "\n\n" +
          rawResponse.slice(0, 1500);
      } else {
        try {
          const aiData = JSON.parse(rawResponse);

          reply =
            aiData?.choices?.[0]?.message?.content ||
            "پاسخ از Z.ai دریافت شد، اما متن پاسخ پیدا نشد.";
        } catch {
          reply =
            "پاسخ Z.ai قابل خواندن نبود:\n\n" +
            rawResponse.slice(0, 1500);
        }
      }

      // ارسال نتیجه به تلگرام
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

      // ثبت خطای اصلی در Cloudflare
      console.error("WORKER ERROR:", error);

      return new Response(
        "Worker Error: " + String(error),
        { status: 500 }
      );
    }
  }
};
