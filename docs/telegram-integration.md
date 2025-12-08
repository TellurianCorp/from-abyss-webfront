# Telegram Integration

This document describes the Telegram integration system for the FromAbyss dashboard.

## Overview

The Telegram integration provides a comprehensive bot system that allows users to interact with the FromAbyss platform through Telegram. The system uses Telegram's REST API directly, providing a lightweight and efficient solution.

## Architecture

### Models

- **TelegramBot**: Stores bot configuration and tokens
- **TelegramChat**: Represents Telegram chats (private, group, channel)
- **TelegramUser**: Stores user information and preferences
- **TelegramMessage**: Stores all messages with metadata
- **TelegramBotCommand**: Defines available commands and their handlers
- **TelegramWebhook**: Manages webhook configuration
- **TelegramBotSession**: Stores user session data
- **TelegramBotBackgroundTask**: Manages background bot tasks with AI integration

### Services

- **TelegramBotService**: Core bot functionality using REST API
- **TelegramMessageHandler**: Processes incoming messages and commands
- **TelegramBotManager**: Manages multiple bots
- **AIService**: Unified service for ChatGPT and Gemini AI integration

## Setup

### 1. Dependencies

The integration uses only the `requests` library for HTTP communication with Telegram's API. No external Telegram-specific packages are required.

### 2. Create Bot

