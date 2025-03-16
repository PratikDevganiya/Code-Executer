/**
 * Language Setup Utility
 * 
 * This file provides information about language requirements and installation instructions
 * for the Code Executor application.
 */

const { execSync } = require('child_process');

// Check if a command is available on the system
const isCommandAvailable = (command) => {
  try {
    const checkCmd = process.platform === 'win32' 
      ? `where ${command.split(' ')[0]}` 
      : `which ${command.split(' ')[0]}`;
    
    execSync(checkCmd, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Language configuration with required commands and installation instructions
const languageConfig = {
  javascript: {
    name: "JavaScript",
    command: "node",
    extension: "js",
    installInstructions: {
      linux: "sudo apt-get install -y nodejs npm",
      mac: "brew install node",
      windows: "Download and install Node.js from https://nodejs.org/"
    }
  },
  typescript: {
    name: "TypeScript",
    command: "ts-node",
    extension: "ts",
    installInstructions: {
      linux: "sudo npm install -g typescript ts-node",
      mac: "npm install -g typescript ts-node",
      windows: "npm install -g typescript ts-node"
    }
  },
  python: {
    name: "Python",
    command: "python3",
    fallbackCommand: "python",
    extension: "py",
    installInstructions: {
      linux: "sudo apt-get install -y python3",
      mac: "brew install python3",
      windows: "Download and install Python from https://www.python.org/downloads/"
    }
  },
  java: {
    name: "Java",
    command: "javac",
    extension: "java",
    installInstructions: {
      linux: "sudo apt-get install -y default-jdk",
      mac: "brew install openjdk",
      windows: "Download and install JDK from https://www.oracle.com/java/technologies/downloads/"
    }
  },
  c: {
    name: "C",
    command: "gcc",
    extension: "c",
    installInstructions: {
      linux: "sudo apt-get install -y gcc",
      mac: "brew install gcc",
      windows: "Install MinGW or download and install GCC from https://gcc.gnu.org/"
    }
  },
  "c++": {
    name: "C++",
    command: "g++",
    extension: "cpp",
    installInstructions: {
      linux: "sudo apt-get install -y g++",
      mac: "brew install g++",
      windows: "Install MinGW or download and install G++ from https://gcc.gnu.org/"
    }
  },
  "c#": {
    name: "C#",
    command: "mcs",
    extension: "cs",
    installInstructions: {
      linux: "sudo apt-get install -y mono-complete",
      mac: "brew install mono",
      windows: "Download and install Mono from https://www.mono-project.com/download/stable/"
    }
  },
  php: {
    name: "PHP",
    command: "php",
    extension: "php",
    installInstructions: {
      linux: "sudo apt-get install -y php",
      mac: "brew install php",
      windows: "Download and install PHP from https://windows.php.net/download/"
    }
  },
  go: {
    name: "Go",
    command: "go",
    extension: "go",
    installInstructions: {
      linux: "sudo apt-get install -y golang",
      mac: "brew install go",
      windows: "Download and install Go from https://golang.org/dl/"
    }
  },
  rust: {
    name: "Rust",
    command: "rustc",
    extension: "rs",
    installInstructions: {
      linux: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
      mac: "brew install rust",
      windows: "Download and install Rust from https://www.rust-lang.org/tools/install"
    }
  },
  ruby: {
    name: "Ruby",
    command: "ruby",
    extension: "rb",
    installInstructions: {
      linux: "sudo apt-get install -y ruby-full",
      mac: "brew install ruby",
      windows: "Download and install Ruby from https://rubyinstaller.org/"
    }
  },
  swift: {
    name: "Swift",
    command: "swift",
    extension: "swift",
    installInstructions: {
      linux: "Visit https://swift.org/download/ for installation instructions",
      mac: "Included with Xcode, or brew install swift",
      windows: "Swift is not officially supported on Windows"
    }
  },
  kotlin: {
    name: "Kotlin",
    command: "kotlinc",
    extension: "kt",
    installInstructions: {
      linux: "sudo snap install kotlin --classic",
      mac: "brew install kotlin",
      windows: "Download and install Kotlin from https://kotlinlang.org/docs/command-line.html"
    }
  }
};

// Get installation instructions for a specific language
const getInstallInstructions = (language) => {
  const config = languageConfig[language];
  if (!config) {
    return `Language '${language}' is not supported.`;
  }

  const platform = process.platform === 'win32' 
    ? 'windows' 
    : (process.platform === 'darwin' ? 'mac' : 'linux');

  return {
    name: config.name,
    command: config.command,
    instructions: config.installInstructions[platform]
  };
};

// Check which languages are available on the system
const getAvailableLanguages = () => {
  const available = {};
  
  Object.entries(languageConfig).forEach(([key, config]) => {
    const isAvailable = isCommandAvailable(config.command) || 
      (config.fallbackCommand && isCommandAvailable(config.fallbackCommand));
    
    available[key] = {
      name: config.name,
      available: isAvailable,
      command: config.command
    };
  });
  
  return available;
};

module.exports = {
  languageConfig,
  isCommandAvailable,
  getInstallInstructions,
  getAvailableLanguages
}; 