# Link Saver

Your AI-powered digital library. Save, organize, and discover your favorite links with automatic metadata extraction and AI-generated summaries.

## Features
- User authentication (sign up, sign in, JWT sessions)
- Add, view, and delete bookmarks
- AI-powered link summaries
- Automatic metadata extraction (title, favicon, description)
- Tagging and smart search
- Responsive, modern UI with dark mode
- Secure password hashing (bcrypt)
- SQLite local database (easy to migrate)

## Getting Started

### 1. Clone the repository
```bash
git clone :-https://github.com/DRAKEN-1974/link-summarizer
cd final-link-saver
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```env
# Change this to a strong, random value before deploying!
JWT_SECRET=your-very-secure-random-secret-key
```

### 4. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Deployment
- Set `JWT_SECRET` in your production environment.
- The app uses SQLite by default. For production, consider using a managed database and updating the database logic.
- Compatible with Vercel, Netlify, or any Node.js hosting.

## Folder Structure
- `app/` - Next.js app directory
- `components/` - UI and feature components
- `lib/` - Database, authentication, and utility logic
- `styles/` or `app/globals.css` - Tailwind and custom styles

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

---
<img width="2722" height="1434" alt="image" src="https://github.com/user-attachments/assets/e7774292-4697-4df1-b30b-be7607014286" />
Image Showcasing the login page in white theme.



<img width="2722" height="1434" alt="image" src="https://github.com/user-attachments/assets/2361c805-f614-4907-b1b2-bd6d5596c682" />
Image of the same login page in the black theme.


<img width="2722" height="1486" alt="image" src="https://github.com/user-attachments/assets/c663db60-f3f0-46c6-9f6a-ea0e5203f2a7" />
Showcasing how the main dashboard looks like.

<img width="2722" height="1486" alt="image" src="https://github.com/user-attachments/assets/214de5ff-6c7c-43ba-a82c-00490899c15b" />

Showcasing the same dashboard in the changes theme.

