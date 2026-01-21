# Slash Commands Usage Guide

This guide explains how to use each slash command in the editor. Type `/` to open the command menu, then type the command name or use arrow keys to navigate.

---

## 📋 **Structure Commands**

### `/h1`, `/h2`, `/h3` - Headings
**Usage:**
- **No text selection needed** - Works at any cursor position
- Type `/h1`, `/h2`, or `/h3` and press Enter
- Converts the current line/paragraph into a heading
- If text is already on the line, it becomes a heading
- If the line is empty, you can start typing and it will be a heading

**Example:**
1. Type `/h1` → Press Enter
2. Type "My Title" → It appears as a large heading

**With existing text:**
1. Type "My Title" on a line
2. Move cursor to that line
3. Type `/h1` → Press Enter
4. "My Title" becomes a heading

---

### `/p` - Paragraph
**Usage:**
- **No text selection needed**
- Type `/p` and press Enter
- Converts the current heading/block into a normal paragraph

**Example:**
1. Have a heading selected
2. Type `/p` → Press Enter
3. Heading becomes normal text

---

### `/collapsible` - Collapsible Section
**Usage:**
- **No text selection needed**
- Type `/collapsible` and press Enter
- You'll be prompted for:
  - **Summary/Title** (e.g., "Click to expand")
- Inserts a heading with a ▼ symbol and a paragraph below it
- You can edit the content paragraph directly

**Example:**
1. Type `/collapsible` → Press Enter
2. Enter "API Details" as the summary
3. Edit "Content goes here..." to add your content

---

## 📝 **List Commands**

### `/bulletlist` - Bullet List
**Usage:**
- **No text selection needed** - Works at cursor position
- Type `/bulletlist` and press Enter
- Creates a bullet list and you can start typing
- Press Enter to create a new bullet item
- Press Enter twice or Shift+Enter to exit the list

**Example:**
1. Type `/bulletlist` → Press Enter
2. Type "First item"
3. Press Enter → Type "Second item"
4. Press Enter twice to exit

**With existing text:**
- Can also toggle bullet list formatting on selected text

---

### `/numberedlist` - Numbered List
**Usage:**
- **No text selection needed** - Works at cursor position
- Type `/numberedlist` and press Enter
- Creates a numbered list (1, 2, 3...)
- Press Enter to create a new numbered item
- Press Enter twice or Shift+Enter to exit the list

**Example:**
1. Type `/numberedlist` → Press Enter
2. Type "Step one"
3. Press Enter → Type "Step two"
4. Press Enter twice to exit

---

### `/tasklist` - Task List (Checkboxes)
**Usage:**
- **No text selection needed** - Works at cursor position
- Type `/tasklist` and press Enter
- Creates a task list with checkboxes
- Click the checkbox to mark items as complete
- Press Enter to create a new task item
- Press Enter twice or Shift+Enter to exit the list

**Example:**
1. Type `/tasklist` → Press Enter
2. Type "Buy groceries"
3. Press Enter → Type "Call dentist"
4. Click checkboxes to mark items as done

---

## 💻 **Code Commands**

### `/codeblock` - Code Block
**Usage:**
- **No text selection needed**
- Type `/codeblock` and press Enter
- Inserts a multi-line code block
- Start typing code inside the block
- Press Enter to create a new line within the code block
- Click outside or press Escape to exit code block mode

**Example:**
1. Type `/codeblock` → Press Enter
2. Type:
   ```javascript
   function hello() {
     console.log("Hello");
   }
   ```
3. Click outside to exit

**With selected text:**
- If you have text selected, it will be wrapped in a code block

---

### `/code` - Inline Code
**Usage:**
- **Two ways to use:**
  
  **A. Without selection (create inline code):**
  1. Type `/code` → Press Enter
  2. Start typing - text appears in monospace
  3. Press space or type normally to exit inline code

  **B. With text selected (wrap in inline code):**
  1. Highlight existing text (e.g., "myVariable")
  2. Type `/code` → Press Enter
  3. Selected text becomes inline code

**Example (without selection):**
1. Type "Use the `/code` command"
2. Place cursor before `/code`
3. Type `/code` → Press Enter
4. `/code` appears as inline code

**Example (with selection):**
1. Type "Check the myVariable function"
2. Select "myVariable"
3. Type `/code` → Press Enter
4. "myVariable" becomes inline code

---

