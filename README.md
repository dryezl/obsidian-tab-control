# Obsidian Tab Control Plugin

A simple plugin for Obsidian that helps you organize your tabs by providing commands to sort tabs by name and remove duplicate tabs.

## Features

- **Sort tabs by name**: Alphabetically sorts all tabs in your current workspace
- **Remove duplicate tabs**: Closes duplicate tabs and keeps only one instance of each file
- **Organize tabs**: Combines both operations - removes duplicates and then sorts alphabetically
- **Ribbon icon**: Quick access to organize tabs with a single click

## Commands

This plugin adds the following commands to Obsidian:

1. **Sort tabs by name** - Sorts all tabs alphabetically (case-insensitive)
2. **Remove duplicate tabs (keep one)** - Closes duplicate tabs, keeping only the first occurrence
3. **Organize tabs (sort and remove duplicates)** - Performs both operations in sequence

## Usage

### Via Command Palette
1. Open the Command Palette (`Ctrl/Cmd + P`)
2. Type "Tab Control" to see available commands
3. Select the desired command

### Via Ribbon Icon
Click the "layers" icon in the left ribbon to organize all tabs (remove duplicates and sort)

### Via Hotkeys
You can assign custom hotkeys to any of the commands in Settings > Hotkeys

## How it works

- **Duplicate detection**: Files are considered duplicates if they have the same file path. For non-file tabs (like graph view), the display name is used.
- **Sorting**: Tabs are sorted alphabetically by their display name in a case-insensitive manner.
- **Scope**: The plugin works on all tabs in your current Obsidian workspace.

## Installation

### Manual Installation
1. Download the latest release
2. Extract the files to your vault's `.obsidian/plugins/tab-control/` folder
3. Enable the plugin in Settings > Community Plugins

### From Community Plugins
Search for "Tab Control" in the Community Plugins section of Obsidian settings.

## Development

This plugin is built using TypeScript and the Obsidian API.

### Building
```bash
npm run build
```

### Development
```bash
npm run dev
```

### Installing dependencies
```bash
npm i
```

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have feature requests, please create an issue on the GitHub repository.
