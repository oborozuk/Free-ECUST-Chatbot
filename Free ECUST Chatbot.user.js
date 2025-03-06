// ==UserScript==
// @name         Free ECUST Chatbot
// @namespace    https://github.com/oborozuk
// @version      0.1.5
// @description  Free and unrestricted ECUST chatbot
// @author       Oborozuki
// @match        *://ai.s.ecust.edu.cn/*
// @run-at       document-start
// @grant        unsafeWindow
// @downloadURL  https://github.com/oborozuk/Free-ECUST-Chatbot/raw/refs/heads/main/Free%20ECUST%20Chatbot.user.js
// @updateURL    https://github.com/oborozuk/Free-ECUST-Chatbot/raw/refs/heads/main/Free%20ECUST%20Chatbot.user.js
// ==/UserScript==

const modelTemperature = 0.8;
const deleteSystemPrompt = true;

(function () {
    const originFetch = fetch;

    window.unsafeWindow.fetch = async (url, options) => {
        if (url.includes("/api/tokenizer") || url.includes("/api/paycenter/token/consume")) {
            return null;
        }

        if (url.includes("/api/chat/") && options?.body) {
            const body = JSON.parse(options.body);
            body.chatSettings.temperature = modelTemperature;

            if (body.messages?.length) {
                const firstMessage = body.messages[0];
                if (deleteSystemPrompt && firstMessage.role === "system") {
                    body.messages.shift();
                }
            }
            options.body = JSON.stringify(body);
        }

        return originFetch(url, options).then(async (response) => {
            if (url.includes("/api/text/check")) {
                const res = await response.clone().json();
                res.data.forEach(d => { d.code = 1; });
                return new Response(JSON.stringify(res), response);
            // } else if (url.includes("/chatbot/api/paycenter/token/check")) {
            //     const res = await response.clone().json();
            //     res.unUsedToken = 9999999999;
            //     return new Response(JSON.stringify(res), response);
            }
            return response;
        });
    };
})();
