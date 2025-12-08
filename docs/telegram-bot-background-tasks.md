# Telegram Bot Background Tasks

This document describes the new Telegram bot background task system that integrates with the Django admin interface and uses Google Gemini AI for intelligent responses.

## Overview

The refactored bot system provides:

- **Django Admin Integration**: Manage bots through the Django admin interface
- **Background Task Management**: Run bots as background tasks using threading
- **Google Gemini AI Integration**: Use AI for intelligent chatbot responses
- **Mention Detection**: Respond when mentioned in group chats
- **Direct Message Support**: Respond to private messages
- **Task Monitoring**: Track task status, messages processed, and errors

## Features

### 1. Background Task Management
- Create and manage multiple bot tasks
- Start/stop tasks through admin interface or command line
- Monitor task status and statistics
- Automatic error handling and recovery

### 2. AI-Powered Responses
- Integration with Google Gemini AI
- Configurable personality and behavior
- Intelligent context-aware responses
- Fallback responses when AI is unavailable

### 3. Smart Message Detection
- Respond to direct messages
- Detect mentions in group chats (@botname)
- Detect bot name mentions
- Configurable response triggers

### 4. Admin Interface
- Complete task management through Django admin
- Real-time status monitoring
- Task configuration and statistics
- Bulk operations (start/stop multiple tasks)

## Quick Start

### 1. Create a Telegram Bot

1. Talk to [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot and get the token
3. Add the bot to Django admin: `/admin/telegram/telegrambot/add/`

### 2. Configure Gemini AI Credentials

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add credentials in Django admin: `/admin/credentials/geminicredential/add/`
3. Set the credential as active

### 3. Create a Background Task

1. Go to Django admin: `/admin/telegram/telegrambotbackgroundtask/add/`
2. Select your bot
3. Configure task settings:
   - **Name**: Descriptive name for the task
   - **Use Gemini AI**: Enable AI-powered responses
   - **Respond to mentions**: Enable group mention detection
   - **Respond to direct**: Enable private message responses
   - **Max response length**: Limit response size (default: 4096)

### 4. Start the Task

#### Method 1: Django Admin
1. Go to `/admin/telegram/telegrambotbackgroundtask/`
2. Select your task
3. Choose "Start selected background tasks" from actions

#### Method 2: Command Line
```bash
python tools/bot.py start <task_id>
```

#### Method 3: Management Command
```bash
python manage.py start_bot_background_task <task_id>
```

## Command Line Interface

The `tools/bot.py` script provides a command-line interface for managing tasks:

```bash
# List all tasks
python tools/bot.py list

# Start a task
python tools/bot.py start <task_id>

# Stop a task
python tools/bot.py stop <task_id>

# Get task status
python tools/bot.py status <task_id>

# Check Gemini credentials
python tools/bot.py check-credentials
```

## Management Commands

Django management commands for task management:

```bash
# List all tasks
python manage.py start_bot_background_task --list

# Start a task
python manage.py start_bot_background_task <task_id>

# Stop a task
python manage.py stop_bot_background_task <task_id>

# Stop all tasks
python manage.py stop_bot_background_task --all
```

## Admin Interface

### Background Task Manager

Access the task manager at: `/telegram/background-tasks/`

Features:
- **Statistics Dashboard**: Overview of all tasks
- **Task List**: Detailed view of all tasks with status
- **Quick Actions**: Start/stop tasks with one click
- **Real-time Updates**: Auto-refresh for running tasks
- **Task Details**: View configuration and statistics

### Task Configuration

Each task can be configured with:

- **Bot Selection**: Choose which bot to use
- **AI Settings**: Enable/disable Gemini AI
- **Response Triggers**: Configure when to respond
- **Message Limits**: Set maximum response length
- **Personality**: Customize bot behavior (in bot settings)

## Bot Personality Configuration

Configure bot personality in the TelegramBot model:

1. Go to `/admin/telegram/telegrambot/`
2. Edit your bot
3. Set the "Personality" field with instructions like:

```
You are a helpful AI assistant for the FromAbyss community. 
You should be friendly, knowledgeable about gaming and entertainment, 
and always respond in a helpful and engaging way. 
Keep responses concise but informative.
```

## Monitoring and Troubleshooting

### Task Status

Tasks can have the following statuses:
- **Pending**: Task created but not started
- **Running**: Task is actively running
- **Completed**: Task finished successfully
- **Failed**: Task encountered an error
- **Stopped**: Task was manually stopped

### Error Handling

- Tasks automatically retry on temporary errors
- Failed tasks can be restarted from admin interface
- Error messages are stored and displayed in admin
- Logs are available in Django logs

### Performance Monitoring

- **Messages Processed**: Track how many messages each task has handled
- **Last Run**: When the task last processed messages
- **Response Time**: Monitor AI response generation time
- **Error Rate**: Track failed responses

## Security Considerations

1. **Bot Tokens**: Stored securely in database
2. **API Keys**: Gemini credentials encrypted in database
3. **Access Control**: Admin interface requires staff permissions
4. **Rate Limiting**: Built-in delays to respect API limits
5. **Error Logging**: Sensitive data not logged

## Integration with Existing System

The new system integrates with existing components:

- **TelegramBot Model**: Uses existing bot configuration
- **TelegramChat/User Models**: Stores chat and user data
- **TelegramMessage Model**: Logs all messages
- **GeminiCredential Model**: Uses existing AI credentials
- **Admin Interface**: Extends existing admin functionality

## Migration from Old System

If you have existing bot configurations:

1. **Bot Tokens**: Existing bots are automatically available
2. **Webhooks**: Can be used alongside background tasks
3. **Commands**: Existing command handlers still work
4. **Messages**: All existing message history preserved

## Best Practices

1. **Task Naming**: Use descriptive names for easy identification
2. **Personality**: Write clear, specific personality instructions
3. **Monitoring**: Regularly check task status and error logs
4. **Testing**: Test bot responses in private chats first
5. **Backup**: Keep backup of bot configurations and credentials

## Troubleshooting

### Common Issues

1. **Task won't start**: Check if bot token is valid
2. **No AI responses**: Verify Gemini credentials are active
3. **High error rate**: Check network connectivity and API limits
4. **Memory usage**: Monitor for memory leaks in long-running tasks

### Debug Commands

```bash
# Check task status
python tools/bot.py status <task_id>

# Verify credentials
python tools/bot.py check-credentials

# View Django logs
tail -f logs/django.log
```

## API Reference

### Models

- `TelegramBotBackgroundTask`: Main task model
- `TelegramBot`: Bot configuration and personality
- `GeminiCredential`: AI credentials

### Services

- `TelegramBotBackgroundService`: Core task service
- `GeminiAIService`: AI response generation
- `bot_manager`: Global bot management

### Views

- `background_task_manager`: Admin task manager
- `start_background_task`: Start task endpoint
- `stop_background_task`: Stop task endpoint
- `get_task_status`: Status endpoint

## Future Enhancements

Planned features:
- **Scheduled Tasks**: Run tasks at specific times
- **Advanced AI Models**: Support for multiple AI providers
- **Message Analytics**: Detailed response analytics
- **Multi-language Support**: Internationalization
- **Plugin System**: Extensible command handlers
