# CSS Module Migration Guide

This guide explains how to migrate from the monolithic `App.css` to component-scoped CSS modules for better maintainability and performance.

## 📁 New Module Structure

CSS has been split into modular files:

```
src/styles/
├── theme.module.css         # Theme variables and global resets
├── Card.module.css          # Card component styles
├── Button.module.css        # Button component styles
├── Layout.module.css        # Layout utilities (grid, flex, container)
└── Typography.module.css    # Typography styles (headings, text, links)
```

## 🚀 How to Use CSS Modules

### 1. Import the Module

```tsx
import styles from '../styles/Card.module.css'
```

### 2. Apply Classes

```tsx
<div className={styles.card}>
  <div className={styles.cardHeader}>
    <h2 className={styles.cardTitle}>Title</h2>
  </div>
  <div className={styles.cardBody}>
    Content goes here
  </div>
</div>
```

### 3. Combine Multiple Classes

```tsx
import styles from '../styles/Button.module.css'

<button className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonLarge}`}>
  Click Me
</button>
```

Or use a helper function:

```tsx
const classNames = (...classes: string[]) => classes.filter(Boolean).join(' ')

<button className={classNames(
  styles.button,
  styles.buttonPrimary,
  isLoading && styles.buttonLoading
)}>
  Submit
</button>
```

## 📚 Module Reference

### Theme Module (`theme.module.css`)

**Variables Available:**
- Colors: `--abyss-black`, `--bone`, `--sepia`, `--blood`, `--muted`
- Fonts: `--font-primary`, `--font-horror`, `--font-mono`, `--font-typewriter`
- Spacing: `--spacing-xs` through `--spacing-2xl`
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-blood`
- Special: `--torn-paper-clip`

**Usage:**
```tsx
// Import in your component CSS module
.myComponent {
  background: var(--abyss-black);
  color: var(--bone);
  padding: var(--spacing-md);
}
```

### Card Module (`Card.module.css`)

**Classes:**
- `.card` - Base card style
- `.cardTornPaper` - Torn paper effect card
- `.cardHeader` - Card header section
- `.cardTitle` - Card title
- `.cardBody` - Card body content
- `.cardFooter` - Card footer section
- `.cardBlood` - Blood-themed variant
- `.cardSepia` - Sepia-themed variant
- `.cardInteractive` - Interactive/clickable card

**Example:**
```tsx
import styles from '../styles/Card.module.css'

function PostCard({ post }) {
  return (
    <div className={`${styles.card} ${styles.cardInteractive}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{post.title}</h3>
      </div>
      <div className={styles.cardBody}>
        {post.content}
      </div>
      <div className={styles.cardFooter}>
        <span>{post.author}</span>
        <span>{post.date}</span>
      </div>
    </div>
  )
}
```

### Button Module (`Button.module.css`)

**Classes:**
- `.button` - Base button style
- `.buttonPrimary` - Primary (blood) button
- `.buttonSecondary` - Secondary (sepia) button
- `.buttonOutline` - Outline button
- `.buttonGhost` - Ghost/transparent button
- `.buttonSmall` / `.buttonLarge` - Size variants
- `.buttonFullWidth` - Full-width button
- `.buttonHorror` - Horror font button
- `.buttonLoading` - Loading state with spinner

**Example:**
```tsx
import styles from '../styles/Button.module.css'