### `/code-lang` - Code Block with Language
**Usage:**
- **No text selection needed**
- Type `/code-lang` and press Enter
- You'll be prompted for language (e.g., "javascript", "python", "typescript")
- Inserts a code block where you can type code
- Note: Language attribute is for reference only (not syntax highlighted)

**Example:**
1. Type `/code-lang` → Press Enter
2. Enter "javascript" as the language
3. Code block is inserted - type your JavaScript code

---

### `/diff` - Code Diff Block
**Usage:**
- **No text selection needed**
- Type `/diff` and press Enter
- Inserts a code block with example diff markers:
  - `+ Added line` (green, for added code)
  - `  Unchanged line` (normal, for unchanged code)
  - `- Removed line` (red, for removed code)
- Edit the content to show your actual diff

**Example:**
1. Type `/diff` → Press Enter
2. A template appears:
   ```
   + Added line
     Unchanged line
   - Removed line
   ```
3. Edit to show your actual code changes

---

### `/snippet` - Code Snippet
**Usage:**
- **No text selection needed**
- Type `/snippet` and press Enter
- You'll be prompted for code snippet text
- Enter your code (e.g., `console.log("Hello World");`)
- Inserts the code in a code block

**Example:**
1. Type `/snippet` → Press Enter
2. Enter `console.log("Hello");`
3. Code block with your snippet is inserted

---

### `/file` - File Reference
**Usage:**
- **No text selection needed**
- Type `/file` and press Enter
- You'll be prompted for:
  - **File path** (e.g., `/src/components/Button.tsx`)
  - **Display text** (optional, defaults to file path)
- Inserts the file path as inline code

**Example:**
1. Type `/file` → Press Enter
2. Enter file path: `/src/utils/helpers.js`
3. Enter display text: `helpers.js` (or leave empty to use full path)
4. `helpers.js` appears as inline code

---

## 🎨 **Formatting Commands**

### `/left`, `/center`, `/right` - Text Alignment
**Usage:**
- **Works on the current paragraph/heading**
- Type `/left`, `/center`, or `/right` and press Enter
- Aligns the entire paragraph/heading where your cursor is
- No need to select text - works on the current block

**Example:**
1. Type a paragraph of text
2. Place cursor anywhere in that paragraph
3. Type `/center` → Press Enter
4. The entire paragraph is centered

---

### `/strike` - Strikethrough
**Usage:**
- **With text selected:**
  1. Highlight the text you want to strike through
  2. Type `/strike` → Press Enter
  3. Selected text gets strikethrough formatting

- **Without selection (toggle mode):**
  1. Place cursor where you want strikethrough
  2. Type `/strike` → Press Enter
  3. Start typing - text appears with strikethrough
  4. Type `/strike` again to turn it off

**Example (with selection):**
1. Type "This is outdated text"
2. Select "outdated"
3. Type `/strike` → Press Enter
4. "outdated" appears with strikethrough

---

### `/clear` - Clear Formatting
**Usage:**
- **With text selected:**
  1. Highlight text that has formatting (bold, italic, links, etc.)
  2. Type `/clear` → Press Enter
  3. All formatting is removed, text becomes plain

**Example:**
1. Type "**Bold text** with a [link](url)"
2. Select all the text
3. Type `/clear` → Press Enter
4. Text becomes plain: "Bold text with a link"

---

### `/break` - Line Break
**Usage:**
- **No text selection needed**
- Type `/break` and press Enter
- Inserts a line break (soft break) without creating a new paragraph
- Useful for addresses, poetry, or formatted text

**Example:**
1. Type "Line 1"
2. Type `/break` → Press Enter
3. Type "Line 2"
4. Both lines are in the same paragraph, but on separate lines

---

## 📦 **Content Commands**

### `/table` - Insert Table
**Usage:**
- **No text selection needed**
- Type `/table` and press Enter
- Inserts a 3x3 table with a header row
- Click in cells to edit content
- Use Tab to move between cells
- Use Backspace in empty cell to delete row

**Example:**
1. Type `/table` → Press Enter
2. A 3x3 table appears:
   ```
   | Header | Header | Header |
   |--------|--------|--------|
   | Cell   | Cell   | Cell   |
   | Cell   | Cell   | Cell   |
   ```
3. Click cells to edit

---

### `/image` - Insert Image
**Usage:**
- **No text selection needed**
- Type `/image` and press Enter
- You'll be prompted for image URL
- Enter a full URL (e.g., `https://example.com/image.png`)
- Image is inserted at cursor position
- Cursor moves after the image (you can continue typing)

