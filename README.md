# ToMe CLI 

Well, for a start, Hi everyone reading this. This is ToMe (Repository Intelligence State Engine). I built this because TBH, understanding big codebases is a kind of thing which I guess people do to shine around their dev skills. But sometimes, you just have a massive project and you have no idea how the parts connect. So, I created this tool to basically read your entire codebase and write out the whole architecture and rules for you automatically using AI. 

A good architecture doc in this professional world is going to act as the salt of every recipe you cook in your project. Without it, you can be a lowkey worker showing up every day to fix bugs which you cannot will to understand. The underlying power to play with complex code, all lie in knowing the structure. And that's where this tool will help you win.

### What it actually does

If you run ToMe, it will look at all your files, figure out the important ones, and ask Gemini (or OpenAI/Claude) to build a map of your code. It saves this as a `.ris-state.json` file and creates a neat `architect.md` file so you can read it. You can also connect it directly to AI tools like Claude Desktop or Cursor so they know your codebase architecture instantly.

### How to use it step-wise

The inertia of setting things up can be a bit much, but I made it very simple so that native style can be done without much practice. 

**Step 1: Install it**
Just get it globally on your system.
```bash
npm install -g tome-cli
```

**Step 2: Go to your project**
Open your terminal and go to the folder where your big codebase is.
```bash
cd /path/to/your/project
```

**Step 3: Init the tool**
Run this to create the base config files. It will make a `.tome` folder. Don't worry, it automatically ignores heavy stuff like `node_modules` or `venv` so it won't crash.
```bash
tome init
```

**Step 4: Set your API Key**
You need an API key to let the AI do the thinking. It automatically detects if you are using Gemini, OpenAI, or Anthropic just by looking at the key. Put it in your terminal like this:

For Mac/Linux:
```bash
export TOME_API_KEY="your-api-key-here"
```
For Windows (PowerShell):
```bash
$env:TOME_API_KEY="your-api-key-here"
```

**Step 5: Run the magic**
Now just tell it to update. 
```bash
tome update
```
It will read your files and do the work. If your project is too big (like 80,000 files), it uses a smart sampling trick to pick only the top 500 best files so your API bill doesn't explode. Also, if your heavy AI model fails or runs out of quota, the dare to upgrade myself made me build an auto-fallback feature. It will automatically switch to a free-tier model (like `gemini-2.5-flash` or `gpt-4o-mini`) to get your job done. 

If the internet breaks halfway, it keeps the old files that were already present. It never corrupts your work.

**Step 6: Use it with your Agents (Optional)**
If you want to let your AI agents read this architecture, you can run:
```bash
tome serve
```
This starts an MCP Server. You can plug this into Claude Desktop and it will be in the big games in the long run.

So, I guess I have cleared out my intentions for this tool. Have fun using it, and let the beauty words of your new architecture docs impress everyone around you!


## P.S : I would surely love to get all the views and improvements you think it will require. It's a tool made out of a requirement so I would work on your ideas and make it much better if you all can  help as well.
