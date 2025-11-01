# Contributing to Web Indexer

First off, thank you for considering contributing to Web Indexer! 🎉 It's people like you that make Web Indexer such a great tool for the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Suggesting New Sites](#suggesting-new-sites)
  - [Reporting Issues](#reporting-issues)
  - [Contributing Code](#contributing-code)
  - [Improving Documentation](#improving-documentation)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Automated Workflow](#automated-workflow)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inspiring community for all. By participating, you are expected to uphold these standards:

- **Be Respectful**: Treat everyone with respect. Harassment and abuse are never tolerated.
- **Be Constructive**: Provide constructive feedback and be open to receiving it.
- **Be Collaborative**: Work together towards the common goal of improving the project.
- **Be Patient**: Remember that people come from different backgrounds and skill levels.

## 🤝 How Can I Contribute?

### Suggesting New Sites

The easiest way to contribute is by suggesting new websites to add to the index!

#### Via Web Interface (Recommended)

1. Visit [indexer.is-an.app](https://indexer.is-an.app)
2. Click the **"Suggest Site"** button in the quick actions bar
3. Fill out the form with the following information:
   - Site Name
   - Site URL
   - Category (Manga, Light Novel, Movie, App, Anime, Learning, or NSFW)
   - Icon URL (optional - we'll generate one if not provided)
   - Description
   - Content warnings (ads, popups, registration required)
4. Click "Submit via GitHub" - you'll be redirected to create a GitHub issue

#### Via GitHub Issue

1. Go to the [Issues page](https://github.com/OshekharO/Web-Indexer/issues)
2. Click **"New Issue"**
3. Select **"Site Suggestion"** template
4. Fill in all required information
5. Submit the issue

#### What Happens Next?

1. A maintainer will review your suggestion
2. If approved, the maintainer adds the `approved` label
3. Our GitHub Actions workflow automatically creates a Pull Request
4. The PR is reviewed and merged
5. Your suggested site goes live! 🎉

### Reporting Issues

Found a problem? Let us know!

#### Types of Issues to Report

- 🔴 **Broken/Offline Sites**: A listed site is no longer accessible
- ⚠️ **Wrong Information**: Site details are incorrect
- 🛡️ **Security Concerns**: Malware, phishing, or security issues
- 📝 **Duplicate Sites**: A site is listed multiple times
- 🐛 **Bug Reports**: Something on the indexer isn't working
- 💡 **Feature Requests**: Ideas for new features

#### How to Report

1. Visit the [Issues page](https://github.com/OshekharO/Web-Indexer/issues)
2. Click **"New Issue"**
3. Select the appropriate template
4. Provide as much detail as possible
5. Submit the issue

### Contributing Code

Want to contribute code? Awesome! Here's how:

#### Good First Issues

Look for issues labeled `good first issue` - these are great entry points for new contributors.

#### Types of Code Contributions

- 🐛 Bug fixes
- ✨ New features
- 🎨 UI/UX improvements
- ♿ Accessibility enhancements
- ⚡ Performance optimizations
- 📱 Mobile responsiveness improvements
- 🌐 Internationalization/Localization

#### Before You Start

1. **Check existing issues**: Make sure someone isn't already working on it
2. **Open an issue**: Discuss your idea before spending time coding
3. **Get feedback**: Wait for maintainer approval before starting work

### Improving Documentation

Documentation improvements are always welcome!

- Fix typos or grammatical errors
- Improve clarity of existing documentation
- Add examples or tutorials
- Translate documentation to other languages
- Create video tutorials or guides

## 💻 Development Setup

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Git installed on your machine
- A text editor or IDE (VS Code, Sublime Text, etc.)
- Basic knowledge of HTML, CSS, and JavaScript

### Setup Instructions

1. **Fork the repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Web-Indexer.git
   cd Web-Indexer
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/OshekharO/Web-Indexer.git
   ```

4. **Open in browser**
   
   Simply open `index.html` in your browser, or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```

5. **Make your changes**
   
   Edit the files and test your changes in the browser.

### Project File Structure

```
Web-Indexer/
├── index.html              # Main HTML file with all UI elements
├── script.js               # Main JavaScript file with all functionality
├── style.css               # Custom styles and theme definitions
├── providers.json          # Database of all indexed sites
├── manifest.json           # PWA manifest for installability
├── img/                    # Images, icons, and logos
├── .github/
│   ├── workflows/
│   │   └── process-suggestions.yml  # GitHub Actions workflow
│   ├── scripts/
│   │   ├── add-site.js             # Script to add sites to providers.json
│   │   └── extract-issue-data.js   # Script to extract data from issues
│   └── ISSUE_TEMPLATE/
│       ├── site-suggestion.yml     # Template for suggesting sites
│       └── site-issue.yml          # Template for reporting issues
├── README.md               # Project overview and documentation
├── CONTRIBUTING.md         # This file
└── LICENSE                 # Unlicense (public domain)
```

### Understanding the Code

#### providers.json Structure

The `providers.json` file contains all indexed sites as a JSON object. Each site entry follows this format:

```json
{
  "ProviderKeyName": {
    "name": "Site Display Name",
    "url": "https://example.com",
    "status": 1,
    "icon": "https://example.com/icon.png"
  },
  "AnotherProviderKey": {
    "name": "Another Site",
    "url": "https://another-example.com",
    "status": 2,
    "icon": "https://another-example.com/icon.png"
  }
}
```

**Status Codes:**
- `1` - Manga
- `2` - Light Novel
- `3` - Movie
- `4` - App
- `5` - Anime
- `6` - Learning
- `7` - NSFW

#### Key JavaScript Functions

- `loadSites()` - Fetches and processes sites from providers.json
- `filterSites()` - Filters sites based on selected category
- `searchSites()` - Searches sites based on user input
- `renderSites()` - Renders site cards to the DOM
- `checkSiteHealth()` - Checks if a site is online/offline
- `toggleBookmark()` - Adds/removes sites from bookmarks

## 🔄 Pull Request Process

### Creating a Pull Request

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   
   Write clean, readable code following our style guidelines.

3. **Test your changes**
   
   - Open the site in multiple browsers
   - Test all functionality you modified
   - Ensure no console errors
   - Test on mobile devices if relevant

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```
   
   Use clear, descriptive commit messages:
   - `feat: Add dark mode toggle`
   - `fix: Correct search functionality`
   - `docs: Update installation instructions`
   - `style: Improve card hover effects`

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Fill in the PR template with details about your changes
   - Link any related issues

### PR Guidelines

- **One feature per PR**: Keep PRs focused on a single feature or fix
- **Clear description**: Explain what you changed and why
- **Screenshots**: Include screenshots for UI changes
- **Tests**: Ensure everything works as expected
- **Documentation**: Update docs if you changed functionality
- **No breaking changes**: Avoid changes that break existing functionality

### PR Review Process

1. A maintainer will review your PR
2. They may request changes or ask questions
3. Make requested changes and push to the same branch
4. Once approved, your PR will be merged
5. Your contribution will be live! 🎉

## 🎨 Style Guidelines

### HTML

- Use semantic HTML5 elements
- Keep proper indentation (2 spaces)
- Use descriptive class names
- Follow Bootstrap conventions where applicable

### CSS

- Use existing Bootstrap classes when possible
- Add custom classes to `style.css` for unique styling
- Follow mobile-first responsive design
- Keep specificity low
- Use CSS custom properties for theme colors

### JavaScript

- Use ES6+ features (const/let, arrow functions, etc.)
- Write clear, self-documenting code
- Add comments for complex logic
- Use meaningful variable names
- Follow existing code patterns
- Avoid global variables when possible

### Naming Conventions

- **Variables**: camelCase (`userName`, `siteList`)
- **Functions**: camelCase (`loadSites()`, `filterByCategory()`)
- **CSS Classes**: kebab-case (`site-card`, `filter-button`)
- **Files**: kebab-case (`add-site.js`, `site-suggestion.yml`)

## 🤖 Automated Workflow

Understanding our automation helps you contribute better!

### How It Works

1. **Issue Creation**: User creates a site suggestion issue
2. **Review**: Maintainer reviews and adds `approved` label
3. **Trigger**: GitHub Actions workflow is triggered by the `approved` label
4. **Extraction**: Script extracts data from the issue
5. **Modification**: Script adds the site to `providers.json`
6. **PR Creation**: Automated PR is created with the changes
7. **Review & Merge**: Maintainer reviews and merges the automated PR

### Relevant Files

- `.github/workflows/process-suggestions.yml` - Main workflow
- `.github/scripts/extract-issue-data.js` - Extracts issue data
- `.github/scripts/add-site.js` - Adds site to providers.json

### Manual Override

If the automated workflow fails, maintainers can manually:
1. Clone the repository
2. Edit `providers.json`
3. Add the site entry
4. Create a PR manually

## 👥 Community

### Getting Help

- 📝 **GitHub Issues**: For bugs and feature requests
- 💬 **Telegram**: [@OshekherO](https://t.me/OshekherO) for general support
- 📖 **Documentation**: Check the README first

### Recognition

All contributors will be recognized! Your GitHub profile will appear in:
- Pull request history
- Commit history
- Contributors list (automatically maintained by GitHub)

### Maintainers

- **[@OshekharO](https://github.com/OshekharO)** - Project Creator & Lead Maintainer

## 📝 Additional Notes

### Content Guidelines

When suggesting sites, please ensure:

- ✅ The site is functional and accessible
- ✅ The site provides legitimate content
- ✅ The URL is correct and complete
- ✅ Content warnings are accurate
- ✅ NSFW content is properly labeled
- ❌ No malware, phishing, or harmful sites
- ❌ No illegal content

### Legal Considerations

- We do not host any content; we only provide links
- All links are user-submitted and community-curated
- We respect DMCA and intellectual property rights
- Report copyright concerns via the DMCA policy available in the footer of the [live site](https://indexer.is-an.app) or contact sakshamshekher@outlook.com

### Questions?

If you have any questions not covered in this guide, feel free to:
- Open a GitHub issue with your question
- Contact the maintainer on Telegram
- Check existing issues for similar questions

---

## 🎉 Thank You!

Your contributions make Web Indexer better for everyone. Whether you're fixing a typo, suggesting a site, or implementing a major feature, every contribution matters!

Happy Contributing! 🚀

---

<p align="center">
  Made with ❤️ by the Web Indexer Community
</p>