**Example:**
1. Type `/image` → Press Enter
2. Enter URL: `https://example.com/photo.jpg`
3. Image appears in the document
4. Continue typing after the image

---

### `/callout` - Callout/Alert Box
**Usage:**
- **No text selection needed**
- Type `/callout` and press Enter
- You'll be prompted for:
  - **Callout type**: `note`, `warning`, or `tip`
  - **Callout text**: The content of the callout
- Inserts a styled blockquote with your message

**Example:**
1. Type `/callout` → Press Enter
2. Enter type: `warning`
3. Enter text: `This feature is experimental`
4. A yellow warning box appears with your message

**Note:** The callout appears as a blockquote with special styling. You can edit the text directly.

---

### `/date` - Insert Timestamp
**Usage:**
- **No text selection needed**
- Type `/date` and press Enter
- Inserts current date and time automatically
- Format: `MM/DD/YYYY, HH:MM:SS AM/PM` (based on your system locale)

**Example:**
1. Type `/date` → Press Enter
2. Current timestamp is inserted: `12/25/2024, 3:45:30 PM`
3. You can edit the timestamp if needed

---

### `/quote` - Blockquote
**Usage:**
- **Two ways to use:**
  
  **A. Without selection (create blockquote):**
  1. Type `/quote` → Press Enter
  2. Start typing - text appears in a blockquote

  **B. With text selected (wrap in blockquote):**
  1. Highlight existing text
  2. Type `/quote` → Press Enter
  3. Selected text becomes a blockquote

**Example (without selection):**
1. Type `/quote` → Press Enter
2. Type "This is a quoted statement"
3. Text appears in a blockquote

**Example (with selection):**
1. Type "This is important information"
2. Select the text
3. Type `/quote` → Press Enter
4. Text becomes a blockquote

---

### `/reference` - Reference/Citation Link
**Usage:**
- **No text selection needed**
- Type `/reference` and press Enter
- You'll be prompted for:
  - **Reference title** (e.g., "Documentation", "API Docs")
  - **URL** (e.g., `https://example.com/docs`)
- Inserts a clickable link in the format: `[Reference title]`
- Link opens in a new tab when clicked
- If URL doesn't start with `http://` or `https://`, `https://` is automatically added

**Example:**
1. Type `/reference` → Press Enter
2. Enter title: `React Documentation`
3. Enter URL: `react.dev`
4. Link appears: `[React Documentation]` (blue, underlined)
5. Click to open the link

---

## 🔧 **Utility Commands**

### `/divider` - Horizontal Rule
**Usage:**
- **No text selection needed**
- Type `/divider` and press Enter
- Inserts a horizontal line (divider) across the page
- Useful for separating sections

**Example:**
1. Type some text
2. Press Enter for a new line
3. Type `/divider` → Press Enter
4. A horizontal line appears
5. Continue typing below the line

---

## 🎯 **Quick Tips**

1. **Typing to filter:** After typing `/`, start typing the command name (e.g., `/tab` to find `/table`)

2. **Keyboard navigation:**
   - Use ↑/↓ arrow keys to navigate commands
   - Press Enter to select
   - Press Escape to close menu (keeps the `/` character)

3. **Command variations:** Many commands have multiple keywords:
   - `/h1` also matches "heading", "title"
   - `/codeblock` also matches "code", "snippet", "pre"

4. **Toggle commands:** Some commands (like `/code`, `/quote`) can toggle formatting:
   - Without selection: Toggle on, then type
   - With selection: Apply to selection
   - Use the command again to toggle off

5. **Spaces after insertion:** Most commands automatically insert a space after the content so you can continue typing smoothly.

---

## 📊 **Command Categories**

- **Structure** (`/h1`, `/h2`, `/h3`, `/p`, `/collapsible`) - Document structure
- **Lists** (`/bulletlist`, `/numberedlist`, `/tasklist`) - Various list types
- **Code** (`/codeblock`, `/code`, `/code-lang`, `/diff`, `/snippet`, `/file`) - Code-related
- **Formatting** (`/left`, `/center`, `/right`, `/strike`, `/clear`, `/break`) - Text formatting
- **Content** (`/table`, `/image`, `/callout`, `/date`, `/quote`, `/reference`) - Rich content
- **Utility** (`/divider`) - Utility elements

---

**Note:** All commands work at the current cursor position. Some commands (like formatting) work better with selected text, while others (like `/table`, `/image`) insert new content regardless of selection.