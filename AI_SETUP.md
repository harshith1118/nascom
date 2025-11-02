# AI API Configuration for Netlify Deployment

## Google API Key Setup for Netlify

To ensure the generate functionality works properly on your Netlify deployment, you need to configure the Google API key as an environment variable.

### Steps:

1. **Get your Google API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create an account or sign in
   - Create a new API key for your project
   - Copy the API key

2. **Configure the Environment Variable on Netlify:**
   - Go to your Netlify dashboard
   - Select your project
   - Go to "Site settings" → "Build & deploy" → "Environment"
   - Click "Edit variables"
   - Add a new variable:
     - Key: `GOOGLE_API_KEY`
     - Value: [Your copied API key]
   - Save the changes

3. **Redeploy your site:**
   - Trigger a new build to apply the environment variable changes

### Troubleshooting:

- If you're still getting 504 errors after setting up the API key:
  - Check that the environment variable is properly set in Netlify
  - Make sure your Google API key has the necessary permissions for the Gemini API
  - Verify your billing is properly set up with Google Cloud if required
  - Ensure your API key hasn't exceeded usage quotas

### Timeout Configuration:

The application is configured with:
- 60-second timeout for API requests
- 2 retry attempts for failed requests
- Proper error handling for timeout scenarios

This should help prevent the 504 errors you were experiencing with the generate functionality.