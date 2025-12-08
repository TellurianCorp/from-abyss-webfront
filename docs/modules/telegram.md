# <i class="fas fa-robot"></i> Telegram Integration for FromAbyss Dashboard

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2+-green.svg)](https://djangoproject.com)
[![Telegram API](https://img.shields.io/badge/Telegram%20API-REST-orange.svg)](https://core.telegram.org/bots/api)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-85%25-brightgreen.svg)](tests/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)]()

## <i class="fas fa-list"></i> Overview

This module provides comprehensive Telegram bot integration for the FromAbyss dashboard, allowing users to interact with the platform through Telegram. The integration uses Telegram's REST API directly, providing a lightweight and efficient solution with AI-powered chatbot capabilities.

## ✨ Features

### <i class="fas fa-robot"></i> Bot Management
- **Multi-Bot Support**: Create and manage multiple Telegram bots
- **Background Tasks**: Run bots as persistent background processes
- **AI Integration**: Support for ChatGPT and Gemini AI services
- **Webhook Support**: Real-time message processing
- **Admin Interface**: Complete management through Django admin

### <i class="fas fa-chart-bar"></i> Channel Statistics
- **Real-time Analytics**: Comprehensive channel and group statistics
- **Member Counts**: Live member counts for all chats
- **Administrator Analysis**: Detailed admin information and roles
- **Bot Role Tracking**: Monitor bot permissions across chats
- **Data Export**: CSV export for external analysis
- **Search & Filter**: Advanced search functionality

### <i class="fas fa-comments"></i> Message Handling
- **Command System**: Customizable command handlers
- **User Sessions**: Stateful user interactions
- **Markdown Support**: Rich text formatting with fallback
- **UTF-8 Encoding**: Full Unicode support
- **Message Storage**: Complete message history with metadata

### <i class="fas fa-bullseye"></i> AI Chatbot Features
- **Dual AI Support**: ChatGPT and Gemini integration
- **Personality Configuration**: Customizable bot personalities
- **Fallback Mechanisms**: Graceful handling of API limits
- **Context Awareness**: Intelligent conversation handling
- **Multi-language Support**: International character support

## <i class="fas fa-rocket"></i> Quick Start

### 1. Create a Bot

1. Talk to [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot and get the token
3. Use the management command:

```bash
python manage.py setup_telegram_bot "FromAbyss Bot" "YOUR_BOT_TOKEN" "your_bot_username"
```

### 2. Set Webhook

```bash
curl -X POST https://yourdomain.com/telegram/webhook/1/set/ \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/telegram/webhook/1/"}'
```

### 3. Test the Bot

```bash
python manage.py test_telegram_bot "FromAbyss Bot" YOUR_CHAT_ID
```

## 📊 Channel Statistics Dashboard

### Access Methods

#### 🌐 Web Dashboard (Recommended)
- **URL**: `/studio/social/telegram-stats/`
- **Features**: Modern UI, real-time updates, CSV export, search functionality

#### 🔧 Command Line
```bash
# Get stats for all bots
python manage.py get_channel_stats --all-bots

# Get stats for specific bot
python manage.py get_channel_stats --bot-id 1 --format table

# Get stats for specific chat
python manage.py get_channel_stats --bot-id 1 --chat-id -1001234567890
```

#### 📡 API Endpoints
```bash
# Get all chats stats
curl -X GET "https://yourdomain.com/telegram/bot/1/chats/stats/"

# Get specific chat stats
curl -X GET "https://yourdomain.com/telegram/bot/1/chat/-1001234567890/stats/"
```

### 📈 Available Statistics

- **Total Chats**: Complete count of all accessible chats
- **Total Members**: Sum of all members across chats
- **Chat Type Breakdown**: Private, Group, Supergroup, Channel counts
- **Administrator Analysis**: Admin counts and roles
- **Bot Role Tracking**: Bot permissions in each chat
- **Member Averages**: Average members per chat type

## 🤖 Background Tasks & AI Integration

### Starting Background Tasks

```bash
# Start all active background tasks
python manage.py start_all_bot_tasks

# Run persistent bot service
python run_telegram_bot.py

# Using shell script
./scripts/start_telegram_bots.sh
```

### AI Configuration

The system supports both ChatGPT and Gemini AI:

1. **Configure AI Credentials** in Django admin
2. **Set Bot Personality** for custom behavior
3. **Choose AI Service** (ChatGPT or Gemini)
4. **Enable Background Tasks** for persistent operation

### AI Features

- **Smart Responses**: Context-aware conversations
- **Personality Customization**: Brand-specific bot behavior
- **Fallback Handling**: Graceful degradation on API limits
- **Multi-language Support**: UTF-8 encoding for all languages

## <i class="fas fa-tools"></i> Admin Interface

### Access Points

1. **Main Admin**: `/admin/` → Telegram Bot section
2. **Send Message**: `/telegram/send-message/`
3. **Channel Stats**: `/studio/social/telegram-stats/`
4. **Background Tasks**: Admin actions for task management

### Admin Features

- **Bot Management**: Create, edit, and configure bots
- **Message Sending**: Send messages to any chat
- **Statistics Viewing**: Access comprehensive analytics
- **Task Control**: Start/stop background tasks
- **AI Configuration**: Set up AI services and personalities

## <i class="fas fa-broadcast-tower"></i> API Endpoints

### Webhook Management
- `POST /telegram/webhook/{bot_id}/` - Handle incoming updates
- `GET /telegram/webhook/{bot_id}/info/` - Get webhook information
- `POST /telegram/webhook/{bot_id}/set/` - Set webhook URL
- `POST /telegram/webhook/{bot_id}/delete/` - Delete webhook

### Bot Management
- `GET /telegram/bot/{bot_id}/status/` - Get bot status and statistics
- `POST /telegram/bot/{bot_id}/send/` - Send message via bot

### Channel Statistics
- `GET /telegram/bot/{bot_id}/chat/{chat_id}/stats/` - Individual chat stats
- `GET /telegram/bot/{bot_id}/chats/stats/` - All chats stats
- `GET /studio/social/telegram-stats/` - Enhanced dashboard

### Background Task Management
- `GET /telegram/background-tasks/` - Task manager
- `POST /telegram/background-tasks/{task_id}/start/` - Start task
- `POST /telegram/background-tasks/{task_id}/stop/` - Stop task
- `GET /telegram/background-tasks/{task_id}/status/` - Task status

## <i class="fas fa-gamepad"></i> Built-in Commands

- `/start` - Welcome message
- `/help` - Show available commands
- `/info` - Bot information
- `/news` - Latest news
- `/games` - Featured games
- `/settings` - User preferences
- `/contact` - Contact information
- `/feedback` - Send feedback

## <i class="fas fa-folder"></i> Models

- **TelegramBot**: Bot configuration and tokens
- **TelegramChat**: Chat information (private, group, channel)
- **TelegramUser**: User profiles and preferences
- **TelegramMessage**: Message storage with metadata
- **TelegramBotCommand**: Command definitions and handlers
- **TelegramWebhook**: Webhook configuration
- **TelegramBotSession**: User session data
- **TelegramBotBackgroundTask**: Background task management

## <i class="fas fa-cogs"></i> Development

### Adding Custom Commands

1. Create handler function in `telegram/handlers.py`:

```python
async def custom_command(bot_service, message_data, chat, user):
    await bot_service.send_message(
        chat_id=chat.chat_id,
        text="Custom response!"
    )
```

2. Register command in database:

```python
TelegramBotCommand.objects.create(
    bot=bot,
    command='custom',
    description='Custom command',
    handler_function='telegram.handlers.custom_command'
)
```

### Environment Setup

The integration uses only the standard `requests` library. No additional Telegram-specific packages are required.

## 🔒 Security

- **Bot tokens** are stored securely in the database
- **Webhook endpoints** validate bot authenticity
- **CSRF protection** disabled for webhooks (required by Telegram)
- **User data** protected through admin interface
- **Background tasks** use lock files to prevent multiple instances
- **API rate limiting** handled gracefully

## 📊 Monitoring & Logging

### Logging Categories

- **Webhook requests** and responses
- **Message processing** and command execution
- **Background task** operations
- **AI service** interactions
- **Error handling** and debugging

### Debug Commands

```bash
# Check bot status
python manage.py test_telegram_bot "Bot Name" CHAT_ID

# View webhook info
curl https://yourdomain.com/telegram/webhook/1/info/

# Check bot statistics
curl https://yourdomain.com/telegram/bot/1/status/

# Get channel stats
python manage.py get_channel_stats --bot-id 1

# Check background tasks
python manage.py start_all_bot_tasks
```

## <i class="fas fa-flask"></i> Testing

### Test Coverage

- **Unit Tests**: Core functionality testing
- **Integration Tests**: API endpoint testing
- **Admin Tests**: Admin interface functionality
- **Background Task Tests**: Task management testing
- **AI Service Tests**: AI integration testing

### Running Tests

```bash
# Run all tests
python manage.py test telegram

# Run specific test
python manage.py test telegram.tests.test_services

# Run with coverage
coverage run --source='.' manage.py test telegram
coverage report
```

## <i class="fas fa-rocket"></i> Deployment

### Production Considerations

- **Webhook URLs**: Use HTTPS in production
- **Database**: Ensure proper indexing for performance
- **Background Tasks**: Use process managers (systemd, supervisor)
- **Logging**: Configure proper log rotation
- **Monitoring**: Set up health checks and alerts

### Environment Variables

```bash
# Required for AI services
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Optional for enhanced features
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret
```

## <i class="fas fa-crystal-ball"></i> Future Enhancements

- **Real-time Analytics Dashboard**: Live statistics updates
- **Advanced AI Memory**: Conversation context preservation
- **Multi-platform Integration**: Connect with other social platforms
- **Advanced User Analytics**: Detailed engagement metrics
- **Automated Content Publishing**: Schedule and auto-publish content
- **Community Management**: Advanced moderation tools

## <i class="fas fa-bug"></i> Troubleshooting

### Common Issues

1. **Import errors**: No external dependencies required
2. **Webhook not working**: Check URL and bot token
3. **Commands not responding**: Verify handler registration
4. **Background tasks not starting**: Check lock files and permissions
5. **AI responses failing**: Verify API credentials and quotas
6. **Channel stats not loading**: Check bot permissions

### Support

- **Documentation**: Check this README and `/docs/telegram-integration.md`
- **Admin Interface**: Use Django admin for configuration
- **Logs**: Check Django logging for detailed error information
- **API Testing**: Use provided debug commands

## <i class="fas fa-file-alt"></i> License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## <i class="fas fa-hands-helping"></i> Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

**Built with ❤️ for the FromAbyss community**

*This integration provides a powerful channel for engaging with the FromAbyss audience through Telegram's popular messaging platform, using a lightweight and efficient REST API approach with comprehensive statistics and AI-powered interactions.*
