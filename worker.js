export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("AI Life Assistant is running");
    }

    const update = await request.json();
    const chatId = update?.message?.chat?.id;

    if (chatId) {
      await fetch(
        "https://api.telegram.org/bot" +
          env.TELEGRAM_BOT_TOKEN +
          "/sendMessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Bot connected successfully!"
          })
        }
      );
    }

    return new Response("OK");
  }
};
