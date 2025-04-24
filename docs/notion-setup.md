# Notion Integration Setup Guide

This guide explains how to set up the Notion integration for fetching video data.

## Step 1: Create a Notion Integration

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Click "New Integration"
3. Name your integration (e.g., "Video Database")
4. Select the workspace where your database exists
5. Set the capabilities required (at minimum, read content)
6. Click "Submit" to create the integration
7. Copy the "Internal Integration Token" - this will be your `NOTION_API_KEY`

## Step 2: Share Your Database with the Integration

1. Navigate to your video database in Notion
2. Click the "..." menu in the top right corner
3. Select "Add connections"
4. Find and select your integration from the list
5. Confirm by clicking "Confirm"

## Step 3: Get Your Database ID

1. Open your Notion database in a browser
2. Look at the URL, which will look like: `https://www.notion.so/workspace/XXXXX?v=YYYYY`
3. The database ID is the `XXXXX` part from the URL
4. This will be your `NOTION_DATABASE_ID`

## Step 4: Configure Environment Variables

Add these environment variables to your `.env` file:

```
NOTION_API_KEY=your_integration_token
NOTION_DATABASE_ID=your_database_id
```

## Step 5: Database Structure

Ensure your Notion database has the following properties:

- `Name` (title): The name of the video
- `id` (text): A unique identifier for the video
- `thumbnail` (URL): The URL to the video thumbnail image
- `videoUrl` (URL): The URL to the video file

## Step 6: Install Notion SDK and Run the App

```
npm install @notionhq/client
npm run dev
```

Your app should now fetch videos from your Notion database instead of using hardcoded data. 