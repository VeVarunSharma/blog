---
title: 'So… what is GitHub Copilot’s "Raptor mini"and why should devs care?'
description: 'GitHub quietly slipped a new model into Copilot called “Raptor mini (Preview)”.  The changelog...'
publishedAt: 2025-11-11
updatedAt: 2025-11-13
tags:
  - 'github'
  - 'githubcopilot'
  - 'ai'
  - 'vscode'
draft: false
featured: false
image:
  src: '/images/posts/so-what-is-github-copilots-raptor-mini-and-why-should-devs-care/cover.png'
  alt: 'Cover image for So… what is GitHub Copilot’s "Raptor mini"and why should devs care?'
sourceUrl: 'https://dev.to/vevarunsharma/so-what-is-github-copilots-raptor-miniand-why-should-devs-care-3n30'
---

GitHub quietly slipped a new model into Copilot called **“Raptor mini (Preview)”**.

The changelog basically said:

> “Raptor mini, a new experimental model, is now rolling out in GitHub Copilot to Pro, Pro+, and Free plans in Visual Studio Code… Rollout will be gradual.”

…which does **not** tell us what it is, why it exists, or when you should pick it over the other models.

So we did what devs do: we poked at the UI, looked at the supported-models table, and dug into the VS Code debug logs. And it turns out there’s enough there to form a pretty good picture of what Raptor mini actually is.

This post is that picture.

---

## TL;DR for the busy dev