function SubmitButton({ loading, onClick }) {
  return (
    <button
      className={classNames(
        styles.button,
        styles.buttonPrimary,
        styles.buttonLarge,
        loading && styles.buttonLoading
      )}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

### Layout Module (`Layout.module.css`)

**Classes:**
- Containers: `.container`, `.containerNarrow`, `.containerWide`, `.containerFluid`
- Grid: `.grid`, `.gridCols2`, `.gridCols3`, `.gridCols4`
- Flex: `.flex`, `.flexColumn`, `.flexCenter`, `.flexBetween`, etc.
- Stack: `.stack`, `.stackSm`, `.stackLg`, `.stackXl`
- Sections: `.section`, `.sectionSm`, `.sectionLg`
- Utilities: `.divider`, `.spacerMd`, `.horrorBg`, `.tornPaperBg`

**Example:**
```tsx
import styles from '../styles/Layout.module.css'

function PostGrid({ posts }) {
  return (
    <div className={styles.container}>
      <div className={`${styles.grid} ${styles.gridCols3}`}>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
```

### Typography Module (`Typography.module.css`)

**Classes:**
- Headings: `.heading1` through `.heading6`
- Body: `.body`, `.bodyLarge`, `.bodySmall`
- Text variants: `.textBold`, `.textMuted`, `.textCenter`, etc.
- Special: `.textHorror`, `.textTypewriter`, `.textMono`
- Effects: `.textGlitch`, `.textBloodDrip`
- Components: `.paragraph`, `.link`, `.list`, `.blockquote`, `.code`

**Example:**
```tsx
import styles from '../styles/Typography.module.css'

function Article({ title, content }) {
  return (
    <article>
      <h1 className={styles.heading1}>{title}</h1>
      <p className={styles.paragraphLead}>Lead paragraph...</p>
      <p className={styles.paragraph}>{content}</p>
    </article>
  )
}
```

## 🔄 Migration Steps

### Step 1: Update Component Imports

**Before:**
```tsx
import './MyComponent.css'
```

**After:**
```tsx
import styles from './MyComponent.module.css'
// Or use shared styles
import buttonStyles from '../styles/Button.module.css'
import layoutStyles from '../styles/Layout.module.css'
```

### Step 2: Convert Class Names

**Before:**
```tsx
<div className="card card-interactive">
  <h2 className="card-title">Title</h2>
</div>
```

**After:**
```tsx
<div className={`${styles.card} ${styles.cardInteractive}`}>
  <h2 className={styles.cardTitle}>Title</h2>
</div>
```

### Step 3: Create Component-Specific Modules

For component-specific styles, create a module file:

```
src/components/PostCard/
├── PostCard.tsx
└── PostCard.module.css
```

```css
/* PostCard.module.css */
.postCard {
  /* Extend base card styles */
  composes: card from '../../styles/Card.module.css';

  /* Add component-specific styles */
  max-width: 600px;
}

.postHeader {
  composes: cardHeader from '../../styles/Card.module.css';
  display: flex;
  justify-content: space-between;
}
```

## 🎨 Style Composition

CSS Modules support composition for extending styles:

```css
.primaryButton {
  composes: button buttonPrimary from './Button.module.css';
  /* Additional styles */
  min-width: 120px;
}
```

## 📱 Responsive Design

All modules include responsive breakpoints:

```css
/* Automatically responsive */
.gridCols3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1024px) {
  .gridCols3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .gridCols3 {
    grid-template-columns: 1fr;
  }
}
```

## 🛠️ Best Practices

1. **Use Shared Modules First**: Before creating component-specific styles, check if shared modules cover your needs

2. **Follow BEM Naming**: Even with CSS Modules, use clear naming:
   - `.card` - Block
   - `.cardHeader` - Element
   - `.cardInteractive` - Modifier

3. **Avoid Deep Nesting**: Keep selectors flat for better performance

4. **Leverage CSS Variables**: Use theme variables for consistency:
   ```css
   .myComponent {
     color: var(--bone);
     background: var(--abyss-black);
   }
   ```

5. **Compose When Possible**: Use `composes` to extend existing styles

## 🔍 TypeScript Support

Create a `*.d.ts` file for type safety:

```typescript
// styles.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}
```

## 📦 What's Still in App.css

The following remain in `App.css` and should be migrated incrementally:

- Custom scrollbar styles
- Font face declarations
- Page-specific styles
- Animation keyframes
- Third-party overrides (Bootstrap, etc.)

## 🚧 Migration Priority

1. **High Priority**: Frequently used components (buttons, cards, layouts)
2. **Medium Priority**: Page-specific components
3. **Low Priority**: One-off styles, third-party overrides

## ✅ Benefits

- ✅ **Scoped Styles**: No class name collisions
- ✅ **Better Performance**: Only load needed styles
- ✅ **Type Safety**: TypeScript autocomplete for class names
- ✅ **Easier Refactoring**: Unused styles detected at build time
- ✅ **Code Splitting**: Styles loaded with components
- ✅ **Maintainability**: Clear component-style relationships

## 📚 Additional Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Vite CSS Modules Guide](https://vitejs.dev/guide/features.html#css-modules)
- [React CSS Modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)
