# 🤖 AI Features Quick Start

Get AI-powered code review running in 5 minutes!

## ⚡ 3-Step Setup

### 1. Get API Key (2 minutes)
1. Visit https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### 2. Configure (1 minute)
Open `config.env` and add:
```env
OPENAI_API_KEY=sk-paste-your-key-here
```

### 3. Start Server (2 minutes)
```bash
npm install
npm start
```

✅ **Done!** Look for "🤖 AI Powered" badge in the navbar.

## 🎯 What You Get

| Feature | Description | When to Use |
|---------|-------------|-------------|
| **🤖 AI Review** | Intelligent code analysis | After writing code |
| **💡 Smart Hints** | Context-aware guidance | When stuck |
| **🐛 Debug Help** | Error explanations | When code fails |
| **✅ AI Validation** | Smart feedback on submit | Every submission |

## 💸 Cost

- **~$0.0005 per request** (half a cent)
- **100 students × 12 levels = ~$6-10 total**
- Uses GPT-4o-mini (cheapest model)

Set spending limits at: https://platform.openai.com/account/limits

## 🧪 Test It

1. **Open** http://localhost:3000
2. **Select** Level 1
3. **Write** some code
4. **Click** "🤖 AI Review"
5. **See** intelligent feedback!

## 🔧 Without AI

Platform works perfectly without AI:
- Don't set `OPENAI_API_KEY`
- Get basic hints instead
- All other features work normally

## 🆘 Troubleshooting

**"API key not found"**
- Check `config.env` exists
- Verify no spaces around `=`
- Restart server after changes

**"401 Unauthorized"**
- Invalid API key
- Generate new key at OpenAI

**"429 Rate limit"**
- Too many requests
- Wait 1 minute
- Check usage limits

## 📚 Full Documentation

See [OPENAI_SETUP.md](OPENAI_SETUP.md) for:
- Detailed configuration
- Cost management tips
- Security best practices
- Customization options

---

**Questions?** Check the full docs or open an issue!