- **Raptor mini = an (OpenAI GPT-5-mini–family model fine-tuned by Microsoft/GitHub for Copilot.)[https://gh.io/copilot-openai-fine-tuned-by-microsoft]**
- It’s **served from GitHub’s Azure OpenAI tenant** (not you calling OpenAI directly).
- It has a **surprisingly big context window (~264k)** and **big output (~64k)** for something called “mini.”
- It already **knows how to do Copilot things** (chat, ask, edit, agent) and was good at **tool/MCP flows** in testing.
- You should try it for **workspace-scale, repetitive, “apply this everywhere”** tasks inside VS Code.
- It looks like a **stealth testbed** for a code-forward GPT-5-codex-mini that GitHub/Microsoft want real usage on.

If that’s enough for you — activate it in your Github Copilot Models, and go open Copilot Chat in VS Code, pick **“Raptor mini (Preview)”**, and try a real task.

![vs-code-copilot-models](/images/posts/so-what-is-github-copilots-raptor-mini-and-why-should-devs-care/image-01.png)

If you want the receipts, keep reading.

---

## 1. What GitHub actually told us (the boring part)

From the Copilot UI/docs:

- It’s called **Raptor mini (Preview)**.
- It shows up in **VS Code Copilot Chat** model picker.
- It’s labeled as **“fine-tuned GPT-5 mini.”**
- Docs say it’s **deployed on GitHub-managed Azure OpenAI.**

That alone says: GitHub took an OpenAI GPT-5-mini, ran their own fine-tuning/config, and is exposing it only through Copilot, not as a general-purpose public API.

![github-copilot-model-list](/images/posts/so-what-is-github-copilots-raptor-mini-and-why-should-devs-care/image-02.png)

![copilot-docs-description](/images/posts/so-what-is-github-copilots-raptor-mini-and-why-should-devs-care/image-03.png)

So far: ✅ real model, ✅ real preview, ❌ zero detail.

---

## 2. What the debug logs tell us (the fun part)

From the VS Code debug logs we can actually see the model object. It looked like this:

```json
  {
    "billing": {
      "is_premium": true,
      "multiplier": 1
    },
    "capabilities": {
      "family": "gpt-5-mini",
      "limits": {
        "max_context_window_tokens": 264000,
        "max_output_tokens": 64000,
        "max_prompt_tokens": 200000,
        "vision": {
          "max_prompt_image_size": 3145728,
          "max_prompt_images": 1,
          "supported_media_types": [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
          ]
        }
      },
      "object": "model_capabilities",
      "supports": {
        "parallel_tool_calls": true,
        "streaming": true,
        "structured_outputs": true,
        "tool_calls": true,
        "vision": true
      },
      "tokenizer": "o200k_base",
      "type": "chat"
    },
    "id": "oswe-vscode-prime",
    "is_chat_default": false,
    "is_chat_fallback": false,
    "model_picker_category": "versatile",
    "model_picker_enabled": true,
    "name": "Raptor mini (Preview)",
    "object": "model",
    "policy": {
      "state": "unconfigured",
      "terms": "Enable access to the latest Raptor mini model from Microsoft. [Learn more about how GitHub Copilot serves Raptor mini](https://gh.io/copilot-openai-fine-tuned-by-microsoft)."
    },
    "preview": true,
    "supported_endpoints": [
      "/chat/completions",
      "/responses"
    ],
    "vendor": "Azure OpenAI",
    "version": "raptor-mini"
  }
]
```

A couple important takeaways:

1. **Family is `gpt-5-mini`.** So we’re not dealing with an old GPT-4 derivative. Possibly gpt-5-codex-mini.
2. **264k context** is _large_ for a model GitHub calls “mini.”
3. **64k output** means long edits, long summaries, long multi-file instructions are on the table.
4. **Tool calls + parallel tool calls** means it’s built to play nicely with Copilot’s “do stuff, not just talk” surface.
5. **Vision: true** — you can hand it an image (1 image) and it won’t freak out.

That’s already more concrete than the public announcement.

---

## 3. So… what is it really?

A good working definition for your team:

> **Raptor mini is a Copilot-tuned GPT-5-mini (possibly codex mini) hosted by GitHub/Microsoft on Azure, sized and wired to do big, editor-style, multi-file tasks quickly, and to cooperate with Copilot tools/agents.**

That’s it. Not magic, but very handy.

---

## 4. Why should devs care?

Because this is one of the first times GitHub is letting us touch a **GPT-5-family** model that is:

1. **Editor-first.** It actually behaves in the context of Copilot chat/ask/edit/agent.
2. **Context-heavy.** 200k+ prompt tokens means “I want you to look at a lot of stuff in this workspace” becomes realistic.
3. **Action-friendly.** It was **“using tools, skills, and MCPs amazingly and editing properly”** in testing — that’s exactly what you want from a Copilot model, not just a chatty assistant.
4. **Fast enough.** Even with “reasoning: high” you saw ~122 tokens/sec, which is fine for an IDE loop.
5. **Probably the shape of future Copilot models.** This feels like GitHub/Microsoft collecting real-world data before shipping something more “stable” under a friendlier name.

In other words: **this model is pointed at actual, boring, high-value dev tasks** — “rename this pattern everywhere,” “update docs across files,” “fix this class and regenerate the tests,” not just “explain this LeetCode.”

---

## 5. When to use Raptor mini vs. other models

Here’s a practical way to tell your readers “use this one now”:

### ✅ Use Raptor mini when…

- You’re in **VS Code** and already using **Copilot Chat/Ask/Edit/Agent**.
- You want to **apply or explain changes across multiple files**.
- You want it to **call MCP/tools** reliably.
- You pasted a **long error / long diff / long file** and don’t want to get “too long” pushback.
- You care more about **getting a correct edit** than getting a 1,000-word essay.

### 🟡 Maybe pick something else when…

- You need **extremely creative / longform / non-coding** output.
- You need a **documented, versioned model card** (this is still preview).
- You don’t have it in your model picker yet (GitHub said rollout is gradual).

---

## 6. How to try it right now

1. Enable the Raptor Mini Model in Github Copilot settings (Copilot Pro+ tier needed)

2. Open **VS Code**.

3. Open **GitHub Copilot Chat**.

4. Click the **model picker** at the top.

5. Choose **“Raptor mini (Preview)”**.

6. Run a **real** task, e.g.:

   ```text
   I have the file that's open in the editor. Explain why this custom hook is rerendering so often, then propose the smallest fix, then apply the edit.
   ```

   or

   ```text
   Scan the components in src/components and update every usage of <OldButton> to <NewButton variant="primary" />. Show me the diff per file.
   ```

7. If you want to nerd out, open **Developer Tools** in VS Code and watch the network/model info — that’s where we saw the `oswe-vscode-prime` / `raptor-mini` bits.

---

## 7. What we still don’t know (and should be honest about)

This is a preview. That means:

- GitHub can **change the underlying model** without telling us.
- We don’t have the **full fine-tuning description** (what tasks, what data).
- We don’t have a **stable latency/perf sheet**.
- Naming might change — GitHub has been shuffling Copilot models fairly often.

So if you’re writing internal guidance for your team, phrase it as:

> “Use Raptor mini in VS Code Copilot when it’s available, especially for long or tool-heavy edits. It’s experimental, so results may change.”

---

## 8. A quick hypothesis (the hype part, but reasonable)

This looks like GitHub/Microsoft dogfooding a code-forward GPT-5-mini in the safest place possible — Copilot inside VS Code — where they control the context, the tools, and the telemetry.

That’s how you get real data on: “Can it handle 200k-token workspace prompts?”, “Does it call tools well?”, “Do developers accept the edits?” — all the things you can’t learn from a generic chat playground.

So yeah, **a little hype is justified** — not because the name is cool, but because this is how the next generation of Copilot models will actually get trained/tuned.

---

## 9. Closing

![gpt-5-mini-stealth-reveal](/images/posts/so-what-is-github-copilots-raptor-mini-and-why-should-devs-care/image-04.png)

GitHub didn’t give us the story, so we had to reconstruct it:

- **What it is:** Copilot-tuned GPT-5-mini (possibly codex mini) on Azure.
- **Why it matters:** big context + good tool use = better real VS Code tasks.
- **Who should try it:** anyone already living in Copilot that hits “this is too long” or “stop ignoring my workspace” walls.
- **What to expect:** it’ll change — it’s a preview — but trying it now gives you better edits today _and_ better models tomorrow.

If you’ve got it in your picker, give it a real job. Not “write a poem,” but “touch 12 files safely.”

And if you don’t have it yet… GitHub said rollout is gradual, so check back. 😉

I'd love to hear other developers thoughts on this and see what the community can further prove with this and how they're using Mini-Raptor.

---