1. Talk to [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot and get the token
3. Use the management command to set up the bot:

```bash
python manage.py setup_telegram_bot "FromAbyss Bot" "YOUR_BOT_TOKEN" "your_bot_username" --webhook-url "https://yourdomain.com/telegram/webhook/1/"
```

### 3. Configure Webhook

The webhook URL should point to your domain with the bot ID:

```
https://yourdomain.com/telegram/webhook/{bot_id}/
```

### 4. Test the Bot

```bash
python manage.py test_telegram_bot "FromAbyss Bot" YOUR_CHAT_ID
```

## API Endpoints

### Webhook Endpoints

- `POST /telegram/webhook/{bot_id}/` - Handle incoming updates
- `GET /telegram/webhook/{bot_id}/info/` - Get webhook information
- `POST /telegram/webhook/{bot_id}/set/` - Set webhook URL
- `POST /telegram/webhook/{bot_id}/delete/` - Delete webhook

### Bot Management

- `GET /telegram/bot/{bot_id}/status/` - Get bot status and statistics
- `POST /telegram/bot/{bot_id}/send/` - Send message via bot

### Channel Statistics

- `GET /telegram/bot/{bot_id}/chat/{chat_id}/stats/` - Get statistics for a specific chat/channel
- `GET /telegram/bot/{bot_id}/chats/stats/` - Get statistics for all chats the bot has access to
- `GET /telegram/channel-stats/` - Channel statistics dashboard (requires staff access)
- `GET /studio/social/telegram-stats/` - Enhanced channel stats in publisher section

### Background Task Management

- `GET /telegram/background-tasks/` - Background task manager
- `POST /telegram/background-tasks/{task_id}/start/` - Start background task
- `POST /telegram/background-tasks/{task_id}/stop/` - Stop background task
- `GET /telegram/background-tasks/{task_id}/status/` - Get task status

### Send Message Interface

- `GET /telegram/send-message/` - Send message page (requires staff access)
- `POST /telegram/send-message/` - Send message API endpoint

## Channel Statistics

The system provides comprehensive channel statistics functionality to monitor and analyze Telegram channels, groups, and chats.

### Features

- **Individual Chat Stats**: Get detailed statistics for specific chats/channels
- **All Chats Overview**: Comprehensive statistics for all chats a bot has access to
- **Member Counts**: Real-time member counts for groups and channels
- **Administrator Information**: List of administrators and their roles
- **Bot Role Analysis**: Check the bot's role in each chat
- **Chat Type Breakdown**: Statistics organized by chat type (private, group, supergroup, channel)

### Available Statistics

For each chat/channel, the system provides:

- **Basic Information**: Title, username, type, creation date
- **Member Count**: Total number of members
- **Administrator Count**: Number of administrators
- **Bot Role**: Bot's role in the chat (creator, administrator, member, left, kicked)
- **Administrator List**: Detailed list of all administrators with their roles

### Access Methods

#### 1. Web Dashboard

**Enhanced Publisher Dashboard** (Recommended):
- URL: `/studio/social/telegram-stats/`
- Modern dark theme UI with gradient cards
- Interactive features: search, export, real-time updates
- Integrated with publisher navigation

**Legacy Dashboard**:
- URL: `/telegram/channel-stats/`
- Basic functionality for backward compatibility

**Features:**
- **Bot Selection**: Choose from available active bots
- **Overall Statistics**: Total chats, members, and breakdown by type
- **Individual Chat Details**: Detailed table with all chat information
- **Real-time Updates**: Refresh statistics on demand
- **Error Handling**: Display any errors that occur during data fetching
- **CSV Export**: Download data for external analysis
- **Search Functionality**: Filter chats by name, username, or type

#### 2. API Endpoints

**Get specific chat stats:**
```bash
curl -X GET "https://yourdomain.com/telegram/bot/1/chat/-1001234567890/stats/"
```

**Get all chats stats:**
```bash
curl -X GET "https://yourdomain.com/telegram/bot/1/chats/stats/"
```

#### 3. Management Commands

**Get stats for all bots:**
```bash
python manage.py get_channel_stats --all-bots
```

**Get stats for specific bot:**
```bash
python manage.py get_channel_stats --bot-id 1
```

**Get stats for bot by name:**
```bash
python manage.py get_channel_stats --bot-name "FromAbyss Bot"
```

**Get stats for specific chat:**
```bash
python manage.py get_channel_stats --bot-id 1 --chat-id -1001234567890
```

**Output formats:**
```bash
# Table format (default)
python manage.py get_channel_stats --bot-id 1 --format table

# JSON format
python manage.py get_channel_stats --bot-id 1 --format json

# Summary format
python manage.py get_channel_stats --bot-id 1 --format summary
```

#### 4. Admin Interface

Access channel stats through the Django admin:

1. Go to `/admin/`
2. Navigate to **Telegram Bot** section
3. Select a bot
4. Choose **"View channel statistics"** from the actions dropdown
5. Click **"Go"**

### API Methods Supported

The channel stats functionality uses these Telegram Bot API methods:

- `getChat` - Get basic chat information
- `getChatMemberCount` - Get member count for groups/channels
- `getChatAdministrators` - Get list of administrators
- `getChatMember` - Get information about a specific member
- `getMe` - Get bot information for role checking

### Error Handling

The system handles various error scenarios:

- **Bot not found**: Returns 404 error
- **Chat not accessible**: Logs error and continues with other chats
- **API rate limits**: Implements proper error handling for rate limit responses
- **Network errors**: Graceful degradation with error reporting

### Performance Considerations

- **Caching**: Consider implementing caching for frequently accessed statistics
- **Rate Limiting**: Respect Telegram's API rate limits
- **Batch Processing**: For large numbers of chats, consider implementing batch processing
- **Background Jobs**: For regular statistics updates, consider using background tasks

## Background Tasks & AI Integration

### Features

- **Background Bot Tasks**: Run bots as persistent background processes
- **AI Chatbot Integration**: Support for both ChatGPT and Gemini AI
- **Automatic Task Management**: Start/stop tasks based on admin configuration
- **Process Management**: Prevent multiple instances with lock files

### AI Services

The system supports multiple AI providers:

- **ChatGPT (OpenAI)**: Primary AI service with GPT-3.5-turbo model
- **Gemini (Google)**: Alternative AI service with gemini-2.5-flash model
- **Fallback Mechanisms**: Graceful handling of quota limits and API errors

### Management Commands

**Start all background tasks:**
```bash
python manage.py start_all_bot_tasks
```

**Stop all background tasks:**
```bash
python manage.py stop_all_bot_tasks
```

**Run persistent bot service:**
```bash
python run_telegram_bot.py
```

**Using shell script:**
```bash
./scripts/start_telegram_bots.sh
```

## Commands

The bot comes with several built-in commands:

- `/start` - Welcome message and bot introduction
- `/help` - Show available commands
- `/info` - Bot information and capabilities
- `/news` - Latest news from FromAbyss
- `/games` - Featured games and reviews
- `/settings` - User preferences and configuration
- `/contact` - Contact information
- `/feedback` - Send feedback to the team

## Adding Custom Commands

1. Create a handler function in `telegram/handlers.py`:

```python
async def custom_command(bot_service: TelegramBotService, message_data: Dict[str, Any], chat, user) -> None:
    """Handle custom command"""
    response = "This is a custom command!"
    await bot_service.send_message(
        chat_id=chat.chat_id,
        text=response
    )
```

2. Add the command to the database via admin interface or management command:

```python
TelegramBotCommand.objects.create(
    bot=bot,
    command='custom',
    description='Custom command description',
    handler_function='telegram.handlers.custom_command',
    is_active=True
)
```

## Message Handling

The system automatically:

1. Saves chat and user information
2. Stores all messages with metadata
3. Processes commands and calls appropriate handlers
4. Maintains user sessions for stateful interactions
5. Handles Markdown formatting with fallback to plain text
6. Ensures UTF-8 encoding for all messages

## Admin Interface

The Django admin provides interfaces for:

- Managing bots and their configurations
- Viewing chats, users, and messages
- Monitoring bot statistics
- Managing webhook settings
- Viewing user sessions
- Managing background tasks
- Configuring AI services

## Security Considerations

- Bot tokens are stored securely in the database
- Webhook endpoints validate bot authenticity
- User data is protected and can be managed through admin interface
- CSRF protection is disabled for webhook endpoints (required by Telegram)
- Background tasks use lock files to prevent multiple instances

## Monitoring and Logging

The system includes comprehensive logging for:

- Webhook requests and responses
- Message processing
- Command execution
- Error handling
- Background task operations
- AI service interactions

Logs are available in Django's standard logging system.

## REST API Implementation

The integration uses Telegram's REST API directly:

### Key Features:
- **Direct HTTP requests** to `https://api.telegram.org/bot{token}/`
- **No external dependencies** beyond the standard `requests` library
- **Full API coverage** for all bot operations
- **Efficient message processing** with JSON parsing
- **Error handling** for API responses
- **UTF-8 encoding** for all outgoing messages
- **Markdown support** with fallback to plain text

### API Methods Supported:
- `getMe` - Get bot information
- `setWebhook` - Configure webhook
- `deleteWebhook` - Remove webhook
- `getWebhookInfo` - Get webhook status
- `sendMessage` - Send text messages
- `sendPhoto` - Send photos
- `sendDocument` - Send documents
- `answerCallbackQuery` - Handle inline keyboards
- `getChat` - Get chat information
- `getChatMemberCount` - Get member count
- `getChatAdministrators` - Get administrators
- `getChatMember` - Get member information

## Future Enhancements

- Integration with existing content (posts, games, movies)
- Automated notifications for new content
- Advanced user analytics
- Multi-language support
- Inline keyboards and rich media
- Channel management for broadcasting
- Real-time analytics dashboard
- Advanced AI conversation memory
- Integration with other social platforms

## Troubleshooting

### Common Issues

1. **Webhook not receiving updates**: Check webhook URL and bot token
2. **Commands not working**: Verify command handlers are properly registered
3. **Messages not being saved**: Check database connectivity and model migrations
4. **Background tasks not starting**: Check lock files and process management
5. **AI responses not working**: Verify API credentials and quota limits
6. **Channel stats not loading**: Check bot permissions and API access

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

## Integration with FromAbyss Content

The bot can be extended to:

- Share new blog posts and articles
- Notify about game reviews and releases
- Broadcast movie and series updates
- Provide access to exclusive content
- Enable community interactions
- Deliver personalized content recommendations
- Facilitate user engagement and feedback

This integration provides a powerful channel for engaging with the FromAbyss audience through Telegram's popular messaging platform, using a lightweight and efficient REST API approach with comprehensive statistics and AI-powered interactions.
