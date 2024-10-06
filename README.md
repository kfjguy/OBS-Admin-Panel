![Logo](app/client/images/logo.svg)

![GitHub Stars](https://img.shields.io/github/stars/kfjguy/OBS-Admin-Panel)
![GitHub Forks](https://img.shields.io/github/forks/kfjguy/OBS-Admin-Panel)
![GitHub License](https://img.shields.io/github/license/kfjguy/OBS-Admin-Panel)
![GitHub Last Commit](https://img.shields.io/github/last-commit/kfjguy/OBS-Admin-Panel)

# OBS Admin Panel

**Warning**: This is in early development, and many things will change significantly. Currently in early alpha.

## Introduction

Welcome to the **OBS Admin Panel**, an open-source tool built for streamers and content creators. Want to give control of your OBS to a friend or team member? Now you can! Host a secure web server with an IP whitelist, so only the people you trust can access your OBS admin panel. Using the built-in OBS WebSocket (default TCP port 4455), authorized users can manage scenes, enhancing your streams even further.

**Current Version:** v0.2.0

## Table of Contents

- [OBS Admin Panel](#obs-admin-panel)
  - [Introduction](#introduction)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Configuration](#configuration)
    - [Installation](#installation)
      - [Linux \& Windows](#linux--windows)
      - [Docker](#docker)
  - [Roadmap](#roadmap)
  - [Contributing ❤️](#contributing-️)
  - [License](#license)
  - [Links](#links)

## Features

- **Secure Access**: Only whitelisted users can access the tool.
- **Real-Time Scene Control**: Add, remove, edit, and switch scenes remotely.
- **Easy to Use**: Simple, intuitive interface for effortless control.
- **OBS WebSocket Integration**: Seamlessly connects to OBS using the WebSocket server with minimal setup.

## Getting Started

### Prerequisites

Ensure you have the following:

- **OBS Studio**: Download the latest version [here](https://obsproject.com/).
- **Node.js or Docker**:
  - **Node.js**: Install [Node.js](https://nodejs.org/en/) (version **14.0.0** or higher).
  - **OR**
  - **Docker**: Install Docker by downloading the [Docker Engine](https://docs.docker.com/engine/install/).

**Setting Up OBS WebSocket:**

1. Open OBS Studio.
2. Navigate to `Tools` > `WebSocket Server Settings`.
   - **Note:** Update OBS if not found.
3. Enable the WebSocket server and set up a secure password.

### Configuration

**Note**: For a Docker container, these configurations are set via the `docker run` command.

All configuration adjustments are made in the `.env` file.

By default, the web server runs on port `4545`. Localhost IP `127.0.0.1` is whitelisted by default. You can add more IPs in a comma-separated format (`IP1,IP2,IP3`). The tool will try to reconnect if the connection is lost, with a default retry delay of 15 seconds. The OBS WebSocket address and password are found in OBS settings after enabling the WebSocket feature.

Here's a sample `.env` file configuration:

```env
PORT=4545 # Default Port 4545
ALLOWED_IPS= # Whitelist IPs separated by comma | Localhost is allowed by default
OBS_WEBSOCKET_CONNECTION_RETRY_DELAY=15000 # Default 15 Seconds
OBS_WEBSOCKET_ADDRESS=ws://localhost:4455 # OBS WebSocket Address (Port: TCP-4455) -> Example: ws://127.0.0.1:4455
OBS_WEBSOCKET_PASSWORD=your_obs_websocket_password # OBS WebSocket Password
```

### Installation

#### Linux & Windows

1. **Clone the Repository**

   ```bash
   git clone https://github.com/kfjguy/OBS-Admin-Panel.git
   ```

2. **Configure `.env`**
   - [See Configuration Section](#configuration)


3. **Navigate to the Server Directory**

   ```bash
   cd OBS-Admin-Panel/app/server
   ```

4. **Install Dependencies**

   ```bash
   npm install
   ```

5. **Start the Server**

   ```bash
   npm start
   ```

#### Docker

1. **Pull the Docker Image**

   ```bash
   docker pull kfjguy/obs-admin-panel
   ```

2. **Run the Container with Configuration**

   *For Bash:*
   ```bash
   docker run -d -p 4545:4545 -p 4455 \
      --name obs-admin-panel \
      -e PORT=4545 \
      -e ALLOWED_IPS="1.1.1.1,2.2.2.2" \
      -e OBS_WEBSOCKET_CONNECTION_RETRY_DELAY=15000 \
      -e OBS_WEBSOCKET_ADDRESS="ws://localhost:4455" \
      -e OBS_WEBSOCKET_PASSWORD="your_password" \
      kfjguy/obs-admin-panel
   ```

   *For PowerShell:*
   ```powershell
   docker run -d -p 4545:4545 -p 4455 `
      --name obs-admin-panel `
      -e PORT=4545 `
      -e ALLOWED_IPS="1.1.1.1,2.2.2.2" `
      -e OBS_WEBSOCKET_CONNECTION_RETRY_DELAY=15000 `
      -e OBS_WEBSOCKET_ADDRESS="ws://localhost:4455" `
      -e OBS_WEBSOCKET_PASSWORD="your_password" `
      kfjguy/obs-admin-panel
   ```

## Roadmap

- **Expanded Scene Editing Features**:
  - Currently, you can move scene elements, but future updates will support adding, removing, enabling/disabling visibility, resizing scene items, and introducing arrow key controls for more precision.

## Contributing ❤️

If you'd like to contribute to the OBS-Admin-Panel development, i'd love your help! Contributions of any kind are welcome and appreciated.

## License

This project is licensed under the MIT License. See the [`LICENSE`](LICENSE) file for details.

## Links

- **Project Repository**: [https://github.com/kfjguy/OBS-Admin-Panel](https://github.com/kfjguy/OBS-Admin-Panel)
- **Issues and Bug Reports**: [https://github.com/kfjguy/OBS-Admin-Panel/issues](https://github.com/kfjguy/OBS-Admin-Panel/issues)
- **Docker Hub Repository**: [https://hub.docker.com/repository/docker/kfjguy/obs-admin-panel/general](https://hub.docker.com/repository/docker/kfjguy/obs-admin-panel/general)

---

A big thank you to everyone using or contributing to this project. Your support makes it better!

*Ready to make your streaming setup easier? Try out the OBS Admin Panel today!*

---

<img src="app/client/images/obs.svg" alt="OBS-Icon" width="128" height="128">
<img src="app/client/images/logo.svg" alt="OBS-Admin-Panel-Icon" width="128" height="128">
