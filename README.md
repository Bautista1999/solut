# Solutio: Crowdbuilding Platform Overview

Solutio is a decentralized crowdbuilding platform built on the Internet Computer (ICP) network. It enables users to create topics, contribute ideas, and pledge funds. Developers can propose solutions, and when accepted, receive funding from the community.

## Key Components
### Frontend
- Framework: Svelte and SvelteKit
- External Library: Skeleton for UI elements
- Structure: Screens, controllers, and shared components organized for optimal user interaction.
### Backend
- Database: Juno, a decentralized database on the ICP network
- Functions: JavaScript functions connecting frontend to Juno for CRUD operations
- Data Objects: Models for interacting with the database
- Other Functions: Additional logic not requiring database access
- Stores: Svelte writable/readable stores for state management
- Validators: Ensure data integrity for topic and solution creation

## Solutio's project walkthrough
### Project's folder overview
    /Solutio	
        /.svelte-kit	
        /build
        /node_modules
        /src
            /lib
                /components 
                /data_functions				
                    - docu_functions.js 
                    - user_functions.js  
                /data_objects 				
                    data_objects.js			
                /other_functions 
                /stores
                /validators 
            /routes 
                /create
                /homepage
                /idea			
                /notifications
                /profile
                /solution
                +layout.svelte
                +layout.ts
                +page.velte	
            app.d.ts
            app.html
        /static
            /assets
                /fonts
                (many images.jpg)
        package.json
        .gitattributes
        .gitignore
        jsconfig.json
        postcss.config.cjs	
        README.md
        Juno.json
        svelte.config.js
        tailwind.config.js
        vite.config.js

`/Solutio`
The root directory contains the entire Solutio project.

`.svelte-kit, /build, /node_modules`
These folders are related to the SvelteKit framework and contain build artifacts and dependencies. They are generated during development and build processes.

`/src`
The main source code directory where most of the project logic resides.

- `/lib`
    
    - `/components` 
        Shared UI components used across various screens in Svelte.

    - `/data_functions`
        Backend functions for logic, connecting with the database (Juno), and external libraries like @dfinity/nns. Screens controllers connect with this backend for data operations.

        - `docu_functions.js`
            Provides CRUD operations for the database.
            
        - `user_functions.js`
            Functions related to user operations.

    - `/data_objects`
        Files providing the construction of objects or models for interacting with the database.

        - `data_objects.js:`
            Constructs objects for database interactions.

    -  `/other_functions`
        Houses functions that don't require direct database access but involve logic.

    - `/stores`
        Svelte writable/readable stores for managing state in components.

    - `/validators`
        Validators for ensuring data integrity during topic and solution creation.

- `/routes`
    Contains Svelte files representing each screen in the application. Each screen has a corresponding controller in the <script></script> section.
        
    - `/create, /homepage, /idea, /notifications, /profile, /solution`
        Screens for creating topics, the homepage, individual ideas, notifications, user profile, and viewing solutions.

    - `+layout.svelte, +layout.ts`
        Layout components for consistent styling and structure across screens.

    - `+page.svelte`
        The main page in the platform; it is loaded when entering the solutions section.

- `app.d.ts, app.html`
    These files define the type and structure of the SvelteKit application.

- `/static`
    Contains static assets like fonts and images.

- `package.json, .gitattributes, .gitignore, jsconfig.json, postcss.config.cjs`
    Configuration files for package management, git, JavaScript, and PostCSS.

- `README.md, Juno.json, svelte.config.js, tailwind.config.js, vite.config.js`
    Documentation, configuration, and build files.

## Solutio's software architecture overview

![Alt Text](/Users/juanbautistamartinezrezzio/Documents/Dev/ic_project/solutio/static/assets/Solutio_Architecture_19_12_2023.jpg)

## Decentralization and Blockchain Integration
Canister Hosting: Solutio is hosted on Juno's canister, relying on the ICP network for decentralization.
## User Dashboard
- Features: View topics, create topics, contribute ideas, pledge funds, approve solutions, provide solutions, view notifications, and manage profile.
## User Engagement Features
Engagement: Users can contribute ideas, pledge funds, approve solutions, and follow topics, ideas, or solutions.
## Security Measures
- Security: Solutio relies on ICP through Juno for robust security, ensuring data integrity and user privacy.
## Technology Stack
- Frontend: Svelte, SvelteKit, Skeleton
- Backend: JavaScript, Juno
- Database: Juno, ICP network
- Integration: @dfinity/utils, @dfinity/principal, @dfinity/nns for ICP token management

# Enviornment set-up
# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
